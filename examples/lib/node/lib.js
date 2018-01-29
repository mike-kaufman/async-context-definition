
function output(s) {
    const obj = {
        'event': 'output',
        'data': {
            'output': s
        }
    }
    console.log(JSON.stringify(obj) + ',');
}

module.exports = {
    output
}
