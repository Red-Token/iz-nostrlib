import {addSession, getSigner, Session} from "@welshman/app";
import {bytesToHex} from "@noble/hashes/utils";
import {generateSecretKey, getPublicKey, nip19} from "nostr-tools";
import {Subscription} from "./Subscription";
import {Publisher} from "./Publisher";
import {SynchronisedEventStream} from "./SynchronisedEventStream";
import {ISigner} from "@welshman/signer";
import {NostrClient} from "../client/NostrClient";

export type SignerData = {
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
 * if it's nip07 (Browser extension) the just activate it, we don't use anything else
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

    protected signer: ISigner | undefined;
    public eventStream: SynchronisedEventStream;

    /**
     * Arms the Session with the signature data
     * @param relays
     */
    constructor(public readonly relays: string[]) {
        this.eventStream = new SynchronisedEventStream()
    }

    /**
     * Init the Signer
     * @param signerData
     */
    async init(signerData: SignerData): Promise<SynchronisedSession> {

        return this.init2(NostrClient.transformer[signerData.type](signerData))
        // return new Promise<SynchronisedSession>((resolve, reject) => {
        //     const wsession = NostrClient.transformer[signerData.type](signerData)
        //     addSession(wsession)
        //     this.signer = getSigner(wsession)
        //     resolve(this)
        // })
    }

    async init2(wsession: Session): Promise<SynchronisedSession> {
        return new Promise<SynchronisedSession>((resolve, reject) => {
            addSession(wsession)
            this.signer = getSigner(wsession)
            resolve(this)
        })
    }

    isInitialized(): boolean {
        return this.signer !== undefined
    }

    createPublisher() {
        return new Publisher(this)
    }

    createSubscription(filters: any) {
        return new Subscription(this, filters)
    }

    async getPublicKey() {
        return this.signer?.getPubkey();
    }
}
