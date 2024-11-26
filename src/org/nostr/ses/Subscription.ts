import {PartialSubscribeRequest, subscribe} from "@welshman/app";
import {SynchronisedSession} from "./SynchronisedSession";
import {Filter, TrustedEvent} from "@welshman/util";

export class Subscription {
    private sub: any;

    constructor(private session: SynchronisedSession, filters: Filter[]) {

        const psr: PartialSubscribeRequest = {
            relays: session.relays,
            // The filters are the kind of event we want to subscribe to
            filters: filters,
            // Here we pass in the event handler
            onEvent: (event: TrustedEvent) => {
                this.session.eventStream.onIncomingEvent(event)
            }
        }

        this.sub = subscribe(psr)
    }

    unsubscribe() {
    }
}
