
import { IExecuteBeginEvent, IExecuteEndEvent, ILinkEvent, ICauseEvent, 
         raiseBeforeExecuteEvent, raiseAfterExecuteEvent, raiseLinkEvent, raiseCauseEvent} 
         from './async-context-events';

/**
 * maker interface for a generic function type
 */
export interface IFunction {
    (...args: any[]): any
}

/**
 * interface for an "asynchronous continuation" function
 */
export interface IContinuation extends IFunction {
    isContinuation: boolean;
    originalFunction: (...args: any[]) => any;
    causeID?: number;
    linkID: number;
}


/**
 * the "link" function that ensures the passed in callback is a continuation
 * 
 * @param cb 
 */
export function link(cb: IFunction): IContinuation {
    let c: IContinuation;
    if ((cb as IContinuation).isContinuation) {
        c = cb as IContinuation;
    }
    else {
        const e: ILinkEvent = raiseLinkEvent();
        const p = function (...args: any[]) {
            try {
                // investigate behavior here when cb is a bound function
                raiseBeforeExecuteEvent((p as IContinuation).causeID);
                return (p as IContinuation).originalFunction.apply(this, args);
            }
            finally {
                raiseAfterExecuteEvent();
            }
        }
        c = p as IContinuation;
        c.isContinuation = true;
        c.originalFunction = cb;
        c.linkID = e.linkID;
    }
    return c;
}

/**
 * raise the cause event
 */
export function cause(c: IContinuation) {
    const e: ICauseEvent = raiseCauseEvent(c.linkID);
    c.causeID = e.causeID;
}

