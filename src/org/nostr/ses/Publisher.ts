import {createEvent, CreateEventOpts} from "@welshman/util";
import {publishThunk} from "@welshman/app";
import {SynchronisedSession} from "./SynchronisedSession";

/**
 * A Publisher publishes Events to a set of relays as part of a SynchronisedSession
 *
 * The way and event is published in welshman is that a pubkey is assigned to the event, this is done by own event.
 * Then the event is passed to the publishing worker, who in turn finds the session based on said pubkey and signs it.
 * Unless the event is already signed. But you will get a bad user experience if you don't sign it in the worker.
 *
 */
export class Publisher {
    constructor(readonly session: SynchronisedSession) {
    }

    // TODO: There is a big dragon here, we dont select the signer!
    // TODO: Make the a class
    publish(kind: number, payload: CreateEventOpts) {
        const event = createEvent(kind, payload)

        // Sent the message
        return publishThunk({
            event,
            relays: this.session.relays,
        })
    }
}
