var records = [
{event: "executeBegin", executeID: "0", "data":{"highlightLine": 1} },
{"event":"output","data":{"output":"// Promise P", "highlightLine": 2}},
{event: "link", "executeID":0,"linkID":1, "data":{"highlightLine": 3} },
{event: "cause", "executeID":0, linkID: 1, causeID: 2, "data":{"highlightLine": 3} },
{"event":"output","data":{"output":"// Promise then", "highlightLine": 9}},
{event: "link",  "executeID":0, linkID: 3,  "data":{"highlightLine": 10}},
{event: "executeEnd", executeID: "0" },
{"event":"executeBegin","executeID":4,"causeID":2,  "data":{"highlightLine": 4}},
{"event":"output","data":{"output":"// Promise resolve", "highlightLine": 4}},
{event: "cause", "executeID": 4, linkID: 3, causeID: 5,  "data":{"highlightLine": 5}},
{event: "executeEnd", executeID: 4, },
{event: "executeBegin", executeID: 6, causeID: 5, "data":{"highlightLine": 11}},
{"event":"output","data":{"output":"// Hello 42 World!", "highlightLine": 11}},
{event: "executeEnd", executeID: 6}
];

var codeLines = `const p = new Promise((res) => {
    console.log("Promise p");
    callbackOnce(() => {
      console.log("Promise resolve");
      res(42);
    });
});

console.log("Promise then");
p.then((val) => {
    console.log(\`Hello \${val} World!\`);
});`;