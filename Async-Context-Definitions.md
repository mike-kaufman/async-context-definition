
# Async Context Definitions

## Overview

Node.js uses an event-driven non-blocking I/O model of execution instead of 
multi-threading. This model greatly simplifies reasoning about many aspects of 
program execution but requires the use of _callback_ based code to ensure 
applications remain responsive. Thus, understanding the behavior of an 
application may require understanding the execution of several blocks of code 
and how their executions are related via asynchronous callback interleavings and 
dependencies.

This document provides a specification for asynchronous execution in Node.js 
and a model for reasoning about the relationships between asynchronous calls 
in an application. Through this document we will use two running examples of 
tools/scenarios that need to understand asynchronous execution to answer key 
questions about a Node application:

 * Long call stack construction in a debugger.
 * Resource use of a HTTP request handler.

### Long Call Stacks
A "long call stack" is a list of call-stacks that span asynchronous callback 
operations.  Analagous to a synchronous callstack, "Long call stacks" are useful
for programmers to answer the question of "what was the call path to a specific 
point in program execution.  For example, the  following code

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

### HTTP Resource Usage

**TODO** fill in details of example. 

### 
A fundamental challenge for asynchronous execution tracking is that, in the 
Node.js model, asynchronous relationships are defined both at different layers 
of the runtime as well as by through implicit conventions. Thus, our 
definitions and mechanisms for tracking asynchronous execution rely on:
 1. A notion of `client` code which sees an _asynchronous execution_ based on 
 a series of executed JavaScript functions from different asynchronous 
 contexts and fundamental relationships between them.
 2. A notion of `runtime` code, which can be native C++, JavaScript in Node 
 core, or even other user code that is surfacing an asynchronous API to the 
 `client` even if the underlying execution mixes code from different 
 asynchronous client contexts in a single synchronous execution.
 3. A set of explicit tagging API's that will notify us of which API's are 
 involved in these boundaries and which relations they affect.

These issues are illustrated by the Node `timers` API which, as described 
[here](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/), 
is implemented in JavaScript code and uses a list of timer callbacks to 
track _every_ function to be executed when a given timespan has elapsed. 
When the timespan expires a single synchronous function is called from the 
LibUV library, `listOnTimeout`, that iterates over the list and executes 
every function. Thus, from a runtime viewpoint all of the functions are 
part of the same asynchronous context regardless of which (logically 
different) client asynchronous contexts added them. 

## Terminology
Our definitions of asynchronous executions are based on three 
binary relations over the executions of logically asynchronous JavaScript 
functions:
 - **link** -- when the execution one function, _f_, stores a second 
 function, _g_, for later asynchronous execution we say _f_ `links` _g_. 
 - **causal** -- when the execution of a function, _f_, is the `client` code 
 that is logically responsible (according to the `runtime` API) for causing 
 the execution of a previously **linked** _g_  we say _f_ `causes` _g_.
 - **happens before** -- when a function, _f_, is asynchronously executed 
 before a second function, _g_, we say _f_ `happens before` _g_.

We define the following module code that provides the needed explicit marking 
of API's that are exposing asynchronous behavior from a `runtime` component to 
`client` code and which enable the tracking of the core asynchronous execution 
chain concepts.
```
let globalCtxCtr = 0;
generateFreshContext() {
  return ++globalCtxCtr;
}

let globalTimeCtr = 0;
generateNextTime() {
  return ++globalTimeCtr;
}

let currentExecutingContext = undefined;

contextify(f) {
  const functionCtx = generateFreshContext();
  return { function: f, ctx: functionCtx };
}

link(ctxf) {
  emit("link", currentExecutingContext, ctxf.ctx, generateNextTime());
}

cause(ctxf) {
  emit("cause", currentExecutingContext, ctxf.ctx, generateNextTime());
}

execute(ctxf) {
  currentExecutingContext = ctxf.ctx;
  emit("executeBegin", ctxf.ctx, generateNextTime());

  try {
    ctxf.call(null);
  }
  finally {
    emit("executeEnd", ctxf.ctx, generateNextTime());
    currentExecutingContext = undefined;
  }

  return res;
}
```
Using this code a `runtime` will provide an asynchronous API abstraction by 
`contextifying` the functions passed to API's that it wishes to pool for later 
asynchronous execution. At each later phase the `link`, `cause`, and `execute` 
functions will need to be invoked to drive the asynchronous execution and 
update/write the appropriate context information.

## Asynchronous Annotations Examples
To illustrate how the asynchronous annotation code can be used to convert a 
`runtime` API into one that tracks asynchronous events for client code we look 
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
  const cf = contextify(f);
  link(cf);
  cause(cf);

  worklist.push({task: cf, isRepeat: false});
}

//Invoke the callback REPEATEDLY asynchronously on later turns of event loop
function callbackRepeating(f) {
  const cf = contextify(f);
  link(cf);
  cause(cf);

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
  {event: "link", currentExecutingContext: 0, ctx: 1, time: 1}
  {event: "cause", currentExecutingContext: 0, ctx: 1, time: 2}
  {event: "link", currentExecutingContext: 0, ctx: 2, time: 3}
  {event: "cause", currentExecutingContext: 0, ctx: 2, time: 4}
  {event: "executeBegin", ctx: 2, time: 5}
  //Prints "Hello Repeating"
  {event: "executeEnd", ctx: 2, time: 6}
  {event: "executeBegin", ctx: 1, time: 7}
  //Prints "Hello Once"
  {event: "link", currentExecutingContext: 1, ctx: 3, time: 8}
  {event: "cause", currentExecutingContext: 1, ctx: 3, time: 9}
  {event: "executeEnd", ctx: 1, time: 10}
  {event: "executeBegin", ctx: 3, time: 11}
  //Prints "Did it"
  {event: "executeEnd", ctx: 3, time: 12}
  {event: "executeBegin", ctx: 1, time: 13}
  //Prints "Hello Repeating"
  {event: "executeEnd", ctx: 1, time: 14}
  ...
```

### Promise API
**TODO:** do a promise thing

These two examples show how the the context relations from 
[DLS17](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/NodeAsyncContext.pdf) 
can be lifted into the Node ecosystem without the use of the _priority promise_ 
construct (although at the loss of unified scheduling and priority).

## Asynchronous (Sub)Tree Execution
Each execution of a function in a trace can be viewed as a node in an 
`asynchronous execution (sub)tree` with the children defined _either_ 
by the link or cause relations. 
  * A given function context node, _c<sub>1</sub>_, is a `link-parent` for a 
  second context node, _c<sub>2</sub>_, if the `asynchronous event 
  trace` contains the entries
  _{event: "executeBegin", ctx: c<sub>1</sub>, time: t}_ and 
  _{event: "link", ctx: c<sub>2</sub>, time: t'}_ where t < t' and, 
  if the trace contains an event 
  _{event: "executeEnd", ctx: c<sub>1</sub>, time: t''}_, where t < t'' then t' < t''.
  * A given function context node, _c<sub>1</sub>_, is a `causal-parent` for a 
  second context node, _c<sub>2</sub>_, if the `asynchronous event 
  trace` contains the entries
  _{event: "executeBegin", ctx: c<sub>1</sub>, time: t}_ and 
  _{event: "cause", ctx: c<sub>2</sub>, time: t'}_ where t < t' and, 
  if the trace contains an event 
  _{event: "executeEnd", ctx: c<sub>1</sub>, time: t''}_, where t < t'' then t' < t''.

**TODO** use these definitions to see trees for trace examples...

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
**TODO** define the metadata associated with each async execution node.  e.g., time stamps associated w/ each state transition?

## Use Cases
Use cases for Async Context can be broken into two categories, **post-mortem** and
**online**.  

**Post-Mortem Use Cases** are program analysis tasks that happen after a
program has completed execution.  They require reconstruction of an Async Call Graph
up to some point in time, and is achievable via an accurate event stream that 
describes all state transitions of nodes & edges in the Async Call Graph.

Examples of Post-Mortem Use Cases
  1.  **Execution Timing Analysis** - A user wants to understand timing details of 
      specific HTTP request.  Since the HTTP request's processing consists of multiple 
      Async Executions, a thorough timing analysis needs to understand each node 
      in the path from the end of the request, to the start of the request, and for 
      each node, specific timing details around each state transition.  Such data
      can tell us how long a request was blocked in an execution queue, or waiting
      for some event, or actually executing.

  2.  Understand parent/child relationship in async call paths  - **TODO** add text
    
  3.  Reconstruct async call tree to some point in time given an event stream - **TODO** add text

**Online Use Cases** are use cases where the Asynchronous Context needs to be
examined dynamically while a program is executing.  Meeting requirements of
online use cases requires runtime and/or module support to keep an accurate
representation of the Async Call Graph, as well as APIs to navigate the graph.
In particular, garbage collection passes must occur on retired sub-trees.       

Examples of Online Use Cases include:

  1.  **Continuation Local Storage** - Analagous to thread-local-storage, but for 
      asynchronous continuations.  Continuation Local Storage provides the
      ability to store key/value pairs in a storage container 
      associated with the current Async Execution.  Clients can lookup values
      for a given key, and the lookup will walk a path on the Async Call Graph
      until a key is found, or it reaches the root.  Continuation local storage
      is useful when code in some Asynchronous Execution needs to know values
      associated with some parent Asynchronous Execution.  For example, APM 
      vendors often need to associate code execution events with a specific
      HTTP request.

  2.  **Async exception handling** - Traditional (i.e., synchronous) exception
      handling is a multi-frame stack jump.  Asynchronous Exception Handling 
      can be described as a when a synchronous exception handler wishes to 
      notify intersted observers about an exception.  The set of interested 
      observers can be succinctly described as observers on some path through 
      the Async Call Graph.  For example, one trivial strategy would be to 
      traverse all linked edges from the current Async Excecution to the root, 
      and see if any registered observers are present. 

  3.  **Long stack capture**
      **TODO**  - resolve w/ explanation above. 


### Post-Mortem Use Cases
Post-mortem use cases occur after program execution has ended.  These include reconstruction of async context state at some point in time, or understanding timing details.  



### Online Use Cases
Online use cases rely on some accurate "live tree" to navigate.   



## User Space Queueing

## Examples

### Promise.All

### Promise with unhandled rejection

### Callback w/ user space Queueing