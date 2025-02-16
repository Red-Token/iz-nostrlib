import type {CreateEventOpts, HashedEvent, TrustedEvent} from "@welshman/util";
import {AbstractNipMiniEvent, safeFindSingleTagValue} from "../AbstractNipEvent.js";
import {AbstractEventProcessor} from "../ses/StaticEventsProcessor.js";

export class Nip78ArbitraryCustomAppData<T> extends AbstractNipMiniEvent {
    public static KIND: number = 30078;

    static buildFromEvent<T>(event: HashedEvent) {
        return new Nip78ArbitraryCustomAppData(
            JSON.parse(event.content),
            safeFindSingleTagValue(event, 'd'),
            [],
            event
        )
    }

    constructor(public data: T,
                public app: string,
                tags: string[][] = [],
                event?: TrustedEvent
    ) {
        super(tags, event);
    }

    get kind() {
        return Nip78ArbitraryCustomAppData.KIND
    }

    get opts(): CreateEventOpts {

        const tags = [
            ...this.tags,
            ['d', this.app]
        ];

        return {
            content: JSON.stringify(this.data),
            tags
        }
    }
}

export class Nip78ArbitraryCustomAppDataHandler<T> extends AbstractEventProcessor<Nip78ArbitraryCustomAppData<T>> {
    constructor(handler: (event: Nip78ArbitraryCustomAppData<T>) => void) {
        super(Nip78ArbitraryCustomAppData.KIND, Nip78ArbitraryCustomAppData.buildFromEvent, handler);
    }
}

