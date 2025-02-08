import {Nip9999SeederTorrentTransformationResponseEvent} from "./Nip9999SeederControllEvents";
import {SynchronisedSession} from "../ses/SynchronisedSession.js";
import {Community, CommunityIdentity} from "../communities/Community.js";
import {Publisher} from "../ses/Publisher.js";
import {Subscription} from "../ses/Subscription.js";

export class NostrCommunityServiceClient {
    public session: SynchronisedSession
    public subscriptions: Subscription[] = []
    public publisher: Publisher;

    constructor(public community: Community, public communityIdentity: CommunityIdentity) {
        this.session = new SynchronisedSession(community.relays)

        const nowInSeconds = Math.floor(Date.now() / 1000);

        for (const relay of community.relays) {
            const sub = new Subscription(
                this.session,
                [
                    {
                        kinds: [Nip9999SeederTorrentTransformationResponseEvent.KIND],
                        since: nowInSeconds,
                        '#p': [communityIdentity.pubkey]
                        // authors: [page.params.pubkey]
                    }
                ],
                [relay]
            );

            this.subscriptions.push(sub)
        }

        this.publisher = new Publisher(this.session, communityIdentity)

        // this.session.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
        // })
    }
}
