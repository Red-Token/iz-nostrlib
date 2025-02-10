import type {CreateEventOpts, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniEvent, safeFindOptionalMultiTagValues} from "../AbstractNipEvent.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor";

export class Nip25ReactionsEvent extends AbstractNipMiniEvent {
    public static KIND: number = 7;
    static buildFromEvent(event: TrustedEvent) {
        return new Nip25ReactionsEvent(
            JSON.parse(event.content),
            [
                // TODO: Think about this here we only have e and p tags we should model this better
                ...safeFindOptionalMultiTagValues(event, 'e'),
                ...safeFindOptionalMultiTagValues(event, 'p'),
            ],
            event
        )
    }

    constructor(public description: string, tags: string[][] = [], event?: TrustedEvent) {
        super(tags, event);
    }

    get kind() {
        return Nip25ReactionsEvent.KIND
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

export class Nip25ReactionsEventHandler extends AbstractEventProcessor<Nip25ReactionsEvent> {
    constructor(handler: (event: Nip25ReactionsEvent) => void) {
        super(Nip25ReactionsEvent.KIND, Nip25ReactionsEvent.buildFromEvent, handler);
    }
}

// export class Nip25ReactionsEventBuilder {
//     constructor(private event: HashedEvent) {
//     }
//
//     build() {
//         return new Nip25ReactionsEvent(
//             JSON.parse(this.event.content),
//             [
//                 ...safeFindOptionalMultiTagValues(this.event, 'e'),
//                 ...safeFindOptionalMultiTagValues(this.event, 'p'),
//             ],
//             this.event
//         )
//     }
// }
//
// // Need e tag for the event
// // Need p tag for the event
// // Need a tag for a replaceable event
// // We CAN add a k tag
