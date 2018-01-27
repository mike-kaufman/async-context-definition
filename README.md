# h1  Node.js Async Context Definitions

This is an effort to formalize & visualize "asynchronous context" in Node.js applications.

The content here is a "simple summary" of more in-depth work, namely 
1. A [DLS 2017](http://2017.splashcon.org/)
[paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/08/NodeAsyncContext.pdf) that formally 
defines semantics of async execution in javascript
2.  A "translation" of the above concepts to Node.js, without the academic assumptions & formalisms, is [here](./Async-Context-Definitions.md). (*WIP*)

This page is a companion to the above.  The intention is to easily bring an
understanding of the asynchronous execution model formally defined above to a wide audience of Node.js 
and Javascript developers.

## Why do we care?

Javascript is a single-threaded language, which simplifies many things.  To prevent blocking IO, 
operations are pushed onto the background and associated with callback functions written in javascript.
When IO operations complete, the callback is pushed onto a queue for execution by Node's "event loop". 
This is explained in mroe detail [here](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/). 

This model has many benefits, but one of the key challenges is maintaing "context" when
asynchronous callbacks are invoked.  The papers above describe "asynchronous context" in a much more 
rigorous way, but for our purposes, we'll think of "asynchronous context" as the ability to answer, at any given point in program
execution, "what was the path of asynchronous functions that got me here".

## Terminology
During program execution, there are four different types of events that let us track async context:
1.  `executeBegin` - indicates the begining of execution of an asynchronous function.
2.  `link` - indicates a callback was queued for later asynchronous execution. 
3.  `cause` - indicates a previously linked function was resolved. 
4.  `executeEnd` - indicates the end of execution of an asynchronous function

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
```

Given our model, this would produce the following event stream:

```json
{"event": "executeBegin", "executeID": 0 } // main program body is starting
// starting
{"event": "link", "executeID":0, "linkID": 1} // indicates f1() was "linked" in the call to "setTimeout()"
{"event": "cause", "executeID":0, "linkID": 1, "causeID": 2} 
{"event": "link", "executeID":0, "linkID": 3} // indicates f2() was "linked" in the call to "then()"
{"event": "cause", "executeID":0, "linkID": 1, "causeID": 2} 
{"event": "executeEnd", "executeID": 0 } // main program body is ending

{"event": "executeBegin", "executeID": 4, "causeID":2 } // callback f1() is now starting
// resolving promise
{"event": "cause", "executeID":4, "linkID": 3, "causeID": 5} // promise p is now resolved, allowing the "then(function f2()..." to proceed
{"event": "executeEnd", "executeID": 4 } // callback f1() is ending

{"event": "executeBegin", "executeID": 6, "causeID":5 } // callback f2() is now starting
// resolving promise
{"event": "executeEnd", "executeID": 6 } // callback f1() is ending
```

## Events product a Directed Acyclic Graph (DAG)
The events above allow us to produce a Directed Acyclic Graph [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph) 
that we call the "Async Call Graph".  Specifically, the `executeBegin`, `cause` and `link` events correspond to node & edge
creation in the graph.

## Examples & Visualizations
This all much easier to visualize.  We have a list of examples along with step-through visualizations:

 - [simplePromise](./examples/simplePromise/slideShow/async-context.html) - Shows a simple promise example's execution.
