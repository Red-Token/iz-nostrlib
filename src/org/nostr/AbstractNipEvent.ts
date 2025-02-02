import type {TrustedEvent} from "@welshman/util";

export class AbstractNipMiniMiniEvent {
    constructor(
        public event?: TrustedEvent
    ) {
    }
}

export class AbstractNipMiniEvent extends AbstractNipMiniMiniEvent{
    constructor(
        public tags: string[][] = [],
        event?: TrustedEvent
    ) {
        super(event);
    }
}

export class AbstractNipEvent extends AbstractNipMiniEvent {
    constructor(
        public description: string,
        tags: string[][] = [],
        event?: TrustedEvent
    ) {
        super(tags, event);
    }
}

export function safeFindOptionalSingleTagValue(event: TrustedEvent, tag: string): string | undefined {
    const vals = event.tags.find(t => t[0] === tag)
    return (vals === undefined || vals.length < 2) ? undefined : vals[1];
}

export function safeFindOptionalMultiTagValue(event: TrustedEvent, tag: string): string[] {
    return event.tags.filter(t => t[0] === tag).map(t => t[1])
}

export function safeFindOptionalMultiTagValues(event: TrustedEvent, tag: string): string[][] {
    const foundTags = event.tags.filter(t => t[0] === tag).map(t => t.splice(1))
    return foundTags.length > 0 ? foundTags : []
}

export function safeFindSingleTagValue(event: TrustedEvent, tag: string): string {
    const optionalVal = safeFindOptionalSingleTagValue(event, tag);

    if (optionalVal === undefined) throw new Error(`Unknown tag "${tag}"`);
    return optionalVal;
}

