
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
}

export interface IExecuteBeginEvent extends IEvent {
    eventType: EventType.ExecuteBegin,
    event: 'executeBegin';
    executeId: number;
    causeId?: number;  // causeId is missing only on root executeBegin events 
}

export interface IExecuteEndEvent extends IEvent {
    eventType: EventType.ExecuteEnd;
    event: 'executeEnd';
    executeId: number;
}

export interface ILinkEvent extends IEvent {
    eventType: EventType.Link;
    event: 'link';
    executeId: number;
    linkId: number;
}

export interface ICauseEvent extends IEvent {
    eventType: EventType.Cause;
    event: 'cause';
    executeId: number;
    linkId: number;
    causeId: number;
}

export function raiseBeforeExecuteEvent(causeId: number): IExecuteBeginEvent {
    const e: IExecuteBeginEvent = {
        eventType: EventType.ExecuteBegin,
        event: 'executeBegin',
        executeId: getNextAsyncId(),
        causeId
    };
    raise(e);
    // todo: need to restore existing value here
    executeContextStack.push(e);
    return e;
}

export function raiseAfterExecuteEvent(): IExecuteEndEvent {
    const executeId = executeContextStack.pop().executeId;
    const e: IExecuteEndEvent = {
        eventType: EventType.ExecuteEnd,
        event: 'executeEnd',
        executeId
    };
    raise(e);
    return e;
}

export function raiseLinkEvent(): ILinkEvent {
    const e: ILinkEvent = {
        eventType: EventType.Link,
        event: 'link',
        executeId: getCurrentExecuteId(),
        linkId: getNextAsyncId()
    };
    raise(e);
    return e;
}

export function raiseCauseEvent(linkId): ICauseEvent {
    const e: ICauseEvent = {
        event: 'cause',
        eventType: EventType.Cause,
        executeId: getCurrentExecuteId(),
        linkId,
        causeId: getNextAsyncId()
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
    return executeContextStack[executeContextStack.length - 1].executeId;
}

const executeContextStack: IExecuteBeginEvent[] = [];
const listeners: IAsyncEventListener[] = [];
let currentAsyncID = 0;

function raise(e: IEvent) {
    for (let i = 0; i < listeners.length; i++) {
        listeners[i].onAsyncEvent(e);
    }
}

