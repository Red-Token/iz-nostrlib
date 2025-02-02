import type {HashedEvent, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniMiniEvent, safeFindOptionalMultiTagValues} from "../AbstractNipEvent.js";

export class Follow {
    constructor(public pubkey: string, public relay?: string, public nickname?: string) {
    }
}

export function createFollowListFromTags(tags: string[][]): Follow[] {
    return tags.map((tag) => {
        return new Follow(tag[1], tag[2], tag[3])
    })
}

export class Nip02FollowListEvent extends AbstractNipMiniMiniEvent {
    public static KIND: number = 3;

    constructor(public list: Follow[] = [], event?: TrustedEvent) {
        super(event);
    }

    createTemplate() {
        const tags = [
            ...this.list.map<string[]>((follow => {
                return ['p', follow.pubkey]
                // return ['p', follow.pubkey, follow.relay ?? '', follow.nickname ?? '']
            })),
        ];

        return {
            tags
        }
    }
}

export class Nip02FollowListEventBuilder {
    constructor(private event: HashedEvent) {
    }

    build() {
        return new Nip02FollowListEvent(safeFindOptionalMultiTagValues(this.event, 'p').map(tag => {
            return new Follow(tag[0], tag[1], tag[2])
            }),
            this.event
        )
    }
}

