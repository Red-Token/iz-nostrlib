import {SynchronisedEventStream} from "./SynchronisedEventStream";
import {ReactiveArray} from "../util/ReactiveArray";
import {DynamicSubscription} from "./DynamicSubscription";

export type SignerData = {
    type: SignerType,
    nsec?: string,
    pubkey?: string,
    relays?: string[],
    rpubkey?: string,
    secret?: string,
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
export class DynamicSynchronisedSession {

    public eventStream: SynchronisedEventStream;
    public subscriptions: DynamicSubscription[] = [];

    /**
     * Arms the Session with the signature data
     * @param relays
     */
    constructor(public relays: ReactiveArray<string>) {
        this.eventStream = new SynchronisedEventStream()
    }
}
