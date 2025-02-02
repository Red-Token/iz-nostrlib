import {TrustedEvent} from "@welshman/util";
import mitt from 'mitt';

export enum EventType {
    DISCOVERED = 'discovered',
    CONFIRMED = 'confirmed',
}

type NostrEvents = {
    discovered: TrustedEvent
    confirmed: TrustedEvent
}

export class SynchronisedEventStream {
    eventLog = new Map<string, TrustedEvent>()
    public emitter = mitt<NostrEvents>()

    constructor() {
    }

    onIncomingEvent(event: TrustedEvent) {
        if (this.eventLog.has(event.id)) {
            this.emitter.emit(EventType.CONFIRMED, event)
            return
        }

        console.log("RECEIVED:" + event.id)

        this.eventLog.set(event.id, event)
        this.emitter.emit(EventType.DISCOVERED, event)
    }
}
