import {getDefaultAppContext, getDefaultNetContext} from "@welshman/app";
import {setContext} from "@welshman/lib";
import {asyncCreateWelshmanSession, CommunityNostrContext, NotificationEventType} from "../../src/org/nostr/communities/CommunityNostrContext";
import {normalizeRelayUrl} from "@welshman/util";
import {Publisher, SignerData, SignerType, SynchronisedSession} from "../../src";
import {Nip01UserMetaDataEvent} from "../../src/org/nostr/nip01/Nip01UserMetaData";
import {NostrUserProfileMetaData} from "../../src/org/nostr/nip01/NostrUserProfileMetaData";
import {Follow, Nip02FollowListEvent} from "../../src/org/nostr/nip02/Nip02FollowListEvent";
import {Nip35TorrentEvent} from "../../src/org/nostr/nip35/Nip35TorrentEvent";
import {expect} from "chai";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const wait = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Async Test Example', () => {

    before(function () {
        // Code to run before all tests
    });

    it('should complete an async operation', async () => {
        setContext({
            net: getDefaultNetContext(),
            app: getDefaultAppContext()
        })

        const aliceMessagePile = []
        const bobMessagePile: any = []

        const url = 'wss://relay.lxc'
        // const url = 'wss://relay.stream.labs.h3.se'
        const relays = [normalizeRelayUrl(url)]

        let alicePubkey = ''
        let bobPubkey = ''

        let aliceCi
        let bobCi
        let bobCom


        const aliceCom = new CommunityNostrContext('testcom', relays)
        // Alice
        {
            aliceCom.connect()

            aliceCom.notifications.on(NotificationEventType.TORRENT, (event) => {
                console.log('updating', event)
                aliceMessagePile.push(event)
            })

            aliceCom.notifications.on(NotificationEventType.PROFILE, (event) => {
                console.log('profile', event)
                aliceMessagePile.push(event)
            })

            const aliceNSec = 'nsec18c4t7czha7g7p9cm05ve4gqx9cmp9w2x6c06y6l4m52jrry9xp7sl2su9x'
            const aliceSignerData: SignerData = {type: SignerType.NIP01, nsec: aliceNSec}

            const ws = await asyncCreateWelshmanSession(aliceSignerData)
            alicePubkey = ws.pubkey

            const ci = aliceCom.createCommunityIdentity(ws)

            aliceCi = ci

            const profile: NostrUserProfileMetaData = {
                name: 'Alice', about: 'The Queen of tests', display_name: 'The only one',
                website: '', bot: false, picture: '', banner: ''
            }

            ci.profilePublisher.publish(Nip01UserMetaDataEvent.KIND, new Nip01UserMetaDataEvent(profile).createTemplate())
        }

        {
            const com = new CommunityNostrContext('testcom', relays)
            bobCom = com

            com.connect()

            com.notifications.on(NotificationEventType.TORRENT, (event) => {
                console.log('updating', event)
                bobMessagePile.push(event)
            })

            com.notifications.on(NotificationEventType.PROFILE, (event) => {
                console.log('profile', event)
                bobMessagePile.push(event)
            })

            const bobNSec = 'nsec1zsp48upz3vd64lwhx7me8utrxyfxuzdwvxhfld2q0ehs0ya9mlxs47v64q'
            const bobSignerData: SignerData = {type: SignerType.NIP01, nsec: bobNSec}

            const ws = await asyncCreateWelshmanSession(bobSignerData)
            bobPubkey = ws.pubkey
            const ci = com.createCommunityIdentity(ws)
            bobCi = ci

            const profile: NostrUserProfileMetaData = {
                name: 'Bob', about: 'The King of tests', display_name: 'The only two',
                website: '', bot: false, picture: '', banner: ''
            }

            ci.profilePublisher.publish(Nip01UserMetaDataEvent.KIND, new Nip01UserMetaDataEvent(profile).createTemplate())

            const eventTemplate = new Nip02FollowListEvent([...ci.followList, new Follow(alicePubkey)])
            ci.followPublisher.publish(Nip02FollowListEvent.KIND, eventTemplate.createTemplate())
        }

        const xxx = new SynchronisedSession(relays)
        const publisher = new Publisher(xxx, aliceCi)

        const tor = new Nip35TorrentEvent('title1', 'x', 'description', [['sdfsdfs', 'sfsdfsdfs']], ['track'], ['ts'], ['MESSAGE1'])

        const y = publisher.publish(Nip35TorrentEvent.KIND, tor.createTemplate())

        const tor2 = new Nip35TorrentEvent('title2', 'x', 'description', [['sdfsdfs', 'sfsdfsdfs']], ['track'], ['ts'], ['MESSAGE2'])

        const y2 = publisher.publish(Nip35TorrentEvent.KIND, tor2.createTemplate())

        await wait(15000)

        expect(bobMessagePile.length).to.equal(4);
        expect(bobMessagePile[3].title).to.equal('title1');
        expect(bobMessagePile[4].title).to.equal('title2');

        console.log("THE END!")
    });

});
