
# Async Context Definitions

## 1. Overview

Node.js uses an event-driven non-blocking I/O model of execution instead of 
multi-threading. This model simplifies reasoning about many aspects of 
program execution but requires the use of _callback_ or _promise_ based code 
to ensure applications remain responsive. Thus, understanding the behavior of 
an application requires understanding the execution of several blocks of code 
and how their executions are related via asynchronous callback interleavings 
and execution dependencies.

This document provides a specification for asynchronous execution in Node.js 
and a model for reasoning about the relationships between asynchronous calls 
in an application. Colloquially, such relationships are called 
**Asynchronous Context**. A formal definition of Asynchronous Context is given 
in section 2. We model state transitions in asynchronous context as a series 
of discrete events that occur during program execution. These events are 
described in detail in section 3. The event streams can be used to build a 
directed acyclic graph, that we call the **Asynchronous Call Graph**. How the 
events are used to construct the Asynchronous Call Graph is defined in 
section 4. Section 5 gives a number of example problems that are easily 
reasoned about given the terminology defined herein. Lastly, section 6 shows a 
number of common asynchronous code patterns in Node.js, and shows the event 
stream produced from such code executing, as well as some examples of 
the resulting Asynchronous Call Graphs.

## 2. Definition of an Asynchronous API
A fundamental challenge for asynchronous execution tracking is that, in the 
Node.js model, asynchronous behavior is defined both at different layers 
of the code stack and through implicit API usage conventions. Thus, our 
definitions and mechanisms for tracking asynchronous execution rely on:
 1. A convention based notion of `client` code which sees 
 _asynchronous execution_ based on a sequence of executed JavaScript functions 
 from logical asynchronous contexts.
 2. A convention based notion of `host` code, which can be native C++, 
 JavaScript in Node core, or even other userland code that surfaces an 
 asynchronous API to the `client` -- even if the underlying implementations 
 mixes the execution of code from different logical asynchronous client 
 contexts in a single synchronous execution.
 3. A set of explicit tagging API's that will notify us of which API's are 
 involved in these boundaries, the contexts they are associated with, and 
 which relations they affect.

These issues are illustrated by the Node `timers` API which, as described 
[here](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/), 
is implemented using JavaScript in Node core and uses a list of timer 
callbacks to track _every_ function to be executed when a given timespan has elapsed. When the timespan expires a single synchronous function is called 
from the LibUV library, `listOnTimeout`, that iterates over the list and 
executes every function. Thus, from a runtime viewpoint all of the functions 
are part of the same asynchronous context regardless of which (logically 
different) client asynchronous contexts added them. 

### Definition of Context and Ordering
A single JavaScript function may be passed to multiple asynchronous API's 
and, in order to track the state of each of these asynchronous executions 
independently, we must be able to distinguish between uses of the same 
function from multiple logically different asynchronous executions. Thus, 
we begin by defining an _asynchronous function context_ (or context) as a 
unique identifier. We only require that fresh instances of these 
values can be generated on demand and compared for equality. In practice 
monotonically increasing integer values provide a suitable representation.
For a given function _f_ we define the asynchronous context representation 
of _f_ in context _i_ as _f<sub>i</sub>_. 

Our definitions of asynchronous executions are based on three 
binary relations over the executions of logically asynchronous JavaScript 
functions:
 - **link** -- when the execution of function _f_ in context _i_ stores a 
 second function _g_ in context _j_ for later asynchronous execution we say 
 _f<sub>i</sub>_ `links` _g<sub>j</sub>_. 
 - **causal** -- when the execution of a function _f_ in context _i_ is 
 logically responsible (according to the `host` API) 
 for causing the execution of a previously **linked** _g_ from context _j_ 
 we say _f<sub>i</sub>_ `causes` _g<sub>j</sub>_. 
 - **happens before** -- when a function _f_ in context _i_ is asynchronously 
 executed before a second function _g_ in context _j_ we say _f<sub>i</sub>_ 
 `happens before` _g<sub>j</sub>_.

We define the following module code that provides the required functions to
explicitly mark API's that expose asynchronous behavior from `host` code to 
`client` code and which enable the tracking of the core asynchronous execution 
concepts.
```
let globalCtxCtr = 0;
generateFreshContext() {
  return ++globalCtxCtr;
}

let globalTimeCtr = 0;
generateNextTime() {
  return ++globalTimeCtr;
}

let currentExecutingContext = "root";

link(f) {
  const linkCtx = generateFreshContext();
  emit("link", linkCtx, generateNextTime());

  return { function: f, link: linkCtx };
}

cause(ctxf) {
  const causeCtx = generateFreshContext();
  emit("cause", ctxf.link, causeCtx, generateNextTime());

  return Object.assign(ctxf, { cause: causeCtx });
}

execute(ctxf) {
  const origCtx = currentExecutingContext;
  currentExecutingContext = { 
    link: ctxf.link, 
    cause: ctxf.cause, 
    execution: generateFreshContext() 
  };

  emit("executeBegin", currentExecutingContext, generateNextTime());

  let res = undefined;
  try {
    res = ctxf.function.call(null);
  }
  finally {
    emit("executeEnd", currentExecutingContext, generateNextTime());
    currentExecutingContext = origCtx;
  }

  return res;
}
```
Using this code a `host` will provide an asynchronous API abstraction by 
`contextifying` the functions passed to API's that it wishes to pool for later 
asynchronous execution. At each later phase the `link`, `cause`, and `execute` 
functions will need to be invoked to drive the asynchronous execution and 
update/write the appropriate context information.

## 3. Well Formed Asynchronous Event Trace
An event trace for an asynchronous execution must satisfy the following 
ordering and identify requirements:
 1) For any context the events must be ordered in the form: link < cause 
 < beginExecute < endExecute
 2) A single link context, cause context, or execute context may only be 
 introduced in a single event.
 3) A link context may appear in multiple `cause` and `execute` events.
 4) a cause context may appear in multiple `execute` events.
 
The emit events must also satisfy the grammar constraints of the language:
```
Trace := Execution* PartialExecution?

Execution := beginExecution AsyncOp* endExecution

PartialExecution := beginExecution AsyncOp*

AsyncOp := link | cause
```

## Asynchronous Annotations Examples
To illustrate how the asynchronous annotation code can be used to convert a 
`host` API into one that tracks asynchronous events for client code we look 
at applying them to a sample of a callback based API as well as 
the promise API.

### Callback API
For this example we start with a simple asynchronous API that defines 
two method for registering callbacks:
```
let worklist = [];
setInterval(() => {
  const wl = worklist;
  worklist = [];
  wl.forEach((entry) => {
    execute(entry.task);
    if(entry.isRepeat) {
      workist.push(entry);
    }
  });
}, 500);

//Invoke the callback ONCE asynchronously on later turn of event loop
function callbackOnce(f) {
  const cf = cause(link(f));
  worklist.push({task: cf, isRepeat: false});
}

//Invoke the callback REPEATEDLY asynchronously on later turns of event loop
function callbackRepeating(f) {
  const cf = cause(link(f));
  callbackOnce({task: cf, isRepeat: true});
}
```
This example shows how the use of the core asynchronous module code delineates 
the points at which logical linking and causal context are captured or 
propagated. If we invoke this API as follows (when the currentContext is 0):
```
callbackRepeating(() => console.log("Hello Repeating"));

let doit = true;
callbackOnce(() => {
  console.log("Hello Once") 
  if(doit) {
    doit = false;
    callbackOnce(() => console.log("Did it"));
  }
});
```
We will see the asynchronous trace:
```
  {event: "executeBegin", current: "root", time: 1}
  {event: "link", link: 3, time: 2}
  {event: "cause", link: 3, cause: 4, time: 3}
  {event: "link", link: 5, time: 4}
  {event: "cause", link: 5, cause: 6, time: 5}
  {event: "executeBegin", current: { link: 3, cause: 4, execution: 7 }, time: 6}
  //Prints "Hello Repeating"
  {event: "executeEnd", current: { link: 3, cause: 4, execution: 7 }, time: 7}
  {event: "executeBegin", current: { link: 5, cause: 6, execution: 8 }, time: 8}
  //Prints "Hello Once"
  {event: "link", link: 9, time: 9}
  {event: "cause", link: 9, cause: 10, time: 10}
  {event: "executeEnd", current: { link: 5, cause: 6, execution: 8 }, time: 11}
  {event: "executeBegin", current: { link: 3, cause: 4, execution: 11 }, time: 12}
  //Prints "Hello Repeating"
  {event: "executeEnd", current: { link: 3, cause: 4, execution: 11 }, time: 13}
  {event: "executeBegin", current: { link: 9, cause: 10, execution: 12 }, time: 14}
  //Prints "Did it"
  {event: "executeEnd", current: { link: 9, cause: 10, execution: 12 }, time: 15}
  {event: "executeBegin", current: { link: 3, cause: 4, execution: 13 }, time: 16}
  //Prints "Hello Repeating"
  {event: "executeEnd", current: { link: 3, cause: 4, execution: 13 }, time: 17}
  ...
```

### Promise API
Similarly we can provide a basic promise API that supports asynchronous 
context tracking by modifying the real promise implementation as follows: 
**TODO** this is super rough.
```
function then(onFulfilled, onRejected) {
    cfFulfilled = contextify(onFulfilled);
    link(cfFulfilled);

    cfRejected = contextify(onRejected);
    link(cfRejected);

    if(this.isResolved) {
      if(this.success) {
        cause(cfFulfilled);
      }
      else {
        cause(cfRejected);
      }
    }

  ...
}

function resolve(value) {
  this.handlers.forEach((handler) => cause(cfFulfilled));
  ...
}

function reject(value) {
  this.handlers.forEach((handler) => cause(cfFulfilled));
  ...
}
```
If we invoke this API as follows (when the currentContext is 0):
```
const p = new Promise((res) => {
  console.log("Promise p");
  callbackOnce(() => {
    console.log("Promise resolve");
    res(42);
  });
});

console.log("Promise then");
p.then((val) => {
  console.log(`Hello ${val} World!`);
});
```
We will see the asynchronous trace:
```
  {event: "executeBegin", current: "root", time: 1}
  //Prints "Promise P"
  {event: "link", link: 3, time: 2}
  {event: "cause", link: 3, cause: 4, time: 3}
  //Prints "Promise then"
  {event: "link", link: 5, time: 4}
  {event: "executeBegin", current: { link: 3, cause: 4, execution: 6 }, time: 5}
  //Prints "Promise resolve"
  {event: "cause", link: 5, cause: 7, time: 6}
  {event: "executeEnd", current: { link: 3, cause: 4, execution: 6 }, time: 7}
  {event: "executeBegin", current: { link: 5, cause: 7, execution: 8 }, time: 8}
  //Prints "Hello 42 World!"
  {event: "executeEnd", current: { link: 5, cause: 7, execution: 8 }, time: 9}
  {event: "executeEnd", current: "root", time: 16}
```
These two examples show how the the context relations from 
[DLS17](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/NodeAsyncContext.pdf) 
can be lifted into the Node ecosystem without the use of the _priority promise_ 
construct (although at the loss of unified scheduling and priority).

## 4. Asynchronous Call Graph
The events described above can be used to construct and maintain an
`Asynchronous Call Graph`, which is a directed acyclic graph.

Nodes are defined as follows:
  * An "execution context" node is defined when an "executeBegin" event 
  is received. 
  * A "linking context" node is defined when a "link" event is received. 


Edges are defined as follows: 
  * A `link edge`, directed from a given "execution context" node 
  _c<sub>1</sub>_ to second "linking context" node, _c<sub>2</sub>_
  exists, if the `asynchronous event trace` contains the entries
  _{event: "executeBegin", current: c<sub>1</sub>, time: t}_ and 
  _{event: "link", linkCtx: c<sub>2</sub>, time: t'}_ where t < t' and, 
  if the trace contains an event _{event: "executeEnd", current: c<sub>1</sub>, 
  time: t''}_, where t < t'' then t' < t''.  In this case, a `link edge` 
  exists directed from _c<sub>1</sub>_ to _c<sub>2</sub>_.

  * A `causal edge`, directed from a given "execution context" node, 
  _c<sub>1</sub>_, to a second "execution context" node, _c<sub>2</sub>_, if 
  the `asynchronous event trace` contains the entries _{event: "executeBegin", 
  current: c<sub>1</sub>, time: t}_ and _{event: "cause", causeCtx: 
  c<sub>2</sub>, time: t'}_ where t < t' and, if the trace contains an event 
  _{event: "executeEnd", current: c<sub>1</sub>, time: t''}_, where t < t'' 
  then t' < t''.
 
  * An `execution edge`, directed from a given "linking context" node, 
  _c<sub>1</sub>_, to a second `linking context` node _c<sub>2</sub>_, if the 
  `asynchronous event trace` contains the entries _{event: "link", linkCtx: 
  c<sub>1</sub>, time: t}_ and _{event: "executeBegin", current: c<sub>2</sub>, 
  time: t''}_, where t < t'' then t' < t''.

**TODO** - need better definition of above - insuficient info in the event 
trace to know that c<sub>1</sub> is the linking node for c<sub>2</sub> 

**TODO** use these definitions to see trees for trace examples.

### Long Call-Stacks from Traces and Trees
**TODO** fill this in

### Resource Use Monitoring with Traces
**TODO** fill this in

## Enriched Terminology
The definitions in the "Terminology" section provide basic asynchronous 
lifecycle events but do not capture many important features including, 
canceled or failed rejections and, in cases of asynchronous events that 
depend on environmental interaction, what external events may be relevant.

To address these
```
cancel(ctxf) {
    emit("cancel", ctxf.ctx, generateNextTime());
}

externalCause(ctxf, data) {
    emit("externalCause", ctxf.ctx, generateNextTime(), data);
}

completed(ctxf) {
    emit("completed", ctxf.ctx, generateNextTime());
}

failed(ctxf) {
    emit("fail", ctxf.ctx, generateNextTime());
}

rejected(ctxf) {
    emit("rejected", ctxf.ctx, generateNextTime());
}
```

A `completed asynchronous execution` is one in which **TODO**

A `canceled asynchronous execution` is one in which **TODO**

A `failed asynchronous execution` is one in which **TODO**

A `rejected asynchronous execution` is one in which **TODO**

A `rejected and unhandled asynchronous execution` is one in which **TODO**


Using the these definitions we can define the following states of an 
asynchronous execution:
 * A (sub)tree is in `active asynchronous execution` when there exists a child 
 node, link or causal, that has not completed.
 * A (sub)tree has `retired asynchronous execution` when all child nodes, 
 link of causal, are in the completed state.

## Asynchronous Operation Metadata
**TODO** define the metadata associated with each async execution node.  e.g., 
time stamps associated w/ each state transition?

## 5. Use Cases
Use cases for Async Context can be broken into two categories, **post-mortem** and
**online**.  

### Post-Mortem Use Cases** 
**Post-Mortem Use Cases** are program analysis tasks that happen after a
program has completed execution. They require reconstruction of an Async Call 
Graph up to some point in time, and is achievable via an accurate event stream 
that describes all state transitions of nodes & edges in the Async Call Graph.

#### Execution Timing Analysis
**Execution Timing Analysis** - A user wants to understand timing details of 
specific HTTP request. Since the HTTP request's processing consists of 
multiple Async Executions, a thorough timing analysis needs to understand each 
node in the path from the end of the request, to the start of the request, and 
for each node, specific timing details around each state transition. Such data
can tell us how long a request was blocked in an execution queue, or waiting
for some event, or actually executing.

  2.  Understand parent/child relationship in async call paths  - **TODO** add 
  text
    
  3.  Reconstruct async call tree to some point in time given an event stream 
  - **TODO** add text

### Online Use Cases
**Online Use Cases** are use cases where the Asynchronous Context needs to be
examined dynamically while a program is executing. Meeting requirements of
online use cases requires runtime and/or module support to keep an accurate
representation of the Async Call Graph, as well as APIs to navigate the graph. 
In particular, garbage collection passes must occur on retired sub-trees.       

Examples of Online Use Cases include:

#### Continuation Local Storage
Analagous to thread-local-storage, but for asynchronous continuations.  
Continuation Local Storage provides the ability to store key/value pairs 
in a storage container associated with the current Async Execution. Clients 
can lookup values for a given key, and the lookup will walk a path on the 
Async Call Grapp until a key is found, or it reaches the root. Continuation 
local storage is useful when code in some Asynchronous Execution needs to know 
values associated with some parent Asynchronous Execution. For example, APM 
vendors often need to associate code execution events with a specific
HTTP request.

#### Async exception handling
Traditional (i.e., synchronous) exception
handling is a multi-frame stack jump. Asynchronous Exception Handling 
can be described as a when a synchronous exception handler wishes to 
notify intersted observers about an exception. The set of interested 
observers can be succinctly described as observers on some path through 
the Async Call Graph. For example, one trivial strategy would be to 
traverse all linked edges from the current Async Excecution to the root, 
and see if any registered observers are present. 

#### Long Call Stacks
A **long call stack** is a list of call-stacks that span asynchronous callback 
operations. Analagous to a synchronous callstack, "Long call stacks" are 
useful for programmers to answer the question of "what was the call path to a specific point in program execution. For example, the  following code

```
function f1() {
  console.log(new Error().stack);
}

function f2() {
  console.log(new Error().stack);
  setTimeout(f1, 1000);
}

f2();
```

produces the following long stack trace on node version 8.6:

```
Error
    at f2 (D:\tutorials\node\long-call-stack\index.js:6:15)
    at Object.<anonymous> (D:\tutorials\node\long-call-stack\index.js:10:1)
    at Module._compile (module.js:624:30)
    at Object.Module._extensions..js (module.js:635:10)
    at Module.load (module.js:545:32)
    at tryModuleLoad (module.js:508:12)
    at Function.Module._load (module.js:500:3)
    at Function.Module.runMain (module.js:665:10)
    at startup (bootstrap_node.js:187:16)
    at bootstrap_node.js:607:3
Error
    at Timeout.f1 [as _onTimeout] (D:\tutorials\node\long-call-stack\index.js:2:15)
    at ontimeout (timers.js:469:11)
    at tryOnTimeout (timers.js:304:5)
    at Timer.listOnTimeout (timers.js:264:5)
```

### Resource Use Monitoring

**TODO** fill in details of example. 


## User Space Queueing

## 6. Examples

### Promise.All

### Promise with unhandled rejection

### Callback w/ user space Queueing