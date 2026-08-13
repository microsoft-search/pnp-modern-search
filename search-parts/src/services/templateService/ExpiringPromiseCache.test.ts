import { ExpiringPromiseCache } from "./ExpiringPromiseCache";

describe("ExpiringPromiseCache", () => {
    it("deduplicates in-flight requests and caches successful values", async () => {
        let resolveValue: (value: string) => void;
        const pendingValue = new Promise<string>((resolve) => { resolveValue = resolve; });
        const valueFactory = jest.fn(() => pendingValue);
        const cache = new ExpiringPromiseCache<string>(60_000, 10);

        const first = cache.get("template", valueFactory);
        const second = cache.get("template", valueFactory);

        expect(first).toBe(second);
        await Promise.resolve();
        expect(valueFactory).toHaveBeenCalledTimes(1);

        resolveValue("content");
        await expect(first).resolves.toBe("content");
        await expect(cache.get("template", valueFactory)).resolves.toBe("content");
        expect(valueFactory).toHaveBeenCalledTimes(1);
    });

    it("reloads successful values after the TTL", async () => {
        let currentTime = 1_000;
        const valueFactory = jest.fn()
            .mockResolvedValueOnce("first")
            .mockResolvedValueOnce("second");
        const cache = new ExpiringPromiseCache<string>(60_000, 10, () => currentTime);

        await expect(cache.get("template", valueFactory)).resolves.toBe("first");
        currentTime += 60_001;
        await expect(cache.get("template", valueFactory)).resolves.toBe("second");
        expect(valueFactory).toHaveBeenCalledTimes(2);
    });

    it("evicts rejected requests so they can be retried", async () => {
        const valueFactory = jest.fn()
            .mockRejectedValueOnce(new Error("temporary failure"))
            .mockResolvedValueOnce("recovered");
        const cache = new ExpiringPromiseCache<string>(60_000, 10);

        await expect(cache.get("template", valueFactory)).rejects.toThrow("temporary failure");
        await expect(cache.get("template", valueFactory)).resolves.toBe("recovered");
        expect(valueFactory).toHaveBeenCalledTimes(2);
    });

    it("bounds retained entries", async () => {
        const cache = new ExpiringPromiseCache<string>(60_000, 2);
        const firstFactory = jest.fn().mockResolvedValue("first");

        await cache.get("first", firstFactory);
        await cache.get("second", () => Promise.resolve("second"));
        await cache.get("third", () => Promise.resolve("third"));
        await cache.get("first", firstFactory);

        expect(firstFactory).toHaveBeenCalledTimes(2);
    });

    it("allows a cached value to be invalidated", async () => {
        const valueFactory = jest.fn()
            .mockResolvedValueOnce("first")
            .mockResolvedValueOnce("second");
        const cache = new ExpiringPromiseCache<string>(60_000, 10);

        await expect(cache.get("template", valueFactory)).resolves.toBe("first");
        cache.delete("template");
        await expect(cache.get("template", valueFactory)).resolves.toBe("second");
    });

    it("disables caching when capacity is not positive", async () => {
        const valueFactory = jest.fn().mockResolvedValue("content");
        const cache = new ExpiringPromiseCache<string>(60_000, 0);

        await cache.get("template", valueFactory);
        await cache.get("template", valueFactory);

        expect(valueFactory).toHaveBeenCalledTimes(2);
    });
});
