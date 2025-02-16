import {Nip9999SeederTorrentTransformationRequestEvent} from "./Nip9999SeederControllEvents.js";
import {CommunityNostrContext} from "../communities/CommunityNostrContext.js";
import {DynamicPublisher} from "../ses/DynamicPublisher.js";
import {DynamicSynchronisedSession} from "../ses/DynamicSynchronisedSession.js";
import {DynamicSubscription} from "../ses/DynamicSubscription.js";
import {Identity} from "../communities/Identity.js";

export class NostrCommunityServiceBot {
    public session: DynamicSynchronisedSession
    public publisher: DynamicPublisher;

    constructor(public community: CommunityNostrContext, public identity: Identity) {
        this.session = new DynamicSynchronisedSession(community.relays)

        const nowInSeconds = Math.floor(Date.now() / 1000);

        new DynamicSubscription(
            this.session,
            [
                {
                    kinds: [Nip9999SeederTorrentTransformationRequestEvent.KIND],
                    since: nowInSeconds,
                    '#p': [identity.pubkey]
                    // authors: [page.params.pubkey]
                }
            ],
        );

        this.publisher = new DynamicPublisher(this.session, identity)
    }
}
