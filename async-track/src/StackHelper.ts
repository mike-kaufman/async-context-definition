
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

// tslint:disable-next-line:no-var-requires
const sourcemap = require('source-map');

// note:  this interface is consistent with the stack frame interface from https://github.com/stacktracejs/error-stack-parser/blob/master/error-stack-parser.d.ts
// the intention was to use the stack-frame GPS module and our own parsing logic that runs ~2x faster than stackframejs stack frame parsing.  However,
// there are errors about xmlhttprequest being undefined in stackframe-gps.  These can possibly be worked around, so we'll maintain a consistent
// interface, but our own source-map logic is implemented herein.
export interface IStackFrame {
    functionName: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
    source: string;
}

export interface IStackHelper {
    captureStack(stackTopFunction, numFrames?: number): IStackFrame[];
    mapFrames(frames: IStackFrame[], callback: (mappedFrames: IStackFrame[]) => void): void;
    tryGetFirstUserCodeFrame(stackFrames: IStackFrame[]): IStackFrame;
}

export class StackHelper implements IStackHelper {

    /**
     * cache of generated source files to the SourceMapConsumer instance
     */
    private mapCache: { [key: string]: Object } = {};

    /**
     * keep track of any strings we can't parse so we only report an error once per string
     */
    private reportedErrors: { [key: string]: boolean } = {};

    public constructor() {
    }

    private agentRoot = path.resolve(path.join(__dirname, './'));

    /**
     * capture the current stack trace.
     *
     * @stackTopFunction is a function that will mark the top of the stack in the returned trace.
     * All functions include stackTopFunction & above will be omitted.
     *
     * @numFrames - the number of stack frames to capture
     *
     */
    public captureStack(stackTopFunction, numFrames?: number): IStackFrame[] {
        const parsedFrames: IStackFrame[] = [];

        if (numFrames > 0) {
            const obj = {
                stack: undefined
            };

            /* tslint:disable:no-any */
            const saveLimit = (<any>Error).stackTraceLimit;
            (<any>Error).stackTraceLimit = numFrames;
            try {
                (<any>Error).captureStackTrace(obj, stackTopFunction);
            }
            finally {
                (<any>Error).stackTraceLimit = saveLimit;
            }
            /* tslint:enable:no-any */

            let frames = obj.stack.split('\n');

            // start parsing at 1 since first entry will say 'error'
            for (let i = 1; i < frames.length; i++) {
                if (frames[i]) {
                    let frame = this.parseFrameEntry(frames[i]);
                    parsedFrames.push(frame);
                }
            }
        }

        return parsedFrames;
    }

    /**
     * will return the first frame on the stack above stackTopFunction and not in the node_modules directory and
     * not a native module.  If such a frame can't be found, it will return the top of the stack.
     */
    public tryGetFirstUserCodeFrame(frames: IStackFrame[]): IStackFrame {
        let loc: IStackFrame;
        if (frames && frames.length > 0) {
            loc = frames[0];

            // find first stack frame that appears to be part of user's app, namely not in node_modules and not 'native'
            const nodeModules = path.sep + 'node_modules' + path.sep;
            for (let i = 0; i < frames.length; i++) {
                if (frames[i].fileName && !this.isBuiltIn(frames[i]) && !this.isAsyncTrackFrame(frames[i]) && frames[i].fileName !== 'native' && frames[i].fileName.indexOf(nodeModules) === -1) {
                    loc = frames[i];
                    break;
                }
            }
        }

        return loc;
    }

    /**
     * returns true if the given frame is for glimpse code
     */
    public isAsyncTrackFrame(frame: IStackFrame): boolean {
        return frame.fileName.indexOf(this.agentRoot) === 0;
    }

    /**
     * returns true if the given frame is for a node built-in function
     */
    public isBuiltIn(frame: IStackFrame): boolean {
        // if built-in, the fileName will be something like 'http.js'.
        // in this case, path.dirname('http.js') === '.'.  Also check
        // for now directory to be safe.
        const dirname = path.dirname(frame.fileName);
        return (dirname === '.' || dirname.length === 0);
    }

    /**
     * given an array of stack frames, apply source map information to create a new array of stack frames.
     * The callback will be invoked with the new stack frames with mapping info avaialable
     */
    public mapFrames(frames: IStackFrame[], callback: (mappedFrames: IStackFrame[]) => void) {
        const self = this;
        const newFrames: IStackFrame[] = [];
        let callbacksReceived = 0;

        if (frames === undefined || frames.length === 0) {
            callback([]);
        }
        else {
            frames.forEach((currFrame, idx) => {
                self.mapFrame(currFrame, (newFrame) => {
                    ++callbacksReceived;
                    newFrames[idx] = newFrame;
                    if (callbacksReceived === frames.length) {
                        callback(newFrames);
                    }
                });
            });
        }
    }

    /**
     * given content, look up the source map UI.  Public for testing purposes.
     */
    public getMappingUriFromContent(sourceFile: string, data: string): url.Url {
        // see source map proposal:  https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit

        // TODO: support '//@" in addition to '//#' for the " source mapping Url
        // need to have the string concat below, without it will break remap-istanbul when it tries to use source maps on this file
        const sourceMapMark = '\n//# ' + 'sourceMappingURL=';

        let maploc = undefined;
        const idx = data.lastIndexOf(sourceMapMark);
        if (idx > -1) {
            let line = data.substring(idx + sourceMapMark.length);
            line = line.trim();
            return url.parse(line);
        }
        return maploc;
    }

    /**
     * Parse a string form of a single stack frame and return an IStackFrame instance.  Public for testing purposes.
     */
    public parseFrameEntry(source: string): IStackFrame {

        let openParen, closeParen, firstOpenParen, colon1, colon2: number;
        const openParenStack: number[] = [];

        for (let i = 0; i < source.length; i++) {
            switch (source[i]) {
                case '(':
                    if (openParenStack.length === 0) {
                        firstOpenParen = i;
                    }
                    openParenStack.push(i);
                    break;
                case ')':
                    openParen = openParenStack.length === 1 ? openParenStack.pop() : firstOpenParen;
                    closeParen = i;
                    break;
                case ':':
                    if (!colon1) {
                        colon1 = i;
                    }
                    else if (!colon2) {
                        colon2 = i;
                    }
                    else {
                        // we want the last two colons, so if both colon1 & colon2 have been set, advance them.
                        colon1 = colon2;
                        colon2 = i;
                    }
                    break;
                default:
                    break;
            }
        }

        let functionName, fileName, line, column: string;

        if (!openParen && !closeParen && !colon1 && !colon2) {
            if (source === '    at <anonymous>') {
                functionName = '<anonymous>';
                line = '0';
                column = '0';
                fileName = '<anonymous>';
            }
        }
        else if (0 <= openParen && openParen < colon1 && colon1 < colon2 && colon2 < closeParen) {
            // case  '    at processImmediate [as _immediateCallback] (timers.js:533:5)'
            functionName = source.substring(7, openParen).trim();
            fileName = source.substring(openParen + 1, colon1).trim();
            line = source.substring(colon1 + 1, colon2);
            column = source.substring(colon2 + 1, closeParen);
        }
        else if (colon1 && colon2) {
            // case '    at d:\\glimpse\\Glimpse.Node.Prototype\\node_modules\\mocha\\lib\\runner.js:352:7'
            functionName = '<anonymous>';
            fileName = source.substring(7, colon1).trim();
            line = source.substring(colon1 + 1, colon2);
            column = source.substring(colon2 + 1);
        }
        else if (openParen && closeParen) {
            const tryFileName = source.substring(openParen + 1, closeParen);
            if (tryFileName === 'native' || tryFileName === '<anonymous>') {
                // case '    at Array.forEach (native)' or '    at callFn.next (<anonymous>)'
                functionName = source.substring(7, openParen).trim();
                fileName = tryFileName;
                line = '0';
                column = '0';
            }
        }

        // if filename is undefined, we failed to parse the frame
        if (!fileName) {
            // if (this.errorReportingService && !this.reportedErrors[source]) {
            //     this.reportedErrors[source] = true;
            //     this.errorReportingService.reportError(createStackHelperUnsupportedStackFrameFormat(source));
            // }
            functionName = '';
            fileName = '';
            line = '0';
            column = '0';
        }

        return {
            functionName,
            fileName,
            lineNumber: parseInt(line, 10),
            columnNumber: parseInt(column, 10),
            source
        };
    }

    /**
     * given the existing stack frame, create map a new stack frame where data has been replaced with values from source maps, if available.
     */
    private mapFrame(frame: IStackFrame, callback: (mappedFrame: IStackFrame) => void) {
        const self = this;
        if (self.mapCache.hasOwnProperty(frame.fileName)) {
            // in the event we didn't load a source map, we'll populate the cache with undefined.
            const mappedFrame = self.createMappedFrame(self.mapCache[frame.fileName], frame);
            callback(mappedFrame);
        }
        else {
            self.getMappingUriFromFile(frame.fileName, (mappingUri: url.Url) => {
                self.loadSourceMapConsumer(frame.fileName, mappingUri, (sourceMapConsumer) => {
                    // if sourceMapConsumer is undefined, it means there was an error loading it.
                    // We'll populate cache with undefined so we don't continually try to load it.
                    self.mapCache[frame.fileName] = sourceMapConsumer;
                    const mappedFrame = self.createMappedFrame(sourceMapConsumer, frame);
                    callback(mappedFrame);
                });
            });
        }
    }

    /**
     * given a stack frame & a sourceMapConsumer, return a new stack frame with the
     * generated filename/line/column values replaced with the values from the source map.
     *
     * If sourceMapConsumer is null, then original fram will be returned.
     */
    private createMappedFrame(sourceMapConsumer, frame: IStackFrame): IStackFrame {
        if (sourceMapConsumer) {
            const position = sourceMapConsumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
            const validPosition: boolean = position && position.source && (position.line || position.line === 0) && (position.column || position.column === 0);
            if (validPosition) {
                frame = {
                    functionName: frame.functionName,
                    fileName: position.source,
                    lineNumber: position.line,
                    columnNumber: position.column,
                    source: frame.source
                };
            }
            if (os.platform() === 'win32') {
                frame.fileName = frame.fileName.replace(/\//g, '\\');
            }
        }
        return frame;
    }

    /**
     * given a path to a source file, find the source mapping URI, and invoke given callback with UI.
     */
    private getMappingUriFromFile(sourceFile: string, callback: (mappingUri) => void) {
        const self = this;
        fs.readFile(sourceFile, 'utf8', (err, data) => {
            let mappingUri: url.Url = undefined;
            if (data && !err) {
                mappingUri = self.getMappingUriFromContent(sourceFile, data);
            }
            callback(mappingUri);
        });
    }

    /**
     * given a URI to a source map, create a SourceMapConsumer, and invoke the given callback with it.
     */
    private loadSourceMapConsumer(generatedFile: string, uri: url.Url, callback: (sourceMapConsumer) => void) {
        if (uri && (!uri.protocol || uri.protocol === 'file:')) {
            let maploc = uri.pathname;
            if (!path.isAbsolute(maploc)) {
                maploc = path.join(path.dirname(generatedFile), maploc);
            }

            if (os.platform() === 'win32') {
                maploc = maploc.replace(/\//g, '\\');
            }
            fs.readFile(maploc, 'utf8', (err, data) => {
                let smc = undefined;
                if (data && !err) {
                    let map = JSON.parse(data);
                    smc = new sourcemap.SourceMapConsumer(map);
                }
                callback(smc);
            });
        }
        else {
            // if (uri && this.errorReportingService) {
            //     // we've got a URI, but it isn't a file or relative path, so we don't support it.  Send telemetry so we know about it.
            //     const uriString = url.format(uri);
            //     this.errorReportingService.reportError(createStackHelperUnsupportedSourceMapUriError(uriString));
            // }
            callback(undefined);
        }
    }
}
