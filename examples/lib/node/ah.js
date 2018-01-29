const async_hooks = require('async_hooks');
const fs = require('fs');
const os = require('os');
let indent = 0;

const triggerIdMap = {};

function getTriggerforAsyncId(asyncId) {
    let val = triggerIdMap[asyncId];
    if (val === undefined) {
        val = -1;
    }
    return val;
}

function setTriggerforAsyncId(asyncId, triggerAsyncId) {
    if (triggerIdMap[asyncId] !== undefined) {
       throw new error(`ID ${asyncId} already has triggerID ${triggerIdMap[asyncId]}`);
    }
    triggerIdMap[asyncId] = triggerAsyncId;
}

function writeEvent(e) {
    const s = `${JSON.stringify(e, undefined, 0)},${os.EOL}`
    fs.writeSync(1, s);
}

async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    const eid = async_hooks.executionAsyncId();
    // const indentStr = ' '.repeat(indent);
    // fs.writeSync(
    //   1,
    //   `${indentStr}${type}(${asyncId}):` +
    //   ` trigger: ${triggerAsyncId} execution: ${eid}\n`);

    const linkv = {
        event: "link",
        executeID: eid,
        linkID: asyncId,
        data: {
            type
        }
    };
    writeEvent(linkv);

    const causev ={
        event: "cause",
        executeID: eid,
        linkID: asyncId,
        causeID: triggerAsyncId
    };

    setTriggerforAsyncId(asyncId, triggerAsyncId);
    writeEvent(causev);    
  },
  before(asyncId) {
    // const indentStr = ' '.repeat(indent);
    // fs.writeSync(1, `${indentStr}before:  ${asyncId}\n`);
    // indent += 2;
    // ,
    //fs.writeSync(1, `${indentStr}before:  ${asyncId}\n`);
    const v = {
        event: "executeBegin",
        executeID: asyncId,
        causeID: getTriggerforAsyncId(asyncId)
    };
    writeEvent(v);
  },
  after(asyncId) {
    // indent -= 2;
    // const indentStr = ' '.repeat(indent);
    // fs.writeSync(1, `${indentStr}after:   ${asyncId}\n`);
    const v = {
        event: "executeEnd",
        executeID: asyncId
    };
    writeEvent(v);
},
  destroy(asyncId) {
    // const indentStr = ' '.repeat(indent);
    // fs.writeSync(1, `${indentStr}destroy: ${asyncId}\n`);
  },
}).enable();

module.exports = {};