import { HandlebarsCustomizationTracker, IHandlebarsRegistry } from "./HandlebarsCustomizationTracker";

const createRegistry = (): IHandlebarsRegistry => {
    const registry: IHandlebarsRegistry = {
        helpers: {},
        partials: {},
        registerHelper: (name, helper) => { registry.helpers[name] = helper; },
        unregisterHelper: name => { delete registry.helpers[name]; },
        registerPartial: (name, partial) => { registry.partials[name] = partial; },
        unregisterPartial: name => { delete registry.partials[name]; }
    };
    return registry;
};

describe("HandlebarsCustomizationTracker", () => {
    it("unregisters helpers and partials added by a library", () => {
        const registry = createRegistry();
        const tracker = new HandlebarsCustomizationTracker();

        tracker.register(registry, () => {
            registry.registerHelper("customHelper", () => "custom");
            registry.registerPartial("customPartial", "custom");
        });
        tracker.reset(registry);

        expect(registry.helpers.customHelper).toBeUndefined();
        expect(registry.partials.customPartial).toBeUndefined();
    });

    it("restores built-in registrations overridden by a library", () => {
        const registry = createRegistry();
        const originalHelper = () => "built-in";
        registry.registerHelper("helper", originalHelper);
        registry.registerPartial("partial", "built-in");
        const tracker = new HandlebarsCustomizationTracker();

        tracker.register(registry, () => {
            registry.registerHelper("helper", () => "custom");
            registry.registerPartial("partial", "custom");
        });
        tracker.reset(registry);

        expect(registry.helpers.helper).toBe(originalHelper);
        expect(registry.partials.partial).toBe("built-in");
    });

    it("preserves the original state across multiple library registrations", () => {
        const registry = createRegistry();
        const originalHelper = () => "built-in";
        registry.registerHelper("helper", originalHelper);
        const tracker = new HandlebarsCustomizationTracker();

        tracker.register(registry, () => registry.registerHelper("helper", () => "first"));
        tracker.register(registry, () => registry.registerHelper("helper", () => "second"));
        tracker.reset(registry);

        expect(registry.helpers.helper).toBe(originalHelper);
    });

    it("can be reset repeatedly without removing restored registrations", () => {
        const registry = createRegistry();
        const tracker = new HandlebarsCustomizationTracker();
        registry.registerHelper("builtIn", () => "built-in");

        tracker.register(registry, () => registry.registerHelper("custom", () => "custom"));
        tracker.reset(registry);
        tracker.reset(registry);

        expect(registry.helpers.builtIn).toBeDefined();
        expect(registry.helpers.custom).toBeUndefined();
    });
});