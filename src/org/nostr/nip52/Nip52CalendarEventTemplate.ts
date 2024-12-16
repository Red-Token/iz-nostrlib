import {HashedEvent, TrustedEvent} from "@welshman/util";

function getISO8601Date(date: Date) {
    return date.toISOString().split('T')[0]
}

export class AbstractNip52CalendarEvent {
    public readonly start: Date;
    public readonly end?: Date;

    constructor(
        private readonly uuid: string,
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
        this.start = typeof start === 'string' ? new Date(start) : start;
        if (end != undefined) this.end = typeof end === 'string' ? new Date(end) : end
    }

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

export class Nip52CalendarEventTemplate extends AbstractNip52CalendarEvent {
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
}
