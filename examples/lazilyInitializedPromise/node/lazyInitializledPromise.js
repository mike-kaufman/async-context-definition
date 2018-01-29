const express = require('express');
const app = express();

console.log('Express app is starting');

let numRequests = 0;
let lazyPromise;

app.get("/", function (req, res) {
    ++numRequests;
    console.log(`received request ${numRequests}`);

    if (!lazyPromise) {
        lazyPromise = new Promise((resolve, reject) => {
            setImmediate(()=> {
                resolve(true);
            });
        });
    }
    lazyPromise.then(()=> {
        console.log(`in then for request ${numRequests}`);
        res.send(`hello, request ${numRequests}!`);
    });

});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Listening on ${port}`);
});
