import {Nip9999SeederTorrentTransformationResponseEvent} from "./Nip9999SeederControllEvents";
import {CommunityIdentity, CommunityNostrContext} from "../communities/CommunityNostrContext";
import {Subscription} from "../ses/Subscription.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession";
import {DynamicSubscription} from "../ses/DynamicSubscription";
import {DynamicPublisher} from "../ses/DynamicPublisher";

export class NostrCommunityServiceClient {
    public session: DynamicSynchronisedSession
    public subscriptions: Subscription[] = []
    public publisher: DynamicPublisher

    constructor(public community: CommunityNostrContext, public communityIdentity: CommunityIdentity) {
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
