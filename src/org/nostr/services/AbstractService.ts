import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {AbstractNostrContext} from "../communities/AbstractNostrContext.js";

export abstract class AbstractService extends DynamicSynchronisedSession {
    constructor(public context: AbstractNostrContext) {
        super(context.relays);
        context.services.push(this);
    }
}
