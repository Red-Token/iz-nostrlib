// import {SignerData, SynchronisedSession} from "../ses/SynchronisedSession";
import {SynchronisedSession, type SignerData} from "../ses/SynchronisedSession";
import {Session, sessions} from "@welshman/app";
import {generateSecretKey, getPublicKey, nip19} from "nostr-tools";
import {bytesToHex} from "@noble/hashes/utils";
import {getNip07, Nip07Signer} from "@welshman/signer";

export class NostrClient {
    static instance: NostrClient;

    static getInstance(): NostrClient {
        if (!NostrClient.instance) {
            NostrClient.instance = new NostrClient();
        }

        return NostrClient.instance;
    }

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
            // TODO This does not work at all
            return {method: session.type, pubkey: session.pubkey ? session.pubkey : "", handler: {relays: [], pubkey}}
        },
    }

    public sessions: SynchronisedSession[] = []

    private _signerData: SignerData | undefined
    private _wSessionData: Session | undefined
    private _relays: string[] = []

    async logIn(signerData: SignerData) {
        this._signerData = signerData
        this._wSessionData = NostrClient.transformer[signerData.type](signerData);

        for (const session of this.sessions) {
            await session.init2(this._wSessionData)
        }
    }

    logOut(): void {
        this._signerData = undefined;
        this._wSessionData = undefined;
    }

    isLoggedIn(): boolean {
        return this._signerData !== undefined;
    }

    async createSession(relays: string[] | undefined = this._relays): Promise<SynchronisedSession> {
        const session = new SynchronisedSession(relays)

        if (this._wSessionData !== undefined) {
            await session.init2(this._wSessionData)
        }

        this.sessions.push(session)
        return session
    }

    set relays(value: string[]) {
        this._relays = value;
    }

    get relays(): string[] {
        return this._relays
    }

    get publicKey() {
        return this._wSessionData?.pubkey
    }

    // We should do a logging session here
}
