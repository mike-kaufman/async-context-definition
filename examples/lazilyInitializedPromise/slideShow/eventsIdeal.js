var records = [
    {"event":"executeBegin","executeID":0, "data": {"highlightLine": 1}},
    {"event":"output","data":{"output":"Express app is starting", "highlightLine": 4}},
    {"event":"link","executeID":0,"linkID":1,"data":{"type":"app.get()", "highlightLine": 9}},    
    {"event":"cause","executeID":0,"linkID":1,"causeID":2, "data": {"highlightLine": 9}},
    {"event":"link","executeID":0,"linkID":3,"data":{"type":"app.listen()", "highlightLine": 28}},    
    {"event":"cause","executeID":0,"linkID":3,"causeID":4, "data": {"highlightLine": 28}},
    {"event":"executeEnd","executeID":0},

    {"event":"executeBegin","executeID":5,"causeID":4, "data": {"highlightLine": 28}},
    {"event":"output","data":{"output":"Listening on 3000", "highlightLine": 29}},
    {"event":"executeEnd","executeID":5},

    {"event":"executeBegin","executeID":6,"causeID":2, "data": {"highlightLine": 9}},
    {"event":"output","data":{"output":"received request 1", "highlightLine": 11}},
    {"event":"link","executeID":6,"linkID":7,"data":{"type":"setImmediate", "highlightLine": 15}},    
    {"event":"cause","executeID":6,"linkID":7,"causeID":8, "data": {"highlightLine": 15}},
    {"event":"link","executeID":6,"linkID":9,"data":{"type":"then()", "highlightLine": 20}},
    {"event":"executeEnd","executeID":6},

    {"event":"executeBegin","executeID":10,"causeID":8, "data": {"highlightLine": 15}},
    {"event":"cause","executeID":10,"linkID":9,"causeID":11, "data": {"highlightLine": 16}},
    {"event":"executeEnd","executeID":10},

    {"event":"executeBegin","executeID":12,"causeID":11, "data": {"highlightLine": 20}},
    {"event":"output","data":{"output":"in then for request 1", "highlightLine": 21}},
    {"event":"executeEnd","executeID":12},


    {"event":"executeBegin","executeID":13,"causeID":2, "data": {"highlightLine": 9}},
    {"event":"output","data":{"output":"received request 2", "highlightLine": 11}},
    {"event":"link","executeID":13,"linkID":14,"data":{"type":"then()", "highlightLine": 20}},

    {"event":"cause","executeID":13,"linkID":14,"causeID":15, "data": {"highlightLine": 20}},
    {"event":"executeEnd","executeID":13},

    {"event":"executeBegin","executeID":16,"causeID":15, "data": {"highlightLine": 20}},
    {"event":"output","data":{"output":"in then for request 2", "highlightLine": 21}},
    {"event":"executeEnd","executeID":16}

];

var codeLines = `const express = require('express');
const app = express();

console.log('Express app is starting');

let numRequests = 0;
let lazyPromise;

app.get("/", function (req, res) {
    ++numRequests;
    console.log(\`received request \${numRequests}\`);

    if (!lazyPromise) {
        lazyPromise = new Promise((resolve, reject) => {
            setImmediate(()=> {
                resolve(true);
            });
        });
    }
    lazyPromise.then(()=> {
        console.log(\`in then for request \${numRequests}\`);
    });

    res.send(\`hello, request \${numRequests}!\`);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(\`Listening on \${port}\`);
});`;