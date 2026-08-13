interface IHandlebarsRegistrationState {
    existed: boolean;
    value: any;
}

export interface IHandlebarsRegistry {
    helpers: { [name: string]: any };
    partials: { [name: string]: any };
    registerHelper(name: string, helper: any): void;
    unregisterHelper(name: string): void;
    registerPartial(name: string, partial: any): void;
    unregisterPartial(name: string): void;
}

/** Tracks and restores Handlebars registrations made by extensibility libraries. */
export class HandlebarsCustomizationTracker {

    private readonly originalHelpers = new Map<string, IHandlebarsRegistrationState>();
    private readonly originalPartials = new Map<string, IHandlebarsRegistrationState>();

    /** Runs a library registration and records every helper/partial it changes. */
    public register(handlebars: IHandlebarsRegistry, registration: () => void): void {
        const helpersBefore = { ...(handlebars.helpers || {}) };
        const partialsBefore = { ...(handlebars.partials || {}) };

        try {
            registration();
        } finally {
            this.recordChanges(this.originalHelpers, helpersBefore, handlebars.helpers || {});
            this.recordChanges(this.originalPartials, partialsBefore, handlebars.partials || {});
        }
    }

    /** Restores the registry to its state before the tracked library registrations. */
    public reset(handlebars: IHandlebarsRegistry): void {
        this.restoreRegistrations(
            this.originalHelpers,
            handlebars.registerHelper.bind(handlebars),
            handlebars.unregisterHelper.bind(handlebars)
        );
        this.restoreRegistrations(
            this.originalPartials,
            handlebars.registerPartial.bind(handlebars),
            handlebars.unregisterPartial.bind(handlebars)
        );
    }

    private recordChanges(
        originals: Map<string, IHandlebarsRegistrationState>,
        before: { [name: string]: any },
        after: { [name: string]: any }
    ): void {
        const names = new Set([...Object.keys(before), ...Object.keys(after)]);
        names.forEach(name => {
            if (before[name] !== after[name] && !originals.has(name)) {
                originals.set(name, {
                    existed: Object.prototype.hasOwnProperty.call(before, name),
                    value: before[name]
                });
            }
        });
    }

    private restoreRegistrations(
        originals: Map<string, IHandlebarsRegistrationState>,
        register: (name: string, value: any) => void,
        unregister: (name: string) => void
    ): void {
        originals.forEach((original, name) => {
            if (original.existed) {
                register(name, original.value);
            } else {
                unregister(name);
            }
        });
        originals.clear();
    }
}