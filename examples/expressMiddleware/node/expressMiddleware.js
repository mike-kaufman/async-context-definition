const express = require('express');
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
    log(`received request ${numRequests}`);
    req.body.then(() => {
        log(`sending response`);
        res.send('hello world!');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function f3() {
    log(`Listening on ${port}`);
});
