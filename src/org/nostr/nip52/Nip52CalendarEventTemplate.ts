import {HashedEvent, TrustedEvent} from "@welshman/util";
import {ms} from "@welshman/lib";

function getISO8601Date(date: Date) {
    return date.toISOString().split('T')[0]
}

export class AbstractNip52Event {
}

export class AbstractNip52CalendarEvent extends AbstractNip52Event {
    public readonly start: Date;
    public readonly end?: Date;

    constructor(
        readonly uuid: string,
        public title: string,
        public description: string,
        start: Date | string,
        end?: Date | string,
        public locations?: string[],
        public geoHashes?: string[],
        public participants?: string[][],
        public tags?: string[],
        public refs?: string[],
    ) {
        super()
        this.start = typeof start === 'string' ? new Date(start) : start;
        if (end != undefined) this.end = typeof end === 'string' ? new Date(end) : end
    }
}

export class Nip52CalendarEventTemplateBuilder extends AbstractNip52CalendarEvent {

    createNip52EventTemplate() {

        const tags = [
            ['d', this.uuid],
            ['title', this.title],
            ['start', getISO8601Date(this.start)],
        ];

        this.end && tags.push(['end', getISO8601Date(this.end)]);
        this.locations && tags.push(...this.locations.map(location => ['location', location]))
        this.geoHashes && tags.push(...this.geoHashes.map(geohash => ['g', geohash]))
        this.participants && tags.push(...this.participants.map(invite => ['p', ...invite]))
        this.tags && tags.push(...this.tags.map(tag => ['t', tag]))
        this.refs && tags.push(...this.refs.map(ref => ['r', ref]))

        return {
            content: JSON.stringify(this.description),
            tags
        }
    }
}

function safeFindOptionalSingleTagValue(event: TrustedEvent, tag: string): string | undefined {
    const vals = event.tags.find(t => t[0] === tag)

    return (vals === undefined || vals.length < 2) ? undefined : vals[1];
}

function safeFindOptionalMultiTagValue(event: TrustedEvent, tag: string): string[] | undefined {
    const foundTags = event.tags.filter(t => t[0] === tag).map(t => t[1])
    return foundTags.length > 0 ? foundTags : undefined
}

function safeFindOptionalMultiTagValues(event: TrustedEvent, tag: string): string[][] | undefined {
    const foundTags = event.tags.filter(t => t[0] === tag).map(t => t.splice(1))
    return foundTags.length > 0 ? foundTags : undefined
}

function safeFindSingleTagValue(event: TrustedEvent, tag: string): string {
    const optionalVal = safeFindOptionalSingleTagValue(event, tag);

    if (optionalVal === undefined) throw new Error(`Unknown tag "${tag}"`);
    return optionalVal;
}

export class Nip52CalendarEvent extends AbstractNip52CalendarEvent {
    constructor(public event: HashedEvent) {
        super(
            safeFindSingleTagValue(event, 'd'),
            safeFindSingleTagValue(event, 'title'),
            JSON.parse(event.content),
            safeFindSingleTagValue(event, 'start'),
            safeFindOptionalSingleTagValue(event, 'end'),
            safeFindOptionalMultiTagValue(event, 'locations'),
            safeFindOptionalMultiTagValue(event, 'g'),
            safeFindOptionalMultiTagValues(event, 'participant'),
            safeFindOptionalMultiTagValue(event, 't'),
            safeFindOptionalMultiTagValue(event, 'r'),
        );
    }


    getCoordinate(): string {
        return `${this.event.kind}:${this.event.pubkey}:${this.uuid}`
    }

}

export enum Nip52RsvpStatusType {
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    TENTATIVE = 'tentative',
}

export enum Nip52IndividualStatusType {
    FREE = 'free',
    BUSY = 'busy',
}

export class Nip52CalendarEventRSVPBuilder extends AbstractNip52Event {
    constructor(protected cal: Nip52CalendarEvent,
                public status: Nip52RsvpStatusType,
                public message: string,
                public fb?: Nip52IndividualStatusType) {
        super()
    }

    createTemplate(addEventIdTag: boolean = true, addEventCreatorTag: boolean = true) {

        const tags = [
            // TODO: add optional relay here
            ['a', `${this.cal.event.kind}:${this.cal.event.pubkey}:${this.cal.uuid}`],
            ['d', this.cal.uuid],
            ['status', this.status],
        ];

        // TODO: add optional relay here
        addEventIdTag && tags.push(['e', this.cal.event.id])
        this.fb && this.status !== Nip52RsvpStatusType.DECLINED && tags.push(['fb', this.fb]);
        addEventCreatorTag && tags.push(['p', this.cal.event.pubkey]);

        return {
            content: JSON.stringify(this.message),
            tags
        }
    }
}

function getEnumFromValue<T>(enm: Object, value: string | undefined): T | undefined {
    return Object.values(enm).find((enumValue) => enumValue === value) as T | undefined;
}

function getSafeEnumFromValue<T>(enm: Object, value: string): T {
    const res = getEnumFromValue<T>(enm, value);

    if (res === undefined)
        throw new Error('Not so fast')

    return res
}

export class Nip52CalendarEventRSVPMessage extends AbstractNip52Event {
    public readonly coordinate
    public readonly status: Nip52RsvpStatusType
    public readonly uuid: string
    public readonly message: string
    public readonly fb?: Nip52IndividualStatusType
    public readonly calendarEventId?: string

    constructor(public event: HashedEvent) {
        super()
        this.coordinate = safeFindSingleTagValue(event, 'a')
        this.status = getSafeEnumFromValue(Nip52RsvpStatusType, safeFindSingleTagValue(event, 'status'))
        this.uuid = safeFindSingleTagValue(event, 'd')
        this.message = JSON.parse(event.content)
        this.fb = getEnumFromValue(Nip52IndividualStatusType, safeFindOptionalSingleTagValue(event, 'fb'))
        this.calendarEventId = safeFindOptionalSingleTagValue(event, 'e')
    }
}

export class Nip52CalendarEventEntity {
    public log: AbstractNip52Event[] = []

    constructor() {
    }

    onNip52CalendarEventMessage(msg: Nip52CalendarEvent) {
        this.log.push(msg)
    }

    onNip52CalendarEventRSVPMessage(msg: Nip52CalendarEventRSVPMessage) {
        this.log.push(msg)
    }
}


