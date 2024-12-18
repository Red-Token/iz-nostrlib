import {expect} from 'chai';
import {Nip52CalendarEvent, Nip52CalendarEventTemplate} from "../src/org/nostr/nip52/Nip52CalendarEventTemplate";
import {randomUUID} from "crypto";
import {createEvent, normalizeRelayUrl} from "@welshman/util";
import {prepEvent, publishThunk} from "@welshman/app";
import {SignerType, SynchronisedSession} from "../src";

describe('Async Test Example', () => {
    it('should complete an async operation', async () => {

        const et = new Nip52CalendarEventTemplate(randomUUID(), 'Title', 'Cool Event', '2024-10-13')
        let nip52EventTemplate = et.createNip52EventTemplate();
        const eventThin = createEvent(1234, et.createNip52EventTemplate())

        // Create a dummy Alice!
        const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
        const relays: string[] = []
        const aliceSession = await new SynchronisedSession({type: SignerType.NIP01, nsec: aliceNSec}, relays).init()

        const p = prepEvent(eventThin)

        const et2 = new Nip52CalendarEvent(p)
        console.log(nip52EventTemplate)

        expect(et2.title).to.equal(et.title);
    });

});
