import {PartialSubscribeRequest, subscribe} from "@red-token/welshman/app";
import {Filter, TrustedEvent} from "@red-token/welshman/util";
import {Subscription} from "@red-token/welshman/net";
import {DynamicSynchronisedSession} from "./DynamicSynchronisedSession.js";

export class DynamicSubscription {
    private _subscriptions: Map<string, Subscription> = new Map<string, Subscription>();
    private _filters: Filter[] = []

    constructor(private session: DynamicSynchronisedSession, filters: Filter[]) {
        session.subscriptions.push(this)

        this.filters = filters;

        session.relays.addListener((newRelays) => {
            // identify the relays that should be closed

            for (const [relay, subscription] of this._subscriptions) {
                if (newRelays.includes(relay)) continue

                subscription.close()
                this._subscriptions.delete(relay)
            }

            // add new
            for (const relay of newRelays) {
                if (this._subscriptions.has(relay)) continue
                this.addWSubscription(relay);
            }
        })
    }

    private addWSubscription(relay: string) {
        const psr: PartialSubscribeRequest = {
            relays: [relay],
            // The filters are the kind of event we want to subscribe to
            filters: this._filters,
            // Here we pass in the event handler
            onEvent: (event: TrustedEvent) => {
                console.log(`GOT EVENT: ${relay} ${event.kind} ${event.created_at}`);
                this.session.eventStream.onIncomingEvent(event)
            }
        }

        this._subscriptions.set(relay, subscribe(psr))
    }

    private closeSubscriptions(): void {
        for (const [relay, subscription] of this._subscriptions) {
            subscription.close()
            this._subscriptions.delete(relay)
        }
    }

    private createSubscriptions(): void {
        for (const relay of this.session.relays.value) {
            this.addWSubscription(relay);
        }
    }

    set filters(filters: Filter[]) {
        this._filters = filters;

        // close all the old subscriptions
        this.closeSubscriptions()

        // Add news subscriptions
        if (filters.length > 0)
            this.createSubscriptions()
    }

    get filters() {
        return this._filters;
    }
}
