import {SignerData} from "../ses/SynchronisedSession.js";
import {Subscription} from "../ses/Subscription.js";
import {Followee} from "../nip02/Nip02FollowListEvent.js";
import {Nip35TorrentEvent} from "../nip35/Nip35TorrentEvent.js";
import {Nip01UserMetaDataEvent} from "../nip01/Nip01UserMetaData.js";
import {NostrClient} from "../client/NostrClient.js";
import {addSession, getSigner, Session} from "@welshman/app";
import {Nip01Signer, Nip07Signer, Nip46Signer, Nip55Signer} from "@welshman/signer";
import {AbstractNostrContext} from "./AbstractNostrContext";

export enum NotificationEventType {
    PROFILE = 'profile',
    RELAYS = 'relays',
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

export class Identity {
    constructor(public readonly welshmanData: WelshmanSessionData) {
    }

    public get pubkey(): string {
        return this.welshmanData.pubkey;
    }
}

export class CommunityIdentity extends Identity {
    followList: Followee[] = []
    // private readonly followSession: SynchronisedSession
    private followSubscriptions: Subscription[] = []
    private notificationSubscriptions: Subscription[] = []
    // public readonly pubkey: string

    // public followPublisher: Publisher;

    constructor(public readonly community: CommunityNostrContext, data: WelshmanSessionData) {
        super(data)
        // this.pubkey = data.pubkey
        this.community.identities.set(this.pubkey, this)

        // TODO: Create a follow Service
        // this.followSession = new SynchronisedSession(community.relays.value);
        // this.followPublisher = new Publisher(this.followSession, this)
        // this.followSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
        //     if (event.kind === Nip02FollowListEvent.KIND) {
        //         const followListEvent = new Nip02FollowListEventBuilder(event).build();
        //         this.followList = followListEvent.list
        //
        //         // Update the notification of publications
        //         for (const ns of this.notificationSubscriptions)
        //             ns.unsubscribe()
        //
        //         this.notificationSubscriptions = []
        //
        //         const authors = [...this.followList.map(follow => {
        //             return follow.pubkey
        //         })]
        //
        //         // we do nothing if the list is empty
        //         if (authors.length == 0)
        //             return
        //
        //         for (const relay of community.relays.value) {
        //             const sub = new Subscription(
        //                 this.community.notificationSession,
        //                 [{kinds: [Nip35TorrentEvent.KIND], authors}],
        //                 // [{kinds: [Nip35TorrentEvent.KIND]}],
        //                 [relay])
        //
        //             this.notificationSubscriptions.push(sub)
        //         }
        //
        //         return
        //     }
        //
        //     throw new Error("Unable to find any notification session")
        // })

        // Create a subscription for populate the followList
        // for (const relay of community.relays.value) {
        //     this.followSubscriptions.push(new Subscription(
        //         this.followSession,
        //         [{kinds: [Nip02FollowListEvent.KIND], authors: [this.pubkey]}],
        //         [relay]))
        // }
    }

    discard(): void {
        this.followSubscriptions.forEach(subscription => {
            // subscription.unsubscribe()
        })
        this.followSubscriptions = []
        this.notificationSubscriptions.forEach(subscription => {
            // subscription.unsubscribe()
        })
        this.notificationSubscriptions = []
        this.community.identities.delete(this.pubkey)
    }
}

export class CommunityNostrContext extends AbstractNostrContext {

    constructor(public name: string, relays: string[], public image?: string) {
        super(relays)

        // this.notificationSession.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
        //     if (event.kind === Nip35TorrentEvent.KIND) {
        //         const torrentEvent = new Nip35TorrentEventBuilder(event).build()
        //         this.notifications.emit(NotificationEventType.TORRENT, torrentEvent)
        //     }
        // })
    }

    createCommunityIdentity(welshmanSessionData: WelshmanSessionData): CommunityIdentity {
        return new CommunityIdentity(this, welshmanSessionData)
    }
}
