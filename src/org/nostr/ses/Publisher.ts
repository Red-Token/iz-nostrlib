import {createEvent, CreateEventOpts} from '@red-token/welshman/util'
import {publishThunk} from '@red-token/welshman/app'
import {SynchronisedSession} from './SynchronisedSession.js'
import {own} from '@red-token/welshman/signer'
import {Identity} from '../communities/Identity.js'

/**
 * A Publisher publishes Events to a set of relays as part of a SynchronisedSession
 *
 * The way and event is published in welshman is that a pubkey is assigned to the event, this is done by own event.
 * Then the event is passed to the publishing worker, who in turn finds the session based on said pubkey and signs it.
 * Unless the event is already signed. But you will get a bad user experience if you don't sign it in the worker.
 *
 */
export class Publisher {
    constructor(readonly session: SynchronisedSession, private comminityIdentiy: Identity) {}

    // Publishing an event with the specified type and content
    publish(kind: number, payload: CreateEventOpts) {
        const event = own(createEvent(kind, payload), this.comminityIdentiy.pubkey) // Creating an event with pubkey
        // Sent the message
        return publishThunk({
            // Sending an event via welshman
            event,
            relays: this.session.relays
        })
    }
}
