import {AbstractNostrContext} from "./AbstractNostrContext";
import {ProfileService} from "../services/ProfileService";
import {AppDataService} from "../services/AppDataService";
import {GlobalNostrContext} from "./GlobalNostrContext";
import {Identity} from "./Identity";

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
