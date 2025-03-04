import type {TrustedEvent} from "@red-token/welshman/util";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {Nip78ArbitraryCustomAppData, Nip78ArbitraryCustomAppDataHandler} from "../nip78/Nip78ArbitraryCustomAppData.js";
import {updateIfNewer} from "../util/scraps.js";
import {StaticEventsProcessor} from "../ses/StaticEventsProcessor.js";
import {AppNostrContext, collectRelaysFromIdentities} from "../communities/AppNostrContext.js";
import {AbstractService} from "./AbstractService.js";

export function getOrCreate<K, K2, V>(key: K, map: Map<K, Map<K2, V>>) {
    let element = map.get(key);

    if (element == undefined) {
        element = new Map<K2, V>();
        map.set(key, element);
    }

    return element;
}

export class AppDataService extends AbstractService {
    appDataMap = new Map<string, Map<string, Nip78ArbitraryCustomAppData<any>>>()

    constructor(context: AppNostrContext) {
        super(context)

        const eventProcessor = new StaticEventsProcessor([
            new Nip78ArbitraryCustomAppDataHandler((event: Nip78ArbitraryCustomAppData<any>) => {
                updateIfNewer(event, event.app,
                    getOrCreate<string, string, Nip78ArbitraryCustomAppData<any>>(event.event?.pubkey!, this.appDataMap))
            })
        ])

        this.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            eventProcessor.processEvent(event)
        })

        const recalibrate = () => {
            this.context.relays.value = collectRelaysFromIdentities(context.parentContext, context.identities.value)

            const kinds = Array.from(eventProcessor.eventHandlerMap.keys())
            const authors = Array.from(context.identities.value.keys())

            // Terminate all session that have the incorrect author
            for (const sub of this.subscriptions) {
                sub.filters = [{kinds, authors}]
            }
        }

        context.parentContext.profileService.nip65Map.addListener((keys) => {
            console.log("THESE KEYS GOT UPDATED" + keys)
            recalibrate()
        })

        context.identities.addListener((keys) => {
            console.log("THESE KEYS GOT UPDATED2" + keys)
            recalibrate()
        })

        // Activate dynamic subscription
        for (const kind of eventProcessor.eventHandlerMap.keys()) {
            new DynamicSubscription(
                this,
                [{kinds: [kind], authors: []}])
        }
    }

    getAppData(appName: string, pubkey: string) {
        getOrCreate(pubkey,this.appDataMap)
    }

}
