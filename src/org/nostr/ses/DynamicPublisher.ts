import {createEvent, OwnedEvent} from "@red-token/welshman/util";
import {publishThunk} from "@red-token/welshman/app";
import {own} from "@red-token/welshman/signer";
import {DynamicSynchronisedSession} from "./DynamicSynchronisedSession.js";
import {AbstractNipMiniEvent} from "../AbstractNipEvent.js";
import {Identity} from "../communities/Identity.js";

/**
 * A Publisher publishes Events to a set of relays as part of a SynchronisedSession
 *
 * The way and event is published in welshman is that a pubkey is assigned to the event, this is done by own event.
 * Then the event is passed to the publishing worker, who in turn finds the session based on said pubkey and signs it.
 * Unless the event is already signed. But you will get a bad user experience if you don't sign it in the worker.
 *
 */
export class DynamicPublisher {
    constructor(readonly session: DynamicSynchronisedSession, private identity: Identity) {
    }

    prepare(event: AbstractNipMiniEvent): OwnedEvent {
        return own(createEvent(event.kind, event.opts), this.identity.pubkey)
    }

    send(event: OwnedEvent) {
        return publishThunk({
            event: event,
            relays: this.session.relays.value,
        })
    }

    publish(event: AbstractNipMiniEvent) {
        return this.send(this.prepare(event))
    }
}
