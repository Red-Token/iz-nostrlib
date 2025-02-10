import {Nip9999SeederTorrentTransformationRequestEvent} from "./Nip9999SeederControllEvents.js";
import {SynchronisedSession} from "../ses/SynchronisedSession.js";
import {Subscription} from "../ses/Subscription.js";
import {Publisher} from "../ses/Publisher.js";
import {CommunityNostrContext, CommunityIdentity} from "../communities/CommunityNostrContext";
import {DynamicPublisher} from "../ses/DynamicPublisher";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession";
import {DynamicSubscription} from "../ses/DynamicSubscription";

export class NostrCommunityServiceBot {
    public session: DynamicSynchronisedSession
    public publisher: DynamicPublisher;

    constructor(public community: CommunityNostrContext, public communityIdentity: CommunityIdentity) {
        this.session = new DynamicSynchronisedSession(community.relays)

        const nowInSeconds = Math.floor(Date.now() / 1000);

        new DynamicSubscription(
            this.session,
            [
                {
                    kinds: [Nip9999SeederTorrentTransformationRequestEvent.KIND],
                    since: nowInSeconds,
                    '#p': [communityIdentity.pubkey]
                    // authors: [page.params.pubkey]
                }
            ],
        );

        this.publisher = new DynamicPublisher(this.session, communityIdentity)
    }
}
