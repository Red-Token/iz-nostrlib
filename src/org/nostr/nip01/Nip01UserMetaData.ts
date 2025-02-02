import type {HashedEvent, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniEvent} from "../AbstractNipEvent.js";
import {NostrProfileMetaData} from "./NostrProfileMetaData.js";

export class Nip01UserMetaDataEvent extends AbstractNipMiniEvent {
    public static KIND: number = 0;

    constructor(public profile: NostrProfileMetaData,
                tags: string[][] = [],
                event?: TrustedEvent) {
        super(tags, event);
    }

    createTemplate() {
        const tags = [
            ...this.tags,
        ];

        return {
            content: JSON.stringify(this.profile),
            tags
        }
    }
}

export class Nip01UserMetaDataEventBuilder {
    constructor(private event: HashedEvent) {
    }

    build() {
        return new Nip01UserMetaDataEvent(
            JSON.parse(this.event.content),
            [],
            this.event
        )
    }
}

