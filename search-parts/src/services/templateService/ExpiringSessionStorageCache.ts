interface IExpiringSessionStorageCacheEntry {
    content: string;
    expiresAt: number;
}

type StorageProvider = () => Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Stores external template content for the lifetime of the browser tab, bounded by a TTL.
 * Storage access is best-effort because browsers can disable it or reject writes at quota.
 */
export class ExpiringSessionStorageCache {
    public constructor(
        private readonly keyPrefix: string,
        private readonly ttlMs: number,
        private readonly storageProvider: StorageProvider = () => globalThis.sessionStorage,
        private readonly now: () => number = Date.now
    ) { }

    public get(key: string): string | undefined {
        const storageKey = this.getStorageKey(key);

        try {
            const serializedEntry = this.storageProvider().getItem(storageKey);
            if (!serializedEntry) {
                return undefined;
            }

            const entry = JSON.parse(serializedEntry) as IExpiringSessionStorageCacheEntry;
            if (
                typeof entry?.content !== "string"
                || typeof entry.expiresAt !== "number"
                || entry.expiresAt <= this.now()
            ) {
                this.storageProvider().removeItem(storageKey);
                return undefined;
            }

            return entry.content;
        } catch {
            return undefined;
        }
    }

    public set(key: string, content: string): void {
        const entry: IExpiringSessionStorageCacheEntry = {
            content,
            expiresAt: this.now() + this.ttlMs
        };

        try {
            this.storageProvider().setItem(this.getStorageKey(key), JSON.stringify(entry));
        } catch {
            // Session storage may be disabled or at quota. The in-memory cache still applies.
        }
    }

    private getStorageKey(key: string): string {
        return `${this.keyPrefix}:${key}`;
    }
}
