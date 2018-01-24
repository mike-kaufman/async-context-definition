var records = [
    {"event":"executeBegin","executeID":1, "data": {"highlightLine": 1}},
    {"event":"output","data":{"output":"AAA", "highlightLine": 2}},
    {"event":"link","executeID":1,"linkID":8,"data":{"type":"setTimeout", "highlightLine": 4}},    
    {"event":"cause","executeID":1,"linkID":8,"causeID":6, "data": {"highlightLine": 4}},
    {"event":"link","executeID":1,"linkID":9,"data":{"type":"PROMISE", "highlightLine": 8}},
    {"event":"executeEnd","executeID":1},
    {"event":"executeBegin","executeID":10,"causeID":6, "data": {"highlightLine": 5}},
    {"event":"output","data":{"output":"BBB", "highlightLine": 5}},
    {"event":"cause","executeID":10,"linkID":9,"causeID":11, "data": {"highlightLine": 6}},
    {"event":"executeEnd","executeID":10},
    {"event":"executeBegin","executeID":12,"causeID":11, "data": {"highlightLine": 9}},
    {"event":"output","data":{"output":"CCC","highlightLine": 9}},
    {"event":"executeEnd","executeID":12}
];

var codeLines = `lib = require('../../lib/node/lib')
lib.output('AAA');
const p = new Promise((resolve, reject) => {
        setTimeout(() => {
            lib.output('BBB');
            resolve(true);
        }, 100);
    }).then((v) => {
  lib.output('CCC');
});`;