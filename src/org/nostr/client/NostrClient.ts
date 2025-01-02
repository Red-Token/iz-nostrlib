import {SignerData, SynchronisedSession} from "../ses/SynchronisedSession";

export class NostrClient {
    static instance: NostrClient;

    static getInstance(): NostrClient {
        if (!NostrClient.instance) {
            NostrClient.instance = new NostrClient();
        }

        return NostrClient.instance;
    }

    public sessions: SynchronisedSession[] = []

    private signerData: SignerData | undefined
    private _relays: string[] = []

    async logIn(signerData: SignerData) {
        this.signerData = signerData

        for (const session of this.sessions) {
            await session.init(signerData)
        }
    }

    logOut(): void {
        this.signerData = undefined;
    }

    isLoggedIn(): boolean {
        return this.signerData !== undefined;
    }

    createSession(relays: string[] | undefined = this._relays): SynchronisedSession {
        const session = new SynchronisedSession(relays)
        this.sessions.push(session)

        return session
    }

    set relays(value: string[]) {
        this._relays = value;
    }

    // We should do a logging session here
}