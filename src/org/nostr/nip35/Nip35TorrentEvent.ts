import type {CreateEventOpts, HashedEvent, TrustedEvent} from "@welshman/util";
import {
    AbstractNipMiniEvent,
    safeFindOptionalMultiTagValue,
    safeFindOptionalMultiTagValues,
    safeFindSingleTagValue
} from "../AbstractNipEvent.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor";

export class Nip35TorrentEvent extends AbstractNipMiniEvent {
    public static KIND: number = 2003;

    // TODO Make the safeMethods eat the values and only leave the last
    static buildFromEvent(event: HashedEvent) {
        return new Nip35TorrentEvent(
            safeFindSingleTagValue(event, 'title'),
            safeFindSingleTagValue(event, 'x'),
            JSON.parse(event.content),
            safeFindOptionalMultiTagValues(event, 'file'),
            safeFindOptionalMultiTagValue(event, 'tracker'),
            safeFindOptionalMultiTagValue(event, 'i'),
            safeFindOptionalMultiTagValue(event, 't'),
            [],
            event
        )
    }

    constructor(
        public title: string,
        public x: string,
        public description: string,
        public files: string[][] = [],
        public trackers: string[] = [],
        public is: string[] = [],
        public ts: string[] = [],
        tags: string[][] = [],
        event?: TrustedEvent) {
        super(tags, event)
    }

    get kind() {
        return Nip35TorrentEvent.KIND
    }

    get opts(): CreateEventOpts {

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

export class Nip35TorrentEventHandler extends AbstractEventProcessor<Nip35TorrentEvent> {
    constructor(handler: (event: Nip35TorrentEvent) => void) {
        super(Nip35TorrentEvent.KIND, Nip35TorrentEvent.buildFromEvent, handler);
    }
}

export enum Nip10EtagMarker {
    ROOT = 'root',
    REPLY = 'reply',
    MENTION = 'mention',
}

export class Nip35TorrentEventComments extends AbstractNipMiniEvent {
    static KIND: number = 2004;

    static buildFromEvent(event: HashedEvent) {
        return new Nip35TorrentEventComments(
            JSON.parse(event.content)
        )
    }

    constructor(public description: string, tags: string[][] = []) {
        super(tags)
    }

    get kind() {
        return Nip35TorrentEventComments.KIND
    }

    get opts(): CreateEventOpts {
        const tags = [
            ...this.tags,
        ];

        return {
            content: JSON.stringify(this.description),
            tags
        }
    }
}

export class Nip35TorrentEventCommentsHandler extends AbstractEventProcessor<Nip35TorrentEventComments> {
    constructor(handler: (event: Nip35TorrentEventComments) => void) {
        super(Nip35TorrentEventComments.KIND, Nip35TorrentEventComments.buildFromEvent, handler);
    }
}
