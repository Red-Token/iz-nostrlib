import {AbstractNostrContext} from "./AbstractNostrContext.js";
import {ProfileService} from "../services/ProfileService";
import {AppDataService} from "../services/AppDataService";

/**
 * This context is the global context and is used for maintaining the global profile database.
 */
export class AppNostrContext extends AbstractNostrContext {
    public appDataService = new AppDataService(this)
}
