
import {IStackFrame, StackHelper} from './StackHelper';

const stackHelper: StackHelper = new StackHelper();

export interface IAsyncEventListener {
    onAsyncEvent(IEvent);
}

export enum EventType {
    ExecuteBegin,
    ExecuteEnd,
    Link,
    Cause
}

export interface IEvent {
    eventType: EventType,
    event: 'executeBegin' | 'executeEnd' | 'link' | 'cause';
    data?: Object;
}

export interface IExecuteBeginEvent extends IEvent {
    eventType: EventType.ExecuteBegin,
    event: 'executeBegin';
    executeID: number;
    causeID?: number;  // causeID is missing only on root executeBegin events 
}

export interface IExecuteEndEvent extends IEvent {
    eventType: EventType.ExecuteEnd;
    event: 'executeEnd';
    executeID: number;
}

export interface ILinkEvent extends IEvent {
    eventType: EventType.Link;
    event: 'link';
    executeID: number;
    linkID: number;
}

export interface ICauseEvent extends IEvent {
    eventType: EventType.Cause;
    event: 'cause';
    executeID: number;
    linkID: number;
    causeID: number;
}

export function raiseBeforeExecuteEvent(causeID: number): IExecuteBeginEvent {
    const e: IExecuteBeginEvent = {
        eventType: EventType.ExecuteBegin,
        event: 'executeBegin',
        executeID: getNextAsyncId(),
        causeID
    };
    raise(e);
    // todo: need to restore existing value here
    executeContextStack.push(e);
    return e;
}

export function raiseAfterExecuteEvent(): IExecuteEndEvent {
    const executeID = executeContextStack.pop().executeID;
    const e: IExecuteEndEvent = {
        eventType: EventType.ExecuteEnd,
        event: 'executeEnd',
        executeID
    };
    raise(e);
    return e;
}

export function raiseLinkEvent(): ILinkEvent {
    const e: ILinkEvent = {
        eventType: EventType.Link,
        event: 'link',
        executeID: getCurrentExecuteId(),
        linkID: getNextAsyncId()
    };
    raise(e);
    return e;
}

export function raiseCauseEvent(linkID): ICauseEvent {
    const e: ICauseEvent = {
        event: 'cause',
        eventType: EventType.Cause,
        executeID: getCurrentExecuteId(),
        linkID,
        causeID: getNextAsyncId()
    }
    raise(e);
    return e;
}

export function addListener(l: IAsyncEventListener) {
    listeners.push(l);
}

export function getNextAsyncId(): number {
    return ++currentAsyncID;
}

export function getCurrentExecuteId(): number {
    if (executeContextStack.length === 0) {
        return 0;
    }
    else {
        return executeContextStack[executeContextStack.length - 1].executeID;
    }
}

const executeContextStack: IExecuteBeginEvent[] = [];
const listeners: IAsyncEventListener[] = [];
let currentAsyncID = 0;

function raise(e: IEvent) {
    if (e.eventType !== EventType.ExecuteEnd) {
        const frames = stackHelper.captureStack(raise, 30);
        const frame = stackHelper.tryGetFirstUserCodeFrame(frames);
        //stackHelper.mapFrames
        const highlightLine = frame && frames[0] !== frame ? frame.lineNumber : 1;
        e.data = {highlightLine, frame, frames};
    }
    for (let i = 0; i < listeners.length; i++) {
        listeners[i].onAsyncEvent(e);
    }
}

