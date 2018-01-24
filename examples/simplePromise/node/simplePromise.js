ah = require('../../lib/node/ah');
lib = require('../../lib/node/lib')
lib.output('AAA');
const p = new Promise((resolve, reject) => {
        setTimeout(() => {
            lib.output('BBB');
            resolve(true);
        }, 100);
    }).then((v) => {
  lib.output('CCC');
});
