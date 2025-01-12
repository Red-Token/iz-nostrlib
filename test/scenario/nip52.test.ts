import {
    Nip52CalendarEvent,
    Nip52CalendarEventEntity,
    Nip52CalendarEventRSVPBuilder,
    Nip52CalendarEventRSVPMessage,
    Nip52CalendarEventTemplateBuilder,
    Nip52IndividualStatusType,
    Nip52RsvpStatusType
} from "../../src/org/nostr/nip52/Nip52CalendarEventTemplate";
import {randomUUID} from "crypto";
import {createEvent, normalizeRelayUrl, TrustedEvent} from "@welshman/util";
import {getDefaultAppContext, getDefaultNetContext} from "@welshman/app";

import {EventType, SignerData, SignerType} from "../../src";
import {NostrClient} from "../../src/org/nostr/client/NostrClient";
import {setContext} from "@welshman/lib";

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

        const aliceNostrClient = new NostrClient();
        const bobNostrClient = new NostrClient();

        // const url = 'wss://relay.lxc'
        const url = 'wss://relay.stream.labs.h3.se'
        aliceNostrClient.relays = [normalizeRelayUrl(url)]
        bobNostrClient.relays = [normalizeRelayUrl(url)]

        const aliceSession1 = await aliceNostrClient.createSession()

        const bobSession1 = await bobNostrClient.createSession()

        const et = new Nip52CalendarEventTemplateBuilder(randomUUID(), 'Title', 'Cool Event', '2024-10-13')
        let nip52EventTemplate = et.createNip52EventTemplate();
        const eventThin = createEvent(tmpKind, nip52EventTemplate)

        // Create a dummy Alice!
        const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
        // TODO rename to login
        const aliceSignerData: SignerData = {type: SignerType.NIP01, nsec: aliceNSec}
        await aliceSession1.init(aliceSignerData)

        const alicePublisher = aliceSession1.createPublisher()
        const eventEvent = alicePublisher.publish(tmpKind, nip52EventTemplate)

        console.log(eventEvent)

        // TODO: ugly
        const aliceCalculatedEventCoordinate = `${eventEvent.event.kind}:${eventEvent.event.pubkey}:${et.uuid}`

        aliceSession1.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {

            if (event.kind == tmpKind) {
                const cal = new Nip52CalendarEvent(event)

                const resMsg = JSON.parse(event.content)
                const msg = resMsg
                console.log(resMsg)
                console.log(event)
            } else if (event.kind == tmpKind2) {
                console.log(event)
            }

        })

        const aliceSub = aliceSession1.createSubscription([
            // Here we subscribe to the membership kind
            {kinds: [tmpKind], ids: [eventEvent.event.id]},
            {kinds: [tmpKind2], '#a': aliceCalculatedEventCoordinate},
        ])


        const bobStatMap: Map<string, Nip52CalendarEventEntity> = new Map()

        bobSession1.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {

            if (event.kind == tmpKind) {
                const cal = new Nip52CalendarEvent(event)

                console.log(bobNostrClient.publicKey)

                const bobNSec = 'nsec1zsp48upz3vd64lwhx7me8utrxyfxuzdwvxhfld2q0ehs0ya9mlxs47v64q'
                const bobSignerData: SignerData = {type: SignerType.NIP01, nsec: bobNSec}

                bobNostrClient.logIn(bobSignerData).then(() => {

                    console.log(bobNostrClient.publicKey)

                    const e = new Nip52CalendarEventEntity()
                    e.onNip52CalendarEventMessage(cal)
                    bobStatMap.set(cal.getCoordinate(), e)

                    const resMsg = JSON.parse(event.content)
                    const msg = resMsg
                    console.log(resMsg)
                    console.log(event)

                    const bobPublisher = bobSession1.createPublisher()

                    const et2 = new Nip52CalendarEventRSVPBuilder(cal, Nip52RsvpStatusType.ACCEPTED, "I will be there!", Nip52IndividualStatusType.BUSY)
                    let nip52EventTemplate2 = et2.createTemplate();

                    // TODO: HMM double speak?
                    // const eventThin2 = createEvent(tmpKind2, nip52EventTemplate2)
                    const eventEvent2 = bobPublisher.publish(tmpKind2, nip52EventTemplate2)

                    console.log("sdfsdfsfsfsd")
                })


            } else if (event.kind == tmpKind2) {
                console.log("Duuuude!")
                const cool = new Nip52CalendarEventRSVPMessage(event)

                bobStatMap.get(cool.coordinate)?.onNip52CalendarEventRSVPMessage(cool)

                console.log(cool.fb === Nip52IndividualStatusType.BUSY)

                console.log(cool)
            }
        })

        // TODO: ugly
        const bobCalculatedEventCoordinate = `${eventEvent.event.kind}:${eventEvent.event.pubkey}:${et.uuid}`

        const eventData = {
            kind: tmpKind,
            pubkey: eventEvent.event.pubkey,
            uuid: (eventEvent.event.tags.find(tag => tag[0] === 'd') ?? [0, undefined])[1],
        }

        // http://localhost:5174/event/events/10777/38eaed1007b09106a29c2f5d8d3f28dbad24a91db94d3b38836b852e368878ff/d46ffac4-d4ce-4074-b2b4-adabc2e503e8,d46ffac4-d4ce-4074-b2b4-adabc2e503e8

        // Bob get the event id out of band.
        const bobSub = bobSession1.createSubscription([
            // Here we subscribe to the membership kind
            {kinds: [eventData.kind], '#d': eventData.uuid, authors: [eventData.pubkey]},
            {kinds: [tmpKind2], '#a': bobCalculatedEventCoordinate},
        ])

        //
        //
        // const p = prepEvent(eventThin)
        // const et2 = new Nip52CalendarEvent(p)
        // console.log(nip52EventTemplate)
        //
        // expect(et2.title).to.equal(et.title);

        console.log("THE END!")
    });

});
