import type {HashedEvent, TrustedEvent} from "@welshman/util";
import {
    safeFindOptionalMultiTagValue,
    safeFindOptionalMultiTagValues,
    safeFindSingleTagValue
} from "../AbstractNipEvent.js";

export class AbstractNip35TorrentEvent {
    constructor(
        public tags: string[][] = [],
    ) {
    }
}

export class Nip35TorrentEvent extends AbstractNip35TorrentEvent {
    public static KIND: number = 2003;
    // public static KIND: number = 9999;
    public event?: TrustedEvent

    constructor(
        public title: string,
        public x: string,
        public description: string,
        public files: string[][],
        public trackers: string[],
        public is: string[],
        public ts: string[],
        tags: string[][] = [],
        event?: TrustedEvent) {
        super(tags)
        this.event = event
    }

    createTemplate() {
        const tags = [
            ...this.tags,
            ['title', this.title],
            ['x', this.x],
        ];

        this.files.map(file => {
            return ['file', ...file]
        }).forEach(tag => {
            tags.push(tag);
        })

        this.trackers.map(tracker => {
            return ['tracker', tracker]
        }).forEach(tag => {
            tags.push(tag);
        })

        this.is.map(i => {
            return ['i', i]
        }).forEach(tag => {
            tags.push(tag);
        })

        this.ts.map(t => {
            return ['t', t]
        }).forEach(tag => {
            tags.push(tag);
        })

        return {
            content: JSON.stringify(this.description),
            tags
        }
    }
}

export enum Nip10EtagMarker {
    ROOT = 'root',
    REPLY = 'reply',
    MENTION = 'mention',
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


export class Nip35TorrentEventBuilder {
    constructor(private event: HashedEvent) {
    }

    build() {
        return new Nip35TorrentEvent(
            safeFindSingleTagValue(this.event, 'title'),
            safeFindSingleTagValue(this.event, 'x'),
            JSON.parse(this.event.content),
            safeFindOptionalMultiTagValues(this.event, 'file'),
            safeFindOptionalMultiTagValue(this.event, 'tracker'),
            safeFindOptionalMultiTagValue(this.event, 'i'),
            safeFindOptionalMultiTagValue(this.event, 't'),
            [],
            this.event
        )
    }
}

export class Nip35TorrentEventComments extends AbstractNip35TorrentEvent {
    static KIND: number = 2004;

    constructor(public description: string,tags: string[][] = []) {
        super(tags)
    }

    createTemplate() {
        const tags = [
            ...this.tags,
        ];

        return {
            content: JSON.stringify(this.description),
            tags
        }
    }
}

export class Nip35TorrentEventCommentsBuilder {
    constructor(private event: HashedEvent) {
    }

    build() {
        return new Nip35TorrentEventComments(
            JSON.parse(this.event.content)
        )
    }
}


// export class Nip52CalendarEvent extends AbstractNip52CalendarEvent {
//     constructor(public event: HashedEvent) {
//         super(
//             safeFindSingleTagValue(event, 'd'),
//             safeFindSingleTagValue(event, 'title'),
//             JSON.parse(event.content),
//             safeFindSingleTagValue(event, 'start'),
//             safeFindOptionalSingleTagValue(event, 'end'),
//             safeFindOptionalMultiTagValue(event, 'locations'),
//             safeFindOptionalMultiTagValue(event, 'g'),
//             safeFindOptionalMultiTagValues(event, 'participant'),
//             safeFindOptionalMultiTagValue(event, 't'),
//             safeFindOptionalMultiTagValue(event, 'r'),
//         );
//     }
// }
//
// function getEnumFromValue<T>(enm: Object, value: string | undefined): T | undefined {
//     return Object.values(enm).find((enumValue) => enumValue === value) as T | undefined;
// }
//
// function getSafeEnumFromValue<T>(enm: Object, value: string): T {
//     const res = getEnumFromValue<T>(enm, value);
//
//     if (res === undefined)
//         throw new Error('Not so fast')
//
//     return res
// }

