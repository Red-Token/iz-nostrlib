import type {TrustedEvent} from "@welshman/util";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {Nip01UserMetaDataEvent} from "../nip01/Nip01UserMetaData.js";
import {AbstractNostrContext} from "../communities/AbstractNostrContext.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {Nip65RelayListMetadataEvent} from "../nip65/Nip65RelayListMetadata.js";
import {AbstractNipMiniEvent} from "../AbstractNipEvent";
import {Nip78ArbitraryCustomAppData} from "../nip78/Nip78ArbitraryCustomAppData";
import {updateIfNewer} from "../util/scraps";

class AbstractEventHandler<T extends AbstractNipMiniEvent> {
    constructor(public builder: (event: TrustedEvent) => T, public handler: (event: T) => void) {
    }
}

function getOrCreate<K, K2, V>(key: K, map: Map<K, Map<K2, V>>) {
    let element = map.get(key);

    if (element == undefined) {
        element = new Map<K2, V>();
        map.set(key, element);
    }

    return element;
}


export class AppDataService extends DynamicSynchronisedSession {
    appDataMap = new Map<string, Map<string, Nip78ArbitraryCustomAppData<any>>>()

    constructor(context: AbstractNostrContext) {
        super(context.relays)

        const eventHandlerMap = new Map<number, AbstractEventHandler<any>>()

        eventHandlerMap.set(Nip78ArbitraryCustomAppData.KIND, {
            builder: Nip78ArbitraryCustomAppData.buildFromEvent,
            handler: (event: Nip78ArbitraryCustomAppData<any>) => {
                // if (event.event === undefined) throw new Error("No event handler event handler");
                updateIfNewer(event, event.app,
                    getOrCreate<string, string, Nip78ArbitraryCustomAppData<any>>(event.event?.pubkey!, this.appDataMap))
            }
        })

        this.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            const eventHandler = eventHandlerMap.get(event.kind)

            if (eventHandler === undefined)
                throw Error('Unknown event')

            eventHandler.handler(eventHandler.builder(event))
        })

        context.identities.addListener((keys) => {
            const authors = Array.from(context.identities.value.keys())

            // close down any subscriptions that do not match the authors
            this.subscriptions.filter((subscription) => {
                return subscription.filters.find(filter => filter.authors !== authors)
            }).forEach((subscription) => {
                //TODO: Check here
                subscription.filters = subscription.filters.map(filter => {
                    filter.authors = authors
                    return filter
                })
            })
        })

        // Activate dynamic subscription
        for (const kind of eventHandlerMap.keys()) {
            new DynamicSubscription(
                this,
                [{kinds: [kind], authors: []}])
        }
    }
}
