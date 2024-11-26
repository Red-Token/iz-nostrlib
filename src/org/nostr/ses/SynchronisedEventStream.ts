import {TrustedEvent} from "@welshman/util";
import EventEmitter from "node:events";

export enum EventType {
    DISCOVERED = 'discovered',
    CONFIRMED = 'confirmed',
}

export class SynchronisedEventStream {
    eventLog = new Map<string, TrustedEvent>()
    public emitter = new EventEmitter

    constructor() {
    }

    onIncomingEvent(event: TrustedEvent) {
        if (this.eventLog.has(event.id)) {
            this.emitter.emit(EventType.CONFIRMED, event)
            return
        }

        this.eventLog.set(event.id, event)
        this.emitter.emit(EventType.DISCOVERED, event)
    }
}
