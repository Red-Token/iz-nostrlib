import {PartialSubscribeRequest, subscribe} from '@welshman/app'
import {SynchronisedSession} from './SynchronisedSession'
import {Filter, TrustedEvent} from '@welshman/util'

// Class for creating event subscriptions
export class Subscription {
    private sub: any // Subscription object from welshman

    // The constructor accepts session, filters and relays
    constructor(private session: SynchronisedSession, filters: Filter[], relays: string[]) {
        const psr: PartialSubscribeRequest = {
            relays, // Relay for subscription
            // The filters are the kind of event we want to subscribe to
            filters: filters, // Event filters (e.g. by kind)
            // Here we pass in the event handler
            onEvent: (event: TrustedEvent) => {
                // incoming event handler
                console.log(`GOT EVENT: ${this.sub.id} ${event.kind} ${event.created_at}`)
                this.session.eventStream.onIncomingEvent(event) // Passing an event to a stream
            }
        }
        this.sub = subscribe(psr) // Creating a subscription via welshman
    }
}
