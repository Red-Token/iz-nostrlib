import {AbstractNostrContext} from "./AbstractNostrContext.js";
import {GlobalNostrContext} from "./GlobalNostrContext.js";

export class CommunityNostrContext extends AbstractNostrContext {

    constructor(public pubkey: string, parentContext: GlobalNostrContext) {
        //TODO: make this nice and reactive
        super(parentContext.profileService.getRelaysFor(pubkey));
    }
}
