import {createEvent, CreateEventOpts} from "@welshman/util";
import {publishThunk} from "@welshman/app";
import {SynchronisedSession} from "./SynchronisedSession.js";
import {Identity, CommunityIdentity} from "../communities/Community.js";
import {own} from "@welshman/signer";
import {DynamicSynchronisedSession} from "./DynamicSynchronisedSession";
import {AbstractNipMiniEvent} from "../AbstractNipEvent";

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

    publish(event: AbstractNipMiniEvent) {

        // Sent the message
        return publishThunk({
            event: own(createEvent(event.kind, event.opts), this.identity.pubkey),
            relays: this.session.relays.value,
        })
    }
}
