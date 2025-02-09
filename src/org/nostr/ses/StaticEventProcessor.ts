import {AbstractNipMiniEvent} from "../AbstractNipEvent.js";
import type {TrustedEvent} from "@welshman/util";

export class AbstractEventHandler<T extends AbstractNipMiniEvent> {
    constructor(public readonly kind: number, public readonly builder: (event: TrustedEvent) => T, public readonly handler: (event: T) => void) {
    }
}

export class StaticEventProcessor<T extends AbstractNipMiniEvent > {
    public readonly eventHandlerMap = new Map<number, AbstractEventHandler<T>>()

    constructor(eventHandlers: AbstractEventHandler<T>[]) {
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
