import {AbstractNipMiniEvent} from "../AbstractNipEvent.js";

export function updateIfNewer<T extends AbstractNipMiniEvent>(candidate: T, key: string, map: Map<string, T>) {
    const defender = map.get(key)

    if (defender === undefined || defender.created_at < candidate.created_at)
        map.set(key, candidate)
}
