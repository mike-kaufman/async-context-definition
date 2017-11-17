
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

# Terminology
In this section we introduce the core concepts that define asynchronous calls 
and the relations between them in a manner that is independent of the underlying 
implementation details.

## Informal Definition of Asynchronous Execution
Informally we consider any function which is stored in a collection to be 
invoked, later when some condition is satisfied or event has transpired, to be 
part of an `asynchronous execution`. This definition encompasses functions stored in 
the UV event loop, the Node.js timer lists, event listeners, and even functions 
stored in user defined pools.

## Indexed Invocations
A single function object _f_ may be invoked multiple times during the execution 
of an application (in both synchronous and asynchronous contexts). To allow us 
to differentiate these executions we introduce a _global_ counter that is 
incremented at each function invocation _and_ the dynamic invocation is indexed (tagged) 
with the counter. Thus for the code:
```
let words = ["hi", "bye"];
function f = function() { console.log(words.shift()); }
function g = function() { console.log("middle"); }
f();
g();
f();
```
We would say that _dynamically_ the `indexed invocation` _f<sup>1</sup>_ prints 
"hi", _g<sup>2</sup>_ prints "middle", and invocation _f<sup>3</sup>_ prints "bye".

## **Invoked Before**
Given two indexed invocations _f<sup>k</sup>_ and _g<sup>l</sup>_ we defined the 
`invoked before` relation as:
_f<sup>k</sup>_ `invoked before` _g<sup>l</sup>_ _iff_ k < l.

This order allows us to provide a simple global total order on any asynchronous 
callbacks that are invoked during an applications execution. In our example we 
have _f<sup>1</sup>_ `invoked before` _g<sup>2</sup>_ and _f<sup>1</sup>_ 
`invoked before` _f<sup>3</sup>_ but **NOT** _f<sup>3</sup>_ `invoked before` _g<sup>2</sup>_.

## **Asynchronous Linking**
A key concept in our definition of asynchronous execution is the storing of a 
function into some structure that defers the execution until some later point. 
Thus, for a function to actually be invoked as part of an `asynchronous execution` 
it must first be `linked` into an asynchronous callback storage location. The 
execution of functions from a location may be conditional on some other event 
which may/may not occour, e.g., promises that are never resolved/rejected or 
event listeners where the underlying event is never emitted. Thus, this linking 
**does NOT** always imply that the function will actually be executed in the future. 

As 

**TODO:** later we want an example of a linked but not caused function...



###  **Async Callback Invocation** 



###  **Async Call Tree**
A tree that represents the asynchronous execution flow in a Node.js program.

###  **Async Operation**  
A node in the tree.  Each node represents an a specific asynchronous invocation of some function f.  
    *TODO* 
    - example w/ one function invoked two times
    ```
    ```

## Asynchronous Operation Metadata
Each `AsyncOperation` node will be in  exactly one of the following states at any given time.  An `AsyncOperation` node can be in each state exactly once.   

  1. Queued - in execution queue, but not yet ready to execute.
  2. Ready  - in execution queue and ready to execute, but not yet executing
  3. Executing - currently executing in the event loop.
  4. ChildrenPending - execution is finished, and there are one more more `AsyncOperation` child nodes not in the `Retired` state.
  5. Retired  - execution is finished, and there are no children in the `ChildrenPending` state.

### **Linking Context** 
A directed edge between two `Async Operation` nodes that indicates the parent node's execution has "queued" the child node for execution.
  *TODO* 
      - example 

### **Causal Context** 
A directed edge between two `Async Operation` nodes that indicates the parent node's execution has "enabled" the child node for execution.
  *TODO* 
      - example

### **Async Execution Chain** 
A path through the tree.

### **Async Event Stream**
Stream of events that indicate state changes of the Async Call Tree.  State changes can include state changes on `Async Operation` nodes and new `Linking Context` and `Causal Context` edges being defined.  Stream events can be interpreted to construct a "live tree". 

## Use Cases

### Post-Mortem Use Cases
Post-mortem use cases occur after program execution has ended.  These include reconstruction of async context state at some point in time, or understanding timing details.  

  1.  Understand execution & timing details of an async call path 
  2.  Understand parent/child relationshipo in async call paths
  3.  Reconstruct async call tree to some point in time given an event stream 

### Online Use Cases
Online use cases rely on some accurate "live tree" to navigate.   

  1.  Continuation Local Storage
  2.  Async exception handling
  3.  Long stack capture


## User Space Queueing

## Examples

### Promise.All

### Promise with unhandled rejection

### Callback w/ user space Queueing