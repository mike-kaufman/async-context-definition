ah = require('./ah.js');
//console.log('hello');
const p = new Promise((resolve, reject) => {
    Promise.resolve('hello').then((v) => {
        console.log(v);
        setTimeout(() => {
            resolve('resolving promise in timeout');
        }, 100);
    });
}).then((v) => {
  console.log('in then: ' + v);
});
