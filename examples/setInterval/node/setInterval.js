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
    if (counter === 3) {
        console.log(`clearing interval`);
        clearInterval(interval);
    }
}, 1000);

