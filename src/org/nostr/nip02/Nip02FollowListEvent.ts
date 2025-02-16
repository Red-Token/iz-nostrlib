import type {CreateEventOpts, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniEvent, safeFindOptionalMultiTagValues} from "../AbstractNipEvent.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor.js";

export class Followee {
    constructor(public pubkey: string, public relay?: string, public nickname?: string) {
    }
}

// export function createFollowListFromTags(tags: string[][]): Follow[] {
//     return tags.map((tag) => {
//         return new Follow(tag[1], tag[2], tag[3])
//     })
// }

export class Nip02FollowListEvent extends AbstractNipMiniEvent {
    public static KIND: number = 3;

    static buildFromEvent(event: TrustedEvent) {
        return new Nip02FollowListEvent(safeFindOptionalMultiTagValues(event, 'p').map(tag => {
                return new Followee(tag[0], tag[1], tag[2])
            }),
            event
        )
    }

    constructor(public list: Followee[] = [], event?: TrustedEvent) {
        super([], event);
    }

    get kind() {
        return Nip02FollowListEvent.KIND
    }

    get opts(): CreateEventOpts {

        const pTags = this.list.map((follow => {
            const tag = ['p', follow.pubkey]

            if (follow.relay !== undefined || follow.nickname !== undefined)
                tag.push(follow.relay ?? '')

            if (follow.nickname !== undefined)
                tag.push(follow.nickname)

            return tag
        }))

        const tags = [
            ...this.tags,
            ...pTags
        ];

        return {
            tags,
            content: ''
        }
    }
}

export class Nip02FollowListEventHandler extends AbstractEventProcessor<Nip02FollowListEvent> {
    constructor(handler: (event: Nip02FollowListEvent) => void) {
        super(Nip02FollowListEvent.KIND, Nip02FollowListEvent.buildFromEvent, handler);
    }
}

// export class Nip02FollowListEventBuilder {
//     constructor(private event: HashedEvent) {
//     }
//
//     build() {
//         return new Nip02FollowListEvent(safeFindOptionalMultiTagValues(this.event, 'p').map(tag => {
//                 return new Follow(tag[0], tag[1], tag[2])
//             }),
//             this.event
//         )
//     }
// }
//
