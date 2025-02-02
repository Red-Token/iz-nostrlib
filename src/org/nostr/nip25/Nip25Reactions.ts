import type {HashedEvent, TrustedEvent} from "@welshman/util";
import {AbstractNipEvent, safeFindOptionalMultiTagValues} from "../AbstractNipEvent.js";

export class Nip25ReactionsEvent extends AbstractNipEvent {
    public static KIND: number = 7;

    constructor(description: string, tags: string[][] = [], event?: TrustedEvent) {
        super(description, tags, event);
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

export class Nip25ReactionsEventBuilder {
    constructor(private event: HashedEvent) {
    }

    build() {
        return new Nip25ReactionsEvent(
            JSON.parse(this.event.content),
            [
                ...safeFindOptionalMultiTagValues(this.event,'e'),
                ...safeFindOptionalMultiTagValues(this.event,'p'),
            ],
            this.event
        )
    }
}

// Need e tag for the event
// Need p tag for the event
// Need a tag for a replaceable event
// We CAN add a k tag
