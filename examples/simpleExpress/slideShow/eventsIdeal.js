var records = [
    {"event":"executeBegin","executeID":0, "data": {"highlightLine": 1}},
    {"event":"output","data":{"output":"Express app is starting", "highlightLine": 4}},
    {"event":"link","executeID":0,"linkID":1,"data":{"type":"app.get()", "highlightLine": 8}},    
    {"event":"cause","executeID":0,"linkID":1,"causeID":2, "data": {"highlightLine": 8}},
    {"event":"link","executeID":0,"linkID":3,"data":{"type":"app.listen()", "highlightLine": 15}},    
    {"event":"cause","executeID":0,"linkID":3,"causeID":4, "data": {"highlightLine": 15}},
    {"event":"executeEnd","executeID":0},

    {"event":"executeBegin","executeID":5,"causeID":4, "data": {"highlightLine": 16}},
    {"event":"output","data":{"output":"Listening on 3000", "highlightLine": 16}},
    {"event":"executeEnd","executeID":5},

    {"event":"executeBegin","executeID":6,"causeID":2, "data": {"highlightLine": 8}},
    {"event":"output","data":{"output":"received request 1", "highlightLine": 16}},
    {"event":"executeEnd","executeID":6},

    {"event":"executeBegin","executeID":6,"causeID":2, "data": {"highlightLine": 8}},
    {"event":"output","data":{"output":"received request 2", "highlightLine": 16}},
    {"event":"executeEnd","executeID":6},
];

var codeLines = `const express = require('express');
const app = express();

console.log('Express app is starting');

let numRequests = 0;

app.get("/", function f1(req, res) {
    ++numRequests;
    console.log(\`received request \${numRequests}\`);
    res.send('hello world!');
});

const port = process.env.PORT || 3000;
app.listen(port, function f2() {
    console.log(\`Listening on \${port}\`);
});`;