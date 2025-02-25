import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession";
import {AbstractNostrContext} from "../communities/AbstractNostrContext";

export abstract class AbstractService extends DynamicSynchronisedSession {
    constructor(public context: AbstractNostrContext) {
        super(context.relays);
        context.services.push(this);
    }
}
