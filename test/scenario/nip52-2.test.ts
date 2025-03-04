import {normalizeRelayUrl, TrustedEvent} from "@red-token/welshman/util";
import {getDefaultAppContext, getDefaultNetContext} from "@red-token/welshman/app";

import {EventType, NostrClient, SignerData, SignerType} from "../../src/index.js";
import {setContext} from "@red-token/welshman/lib";
import {Subscription} from "../../src/index.js";

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

        setContext({
            net: getDefaultNetContext(),
            app: getDefaultAppContext()
        })

        const tmpKind = 10777
        const tmpKind2 = 10778

        const bobNostrClient = new NostrClient();

        // const url = 'wss://relay.lxc'
        const url = 'wss://relay.stream.labs.h3.se'
        bobNostrClient.relays = [normalizeRelayUrl(url)]

        const bobSession1 = await bobNostrClient.createSession()

        // const bobNSec = 'nsec1zsp48upz3vd64lwhx7me8utrxyfxuzdwvxhfld2q0ehs0ya9mlxs47v64q'
        // const bobSignerData: SignerData = {type: SignerType.NIP01, nsec: bobNSec}
        // await bobSession1.init(bobSignerData)

        bobSession1.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            console.log('discovered event', event)

            const bobNSec = 'nsec1zsp48upz3vd64lwhx7me8utrxyfxuzdwvxhfld2q0ehs0ya9mlxs47v64q'
            const bobSignerData: SignerData = {type: SignerType.NIP01, nsec: bobNSec}
            bobNostrClient.logIn(bobSignerData).then((result) => {
                console.log(bobNostrClient.publicKey)
                console.log(result)
            })
        })

        const eventData = {
            kind: 10777,
            pubkey: "38eaed1007b09106a29c2f5d8d3f28dbad24a91db94d3b38836b852e368878ff",
            uuid: "64af9d5b-0cfc-4888-a2ad-4d2cb41e81b7",
        }

        const coordinates = `${eventData.kind}:${eventData.pubkey}:${eventData.uuid}`;



        // Bob get the event id out of band.
        const bobSub = new Subscription(bobSession1,[
            // Here we subscribe to the membership kind
            {kinds: [eventData.kind], '#d': eventData.uuid, authors: [eventData.pubkey]},
            {kinds: [tmpKind2], '#a': coordinates},
        ], )

        console.log("THE END!")
    });

});
