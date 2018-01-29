var records = [
    {"event":"executeBegin","executeID":0, "data": {"highlightLine": 1}},
    {"event":"link","executeID":0,"linkID":1},
    {"event":"cause","executeID":0,"linkID":1,"causeID":2},
    {"event":"link","executeID":0,"linkID":3},
    {"event":"cause","executeID":0,"linkID":3,"causeID":4},
    {"event":"executeEnd","executeID":0},
    {"event":"executeBegin","executeID":5,"causeID":2},
    {"event":"output","data":{"output":"// Hello Repeating", "highlightLine": 25}},
    {"event":"executeEnd","executeID":5},
    {"event":"executeBegin","executeID":6,"causeID":4},
    {"event":"output","data":{"output":"// Hello Once", "highlightLine": 29}},
    {"event":"link","executeID":6,"linkID":7},
    {"event":"cause","executeID":6,"linkID":7,"causeID":8},
    {"event":"executeEnd","executeID":6},
    {"event":"executeBegin","executeID":9,"causeID":2},
    {"event":"output","data":{"output":"// Hello Repeating", "highlightLine": 25}},
    {"event":"executeEnd","executeID":9},
    {"event":"executeBegin","executeID":10,"causeID":8},
    {"event":"output","data":{"output":"// Did it", "highlightLine": 32}},
    {"event":"executeEnd","executeID":10},
    {"event":"executeBegin","executeID":11,"causeID":2},
    {"event":"output","data":{"output":"// Hello Repeating", "highlightLine": 25}},
    {"event":"executeEnd","executeID":11},
    {"event":"executeBegin","executeID":12,"causeID":2},
    {"event":"output","data":{"output":"// Hello Repeating", "highlightLine": 25}},
    {"event":"executeEnd","executeID":12}
];

var codeLines = `let worklist = [];
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
});`;