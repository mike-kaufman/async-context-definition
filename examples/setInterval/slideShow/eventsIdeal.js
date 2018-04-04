var records = [
    {"event":"executeBegin","executeID":0, "data": {"highlightLine": 1}},
    {"event":"output","data":{"output":"starting", "highlightLine": 1}},
    {"event":"link","executeID":0,"linkID":1,"data":{"type":"setInterval", "highlightLine": 3}},    
    {"event":"cause","executeID":0,"linkID":1,"causeID":2, "data": {"highlightLine": 3}},
    {"event":"executeEnd","executeID":0},

    {"event":"executeBegin","executeID":4,"causeID":2, "data": {"highlightLine": 4}},
    {"event":"output","data":{"output":"Stating iteration 1", "highlightLine": 5}},
    {"event":"link","executeID":4,"linkID":5,"data":{"type":"setTimeout", "highlightLine": 7}},    
    {"event":"cause","executeID":4,"linkID":5,"causeID":6, "data": {"highlightLine": 7}},
    {"event":"link","executeID":4,"linkID":7,"data":{"type":"then()", "highlightLine": 11}},    
    {"event":"executeEnd","executeID":4},

    {"event":"executeBegin","executeID":8,"causeID":6, "data": {"highlightLine": 7}},
    {"event":"output","data":{"output":"resolving iteration 1", "highlightLine": 8}},
    {"event":"cause","executeID":8,"linkID":7,"causeID":9, "data": {"highlightLine": 9}},
    {"event":"executeEnd","executeID":8},

    {"event":"executeBegin","executeID":10,"causeID":9, "data": {"highlightLine": 11}},
    {"event":"output","data":{"output":"then'd iteration 1", "highlightLine": 12}},
    {"event":"executeEnd","executeID":10},

    {"event":"executeBegin","executeID":11,"causeID":2, "data": {"highlightLine": 4}},
    {"event":"output","data":{"output":"Stating iteration 2", "highlightLine": 5}},
    {"event":"link","executeID":11,"linkID":12,"data":{"type":"setTimeout", "highlightLine": 7}},    
    {"event":"cause","executeID":11,"linkID":12,"causeID":13, "data": {"highlightLine": 7}},
    {"event":"link","executeID":11,"linkID":14,"data":{"type":"then()", "highlightLine": 11}},
    {"event":"output","data":{"output":"clearing interval", "highlightLine": 16}},
    {"event":"executeEnd","executeID":11},

    {"event":"executeBegin","executeID":15,"causeID":13, "data": {"highlightLine": 7}},
    {"event":"output","data":{"output":"resolving iteration 2", "highlightLine": 8}},
    {"event":"cause","executeID":15,"linkID":14,"causeID":16, "data": {"highlightLine": 9}},
    {"event":"executeEnd","executeID":15},

    {"event":"executeBegin","executeID":17,"causeID":16, "data": {"highlightLine": 11}},
    {"event":"output","data":{"output":"then'd iteration 2", "highlightLine": 12}},
    {"event":"executeEnd","executeID":17}
];

var codeLines = `console.log('starting');
let counter = 0;
const interval = setInterval(function f1() {
    const myIteration = ++counter;
    console.log(\`Staring iteration \${myIteration}\`);
    const p = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(\`resolving interation \${myIteration}\`);
            resolve(true);
        }, 100);
    }).then(()=>{
        console.log(\`then'd iteration \${myIteration}\`);
    })
    if (counter === 2) {
        console.log(\`clearing interval\`);
        clearInterval(interval);
    }
}, 1000);`;