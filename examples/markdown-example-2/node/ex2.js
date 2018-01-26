let globalCtxCtr = 0;
function generateNextContextID() {
  return ++globalCtxCtr;
}

let globalTimeCtr = 0;
function generateNextTime() {
  return ++globalTimeCtr;
}

// initialize to "root context" of 0
let currentExecutingContext = 0;

function emit(obj) {
  console.log(JSON.stringify(obj));
}

function link(f) {
  const linkID = generateNextContextID();
  emit({event: "link", executeID: currentExecutingContext, linkID});

  return { function: f, linkID };
}

function cause(ctxf) {
  const causeID = generateNextContextID();
  emit({event: "cause", executeID: currentExecutingContext, linkID: ctxf.linkID, causeID });

  return Object.assign(ctxf, { causeID });
}

function execute(ctxf) {
  const origCtx = currentExecutingContext;
  currentExecutingContext = generateNextContextID();

  emit({event: "executeBegin", executeID: currentExecutingContext, causeID: ctxf.causeID});

  let res = undefined;
  try {
    res = ctxf.function.call(null);
  }
  finally {
    emit({event: "executeEnd", executeID: currentExecutingContext});
    currentExecutingContext = origCtx;
  }

  return res;
}

// -- 

function then(onFulfilled, onRejected) {
    const cfFulfilled = link(onFulfilled);
    //cfFulfilled = link(cfFulfilled);

    var cfRejected = link(onRejected);
    //link(cfRejected);

    if(this.isResolved) {
      if(this.success) {
        cfFulfilled = cause(cfFulfilled);
      }
      else {
        cfRejected = cause(cfRejected);
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
```js
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