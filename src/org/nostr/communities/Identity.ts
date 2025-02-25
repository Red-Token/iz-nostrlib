// import {SignerData} from "../ses/SynchronisedSession";
import {NostrClient} from "../client/NostrClient";
import {addSession, getSigner, Session} from "@welshman/app";
import {Nip01Signer, Nip07Signer, Nip46Signer, Nip55Signer} from "@welshman/signer";
import {AbstractNostrContext} from "./AbstractNostrContext";
import {SignerData} from "../ses/DynamicSynchronisedSession";

export type WelshmanSessionData = {
    wSession: Session,
    signer: NonNullable<Nip07Signer | Nip01Signer | Nip46Signer | Nip55Signer | null>
    pubkey: string
}

export async function asyncCreateWelshmanSession(signerData: SignerData): Promise<WelshmanSessionData> {
    const wSession = NostrClient.transformer[signerData.type](signerData)
    addSession(wSession)
    const signer = getSigner(wSession)
    const pubkey = await signer.getPubkey()

    return {wSession, signer, pubkey}
}

/**
 * This is the token that allows the user to assume and identity
 */
export class Identifier {
    constructor(public readonly welshmanData: WelshmanSessionData) {
    }

    public get pubkey(): string {
        return this.welshmanData.pubkey;
    }
}

/**
 * This is the role a user plays in a context
 */
export class Identity {
    // private _publisher?: DynamicPublisher;

    constructor(public context: AbstractNostrContext, private readonly _identifier: Identifier) {
        context.identities.set(_identifier.pubkey, this)
    }

    public get pubkey(): string {
        return this._identifier.pubkey;
    }

    // public get publisher(): DynamicPublisher {
    //     if (this._publisher === undefined) {
    //         this._publisher = new DynamicPublisher(this.context.profileService, this)
    //     }
    //
    //     return this._publisher
    // }
}
