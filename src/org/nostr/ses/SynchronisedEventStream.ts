import {TrustedEvent} from '@red-token/welshman/util'
import mitt from 'mitt' // To resolve this error, I removed default in export at the top level of the module

// Types of events in the stream
export enum EventType {
    DISCOVERED = 'discovered', // New event
    CONFIRMED = 'confirmed' // Confirmed event
}

type NostrEvents = {
    discovered: TrustedEvent
    confirmed: TrustedEvent
}

// Class for processing incoming events
export class SynchronisedEventStream {
    eventLog = new Map<string, TrustedEvent>() // Event log by ID
    public emitter = mitt<NostrEvents>() // Event emitter

    constructor() {}

    // Processing an incoming event
    onIncomingEvent(event: TrustedEvent) {
        if (this.eventLog.has(event.id)) {
            // If the event is already known
            this.emitter.emit(EventType.CONFIRMED, event) // Confirmation
            return
        }
        console.log('RECEIVED:' + event.id)
        this.eventLog.set(event.id, event) // Saving a new event
        this.emitter.emit(EventType.DISCOVERED, event) // Notification of a new event
    }
}
