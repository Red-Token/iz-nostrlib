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
        const prepared = own(createEvent(event.kind, event.opts), this.identity.pubkey)
        const preparedAny = prepared as Record<string, unknown>
        console.info('[iz-nostrlib] DynamicPublisher.prepare', {
            kind: event.kind,
            identityPubkey: this.identity.pubkey,
            preparedKeys: Object.keys(preparedAny),
            preparedId: (preparedAny['id'] as string | undefined) ?? null
        })
        return prepared
    }

    send(event: OwnedEvent) {
        const eventAny = event as Record<string, unknown>
        console.info('[iz-nostrlib] DynamicPublisher.send', {
            eventKeys: Object.keys(eventAny),
            eventId: (eventAny['id'] as string | undefined) ?? null,
            relays: this.session.relays.value
        })
        return publishThunk({
            event: event,
            relays: this.session.relays.value,
        })
    }

    publish(event: AbstractNipMiniEvent) {
        console.info('[iz-nostrlib] DynamicPublisher.publish begin', {
            kind: event.kind
        })
        const prepared = this.prepare(event)
        const result = this.send(prepared)
        const preparedAny = prepared as Record<string, unknown>
        console.info('[iz-nostrlib] DynamicPublisher.publish end', {
            eventId: (preparedAny['id'] as string | undefined) ?? null,
            resultType: typeof result
        })
        return result
    }
}
