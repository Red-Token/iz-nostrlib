type MapListener<K> = (keys: K[]) => void;

export class ReactiveMap<K, V> {
    private readonly map: Map<K, V>;
    private listeners: MapListener<K>[] = [];

    constructor(map: Map<K, V> = new Map<K, V>()) {
        this.map = map;
    }

    // ✅ Add a listener
    addListener(listener: MapListener<K>): void {
        this.listeners.push(listener);
    }

    // ✅ Remove a listener
    removeListener(listener: MapListener<K>): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    // ✅ Notify all listeners
    private notify(keys: K[]): void {
        this.listeners.forEach(listener => listener(keys));
    }

    /** Get the current state */
    get value(): Map<K, V> {
        return this.map
    }

    set(key: K, value: V): Map<K, V> {
        const updated = this.map.set(key, value)
        this.notify([key])
        return updated;
    }

    delete(key: K): boolean {
        const existed = this.map.delete(key)
        if (existed) this.notify([key])
        return existed
    }

    clear(): void {
        const keys = Array.from(this.map.keys())
        this.map.clear()
        if (keys.length > 0) this.notify(keys)
    }
}
