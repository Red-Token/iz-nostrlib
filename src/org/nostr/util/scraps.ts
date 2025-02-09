import {AbstractNipMiniEvent, safeFindOptionalMultiTagValues} from "../AbstractNipEvent.js";
import type {TrustedEvent} from "@welshman/util";
import {Nip10EtagMarker} from "../nip35/Nip35TorrentEvent";

export function updateIfNewer<T extends AbstractNipMiniEvent>(candidate: T, key: string, map: Map<string, T>) {
    const defender = map.get(key)

    if (defender === undefined || defender.created_at < candidate.created_at)
        map.set(key, candidate)
}

export function createRefETags(event: TrustedEvent, relay: string = ""): string[][] {
    const eTags = safeFindOptionalMultiTagValues(event, 'e')

    // Is this a root event
    if (eTags.length > 0) {
        const rootTag = eTags.find(tag => tag.length > 3 && tag[3] === Nip10EtagMarker.ROOT)

        if (rootTag === undefined)
            throw new Error('not good, eTags found and no tag marked root')

        return [rootTag, ['e', event.id, relay, Nip10EtagMarker.REPLY, event.pubkey]]//The root tag is the eTag marked as root
    } else {
        //The root tag is the incoming event
        return [['e', event.id, relay, Nip10EtagMarker.ROOT, event.pubkey]]
    }
}

export function createRefPTags(event: TrustedEvent, relay: string = ""): string[][] {
    return [
        ...safeFindOptionalMultiTagValues(event, 'p'),
        ['p', event.pubkey],
    ]
}
