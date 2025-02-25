import {
    Nip9999SeederTorrentTransformationRequestEvent,
    Nip9999SeederTorrentTransformationResponseEvent
} from "./Nip9999SeederControllEvents";
import {CommunityNostrContext} from "../communities/CommunityNostrContext";
import {Subscription} from "../ses/Subscription";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession";
import {DynamicSubscription} from "../ses/DynamicSubscription";
import {DynamicPublisher} from "../ses/DynamicPublisher";
import {Identity} from "../communities/Identity";

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
        const dss: DynamicSynchronisedSession = new DynamicSynchronisedSession(this.community.relays)
        const pub = new DynamicPublisher(dss, this.identity)
        const event = pub.publish(req)
        const sub = new DynamicSubscription(dss, [{
            kinds: [Nip9999SeederTorrentTransformationResponseEvent.KIND],
            '#e': [event.event.id]
        }])
        return {dss, pub};
    }
}
