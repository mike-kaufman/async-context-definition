
Node.js uses an event-driven non-blocking I/O model of execution instead of 
multi-threading. This model greatly simplifies reasoning about many aspects of 
a programs execution but requires the use of _callback_ based code to ensure 
applications remain responsive. Thus, understanding a the behvior of an 
application may require understanding the execution of several blocks of code 
and how their executions are related via asychronous callback operations.

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
definitions and mechanisims for tracking asynchronous execution rely on:
 1. A notion of `client` code which sees an _asynchnonous execution_ based on 
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
binary relations over the executions of logically ascynchrounous JavaScript 
functions:
 - **link** -- when the execution one function, _f_, stores a second 
 function, _g_, into a storage location (native, Node.js core, or user defined) 
 for later ascynhronous execution we say _f_ `links` _g_. 
 - **causal** -- when the execution of a function, _f_, is the `client` code 
 that is locaically responsible (according to the `runtime` API) for causing 
 the execution of a previously **linked** _g_  we say _f_ `causes` _g_.
 - **happens before** -- when a function, _f_, is asynchrnously executed 
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

contextify(f, args, label, aspromise) {
  const functionCtx = generateFreshContext();
  return { label: label, 
           function: f, 
           argv: args, 
           ctx: functionCtx, 
           asPromise: aspromise };
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
    ctxf.apply(null, ctxf.argv);
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

An asynchronous execution is implicitly defined by the placement of 
these operations and, as seen in the code, produces an asynchronous event 
trace. A trace is well-formed if it preserves the following properties:
 1. For each link/cause entry `currentExecutingContext` < `ctxf.ctx`
 2. For each `ctxf.ctx` the timestamps (if present) for "link" < "cause"  
 < "externalCause" (optional) < "executeBegin" < "fail" (optional) < "executeEnd"

Using the core definitions we can define the following states of an 
asynchronous function or execution:
 * `Queued asynchronous function` is one where the "link" event has been 
 emitted /\ the "cause" event has not been emited.

 * `Ready asynchronous function` is one where the "cause" event has been 
 emited /\ the "executeBegin" event has not been emited.

 * `Executing asynchronous function` is one where the "executeBegin" event 
 has been emitted /\ the "executeEnd" event has not been emited.

 * `Completed asynchronous function` is one where the "executeEnd" event 
 has been emited.

Each `AsyncOperation` node will be in  exactly one of the following states at any given time.  An `AsyncOperation` node can be in each state exactly once.
**TODO** say more here

#  Async Call (Sub)Tree
A tree that represents the asynchronous execution flow in a Node.js program.

 * `Active asynchronous execution` is **TODO**

 * `Retired asynchronous execution` is **TODO**

# Asynchronous Annotations Examples
To illustrate how the asyncronous annotation code can be used to convert a 
`runtime` API into one that tracks asynchronous events for client code we look 
at applying them to a sample of a callback based API as well as 
the promise API.

## Callback API
**TODO:**

## Promise API
**TODO:**

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

failed(ctxf) {
    emit("fail", ctxf.ctx, generateNextTime());
}

rejected(ctxf) {
    emit("rejected", ctxf.ctx, generateNextTime());
}
```

A `canceled asynchronous execution` is one in which **TODO**

A `failed asynchronous execution` is one in which **TODO**

A `rejected asynchronous execution` is one in which **TODO**

A `rejected and unhandled asynchronous execution` is one in which **TODO**

# Asynchronous Operation Metadata

# Use Cases

## Post-Mortem Use Cases
Post-mortem use cases occur after program execution has ended.  These include reconstruction of async context state at some point in time, or understanding timing details.  

  1.  Understand execution & timing details of an async call path 
  2.  Understand parent/child relationshipo in async call paths
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