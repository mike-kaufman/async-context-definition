# The Continuation Moodel  - A Model for Asynchronous Execution in JavaScript

This is an effort to formalize & visualize "asynchronous context" in Node.js applications.

The content here is a "simple summary" of more in-depth work, namely 
1. A [DLS 2017 paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/NodeAsyncContext.pdf) that formally 
defines semantics of async execution in javascript
2.  A ["translation"](./Async-Context-Definitions.md) of the above concepts, without the academic assumptions & formalisms. (*WIP*)

This page is a companion to the above.  The intention is to easily bring an
understanding of the asynchronous execution model formally defined above to a wide audience of Node.js 
and Javascript developers.

## Why do we care?

Javascript is a single-threaded language, which simplifies many things.  To prevent blocking IO, 
operations are pushed onto the background and associated with callback functions written in JavaScript.
When IO operations complete, the callback is pushed onto a queue for execution by Node's "event loop". 
This is explained in more detail [here](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/). 

While this model has many benefits, one of the key challenges is maintaing "context" when
asynchronous callbacks are invoked.  The papers above describe "asynchronous context" in a much more 
rigorous way, but for our purposes, we'll think of "asynchronous context" as the ability to answer, at any given point in program
execution, "what was the path of asynchronous functions that got me here"?

## Terminology
One of the key challenges with "asynchronous context" is the lack of agreed upon terminology and semantics.  Let's define some:

1.  `Execution Frame` - An `Execution Frame` is a period of program execution, defined precisely as the period of time that a special function, called a `Continuation`, is executing.  Not all function are `Continuations` (more on that below). At a lower level of abstraction, you can think of an `Execution Frame` as the period of time from when specific call frame is pushed on the stack, until that call frame is unwound off of the stack.   

2.  `Continuation` - A `Continuation` is a JavaScript function created in one `Execution Frame` and passed to a host library to be invoked later.  Upon invocation, a `Continuation` creates a new unique `Execution Frame`.  For example, when we call `setTimeout(function c() {}, 1000)`, `setTimeout` is invoked in one `Execution Frame`, with the caller passing a `Continution` (namely `c`) as a parameter.  When `c` is invoked after the timeout period, a new `Continuation` is created, and when `c` completes, that continuation is completed. 

3.  `Continuation Point` - Functions that accept a `Continuation` as a parameter are called `Continuation Points`.  `Continuation Points` are determined by convention of the host.  Some examples include `setTimeout` and `Promise.then`.  Note that not all functions that take a function as a parameter are `Continuation Points` - the parameter must be invoked *asynchronously*.  i.e., functions passed as parameters and invoked in the current `Execution Frame` are not `Continuation Points`.  For example, `Array.prototyp.forEach` is *not* considered a `Continuation Point`.

4.  `Link Point` - A `Link Point` is point in program execution where a `Continuation Point` is invoked.  This creates a logical "binding" between the current `Execution Frame` and the `Continuation` passed as a parmaeter.  We call this binding the `Linking Context`. 

5.  `Ready Point` - A `Ready Point` is a point in program execution where a previously linked `Continuation` is made "ready" to execute.  This creates a logical "binding" called the `Ready Context`, also sometimes called a `Causal Context`.  Generally, the `Ready Point` always occurs at or after the `Link Point`. Promises, however, are different. For promises, the `Ready Point` occurs when the previous promise in the promise chain is resolved.

## Events

The above definitions map nicely to a set of four events generated at runtime. These events let us track "async context":
1.  `executeBegin` - indicates the start of an `Execution Frame`. 
2.  `link` - indicates a `Continuation Point` was called and `Continuation` was "pooled" for later execution. 
3.  `ready` - indicates a `Ready Point` was reached. 
4.  `executeEnd` - indicates the end of of an `Execution Frame`.

For example, consider the code below:

```javascript
console.log('starting');
Promise p = new Promise((reject, resolve) => {
    setTimeout(function f1() {
        console.log('resolving promise');
        resolve(true);
    }, 100);
}).then(function f2() {
  console.log('in then');
}


Given our model, this would produce the following event stream:

```json
{"event": "executeBegin", "executeID": 0 } // main program body is starting
// starting
{"event": "link", "executeID":0, "linkID": 1} // indicates f1() was "linked" in the call to "setTimeout()"
{"event": "ready", "executeID":0, "linkID": 1, "readyID": 2} 
{"event": "link", "executeID":0, "linkID": 3} // indicates f2() was "linked" in the call to "then()"
{"event": "executeEnd", "executeID": 0 } // main program body is ending

{"event": "executeBegin", "executeID": 4, "readyID":2 } // callback f1() is now starting
// resolving promise
{"event": "ready", "executeID":4, "linkID": 3, "readyID": 5} // promise p is now resolved, allowing the "then(function f2()..." to proceed
{"event": "executeEnd", "executeID": 4 } // callback f1() is ending

{"event": "executeBegin", "executeID": 6, "readyID":5 } // callback f2() is now starting
// resolving promise
{"event": "executeEnd", "executeID": 6 } // callback f1() is ending
```

## Events Produce the Async Call Graph
The events above allow us to produce a Directed Acyclic Graph ([DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph))
that we call the "Async Call Graph".  Specifically, the `executeBegin`, `ready` and `link` events correspond to node & edge
creation in the graph.

## Examples & Visualizations
This all much easier to visualize.  We have a list of examples along with step-through visualizations:

 - [simplePromise](./examples/simplePromise/slideShow/async-context.html) - Shows a simple promise example's execution.
 - [simpleExpress](./examples/simpleExpress/slideShow/async-context.html) - Shows a simple express app's execution.
 - [expressMiddleware](./examples/expressMiddleware/slideShow/async-context.html) - Shows express app with middleware being used.
 - [setInterval](./examples/setInterval/slideShow/async-context.html) - Illustrates a call to setInterval.
 - [lazilyInitializedPromise](./examples/lazilyInitializedPromise/slideShow/async-context.html) - Illustrates an express app with a promise that is created & resolved in one request's context, and "then'd" in other requests' context.
 - [markdown-example-1](./examples/markdown-example-1/slideShow/async-context.html) - Shows example 1 from the Async Context Definitions [document](./Async-Context-Definitions.md)
 - [markdown-example-2](./examples/markdown-example-2/slideShow/async-context.html) - Shows example 2 from the  Async Context Definitions[document](./Async-Context-Definitions.md)
 
