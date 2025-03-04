import {AbstractNostrContext} from "./AbstractNostrContext.js";
import {ProfileService} from "../services/ProfileService.js";
import {AppDataService} from "../services/AppDataService.js";
import {GlobalNostrContext} from "./GlobalNostrContext.js";
import {Identity} from "./Identity.js";

// export function collectRelaysFromIdentities(ctx: GlobalNostrContext, identities: Identity[]   ) {
//     const relayMap: Map<string, string[]> = new Map();
//
//     identities.forEach(identity => {
//         ctx.profileService.getRelaysFor(identity.pubkey).forEach((relay) => {
//             relayMap.set(relay, (relayMap.get(relay) ?? []).concat(identity.pubkey))
//         })
//     })
//
//     return relayMap;
// }

export function collectRelaysFromIdentities(ctx: GlobalNostrContext, identities: Map<string, Identity>) {
    const relays: Set<string> = new Set();

    identities.forEach(identity => {
        ctx.profileService.getRelaysFor(identity.pubkey).forEach((relay) => {
            relays.add(relay);
        })
    })

    return Array.from(relays);
}

/**
 *  TODO: Make this a lot more dynamic
 */
export class AppNostrContext extends AbstractNostrContext {
    constructor(public parentContext: GlobalNostrContext, identities: Map<string, Identity> = new Map<string, Identity>()) {
        super(collectRelaysFromIdentities(parentContext, identities));
        this.appDataService = new AppDataService(this)
    }

    public appDataService: AppDataService;
}
