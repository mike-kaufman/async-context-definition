
# Overview
Goal here is to get to some "layman-appropriate" set of definitions for the concepts in the async-context paper.  Let's iterate on this to see if we can get to something concrete enough that we can open up to the braoder node.js community. 

## Terminology

###  **Async Call Tree**
A tree that represents the asynchronous execution flow in a Node.js program.

###  **Async Operation**  
A node in the tree.  Each node represents an a specific asynchronous invocation of some function f.  
    *TODO* 
    - example w/ one function invoked two times
    ```
    ```

#### State of each Async-Op
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