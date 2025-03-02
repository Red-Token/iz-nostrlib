import {expect} from 'chai';
import {Nip52CalendarEvent, Nip52CalendarEventTemplateBuilder} from "../src/org/nostr/nip52/Nip52CalendarEventTemplate";
import {randomUUID} from "crypto";
import {createEvent, normalizeRelayUrl} from "@red-token/welshman/build/src/util";
import {prepEvent, publishThunk} from "@red-token/welshman/build/src/app";
import {SignerType, SynchronisedSession} from "../src";

describe('Zool is Cool', () => {
    it('Alice invites Bob for tea!', async () => {
        const et = new Nip52CalendarEventTemplateBuilder(randomUUID(), 'Tea in Wonderland', 'Cool Event', '2024-10-13')
        let nip52EventTemplate = et.createNip52EventTemplate();
        const eventThin = createEvent(1234, et.createNip52EventTemplate())

        // Create a dummy Alice!
        const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
        const relays: string[] = []
        const aliceSession = await new SynchronisedSession(relays).init({type: SignerType.NIP01, nsec: aliceNSec})

        const p = prepEvent(eventThin)
        const et2 = new Nip52CalendarEvent(p)
        console.log(nip52EventTemplate)

        expect(et2.title).to.equal(et.title);
    });

});
