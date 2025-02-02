import {SignerData, SynchronisedSession} from "../ses/SynchronisedSession.js";
import {Publisher} from "../ses/Publisher.js";
import {Subscription} from "../ses/Subscription.js";
import {Follow, Nip02FollowListEvent, Nip02FollowListEventBuilder} from "../nip02/Nip02FollowListEvent.js";
import {Nip35TorrentEvent, Nip35TorrentEventBuilder} from "../nip35/Nip35TorrentEvent.js";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {TrustedEvent} from "@welshman/util";
import mitt from "mitt";
import {Nip01UserMetaDataEvent} from "../nip01/Nip01UserMetaData.js";
import {ProfileService} from "../services/ProfileService.js";
import {NostrClient} from "../client/NostrClient.js";
import {addSession, getSigner, Session} from "@welshman/app";
import {Nip01Signer, Nip07Signer, Nip46Signer, Nip55Signer} from "@welshman/signer";

export enum NotificationEventType {
    PROFILE = 'profile',
    TORRENT = 'torrent',
}

export type NotificationEvents = {
    profile: Nip01UserMetaDataEvent
    torrent: Nip35TorrentEvent
}

export type WelshmanSessionData = {
    wSession: Session,
    signer: NonNullable<Nip07Signer | Nip01Signer | Nip46Signer | Nip55Signer | null>
    pubkey: string
}

export async function asyncCreateWelshmanSession(signerData: SignerData): Promise<WelshmanSessionData> {
    const wSession = NostrClient.transformer[signerData.type](signerData)
    addSession(wSession)
    const signer = getSigner(wSession)
    const pubkey = await signer.getPubkey()

    return {wSession, signer, pubkey}
}

export class CommunityIdentity {
    followList: Follow[] = []
    private readonly followSession: SynchronisedSession
    private followSubscriptions: Subscription[] = []
    private notificationSubscriptions: Subscription[] = []
    public readonly pubkey: string
    private welshmanData: WelshmanSessionData;

    public followPublisher: Publisher;
    public profilePublisher: Publisher

    constructor(public readonly community: Community, data: WelshmanSessionData) {
        this.welshmanData = data
        this.pubkey = data.pubkey
        this.community.identities.set(this.pubkey, this)

        this.profilePublisher = new Publisher(this.community.profileService, this)

        this.followSession = new SynchronisedSession(community.relays);
        this.followPublisher = new Publisher(this.followSession, this)
        this.followSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            if (event.kind === Nip02FollowListEvent.KIND) {
                const followListEvent = new Nip02FollowListEventBuilder(event).build();
                this.followList = followListEvent.list

                // Update the notification of publications
                for (const ns of this.notificationSubscriptions)
                    ns.unsubscribe()

                this.notificationSubscriptions = []

                const authors = [...this.followList.map(follow => {
                    return follow.pubkey
                })]

                // we do nothing if the list is empty
                if (authors.length == 0)
                    return

                for (const relay of community.relays) {
                    const sub = new Subscription(
                        this.community.notificationSession,
                        [{kinds: [Nip35TorrentEvent.KIND], authors}],
                        // [{kinds: [Nip35TorrentEvent.KIND]}],
                        [relay])

                    this.notificationSubscriptions.push(sub)
                }

                return
            }

            throw new Error("Unable to find any notification session")
        })

        // Create a subscription for populate the followList
        for (const relay of community.relays) {
            this.followSubscriptions.push(new Subscription(
                this.followSession,
                [{kinds: [Nip02FollowListEvent.KIND], authors: [this.pubkey]}],
                [relay]))
        }
    }

    discard(): void {
        this.followSubscriptions.forEach(subscription => {
            subscription.unsubscribe()
        })
        this.followSubscriptions = []
        this.notificationSubscriptions.forEach(subscription => {
            subscription.unsubscribe()
        })
        this.notificationSubscriptions = []
        this.community.identities.delete(this.pubkey)
    }
}

export class Community {
    public readonly notificationSession: SynchronisedSession;

    constructor(public name: string, public readonly relays: string[], public image?: string) {
        this.notificationSession = new SynchronisedSession(relays);
        this.notificationSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            if (event.kind === Nip35TorrentEvent.KIND) {
                const torrentEvent = new Nip35TorrentEventBuilder(event).build()
                this.notifications.emit(NotificationEventType.TORRENT, torrentEvent)
            }
        })
    }

    public sessions: SynchronisedSession[] = []
    public identities: Map<string, CommunityIdentity> = new Map()
    public notifications = mitt()
    public profileService = new ProfileService(this)

    private sub: Subscription | undefined

    public connect() {
        // start service to update Kind 0
        this.sub = new Subscription(
            this.profileService,
            [{kinds: [Nip01UserMetaDataEvent.KIND]}],
            this.relays)
    }

    public disconnect() {
        // stop service to update Kind 0
        this.sub?.unsubscribe()
        this.sub = undefined
    }

    public connected() {
        return this.sub !== undefined
    }

    createCommunityIdentity(welshmanSessionData: WelshmanSessionData): CommunityIdentity {
        return new CommunityIdentity(this, welshmanSessionData)
    }
}
