ah = require('../lib/ah');
lib = require('../lib/lib')
lib.output('starting');
const p = new Promise((resolve, reject) => {
        setTimeout(() => {
            lib.output('resolving promise in timeout');
            resolve(true);
        }, 100);
    }).then((v) => {
  lib.output('in "then": ' + v);
});
