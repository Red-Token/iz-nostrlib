import {
    Nip9999SeederTorrentTransformationRequestEvent,
    Nip9999SeederTorrentTransformationResponseEvent
} from "./Nip9999SeederControllEvents.js";
import {CommunityNostrContext} from "../communities/CommunityNostrContext.js";
import {Subscription} from "../ses/Subscription.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {DynamicPublisher} from "../ses/DynamicPublisher.js";
import {Identity} from "../communities/Identity.js";

export class NostrCommunityServiceClient {
    // public session: DynamicSynchronisedSession
    // public subscriptions: Subscription[] = []
    // public publisher: DynamicPublisher

    constructor(public community: CommunityNostrContext, public identity: Identity) {
        // this.session = new DynamicSynchronisedSession(community.relays)
        //
        // const nowInSeconds = Math.floor(Date.now() / 1000);
        //
        // const sub = new DynamicSubscription(
        //     this.session,
        //     [
        //         {
        //             kinds: [Nip9999SeederTorrentTransformationResponseEvent.KIND],
        //             since: nowInSeconds,
        //             '#p': [identity.pubkey]
        //         }
        //     ],
        // );
        //
        // this.publisher = new DynamicPublisher(this.session, identity)
    }

    request(req: Nip9999SeederTorrentTransformationRequestEvent) {
        console.info('[iz-nostrlib] client.request invoked', {
            requestKind: req.kind,
            requestTitle: req.title,
            requestTorrentHash: req.x,
            communityRelays: this.community.relays.value,
            identityPubkey: this.identity.pubkey
        })

        const dss: DynamicSynchronisedSession = new DynamicSynchronisedSession(this.community.relays)
        const pub = new DynamicPublisher(dss, this.identity)
        console.info('[iz-nostrlib] client.request publishing event')
        const event = pub.publish(req)

        const publishedEventId = (event as {event?: {id?: string}} | undefined)?.event?.id
        console.info('[iz-nostrlib] client.request publish result', {
            hasPublishResult: event !== undefined && event !== null,
            publishedEventId: publishedEventId ?? null,
            publishResultKeys: event && typeof event === 'object' ? Object.keys(event as object) : []
        })

        if (!publishedEventId) {
            throw new Error('[iz-nostrlib] publish did not return an event id')
        }

        const sub = new DynamicSubscription(dss, [{
            kinds: [Nip9999SeederTorrentTransformationResponseEvent.KIND],
            '#e': [publishedEventId]
        }])
        console.info('[iz-nostrlib] client.request response subscription created', {
            kind: Nip9999SeederTorrentTransformationResponseEvent.KIND,
            eTag: publishedEventId
        })
        return {dss, pub};
    }
}
