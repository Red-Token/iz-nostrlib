import {AbstractNipMiniEvent} from "../AbstractNipEvent.js";
import type {TrustedEvent} from "@welshman/util";

export class AbstractEventProcessor<T extends AbstractNipMiniEvent> {
    public readonly handler: (event: AbstractNipMiniEvent) => void
    constructor(
        public readonly kind: number,
        public readonly builder: (event: TrustedEvent) => T,
        handler: (event: T) => void) {
        this.handler = handler as (event: AbstractNipMiniEvent) => void;
    }
}

export class StaticEventsProcessor<T extends AbstractNipMiniEvent> {
    public readonly eventHandlerMap = new Map<number, AbstractEventProcessor<T>>()

    constructor(eventHandlers: AbstractEventProcessor<T>[]) {
        eventHandlers.forEach(eventHandler => {
            this.eventHandlerMap.set(eventHandler.kind, eventHandler);
        })
    }

    processUnhandledEvent(event: TrustedEvent) {
        console.log(`Discarding unhandled event: ${event}`);
    }

    processEvent(event: TrustedEvent): void {
        const handler = this.eventHandlerMap.get(event.kind);

        if (handler === undefined) {
            this.processUnhandledEvent(event);
            return
        }

        handler.handler(handler.builder(event))
    }
}
