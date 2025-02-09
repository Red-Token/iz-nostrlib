import {EventType, SignerData, SignerType} from '../../src'
import {normalizeRelayUrl, TrustedEvent} from "@welshman/util";
import {GlobalNostrContext} from "../../src/org/nostr/communities/GlobalNostrContext";
import {DynamicPublisher} from "../../src/org/nostr/ses/DynamicPublisher";
import {Nip01UserMetaDataEvent, UserType} from "../../src/org/nostr/nip01/Nip01UserMetaData";
import {NostrUserProfileMetaData} from "../../src/org/nostr/nip01/NostrUserProfileMetaData";
import {
    asyncCreateWelshmanSession,
    CommunityNostrContext,
    Identity
} from "../../src/org/nostr/communities/CommunityNostrContext";
import {getDefaultAppContext, getDefaultNetContext} from "@welshman/app";
import {setContext} from "@welshman/lib";
import {wait} from '../util'
import {expect} from "chai";
import {Nip65RelayListMetadataEvent} from "../../src/org/nostr/nip65/Nip65RelayListMetadata";
import {Nip78ArbitraryCustomAppData} from "../../src/org/nostr/nip78/Nip78ArbitraryCustomAppData";
import {AppNostrContext} from "../../src/org/nostr/communities/AppNostrContext";
import {Client} from 'ssh2';
import * as fs from "node:fs";
import {DynamicSynchronisedSession} from "../../src/org/nostr/ses/DynamicSynchronisedSession";
import {updateIfNewer} from "../../src/org/nostr/util/scraps";
import {AbstractEventHandler} from "../../src/org/nostr/services/AppDataService";
import {Nip35TorrentEvent} from "../../src/org/nostr/nip35/Nip35TorrentEvent";
import {DynamicSubscription} from "../../src/org/nostr/ses/DynamicSubscription";
import {AbstractNipMiniEvent} from "../../src/org/nostr/AbstractNipEvent";
import {StaticEventProcessor} from "../../src/org/nostr/ses/StaticEventProcessor";


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Async Test Example', () => {
    before(async () => {
        const ssh = new Client();

        await new Promise(resolve => {
            ssh.on('ready', async () => {
                for (const path of ['relay.lxc', 'relay.bf.lxc'])
                    await new Promise(resolve => {
                        ssh.exec(`cd /var/tmp/strfry/${path}; ../bin/strfry delete --age 0`, (err, stream) => {
                            if (err) throw err;
                            stream.on('close', () => {
                                console.log('✅ Command Executed');
                                resolve(true);
                            }).on('data', (data: any) => {
                                console.log('📄 Output:', data.toString());
                            }).stderr.on('data', (data) => {
                                console.error('❌ Error:', data.toString());
                            });
                        })
                    })

                ssh.end(); // Close SSH connection
                resolve(true);
            }).connect({
                host: 'relay.lxc',
                port: 22,
                username: 'root',
                privateKey: fs.readFileSync('.ssh/id')
            })
        })
        console.log("before")
    })

    it('Big Fish', async () => {

        setContext({
            net: getDefaultNetContext(),
            app: getDefaultAppContext()
        })

        const url = 'wss://relay.lxc'
        // const url = 'wss://relay.bf.lxc'
        const relays = [normalizeRelayUrl(url)]

        const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
        const aliceSignerData: SignerData = {type: SignerType.NIP01, nsec: aliceNSec}
        const aliceWSessionData = await asyncCreateWelshmanSession(aliceSignerData)
        const aliceIdentity = new Identity(aliceWSessionData)

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
        expect(JSON.stringify(aliceMetaDataEvent.profile)).to.be.equal(JSON.stringify(readProfile?.profile))

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

        // let's create big Fish

        const bigFishNSec = 'nsec16lc2cn2gzgf3vcv20lwkqquprqujpkq9pj0wcxmnw8scxh6j0yrqlc9ae0'
        const bigFishSignerData: SignerData = {type: SignerType.NIP01, nsec: bigFishNSec}
        const bigFishIdentity = new Identity(await asyncCreateWelshmanSession(bigFishSignerData))

        const bigFishGlobalNostrContext = new GlobalNostrContext(relays)
        const bigFishGlobalDynamicPublisher = new DynamicPublisher(bigFishGlobalNostrContext.profileService, bigFishIdentity)

        const bigFishMetaDataEvent = new Nip01UserMetaDataEvent(new NostrUserProfileMetaData('Big Fish', 'A fishing community in Michigan'), UserType.COMMUNITY, [['nip29'], ['nip35'], ['nip71']])
        bigFishGlobalDynamicPublisher.publish(bigFishMetaDataEvent)

        await wait(2000)

        const bigFishReadProfileAlice = aliceGlobalNostrContext.profileService.nip01Map.get(bigFishIdentity.pubkey)
        const bigFishReadProfileBigFish = bigFishGlobalNostrContext.profileService.nip01Map.get(bigFishIdentity.pubkey)

        const bigFishRelays = [normalizeRelayUrl('wss://relay.bf.lxc')]
        const nip65RelayListMetadataEvent = new Nip65RelayListMetadataEvent([bigFishRelays])
        bigFishGlobalDynamicPublisher.publish(nip65RelayListMetadataEvent)

        await wait(2000)

        const aliceViewOfNip01 = aliceGlobalNostrContext.profileService.nip01Map.get(bigFishIdentity.pubkey)
        const aliceViewOfNip65 = aliceGlobalNostrContext.profileService.nip65Map.get(bigFishIdentity.pubkey)

        expect(aliceViewOfNip65).to.not.be.undefined;
        if (aliceViewOfNip65 === undefined) throw Error('')

        // Alice joins Big Fish and publishes a video of her fishing
        const aliceBigFishCommunityContext = new CommunityNostrContext("Big Fish", aliceViewOfNip65.relays.map(relay => relay[0]))
        const aliceBigFishSession = new DynamicSynchronisedSession(aliceBigFishCommunityContext.relays)
        const aliceBigFishIdentity = aliceBigFishCommunityContext.createCommunityIdentity(aliceWSessionData)
        const aliceBigFishPublisher = new DynamicPublisher(aliceBigFishSession, aliceBigFishIdentity)

        const aliceBigFishEventProcessor = new StaticEventProcessor([
            {
                kind: Nip35TorrentEvent.KIND,
                builder: Nip35TorrentEvent.buildFromEvent,
                handler: (event: Nip35TorrentEvent) => {
                    console.log(event)
                }
            }
        ])

        const aliceBigFishSubscription = new DynamicSubscription(aliceBigFishSession, [{kinds: [Nip35TorrentEvent.KIND]}])

        aliceBigFishSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            aliceBigFishEventProcessor.processEvent(event)
        })

        aliceBigFishPublisher.publish(new Nip35TorrentEvent('My Fish', '1234567890', 'My nice fish'))

        await wait(2000)

        console.log("THE END!")
    });
})
