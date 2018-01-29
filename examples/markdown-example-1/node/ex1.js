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

let worklist = [];
setInterval(() => {
  const wl = worklist;
  worklist = [];
  wl.forEach((entry) => {
    execute(entry.task);
    if(entry.isRepeat) {
      worklist.push(entry);
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
  worklist.push({task: cf, isRepeat: true});
}

callbackRepeating(() => console.log("// Hello Repeating"));

let doit = true;
callbackOnce(() => {
  console.log("// Hello Once") 
  if(doit) {
    doit = false;
    callbackOnce(() => console.log("// Did it"));
  }
});