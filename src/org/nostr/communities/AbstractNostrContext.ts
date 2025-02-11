import {ReactiveArray} from "../util/ReactiveArray.js";
import {ReactiveMap} from "../util/ReactiveMap.js";
import {ProfileService} from "../services/ProfileService.js";
import {Identity} from "./Identity.js";
import {AbstractService} from "../services/AbstractService";

export class AbstractNostrContext {
    public relays: ReactiveArray<string>
    public identities: ReactiveMap<string, Identity>;

    constructor(relays: string[], identities: Map<string, Identity> = new Map<string, Identity>()) {
        this.relays = new ReactiveArray(relays)
        this.identities = new ReactiveMap<string, Identity>(identities);

        // Create the services
    }

    public services: AbstractService[] = []
}
