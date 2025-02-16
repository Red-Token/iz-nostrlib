import {Nip9999SeederTorrentTransformationResponseEvent} from "./Nip9999SeederControllEvents.js";
import {CommunityNostrContext} from "../communities/CommunityNostrContext.js";
import {Subscription} from "../ses/Subscription.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {DynamicPublisher} from "../ses/DynamicPublisher.js";
import {Identity} from "../communities/Identity.js";

export class NostrCommunityServiceClient {
    public session: DynamicSynchronisedSession
    public subscriptions: Subscription[] = []
    public publisher: DynamicPublisher

    constructor(public community: CommunityNostrContext, public communityIdentity: Identity) {
        this.session = new DynamicSynchronisedSession(community.relays)

        const nowInSeconds = Math.floor(Date.now() / 1000);

            const sub = new DynamicSubscription(
                this.session,
                [
                    {
                        kinds: [Nip9999SeederTorrentTransformationResponseEvent.KIND],
                        since: nowInSeconds,
                        '#p': [communityIdentity.pubkey]
                    }
                ],
            );

        this.publisher = new DynamicPublisher(this.session, communityIdentity)
    }
}
