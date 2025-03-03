import {SignerData, SignerType, SynchronisedSession} from "../src";
import {normalizeRelayUrl, TrustedEvent} from "@red-token/welshman/util";
import {GlobalNostrContext} from "../src/org/nostr/communities/GlobalNostrContext";
import {DynamicPublisher} from "../src/org/nostr/ses/DynamicPublisher";
import {Nip01UserMetaDataEvent} from "../src/org/nostr/nip01/Nip01UserMetaData";
import {NostrUserProfileMetaData} from "../src/org/nostr/nip01/NostrUserProfileMetaData";
import {
    CommunityNostrContext
} from "../src/org/nostr/communities";

import {Subscription} from "../src";
import {getDefaultAppContext, getDefaultNetContext, PartialSubscribeRequest, subscribe} from "@red-token/welshman/app";
import {setContext} from "@red-token/welshman/lib";
import {wait} from "./util";
import {expect} from "chai";
import {Nip65RelayListMetadataEvent} from "../src/org/nostr/nip65/Nip65RelayListMetadata";
import {Nip78ArbitraryCustomAppData} from "../src/org/nostr/nip78/Nip78ArbitraryCustomAppData";
import {AppNostrContext} from "../src/org/nostr/communities/AppNostrContext";
import {asyncCreateWelshmanSession, Identity} from "../src/org/nostr/communities/Identity";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Async Test Example', () => {
    before(function () {
    })
    it('Alice saves ', async () => {

        setContext({
            net: getDefaultNetContext(),
            app: getDefaultAppContext()
        })

        const url = 'wss://relay.lxc'
        const relays = [normalizeRelayUrl(url)]

        const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
        const aliceSignerData: SignerData = {type: SignerType.NIP01, nsec: aliceNSec}
        const aliceIdentity = new Identity(await asyncCreateWelshmanSession(aliceSignerData))

        const aliceGlobalNostrContext = new GlobalNostrContext(relays)
        const aliceGlobalDynamicPublisher = new DynamicPublisher(aliceGlobalNostrContext.profileService, aliceIdentity)

        // Update Alice profile
        const aliceMetaDataEvent = new Nip01UserMetaDataEvent(new NostrUserProfileMetaData('Alice', 'The Queen of Tests', 'alice.jpg'))
        aliceGlobalDynamicPublisher.publish(aliceMetaDataEvent)

        await wait(2000)

        // // Verify that stuff work
        const readProfile = aliceGlobalNostrContext.profileService.nip01Map.get(aliceIdentity.pubkey)

        expect(readProfile).to.not.be.null;

        // TODO FIX so that profile are the same in TS
        const cleanProfile = JSON.stringify(aliceMetaDataEvent.profile)

        expect(cleanProfile).to.be.equal(JSON.stringify(readProfile?.profile))


        //Publish Alice Relays
        const aliceRelayList = new Nip65RelayListMetadataEvent(relays.map((relay) => {
            return [relay]
        }))
        aliceGlobalDynamicPublisher.publish(aliceRelayList)

        await wait(2000)

        const rl = aliceGlobalNostrContext.profileService.nip65Map.get(aliceIdentity.pubkey)

        // expect(aliceRelayList.relays).to.be.equal(rl?.relays)
        expect(rl).to.not.be.null;
        expect(rl?.relays.length).to.be.greaterThanOrEqual(1)

        //Publish App data
        class TestAppData {
            constructor(public zool: string = 'isCool!', public counts: number = 123) {
            }
        }

        const appName = 'testApp'
        const appDataEvent = new Nip78ArbitraryCustomAppData<TestAppData>(new TestAppData(), appName)

        const aliceAppContext = new AppNostrContext(rl?.relays.map(relay => relay[0]) ?? [])
        aliceAppContext.identities.set(aliceIdentity.pubkey, aliceIdentity)
        const aliceAppPublisher = new DynamicPublisher(aliceAppContext.appDataService, aliceIdentity)
        aliceAppPublisher.publish(appDataEvent)

        await wait(2000)

        const settings = aliceAppContext.appDataService.appDataMap.get(aliceIdentity.pubkey)?.get(appName)

        console.log("THE END!")
    });
})
