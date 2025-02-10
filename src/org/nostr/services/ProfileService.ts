import type {TrustedEvent} from "@welshman/util";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {Nip01UserMetaDataEvent, Nip01UserMetaDataEventHandler} from "../nip01/Nip01UserMetaData.js";
import {AbstractNostrContext} from "../communities/AbstractNostrContext.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {Nip65RelayListMetadataEvent, Nip65RelayListMetadataEventHandler} from "../nip65/Nip65RelayListMetadata.js";
import {AbstractNipMiniEvent} from "../AbstractNipEvent.js";
import {ReactiveMap} from "../util/ReactiveMap.js";
import {StaticEventsProcessor} from "../ses/StaticEventsProcessor.js";

function createMapEventHandler<T extends AbstractNipMiniEvent>(map: ReactiveMap<string, T>) {
    return (event: T): void => {map.set(event.pubkey, event)}
}

export class ProfileService extends DynamicSynchronisedSession {

    public nip01Map = new ReactiveMap(new Map<string, Nip01UserMetaDataEvent>())
    public nip65Map = new ReactiveMap(new Map<string, Nip65RelayListMetadataEvent>())

    constructor(context: AbstractNostrContext) {
        super(context.relays)

        const eventProcessor = new StaticEventsProcessor<AbstractNipMiniEvent>([
            new Nip01UserMetaDataEventHandler(createMapEventHandler(this.nip01Map)),
            new Nip65RelayListMetadataEventHandler(createMapEventHandler(this.nip65Map)),
        ])

        this.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            eventProcessor.processEvent(event)
        })

        // Activate dynamic subscription
        // for (const kind of eventProcessor.eventHandlerMap.keys()) {
        new DynamicSubscription(
            this,
            [{kinds: [...eventProcessor.eventHandlerMap.keys()]}])
        // }
    }
}
