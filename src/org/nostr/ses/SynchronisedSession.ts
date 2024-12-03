import {addSession, getSigner, Session} from "@welshman/app";
import {bytesToHex} from "@noble/hashes/utils";
import {generateSecretKey, getPublicKey, nip19} from "nostr-tools";
import {Subscription} from "./Subscription";
import {Publisher} from "./Publisher";
import {SynchronisedEventStream} from "./SynchronisedEventStream";
import {ISigner} from "@welshman/signer";

type SignerData = {
    type: SignerType,
    nsec?: string,
    pubkey?: string,
}

export enum SignerType {
    NIP01 = 'nip01',
    NIP07 = 'nip07',
    NIP46 = 'nip46',
}

/**
 * A SynchronisedSession uses one identity and a set of Subscriptions to create a SynchronisedEventStream. It also
 * Allows the user to create a set of Publishers that can be used to publish events into the EventStream.
 *
 * There is a getSigner function that recreates a signer based on the method variable stored.
 *
 * if it's nip01 (NSes) then you use session.secret to get the NSec in HEX
 *
 * if it's nip07 (Browser extension) the just activate it, we dont use anything else
 *
 * if it's nip46 (Remote signer) you create a Signer based on a broker that uses session.secret, and session.handler
 *
 * if it's nip55 (Android Signer) Then you just send in the signer vanilla.
 *
 * Now the change is the ISigner does give you the pubkey, but it does so on an async call (for nip07, nip46 and nip55
 * you need to calls outside the code)
 *
 *
 */
export class SynchronisedSession {
    static transformer = {
        'nip01': (session: SignerData): Session => {
            if (session.nsec === undefined) throw new Error('no nsec in session')

            const decoded = nip19.decode(session.nsec)

            if (decoded.type !== 'nsec') throw new Error('Decoded value not of type nsec')

            const secKey: Uint8Array = decoded.data;
            return {method: session.type, pubkey: getPublicKey(secKey), secret: bytesToHex(secKey)}
        },
        'nip07': (session: SignerData): Session => {
            return {method: session.type, pubkey: session.pubkey ? session.pubkey : ""}
        },
        'nip46': (session: SignerData): Session => {
            // Create temp id
            const sessionSecretKey = generateSecretKey()
            const pubkey = getPublicKey(sessionSecretKey)
            return {method: session.type, pubkey, handler: {relays: [], pubkey}}
        },
    }

    protected signer: ISigner | undefined;
    public eventStream: SynchronisedEventStream;

    /**
     * Arms the Session with the signature data
     * @param signerData
     * @param relays
     */
    constructor(public signerData: SignerData, public readonly relays: string[]) {
        this.eventStream = new SynchronisedEventStream()
    }

    /**
     * Init the Signer
     * @param session
     */
    async init(): Promise<SynchronisedSession> {
        return new Promise<SynchronisedSession>((resolve, reject) => {
            const wsession = SynchronisedSession.transformer[this.signerData.type](this.signerData)
            addSession(wsession)
            this.signer = getSigner(wsession)
            resolve(this)
        })
    }

    createPublisher() {
        return new Publisher(this)
    }

    createSubscription(filters: any) {
        return new Subscription(this, filters)
    }
}
