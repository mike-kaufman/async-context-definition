import * as fs from 'fs';
import * as process from 'process';

import {IAsyncEventListener, IEvent, EventType, addListener} from './async-context-events';
import {getAsyncTrack, IAsyncTrack} from './async-track';
class L implements IAsyncEventListener{
    public events: IEvent[] = [];

    public onAsyncEvent(e: IEvent) {
        this.events.push(e);
    }

    private writeEvent(e: IEvent) {
        console.log(JSON.stringify(e));
    }
}

let _sourceFile:string;
const l = new L();
process.on('beforeExit', () => {
    let lines = '';
    if (_sourceFile) {
        let buff = fs.readFileSync(_sourceFile);
        lines = buff.toString();
        lines = lines.replace(/\`/g, '\\`');
        lines = lines.replace(/\$/g, '\\$');
    }
    const output = `var records = ${JSON.stringify(l.events, undefined, '')};

    var codeLines = \`${lines}\`;`

  fs.writeFileSync('async-events-async-track.js', output);  
});

export function init(sourceFile: string) {
    _sourceFile = sourceFile;
// TODO:  this isn't factored correctly.  Need to move inside async-context-events.
const asyncTrack: IAsyncTrack = getAsyncTrack();

addListener(l);
}