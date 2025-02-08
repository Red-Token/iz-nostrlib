import {AbstractNostrContext} from "./AbstractNostrContext.js";
import {ProfileService} from "../services/ProfileService";

/**
 * This context is the global context and is used for maintaining the global profile database.
 */
export class GlobalNostrContext extends AbstractNostrContext {

    public profileService = new ProfileService(this)

    // public connect() {
    //     // start service to update Kind 0
    // }
}
