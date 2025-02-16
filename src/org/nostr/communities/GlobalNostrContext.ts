import {AbstractNostrContext} from "./AbstractNostrContext.js";
import {ProfileService} from "../services/ProfileService.js";
import {normalizeRelayUrl} from "@welshman/util";

/**
 * This context is the global context and is used for maintaining the global profile database.
 */
export class GlobalNostrContext extends AbstractNostrContext {
    public profileService: ProfileService = new ProfileService(this)

    static startUrls = ['wss://relay.lxc']

    private static _instance: GlobalNostrContext
    static get instance(): GlobalNostrContext {
        if (GlobalNostrContext._instance === undefined) {

            const relays = [...GlobalNostrContext.startUrls.map((url) => normalizeRelayUrl(url))]

            GlobalNostrContext._instance = new GlobalNostrContext(relays)
        }

        return GlobalNostrContext._instance
    }
}
