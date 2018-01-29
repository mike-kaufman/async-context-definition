const express = require('express');
const app = express();

console.log('Express app is starting');

let numRequests = 0;

app.get("/", function (req, res) {
    ++numRequests;
    console.log(`received request ${numRequests}`);
    res.send('hello world!');
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Listening on ${port}`);
});
