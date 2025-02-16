import type {CreateEventOpts, HashedEvent, TrustedEvent} from "@welshman/util";
import {
    AbstractNipMiniEvent,
    safeFindOptionalMultiTagValues,
    safeFindOptionalSingleTagValue
} from "../AbstractNipEvent.js";
import {NostrUserProfileMetaData} from "./NostrUserProfileMetaData.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor.js";

export enum UserType {
    INDIVIDUAL = "individual",
    COMMUNITY = 'community',
}

const stringToEnum = (value: string): UserType | undefined => {
    return (Object.entries(UserType) as [keyof typeof UserType, string][])
        .find(([_, val]) => val === value)?.[1] as UserType | undefined;
};

function defaultIfUndefined<T>(value: T | undefined, defaultValue: T): T {
    return value === undefined ? defaultValue : value;
}

export class Nip01UserMetaDataEvent extends AbstractNipMiniEvent {
    public static KIND: number = 0;

    static buildFromEvent(event: HashedEvent) {
        return new Nip01UserMetaDataEvent(
            JSON.parse(event.content),
            defaultIfUndefined(
                safeFindOptionalSingleTagValue(event, 'c'),
                UserType.INDIVIDUAL),
            safeFindOptionalMultiTagValues(event, 'n'),
            [],
            event
        )
    }

    constructor(public profile: NostrUserProfileMetaData,
                public type: string = UserType.INDIVIDUAL,
                public capabilities: string[][] = [],
                tags: string[][] = [],
                event?: TrustedEvent
    ) {
        super(tags, event);
    }

    get kind() {
        return Nip01UserMetaDataEvent.KIND
    }

    get opts(): CreateEventOpts {
        const nTags = this.capabilities.map(capability => {
            return ['n', ...capability]
        })

        const tags = [
            ...this.tags,
            ...nTags,
            ['c', this.type]
        ];

        return {
            content: JSON.stringify(this.profile),
            tags
        }
    }
}

export class Nip01UserMetaDataEventHandler extends AbstractEventProcessor<Nip01UserMetaDataEvent> {
    constructor(handler: (event: Nip01UserMetaDataEvent) => void) {
        super(Nip01UserMetaDataEvent.KIND, Nip01UserMetaDataEvent.buildFromEvent, handler);
    }
}

