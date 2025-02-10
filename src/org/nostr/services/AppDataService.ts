import type {TrustedEvent} from "@welshman/util";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {AbstractNostrContext} from "../communities/AbstractNostrContext.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {Nip78ArbitraryCustomAppData, Nip78ArbitraryCustomAppDataHandler} from "../nip78/Nip78ArbitraryCustomAppData.js";
import {updateIfNewer} from "../util/scraps.js";
import {StaticEventsProcessor} from "../ses/StaticEventsProcessor";

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

        const eventProcessor = new StaticEventsProcessor([
            new Nip78ArbitraryCustomAppDataHandler((event: Nip78ArbitraryCustomAppData<any>) => {
                updateIfNewer(event, event.app,
                    getOrCreate<string, string, Nip78ArbitraryCustomAppData<any>>(event.event?.pubkey!, this.appDataMap))
            })
        ])

        this.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            eventProcessor.processEvent(event)
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
        for (const kind of eventProcessor.eventHandlerMap.keys()) {
            new DynamicSubscription(
                this,
                [{kinds: [kind], authors: []}])
        }
    }
}
