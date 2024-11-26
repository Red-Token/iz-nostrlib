import {createEvent, CreateEventOpts} from "@welshman/util";
import {publishThunk} from "@welshman/app";
import {SynchronisedSession} from "./SynchronisedSession";

/**
 * A Publisher publishes Events to a set of relays as part of a SynchronisedSession
 */
export class Publisher {
    constructor(readonly session: SynchronisedSession) {
    }

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
