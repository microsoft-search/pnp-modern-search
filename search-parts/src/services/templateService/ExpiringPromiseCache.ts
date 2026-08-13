interface IExpiringPromiseCacheEntry<T> {
    promise: Promise<T>;
    expiresAt: number;
}

/**
 * Deduplicates in-flight work and temporarily retains successful results.
 * Rejected promises are evicted immediately so transient failures can be retried.
 */
export class ExpiringPromiseCache<T> {
    private readonly entries: Map<string, IExpiringPromiseCacheEntry<T>> = new Map();

    public constructor(
        private readonly ttlMs: number,
        private readonly maxEntries: number,
        private readonly now: () => number = Date.now
    ) { }

    public get(key: string, valueFactory: () => Promise<T>): Promise<T> {
        if (this.maxEntries <= 0) {
            return Promise.resolve().then(valueFactory);
        }

        const currentTime = this.now();
        const cachedEntry = this.entries.get(key);

        if (cachedEntry && cachedEntry.expiresAt > currentTime) {
            return cachedEntry.promise;
        }

        if (cachedEntry) {
            this.entries.delete(key);
        }

        this.removeExpiredEntries(currentTime);
        this.removeOldestEntriesAtCapacity();

        const promise = Promise.resolve().then(valueFactory);
        const entry: IExpiringPromiseCacheEntry<T> = {
            promise,
            // Keep in-flight requests cacheable regardless of network latency.
            expiresAt: Number.POSITIVE_INFINITY
        };

        this.entries.set(key, entry);

        promise.then(
            () => {
                if (this.entries.get(key) === entry) {
                    entry.expiresAt = this.now() + this.ttlMs;
                }
            },
            () => {
                if (this.entries.get(key) === entry) {
                    this.entries.delete(key);
                }
            }
        );

        return promise;
    }

    public delete(key: string): void {
        this.entries.delete(key);
    }

    private removeExpiredEntries(currentTime: number): void {
        this.entries.forEach((entry, key) => {
            if (entry.expiresAt <= currentTime) {
                this.entries.delete(key);
            }
        });
    }

    private removeOldestEntriesAtCapacity(): void {
        while (this.entries.size >= this.maxEntries) {
            const oldestKey = this.entries.keys().next().value as string;
            this.entries.delete(oldestKey);
        }
    }
}
