import { ExpiringSessionStorageCache } from "./ExpiringSessionStorageCache";

const createStorage = () => {
    const values = new Map<string, string>();
    return {
        getItem: jest.fn((key: string) => values.get(key) ?? null),
        setItem: jest.fn((key: string, value: string) => { values.set(key, value); }),
        removeItem: jest.fn((key: string) => { values.delete(key); })
    };
};

describe("ExpiringSessionStorageCache", () => {
    it("retains content until its TTL expires", () => {
        let currentTime = 1_000;
        const storage = createStorage();
        const cache = new ExpiringSessionStorageCache("templates", 60_000, () => storage, () => currentTime);

        cache.set("url", "content");
        expect(cache.get("url")).toBe("content");

        currentTime += 60_001;
        expect(cache.get("url")).toBeUndefined();
        expect(storage.removeItem).toHaveBeenCalledWith("templates:url");
    });

    it("ignores malformed entries", () => {
        const storage = createStorage();
        storage.setItem("templates:url", "not-json");
        const cache = new ExpiringSessionStorageCache("templates", 60_000, () => storage);

        expect(cache.get("url")).toBeUndefined();
        expect(storage.removeItem).toHaveBeenCalledWith("templates:url");
    });

    it("continues when browser storage is unavailable", () => {
        const cache = new ExpiringSessionStorageCache("templates", 60_000, () => {
            throw new Error("storage disabled");
        });

        expect(cache.get("url")).toBeUndefined();
        expect(() => cache.set("url", "content")).not.toThrow();
    });
});
