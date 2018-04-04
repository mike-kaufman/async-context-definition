const xx = require( '../../../async-track/out/async-context-events');
const x = require('../../../async-track/out/event-listener');
x.init(__filename);
xx.raiseBeforeExecuteEvent();

console.log('starting');
let counter = 0;
const interval = setInterval(() => {
    const myIteration = ++counter;
    console.log(`Staring iteration ${myIteration}`);
    const p = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`resolving interation ${myIteration}`);
            resolve(true);
        }, 100);
    }).then(() => {
        console.log(`then'd iteration ${myIteration}`);
    });
    if (counter === 2) {
        console.log(`clearing interval`);
        clearInterval(interval);
    }
}, 1000);

xx.raiseAfterExecuteEvent();