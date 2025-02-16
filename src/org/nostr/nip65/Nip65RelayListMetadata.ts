import {CreateEventOpts, HashedEvent, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniEvent, safeFindOptionalMultiTagValues} from "../AbstractNipEvent.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor.js";

export enum RelayType {
    READ = 'read',
    WRITE = 'write',
}

export class Nip65RelayListMetadataEvent extends AbstractNipMiniEvent {
    static KIND: number = 10002;

    static buildFromEvent(event: HashedEvent) {
        return new Nip65RelayListMetadataEvent(
            safeFindOptionalMultiTagValues(event, 'r'),
            [],
            event
        )
    }

    constructor(
        public relays: string[][],
        tags: string[][] = [],
        event?: TrustedEvent) {
        super(tags, event);
    }

    get kind() {
        return Nip65RelayListMetadataEvent.KIND
    }

    get opts(): CreateEventOpts {
        const rTags = this.relays.map(relay => {
            return ['r', ...relay]
        })

        const tags = [
            ...this.tags,
            ...rTags
        ];

        return {
            content: '',
            tags
        }
    }
}

export class Nip65RelayListMetadataEventHandler extends AbstractEventProcessor<Nip65RelayListMetadataEvent> {
    constructor(handler: (event: Nip65RelayListMetadataEvent) => void) {
        super(Nip65RelayListMetadataEvent.KIND, Nip65RelayListMetadataEvent.buildFromEvent, handler);
    }
}
