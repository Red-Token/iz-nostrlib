import {type SignerData, SignerType, SynchronisedSession} from '../ses/SynchronisedSession'
import {Session, SessionNip01, SessionNip07, SessionNip46}  from '@welshman/app'
import {getPublicKey, nip19} from 'nostr-tools'
import {bytesToHex} from '@noble/hashes/utils'


// The main class of the customer Nostr, implemented as a singleton
export class NostrClient {
    static instance: NostrClient

    // Getting a single client copy
    static getInstance(): NostrClient {
        if (!NostrClient.instance) {
            NostrClient.instance = new NostrClient()
        }
        return NostrClient.instance
    }

    // Signature data converters to Session object for welshman
    static transformer = {
        nip01: (session: SignerData): SessionNip01 => {
            // Local signature with a private key
            if (session.nsec === undefined) throw new Error('no nsec in session')
            const decoded = nip19.decode(session.nsec)
            if (decoded.type !== 'nsec') throw new Error('Decoded value not of type nsec')
            const secKey: Uint8Array = decoded.data
            return {method: SignerType.NIP01, pubkey: getPublicKey(secKey), secret: bytesToHex(secKey)}
        },
        nip07: (session: SignerData): SessionNip07 => {
            // Signature through the expansion of the browser
            return {method: SignerType.NIP07, pubkey: session.pubkey ? session.pubkey : ''}
        },
        nip46: (session: SignerData): SessionNip46 => {
            // Remote signature
            if (!session.secret || !session.rpubkey || !session.relays) {
                throw new Error('NIP-46 requires secret, rpubkey, and relays')
            }
            // const sessionSecretKey = generateSecretKey()
            // const pubkey = getPublicKey(sessionSecretKey)
            // TODO This does not work at all
            return {
                method: SignerType.NIP46,
                pubkey: session.pubkey ?? '',
                secret: session.secret,
                handler: {relays: session.relays, pubkey: session.rpubkey}
            }
        }
    }

    public sessions: SynchronisedSession[] = [] // List of active sessions
    private _signerData: SignerData | undefined // Signature data
    private _wSessionData: Session | undefined // The welshman session
    private _relays: string[] = [] // Default relay list

    // Logging in with signature data
    async logIn(signerData: SignerData) {
        this._signerData = signerData
        this._wSessionData = NostrClient.transformer[signerData.type](signerData)
        localStorage.setItem('signerType', signerData.type)
        localStorage.setItem('pubkey', this._wSessionData.pubkey) //This needs to be fixed, since welshman saves the pubkey himself.
        if (signerData.type === 'nip46' && signerData.secret) {
            localStorage.setItem('nip46Token', signerData.secret)
        }
        for (const session of this.sessions) {
            await session.init2(this._wSessionData) // Initializing existing sessions
        }
    }

    // Restoring a session from local storage
    async restoreSession() {
        const type = localStorage.getItem('signerType')
        const pubkey = localStorage.getItem('pubkey')
        if (!type || !pubkey) return
        const signerData: SignerData = {type: type as SignerType, pubkey}
        if (type === 'nip46') {
            signerData.secret = localStorage.getItem('nip46Token') ?? undefined
            signerData.relays = this._relays
        }
        await this.logIn(signerData)
    }

    // Logout
    logOut(): void {
        this._signerData = undefined
        this._wSessionData = undefined
        localStorage.clear()
        this.sessions = []
    }

    // Checking logged in
    isLoggedIn(): boolean {
        return this._signerData !== undefined
    }

    // Creating a new session with specified or default relays
    async createSession(relays: string[] | undefined = this._relays): Promise<SynchronisedSession> {
        const session = new SynchronisedSession(relays)
        if (this._wSessionData !== undefined) {
            await session.init2(this._wSessionData) // Automatic initialization when data is available
        }
        this.sessions.push(session)
        return session
    }

    // Setting the relay list
    set relays(value: string[]) {
        this._relays = value
    }

    // Getting the list of relays
    get relays(): string[] {
        return this._relays
    }

    // Obtaining the public key of the current session
    get publicKey() {
        return this._wSessionData?.pubkey
    }

    // We should do a logging session here
}
