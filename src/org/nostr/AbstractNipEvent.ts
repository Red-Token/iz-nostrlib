import {createEvent, CreateEventOpts, TrustedEvent} from "@red-token/welshman/util";

export class AbstractNipMiniMiniEvent {
    constructor(
        public event?: TrustedEvent
    ) {
    }
}

export abstract class AbstractNipMiniEvent extends AbstractNipMiniMiniEvent {
    protected constructor(
        public _userTags: string[][] = [],
        event?: TrustedEvent
    ) {
        super(event);
    }

    abstract get kind(): number

    get opts(): CreateEventOpts {
        const tags = [
            ...this.eTags.map(tag => ['e', ...tag]),
            ...this.pTags.map(tag => ['p', ...tag]),
            ...this.aTags.map(tag => ['a', ...tag]),
            ...this.otherTags,
            ...this._userTags
        ];

        const content = this.content

        return {
            tags,
            content
        };
    }

    get id(): string {
        return this.event?.id ?? ''
    }

    get created_at(): number {
        return this.event?.created_at ?? -1
    }

    get pubkey(): string {
        return this.event?.pubkey ?? ''
    }

    get eTags(): string[][] {
        return []
    }

    get pTags(): string[][] {
        return []
    }

    get aTags(): string[][] {
        return []
    }

    get otherTags(): string[][] {
        return []
    }

    get content(): string {
        return ''
    }

    get template(): any {
        return createEvent(this.kind, this.opts)
    }
}

export abstract class AbstractNipEvent extends AbstractNipMiniEvent {
    protected constructor(
        public description: string,
        tags: string[][] = [],
        event?: TrustedEvent
    ) {
        super(tags, event);
    }
}

export abstract class AbstractNipStringEvent extends AbstractNipMiniEvent {
    protected constructor(private _content: string, tags: string[][] = [], event?: TrustedEvent) {
        super(tags, event);
    }

    set content(content: string) {
        this._content = content;
    }

    get content(): string {
        return this._content;
    }
}



export abstract class AbstractNipObjectEvent<T> extends AbstractNipMiniEvent {
    protected constructor(private _contentObject: T, tags: string[][] = [], event?: TrustedEvent) {
        super(tags, event);
    }

    get contentObject(): T {
        return this._contentObject;
    }

    get content(): string {
        return JSON.stringify(this._contentObject)
    }
}

// export abstract class AbstractNipArrayEvent<T> extends AbstractNipMiniEvent {
//     protected constructor(private _contentArray: T[], tags: string[][] = [], event?: TrustedEvent) {
//         super(tags, event);
//     }
//
//     get contentArray(): T {
//         return this._contentObject;
//     }
//
//     get content(): string {
//         return JSON.stringify(this._contentObject)
//     }
// }


export function safeFindOptionalSingleTagValue(event: TrustedEvent, tag: string): string | undefined {
    const vals = event.tags.find(t => t[0] === tag)
    return (vals === undefined || vals.length < 2) ? undefined : vals[1];
}

export function safeFindOptionalMultiTagValue(event: TrustedEvent, tag: string): string[] {
    return event.tags.filter(t => t[0] === tag).map(t => t[1])
}

export function safeFindOptionalMultiTagValues(event: TrustedEvent, tag: string): string[][] {
    const foundTags = event.tags.filter(t => t[0] === tag).map(t => t.slice(1))
    return foundTags.length > 0 ? foundTags : []
}

export function safeFindSingleTagValue(event: TrustedEvent, tag: string): string {
    const optionalVal = safeFindOptionalSingleTagValue(event, tag);

    if (optionalVal === undefined) throw new Error(`Unknown tag "${tag}"`);
    return optionalVal;
}

