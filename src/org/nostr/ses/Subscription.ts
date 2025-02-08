import {PartialSubscribeRequest, subscribe} from "@welshman/app";
import {SynchronisedSession} from "./SynchronisedSession.js";
import {Filter, TrustedEvent} from "@welshman/util";

export class Subscription {
    private sub: any;

    constructor(private session: SynchronisedSession, filters: Filter[], relays: string[]) {

        const psr: PartialSubscribeRequest = {
            relays,
            // The filters are the kind of event we want to subscribe to
            filters: filters,
            // Here we pass in the event handler
            onEvent: (event: TrustedEvent) => {
                console.log(`GOT EVENT: ${this.sub.id} ${event.kind} ${event.created_at}`);
                this.session.eventStream.onIncomingEvent(event)
            }
        }

        this.sub = subscribe(psr)
    }
}
