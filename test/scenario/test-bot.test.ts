// src/index.ts
import {randomUUID} from "node:crypto";
import {mkdirSync} from "fs";
import path from "node:path";
import fs from "node:fs";
import {getDefaultAppContext, getDefaultNetContext} from "@red-token/welshman/app";
import {normalizeRelayUrl, TrustedEvent} from "@red-token/welshman/util";
import {DynamicPublisher, SignerData, SignerType} from "../../src/org/nostr/ses/index.js";
import {EventType} from "../../src/index.js";
import {
    asyncCreateWelshmanSession,
    CommunityNostrContext,
    GlobalNostrContext,
    Identifier, Identity
} from "../../src/org/nostr/communities/index.js";
import {
    Nip9999SeederTorrentTransformationRequestEvent, Nip9999SeederTorrentTransformationResponseEvent,
    NostrCommunityServiceBot
} from "../../src/org/nostr/seederbot/index.js";
import {setContext} from "@red-token/welshman/lib";

const gurl = 'wss://relay.pre-alfa.iz-stream.com'
const url = 'wss://relay.big-fish.communities.pre-alfa.iz-stream.com';

// const gurl = 'wss://relay.lxc'
// const url = 'wss://relay.bf.lxc';

export class BotConfig {
    globalRelay = [normalizeRelayUrl(gurl)];
    comRelay = [normalizeRelayUrl(url)]
    nsec = 'nsec1p5p9ax0uftre04ewgxntkca4jurj2zlhjed46nwr22xs652vgtss84jeep'
    communityPubkey = '76e75c0c50ce7ef714b76eaf06d6a06a29d296d5bb86270818675a669938dbe2'
    uploadDir = '/tmp/iz-seeder-bot/upload'
    transcodingDir = '/tmp/iz-seeder-bot/transcoding'
    seedingDir = '/var/tmp/iz-seeder-bot/seeding'
}

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.log('Bot is rdy!');

const rtcConfig = {
    iceServers: [
        {
            urls: [
                "turn:turn.stream.labs.h3.se",
            ],
            username: "test",
            credential: "testme",
        },
        {
            urls:
                ["stun:stun.stream.labs.h3.se"],
            username: "test",
            credential: "testme",
        }],
    iceTransportPolicy: "all",
    iceCandidatePoolSize: 0,
}

const options = {
    announce: ['wss://tracker.webtorrent.dev', 'wss://tracker.btorrent.xyz', 'wss://tracker.openwebtorrent.com'],
    maxWebConns: 500
};

setContext({
    net: getDefaultNetContext(),
    app: getDefaultAppContext()
});

// NSec nsec1gdraq2julszrgygm5zf7e02rng6jguxmr5uuxy7wnyex9yszkwesrfnu3m
// NPub npub1kecwpcs0k6m7j6crfyfecqc4p45j5aqrexrqnxs64h6x0k4x0yysrx2y6f
// PublicKey b670e0e20fb6b7e96b0349139c03150d692a7403c986099a1aadf467daa67909

// const url = 'wss://relay.stream.labs.h3.se';
// const relays = [normalizeRelayUrl(url)];

export async function wait(time: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true)
        }, time)
    })
}

describe('Async Test Example', () => {
    it('should complete an async operation', async () => {

        const botConfig = new BotConfig()

// GlobalNostrContext.startUrls = botConfig.comRelay

        const gnc = new GlobalNostrContext(botConfig.globalRelay)

        await wait(2000)

        const botSignerData: SignerData = {type: SignerType.NIP01, nsec: botConfig.nsec}
        const botIdentifier = new Identifier(await asyncCreateWelshmanSession(botSignerData))

// const bgi = new Identity(gnc, botIdentifier)
        const cnc = new CommunityNostrContext(botConfig.communityPubkey, gnc)

        const bci = new Identity(cnc, botIdentifier)

        console.log("Bot Pubkey", bci.pubkey)

        const ncs = new NostrCommunityServiceBot(cnc, bci)

        const uploadDir = '/tmp/iz-seeder-bot/upload'
        const transcodingDir = '/tmp/iz-seeder-bot/transcoding'
        const seedingDir = '/var/tmp/iz-seeder-bot/seeding'

        mkdirSync(seedingDir, {recursive: true})

        fs.readdirSync(seedingDir).forEach(filename => {
            console.log(`Starting seeding: ${filename}`);
        })

        class RequestStateProgressTracker {
            constructor(private readonly id: string, private readonly publisher: DynamicPublisher) {
            }

            updateState(state: any, tags: string[][] = []) {
                const e2 = new Nip9999SeederTorrentTransformationResponseEvent(state, this.id, tags)
                this.publisher.publish(e2)
            }
        }

        ncs.session.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            console.log(event)

            const rspt = new RequestStateProgressTracker(event.id, ncs.publisher)

            if (event.kind === Nip9999SeederTorrentTransformationRequestEvent.KIND) {
                const req = Nip9999SeederTorrentTransformationRequestEvent.buildFromEvent(event)

                const state = {state: 'accepted', msg: `Processing request ${event.id} for ${req.x}`}
                rspt.updateState(state)

                const torrentPath = path.join(uploadDir, randomUUID())
                mkdirSync(torrentPath, {recursive: true})

                rspt.updateState({state: 'prepared', msg: `Download is prepared`})
            }

            function transcode(id: string, inputFile: string, outputDir: string) {
                return new Promise(resolve => {
                    mkdirSync(outputDir, {recursive: true})

                    const state = {
                        state: 'transcoding',
                        msg: `Transcoding has started`
                    }
                    rspt.updateState(state)
                })
            }
        })

        console.log("BOT STARTED DONE")
    })
})
