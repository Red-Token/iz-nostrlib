import type {TrustedEvent} from "@welshman/util";
import {SynchronisedSession} from "../ses/SynchronisedSession.js";
import {EventType} from "../ses/SynchronisedEventStream.js";
import {Nip01UserMetaDataEvent, Nip01UserMetaDataEventBuilder} from "../nip01/Nip01UserMetaData.js";
import {Community, NotificationEventType} from "../communities/Community.js";

export class ProfileService extends SynchronisedSession {
    constructor(community: Community) {
        super(community.relays)
        this.eventStream.emitter.on(EventType.DISCOVERED, (event: TrustedEvent) => {
            if (event.kind === Nip01UserMetaDataEvent.KIND) {
                const nip01UserMetaDataEvent = new Nip01UserMetaDataEventBuilder(event).build()
                community.notifications.emit(NotificationEventType.PROFILE, nip01UserMetaDataEvent)
            }
        })
    }
}
