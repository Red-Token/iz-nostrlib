import {type CreateEventOpts, HashedEvent, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniEvent, safeFindSingleTagValue} from "../AbstractNipEvent.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor";
import {Nip35TorrentEvent} from "../nip35/Nip35TorrentEvent";

export class Nip9999SeederTorrentTransformationRequestEvent extends AbstractNipMiniEvent {
    static KIND: number = 9999;

    static buildFromEvent(event: HashedEvent) {

        return new Nip9999SeederTorrentTransformationRequestEvent(
            safeFindSingleTagValue(event, 'p'),
            safeFindSingleTagValue(event, 'title'),
            safeFindSingleTagValue(event, 'x'),
            JSON.parse(event.content),
            [],
            event
        )
    }

    constructor(
        public p: string,
        public title: string,
        public x: string,
        public content: any,
        tags: string[][] = [],
        event?: TrustedEvent) {
        super(tags, event);
    }

    get kind() {
        return Nip9999SeederTorrentTransformationRequestEvent.KIND
    }

    get opts(): CreateEventOpts {
        const tags = [
            ...this.tags,
            ['p', this.p],
            ['title', this.title],
            ['x', this.x],
        ];

        return {
            content: JSON.stringify(this.content),
            tags
        }
    }
}

export class Nip9999SeederTorrentTransformationResponseEvent extends AbstractNipMiniEvent {
    static KIND: number = 9998;

    static buildFromEvent(event: TrustedEvent) {
        return new Nip9999SeederTorrentTransformationResponseEvent(
            JSON.parse(event.content),
            safeFindSingleTagValue(event, 'd'),
            [],
            event
        )
    }

    constructor(public state: any, public id: string, tags: string[][] = [], event?: TrustedEvent) {
        super([...tags], event);
    }

    get kind() {
        return Nip9999SeederTorrentTransformationResponseEvent.KIND
    }

    get opts(): CreateEventOpts {
        const tags = [
            ...this.tags,
            ['e', this.id, '', 'root'],
            ['d', this.id],
        ];

        return {
            content: JSON.stringify(this.state),
            tags
        }
    }
}

export class Nip9999SeederTorrentTransformationRequestEventHandler extends AbstractEventProcessor<Nip9999SeederTorrentTransformationRequestEvent> {
    constructor(handler: (event: Nip9999SeederTorrentTransformationRequestEvent) => void) {
        super(Nip9999SeederTorrentTransformationRequestEvent.KIND, Nip9999SeederTorrentTransformationRequestEvent.buildFromEvent, handler);
    }
}

export class Nip9999SeederTorrentTransformationResponseEventHandler extends AbstractEventProcessor<Nip9999SeederTorrentTransformationResponseEvent> {
    constructor(handler: (event: Nip9999SeederTorrentTransformationResponseEvent) => void) {
        super(Nip9999SeederTorrentTransformationResponseEvent.KIND, Nip9999SeederTorrentTransformationResponseEvent.buildFromEvent, handler);
    }
}

