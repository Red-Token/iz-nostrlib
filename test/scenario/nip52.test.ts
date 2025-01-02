import {expect} from 'chai';
import {Nip52CalendarEvent, Nip52CalendarEventTemplate} from "../../src/org/nostr/nip52/Nip52CalendarEventTemplate";
import {randomUUID} from "crypto";
import {createEvent, normalizeRelayUrl, TrustedEvent} from "@welshman/util";
import {prepEvent, publishThunk} from "@welshman/app";
import {EventType, SignerType, SynchronisedSession} from "../../src";
import {NostrClient} from "../../src/org/nostr/client/NostrClient";

describe('Async Test Example', () => {
    it('should complete an async operation', async () => {

        /**
         * Advanced async calendar test.
         *
         * 1. Alice logs in, and creates and event
         *
         * 2. Bob logs in and replies to the event.
         *
         */

        const aliceNostrClient = new NostrClient();

        const aliceSession1 = aliceNostrClient.createSession()

        const tmpKind = 10777

        // const url = 'wss://relay.lxc'
        const url = 'wss://relay.stream.labs.h3.se'
        const relays = [normalizeRelayUrl(url)]

        const et = new Nip52CalendarEventTemplate(randomUUID(), 'Title', 'Cool Event', '2024-10-13')
        let nip52EventTemplate = et.createNip52EventTemplate();
        const eventThin = createEvent(tmpKind, et.createNip52EventTemplate())

        // Create a dummy Alice!
        const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
        // TODO rename to login
        const aliceSession = await new SynchronisedSession(relays).init({type: SignerType.NIP01, nsec: aliceNSec})

        const pub = aliceSession.createPublisher()
        const x = pub.publish(tmpKind, eventThin)

        console.log(x)

        const sub = aliceSession.createSubscription([
            // Here we subscribe to the membership kind
            {kinds: [tmpKind], ids: [x.event.id]},
        ])

        aliceSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            const cal = new Nip52CalendarEvent(event)

            const resMsg = JSON.parse(event.content)
            const msg = resMsg
            console.log(resMsg)
            console.log(event)
        })

        //
        //
        // const p = prepEvent(eventThin)
        // const et2 = new Nip52CalendarEvent(p)
        // console.log(nip52EventTemplate)
        //
        // expect(et2.title).to.equal(et.title);
    });

});
