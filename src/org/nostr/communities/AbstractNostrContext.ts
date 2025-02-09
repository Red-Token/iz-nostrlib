import {SynchronisedSession} from "../ses/SynchronisedSession.js";
import {ReactiveArray} from "../util/ReactiveArray.js";
import {Identity} from "./CommunityNostrContext";
import {ReactiveMap} from "../util/ReactiveMap";

export class AbstractNostrContext {
    public relays: ReactiveArray<string>
    public identities: ReactiveMap<string, Identity>;

    constructor(relays: string[], identities: Map<string, Identity> = new Map<string, Identity>()) {
        this.relays = new ReactiveArray(relays)
        this.identities = new ReactiveMap<string, Identity>(identities);
    }

    public sessions: SynchronisedSession[] = []
}
