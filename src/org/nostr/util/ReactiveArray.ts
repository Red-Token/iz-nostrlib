type Listener<T> = (newArray: T[]) => void;

export class ReactiveArray<T> {
    private array: T[] = [];
    private listeners: Listener<T>[] = [];

    constructor(initialArray: T[] = []) {
        this.array = initialArray;
    }

    // ✅ Add a listener
    addListener(listener: Listener<T>): void {
        this.listeners.push(listener);
    }

    // ✅ Remove a listener
    removeListener(listener: Listener<T>): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    // ✅ Notify all listeners
    private notify(): void {
        this.listeners.forEach(listener => listener([...this.array]));
    }

    // ✅ Modify the array and notify
    push(...items: T[]): number {
        const result = this.array.push(...items);
        this.notify();
        return result;
    }

    pop(): T | undefined {
        const result = this.array.pop();
        this.notify();
        return result;
    }

    splice(start: number, deleteCount?: number, ...items: T[]): T[] {
        const result = deleteCount === undefined ? this.array.splice(start) : this.array.splice(start, deleteCount, ...items);
        this.notify();
        return result;
    }

    // ✅ Get a copy of the array
    get value(): T[] {
        return [...this.array];
    }

    // ✅ Set the entire array
    set value(newArray: T[]) {
        this.array = newArray;
        this.notify();
    }
}
