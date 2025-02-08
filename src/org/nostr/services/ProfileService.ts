import type {TrustedEvent} from "@welshman/util";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {Nip01UserMetaDataEvent} from "../nip01/Nip01UserMetaData.js";
import {AbstractNostrContext} from "../communities/AbstractNostrContext.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {Nip65RelayListMetadataEvent} from "../nip65/Nip65RelayListMetadata.js";
import {AbstractNipMiniEvent} from "../AbstractNipEvent";
import {updateIfNewer} from "../util/scraps";

export class ProfileService extends DynamicSynchronisedSession {

    public nip01Map = new Map<string, Nip01UserMetaDataEvent>()
    public nip65Map = new Map<string, Nip65RelayListMetadataEvent>()

    constructor(context: AbstractNostrContext) {
        super(context.relays)

        const eventHandlerMap = new Map<number, {
            factory: (event: TrustedEvent) => AbstractNipMiniEvent,
            map: Map<string, AbstractNipMiniEvent>
        }>()

        eventHandlerMap.set(Nip01UserMetaDataEvent.KIND, {
            factory: Nip01UserMetaDataEvent.buildFromEvent,
            map: this.nip01Map
        })
        eventHandlerMap.set(Nip65RelayListMetadataEvent.KIND, {
            factory: Nip65RelayListMetadataEvent.buildFromEvent,
            map: this.nip65Map
        })

        this.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            const eventHandler = eventHandlerMap.get(event.kind)
            console.log("Discovered event:" + event)

            if (eventHandler === undefined)
                throw Error('Unknown event')

            const candidate = eventHandler.factory(event)
            updateIfNewer(candidate, event.pubkey, eventHandler.map)
        })

        // Activate dynamic subscription
        for (const kind of eventHandlerMap.keys()) {
            new DynamicSubscription(
                this,
                [{kinds: [kind]}])
        }
    }
}
