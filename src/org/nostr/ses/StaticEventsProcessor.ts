import {AbstractNipMiniEvent} from '../AbstractNipEvent.js'
import type {TrustedEvent} from '@red-token/welshman/util'

// Abstract event handler of a certain type (kind)
export class AbstractEventProcessor<T extends AbstractNipMiniEvent> {
    public readonly handler: (event: AbstractNipMiniEvent) => void
    constructor(
        public readonly kind: number, // Event type
        public readonly builder: (event: TrustedEvent) => T, // Building an event object
        handler: (event: T) => void) { 
        this.handler = handler as (event: AbstractNipMiniEvent) => void
    }
}

// Static handler for routing events by type
export class StaticEventsProcessor<T extends AbstractNipMiniEvent> {
    public readonly eventHandlerMap = new Map<number, AbstractEventProcessor<T>>()

    constructor(eventHandlers: AbstractEventProcessor<T>[]) {
        // Initialisation with a set of handlers
        eventHandlers.forEach((eventHandler) => {
            this.eventHandlerMap.set(eventHandler.kind, eventHandler)
        })
    }

    // Processing of unknown events
    processUnhandledEvent(event: TrustedEvent) {
        console.log(`Discarding unhandled event: ${event}`)
    }

    // Event processing with routing to the specified handler
    processEvent(event: TrustedEvent): void {
        const handler = this.eventHandlerMap.get(event.kind)
        if (handler === undefined) {
            this.processUnhandledEvent(event)
            return
        }

        handler.handler(handler.builder(event))
    }
}
