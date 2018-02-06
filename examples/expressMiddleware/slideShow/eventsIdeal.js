var records = [
    {"event":"executeBegin","executeID":0, "data": {"highlightLine": 1}},
    {"event":"output","data":{"output":"Express app is starting", "highlightLine": 6}},
    {"event":"link","executeID":0,"linkID":1,"data":{"type":"app.listen()", "highlightLine": 36}},
    {"event":"cause","executeID":0,"linkID":1,"causeID":2, "data": {"highlightLine": 36}},
    {"event":"executeEnd","executeID":0},

    {"event":"executeBegin","executeID":3,"causeID":2, "data": {"highlightLine": 36}},
    {"event":"output","data":{"output":"Listening on 3000", "highlightLine": 37}},
    {"event":"executeEnd","executeID":3},

    {"event":"executeBegin","executeID":4,"causeID":2, "data": {"highlightLine": 36}},
    {"event":"output","data":{"output":"in f1", "highlightLine": 21}},
    {"event":"link","executeID":4,"linkID":5,"data":{"type":"app.listen()", "highlightLine": 12}},
    {"event":"cause","executeID":4,"linkID":5,"causeID":6, "data": {"highlightLine": 12}},
    {"event":"output","data":{"output":"received request 1", "highlightLine": 28}},
    {"event":"link","executeID":4,"linkID":7,"data":{"type":"then()", "highlightLine": 29}},
    {"event":"executeEnd","executeID":4},

    {"event":"executeBegin","executeID":8,"causeID":6, "data": {"highlightLine": 12}},
    {"event":"output","data":{"output":"resolving promise", "highlightLine": 13}},
    {"event":"cause","executeID":8,"linkID":7,"causeID":9, "data": {"highlightLine": 14}},
    {"event":"executeEnd","executeID":8},

    {"event":"executeBegin","executeID":10,"causeID":9, "data": {"highlightLine": 29}},
    {"event":"output","data":{"output":"sending response", "highlightLine": 30}},
    {"event":"executeEnd","executeID":10}
];

var codeLines = `const express = require('express');
const app = express();

const log = console.log;

log('Express app is starting');

let numRequests = 0;

function createPromise(body) {
    const p = new Promise((resolve, reject) => {
        setImmediate(() => { 
            log('resolving promise')
            resolve(body) 
        });
    });
    return p;
}

app.use(function f1(req, res, next) {
    log('in f1')
    req.body = createPromise(req.body);
    next();
});

app.get("/", function f2(req, res) {
    ++numRequests;
    log(\`received request \${numRequests}\`);
    req.body.then(() => {
        log('sending response');
        res.send('hello world!');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function f3() {
    log(\`Listening on \${port}\`);
});`;