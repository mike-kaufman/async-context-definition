
Node.js uses an event-driven non-blocking I/O model of execution instead of 
multi-threading. This model greatly simplifies reasoning about many aspects of 
a programs execution but requires the use of _callback_ based code to ensure 
applications remain responsive. Thus, understanding a the behavior of an 
application may require understanding the execution of several blocks of code 
and how their executions are related via asynchronous callback operations.

This document provides a specification for asynchronous execution in Node.js 
and a model for reasoning about the relationships between asynchronous calls 
in an application. Through this document we will use two running examples of 
tools/scenarios that need to understand asynchronous execution to answer key 
questions about a Node application:

 * Long call stack construction in a debugger.
 * Resource use of a HTTP request handler.

**TODO** -- say a bit more here on why these are important in introduce details 
of the application + the code sample we are going to use.

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

# Terminology
Our definitions of asynchronous executions are based on three 
binary relations over the executions of logically asynchronous JavaScript 
functions:
 - **link** -- when the execution one function, _f_, stores a second 
 function, _g_, into a storage location (native, Node.js core, or user defined) 
 for later asynchronous execution we say _f_ `links` _g_. 
 - **causal** -- when the execution of a function, _f_, is the `client` code 
 that is locally responsible (according to the `runtime` API) for causing 
 the execution of a previously **linked** _g_  we say _f_ `causes` _g_.
 - **happens before** -- when a function, _f_, is asynchronously executed 
 before a second function, _g_, we say _f_ `happens before` _g_.

As each of these events is defined with respect to an executing parent function 
we also want to have a notion of ordering on them. Thus, we want to timestamp 
the start/end of each asynchronous execution and each `link` or `causal` event.

We define the following module code that provides the needed explicit marking 
of API's that are exposing asynchronous behavior from a `runtime` component to 
`client` code and which enable the tracking of the core asynchronous execution 
chain concepts.
```
let globalCtxCtr = 0;
generateFreshContext() {
  return ++globalTimeCtr;
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
asynchronous execution. At each later phase the `link`, `cause`, optional 
`externalCause`, and `execute` functions will need to be invoked to drive the 
asynchronous execution and update/write the appropriate context information.

# Asynchronous Annotations Examples
To illustrate how the asynchronous annotation code can be used to convert a 
`runtime` API into one that tracks asynchronous events for client code we look 
at applying them to a sample of a callback based API as well as 
the promise API.

## Callback API
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

## Promise API
**TODO:** do a promise thing

These two examples show how the the context relations from 
[DLS17](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/NodeAsyncContext.pdf) can be 
lifted into the Node ecosystem without the use of the _priority promise_ 
construct (although at the loss of unified scheduling and priority).

# Asynchronous Function Execution
Using the core definitions we can define the following states of an 
asynchronous function:
 * `Queued asynchronous function` is one where the "link" event has been 
 emitted /\ any "cause" event has not been emitted.
 * `Ready asynchronous function` is one where a "cause" event has been 
 emited /\ is not followed by any "executeBegin" event.

# Asynchronous (Sub)Tree Execution
Each asynchronous execution in a trace can be viewed as a node in an 
`asynchronous execution (sub)tree` with the children defined _either_ 
by the link or cause relations. 
  * A given function context node, _c<sub>1</sub>_, is a `link-parent` for a 
  second context node, _c<sub>2</sub>_, if the `asynchronous event 
  trace` contains the entries
  _{event: "executeBegin", ctx: c<sub>1</sub>, time: t}_ and 
  _{event: "link", ctx: c<sub>2</sub>, time: t'}_ where t < t' and, 
  if the trace contains an event 
  _{event: "executeBegin", ctx: c<sub>1</sub>, time: t''}_, then t' < t''.
  * A given function context node, _c<sub>1</sub>_, is a `causal-parent` for a 
  second context node, _c<sub>2</sub>_, if the `asynchronous event 
  trace` contains the entries
  _{event: "executeBegin", ctx: c<sub>1</sub>, time: t}_ and 
  _{event: "cause", ctx: c<sub>2</sub>, time: t'}_ where t < t' and, 
  if the trace contains an event 
  _{event: "executeBegin", ctx: c<sub>1</sub>, time: t''}_, then t' < t''.

**TODO** use these definitions to see trees for trace examples...

# Enriched Terminology
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

# Asynchronous Operation Metadata

# Use Cases

## Post-Mortem Use Cases
Post-mortem use cases occur after program execution has ended.  These include reconstruction of async context state at some point in time, or understanding timing details.  

  1.  Understand execution & timing details of an async call path 
  2.  Understand parent/child relationship in async call paths
  3.  Reconstruct async call tree to some point in time given an event stream 

## Online Use Cases
Online use cases rely on some accurate "live tree" to navigate.   

  1.  Continuation Local Storage
  2.  Async exception handling
  3.  Long stack capture


## User Space Queueing

## Examples

### Promise.All

### Promise with unhandled rejection

### Callback w/ user space Queueing