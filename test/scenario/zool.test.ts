import {CommunityNostrContext, CommunityIdentity} from "../../src/org/nostr/communities/CommunityNostrContext";
import {normalizeRelayUrl, TrustedEvent} from "@welshman/util";
import {EventType, SignerData, SignerType, SynchronisedSession} from "../../src";
import {Nip35TorrentEvent, Nip35TorrentEventBuilder} from "../../src/org/nostr/nip35/Nip35TorrentEvent";
import {Subscription} from "../../src"
import {asyncCreateWelshmanSession} from "../../src/org/nostr/communities/Identity";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Async Test Example', () => {

    before(function () {
        // Code to run before all tests
    });

    it('adds 1 + 2 to equal 3',async () => {

        const url = 'wss://relay.stream.labs.h3.se'
        const relays = [normalizeRelayUrl(url)]

        const bobNSec = 'nsec1zsp48upz3vd64lwhx7me8utrxyfxuzdwvxhfld2q0ehs0ya9mlxs47v64q'
        const bobSignerData: SignerData = {type: SignerType.NIP01, nsec: bobNSec}

        const ws = await asyncCreateWelshmanSession(bobSignerData)

        const c = new CommunityNostrContext(
            'iz-stream',
            relays,
            'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg'
        )

        const ci = new CommunityIdentity(c, ws)

        const session = new SynchronisedSession(c.relays);

        for (const relay of c.relays) {
            const sub = new Subscription(session, [{
                kinds: [Nip35TorrentEvent.KIND],
                // authors: [page.params.pubkey]
            }], [relay]);
        }

        const events = []

        session.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            if (event.kind === Nip35TorrentEvent.KIND) {
                const te = new Nip35TorrentEventBuilder(event).build();

                if (te.event === undefined)
                    throw Error(`Unknown event: ${event}`);

                events.push(te);
            } else {
                console.log('Unknown event ', event);
            }
        });
    });
});
