import {AbstractNostrContext} from "./AbstractNostrContext";
import {GlobalNostrContext} from "./GlobalNostrContext";

export class CommunityNostrContext extends AbstractNostrContext {

    constructor(public pubkey: string, parentContext: GlobalNostrContext) {
        //TODO: make this nice and reactive
        super(parentContext.profileService.getRelaysFor(pubkey));
    }
}
