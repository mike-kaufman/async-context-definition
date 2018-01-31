var records = [
{"event":"output","data":{"output":"Express app is starting"}},
{"event":"link","executeID":1,"linkID":5,"data":{"type":"TickObject"}},
{"event":"cause","executeID":1,"linkID":5,"causeID":1},
{"event":"link","executeID":1,"linkID":6,"data":{"type":"TCPWRAP"}},
{"event":"cause","executeID":1,"linkID":6,"causeID":1},
{"event":"link","executeID":1,"linkID":7,"data":{"type":"TickObject"}},
{"event":"cause","executeID":1,"linkID":7,"causeID":6},
{"event":"executeBegin","executeID":5,"causeID":1},
{"event":"executeEnd","executeID":5},
{"event":"executeBegin","executeID":7,"causeID":6},
{"event":"output","data":{"output":"Listening on 3000"}},
{"event":"link","executeID":7,"linkID":8,"data":{"type":"TickObject"}},
{"event":"cause","executeID":7,"linkID":8,"causeID":7},
{"event":"executeEnd","executeID":7},
{"event":"executeBegin","executeID":8,"causeID":7},
{"event":"executeEnd","executeID":8},
{"event":"link","executeID":0,"linkID":9,"data":{"type":"TCPWRAP"}},
{"event":"cause","executeID":0,"linkID":9,"causeID":6},
{"event":"executeBegin","executeID":6,"causeID":1},
{"event":"link","executeID":6,"linkID":10,"data":{"type":"TIMERWRAP"}},
{"event":"cause","executeID":6,"linkID":10,"causeID":6},
{"event":"link","executeID":6,"linkID":11,"data":{"type":"Timeout"}},
{"event":"cause","executeID":6,"linkID":11,"causeID":6},
{"event":"link","executeID":6,"linkID":12,"data":{"type":"HTTPPARSER"}},
{"event":"cause","executeID":6,"linkID":12,"causeID":6},
{"event":"link","executeID":6,"linkID":13,"data":{"type":"HTTPPARSER"}},
{"event":"cause","executeID":6,"linkID":13,"causeID":6},
{"event":"link","executeID":6,"linkID":14,"data":{"type":"TickObject"}},
{"event":"cause","executeID":6,"linkID":14,"causeID":6},
{"event":"executeEnd","executeID":6},
{"event":"executeBegin","executeID":14,"causeID":6},
{"event":"executeEnd","executeID":14},
{"event":"executeBegin","executeID":13,"causeID":6},
{"event":"output","data":{"output":"in f1"}},
{"event":"link","executeID":13,"linkID":15,"data":{"type":"TickObject"}},
{"event":"cause","executeID":13,"linkID":15,"causeID":13},
{"event":"link","executeID":13,"linkID":16,"data":{"type":"PROMISE"}},
{"event":"cause","executeID":13,"linkID":16,"causeID":13},
{"event":"link","executeID":13,"linkID":17,"data":{"type":"Immediate"}},
{"event":"cause","executeID":13,"linkID":17,"causeID":13},
{"event":"output","data":{"output":"received request 1"}},
{"event":"link","executeID":13,"linkID":18,"data":{"type":"TickObject"}},
{"event":"cause","executeID":13,"linkID":18,"causeID":13},
{"event":"link","executeID":13,"linkID":19,"data":{"type":"PROMISE"}},
{"event":"cause","executeID":13,"linkID":19,"causeID":16},
{"event":"executeEnd","executeID":13},
{"event":"executeBegin","executeID":13,"causeID":6},
{"event":"link","executeID":13,"linkID":20,"data":{"type":"TickObject"}},
{"event":"cause","executeID":13,"linkID":20,"causeID":13},
{"event":"executeEnd","executeID":13},
{"event":"executeBegin","executeID":13,"causeID":6},
{"event":"executeEnd","executeID":13},
{"event":"executeBegin","executeID":15,"causeID":13},
{"event":"executeEnd","executeID":15},
{"event":"executeBegin","executeID":18,"causeID":13},
{"event":"executeEnd","executeID":18},
{"event":"executeBegin","executeID":20,"causeID":13},
{"event":"executeEnd","executeID":20},
{"event":"link","executeID":0,"linkID":21,"data":{"type":"TCPWRAP"}},
{"event":"cause","executeID":0,"linkID":21,"causeID":6},
{"event":"executeBegin","executeID":6,"causeID":1},
{"event":"link","executeID":6,"linkID":22,"data":{"type":"Timeout"}},
{"event":"cause","executeID":6,"linkID":22,"causeID":6},
{"event":"link","executeID":6,"linkID":23,"data":{"type":"HTTPPARSER"}},
{"event":"cause","executeID":6,"linkID":23,"causeID":6},
{"event":"link","executeID":6,"linkID":24,"data":{"type":"HTTPPARSER"}},
{"event":"cause","executeID":6,"linkID":24,"causeID":6},
{"event":"link","executeID":6,"linkID":25,"data":{"type":"TickObject"}},
{"event":"cause","executeID":6,"linkID":25,"causeID":6},
{"event":"executeEnd","executeID":6},
{"event":"executeBegin","executeID":25,"causeID":6},
{"event":"executeEnd","executeID":25},
{"event":"link","executeID":0,"linkID":26,"data":{"type":"TCPWRAP"}},
{"event":"cause","executeID":0,"linkID":26,"causeID":6},
{"event":"executeBegin","executeID":6,"causeID":1},
{"event":"link","executeID":6,"linkID":27,"data":{"type":"Timeout"}},
{"event":"cause","executeID":6,"linkID":27,"causeID":6},
{"event":"link","executeID":6,"linkID":28,"data":{"type":"HTTPPARSER"}},
{"event":"cause","executeID":6,"linkID":28,"causeID":6},
{"event":"link","executeID":6,"linkID":29,"data":{"type":"HTTPPARSER"}},
{"event":"cause","executeID":6,"linkID":29,"causeID":6},
{"event":"link","executeID":6,"linkID":30,"data":{"type":"TickObject"}},
{"event":"cause","executeID":6,"linkID":30,"causeID":6},
{"event":"executeEnd","executeID":6},
{"event":"executeBegin","executeID":30,"causeID":6},
{"event":"executeEnd","executeID":30},
{"event":"executeBegin","executeID":17,"causeID":13},
{"event":"output","data":{"output":"resolving promise"}},
{"event":"link","executeID":17,"linkID":31,"data":{"type":"TickObject"}},
{"event":"cause","executeID":17,"linkID":31,"causeID":17},
{"event":"executeEnd","executeID":17},
{"event":"executeBegin","executeID":31,"causeID":17},
{"event":"executeEnd","executeID":31},
{"event":"executeBegin","executeID":19,"causeID":16},
{"event":"output","data":{"output":"sending response"}},
{"event":"link","executeID":19,"linkID":32,"data":{"type":"TickObject"}},
{"event":"cause","executeID":19,"linkID":32,"causeID":19},
{"event":"link","executeID":19,"linkID":33,"data":{"type":"TIMERWRAP"}},
{"event":"cause","executeID":19,"linkID":33,"causeID":19},
{"event":"link","executeID":19,"linkID":34,"data":{"type":"Timeout"}},
{"event":"cause","executeID":19,"linkID":34,"causeID":19},
{"event":"link","executeID":19,"linkID":35,"data":{"type":"TickObject"}},
{"event":"cause","executeID":19,"linkID":35,"causeID":19},
{"event":"executeEnd","executeID":19},
{"event":"executeBegin","executeID":32,"causeID":19},
{"event":"executeEnd","executeID":32},
{"event":"executeBegin","executeID":35,"causeID":19},
{"event":"link","executeID":35,"linkID":36,"data":{"type":"TickObject"}},
{"event":"cause","executeID":35,"linkID":36,"causeID":35},
{"event":"link","executeID":35,"linkID":37,"data":{"type":"TIMERWRAP"}},
{"event":"cause","executeID":35,"linkID":37,"causeID":35},
{"event":"link","executeID":35,"linkID":38,"data":{"type":"Timeout"}},
{"event":"cause","executeID":35,"linkID":38,"causeID":35},
{"event":"executeEnd","executeID":35},
{"event":"executeBegin","executeID":36,"causeID":35},
{"event":"link","executeID":36,"linkID":39,"data":{"type":"TickObject"}},
{"event":"cause","executeID":36,"linkID":39,"causeID":36},
{"event":"link","executeID":36,"linkID":40,"data":{"type":"TickObject"}},
{"event":"cause","executeID":36,"linkID":40,"causeID":36},
{"event":"link","executeID":36,"linkID":41,"data":{"type":"TickObject"}},
{"event":"cause","executeID":36,"linkID":41,"causeID":36},
{"event":"executeEnd","executeID":36},
{"event":"executeBegin","executeID":39,"causeID":36},
{"event":"executeEnd","executeID":39},
{"event":"executeBegin","executeID":40,"causeID":36},
{"event":"executeEnd","executeID":40},
{"event":"executeBegin","executeID":41,"causeID":36},
{"event":"executeEnd","executeID":41},
{"event":"executeBegin","executeID":33,"causeID":19},
{"event":"executeBegin","executeID":34,"causeID":19},
{"event":"executeEnd","executeID":34},
{"event":"executeEnd","executeID":33},
{"event":"executeBegin","executeID":37,"causeID":35},
{"event":"executeBegin","executeID":38,"causeID":35},
{"event":"executeEnd","executeID":38},
{"event":"executeEnd","executeID":37},
{"event":"executeBegin","executeID":9,"causeID":6},
{"event":"executeEnd","executeID":9}
]

var codeLines = '';
var codeLinesXXX = `const ah = require('../../lib/node/ah'); 
const lib = require('../../lib/node/lib');
const express = require('express');
const app = express();

const log = lib.output;

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