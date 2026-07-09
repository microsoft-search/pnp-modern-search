import { LayoutRenderType } from "@pnp/modern-search-extensibility";
import { IDataResultType } from "../models/common/IDataResultType";
import { ITemplateService } from "../services/templateService/ITemplateService";

// NOTE: this helper intentionally does not import the built-in layout / data source / component /
// suggestions modules. Those pull in heavy runtime dependencies (all the web component classes and
// the layout HTML templates) that would bloat every Web Part bundle importing this helper (notably
// the Search Box) and defeat the Search Results Web Part's dynamic import of AvailableComponents.
// The caller passes the built-in key/name sets in instead.

/**
 * Outcome of an extensibility usage evaluation.
 */
export interface IExtensibilityUsageResult {

    /**
     * Whether the Web Part configuration references anything that requires an
     * extensibility library (i.e. anything provided by `@pnp/modern-search-extensibility`:
     * custom data sources, layouts, query modifiers, web components, Handlebars
     * customizations, Adaptive Card action handlers or suggestions providers) to be loaded.
     */
    usesCustomExtensibility: boolean;

    /**
     * A short human-readable explanation of the decision, used for diagnostics logging.
     */
    reason: string;
}

/**
 * Inputs required to evaluate whether a Search Results Web Part instance uses any
 * custom extensibility feature.
 */
export interface IResultsExtensibilityInput {
    dataSourceKey: string;
    selectedLayoutKey: string;
    layoutRenderType: LayoutRenderType;
    queryModifierConfiguration: { enabled: boolean }[];
    inlineTemplateContent: string;
    externalTemplateUrl: string;
    layoutProperties: { [key: string]: any };
    resultTypes: IDataResultType[];
    templateService: ITemplateService;

    /**
     * Built-in ("out-of-the-box") identifiers, passed in by the caller so this helper does not have
     * to eagerly import the heavy modules that define them.
     */
    builtinDataSourceKeys: string[];
    builtinLayoutKeys: string[];
    builtinComponentNames: string[];
}

/**
 * Inputs required to evaluate whether a Search Box Web Part instance uses any
 * custom extensibility feature.
 */
export interface ISearchBoxExtensibilityInput {
    suggestionProviderConfiguration: { key: string; enabled: boolean }[];

    /** Built-in suggestions provider keys, passed in to avoid eager heavy imports. */
    builtinSuggestionProviderKeys: string[];
}

/**
 * Detects, from a Web Part's persisted configuration alone (i.e. without loading any
 * extensibility library), whether it actually consumes anything provided by an
 * extensibility library.
 *
 * This lets a Web Part avoid the (potentially slow, retry/backoff) load of a registered
 * but unused extensibility library — a common situation for installs that still carry the
 * default extensibility library entry enabled even though it isn't deployed.
 *
 * The detection is intentionally biased towards a false positive (concluding "custom is
 * used" and therefore loading the library) whenever a signal cannot be resolved with
 * certainty, because loading an unused library is merely the current behaviour, whereas
 * skipping a used one would break rendering.
 */
export class ExtensibilityUsageHelper {

    // Names that look like custom elements but are provided outside of an extensibility
    // library (Microsoft Graph Toolkit is loaded on demand via its own toggle).
    private static readonly ALLOWED_CUSTOM_ELEMENT_PREFIXES: string[] = ["mgt-"];

    // Partials that are registered by the solution itself (not by an extensibility library)
    // but only later in the render pipeline, so they must be treated as built-in here.
    private static readonly KNOWN_PARTIALS: Set<string> = new Set(["resultTypes", "@partial-block", "partial-block"]);

    // Bound the recursive walk of `layoutProperties` to keep it cheap and safe.
    private static readonly MAX_COLLECT_DEPTH = 5;
    private static readonly MAX_COLLECTED_STRINGS = 500;

    /**
     * Evaluates whether a Search Results Web Part instance uses any custom extensibility feature.
     */
    public static async getResultsUsage(input: IResultsExtensibilityInput): Promise<IExtensibilityUsageResult> {

        // 1. Custom data source (getCustomDataSources)
        if (input.dataSourceKey && input.builtinDataSourceKeys.indexOf(input.dataSourceKey) === -1) {
            return { usesCustomExtensibility: true, reason: `custom data source '${input.dataSourceKey}'` };
        }

        // 2. Custom layout (getCustomLayouts)
        if (input.selectedLayoutKey && input.builtinLayoutKeys.indexOf(input.selectedLayoutKey) === -1) {
            return { usesCustomExtensibility: true, reason: `custom layout '${input.selectedLayoutKey}'` };
        }

        // 3. Custom query modifier (getCustomQueryModifiers) — the solution has no built-in
        // modifiers, so any enabled entry comes from an extensibility library.
        if ((input.queryModifierConfiguration || []).some(c => c && c.enabled)) {
            return { usesCustomExtensibility: true, reason: "an enabled custom query modifier" };
        }

        // 4. External templates cannot be inspected up front — be conservative and load.
        if (input.externalTemplateUrl || (input.resultTypes || []).some(rt => rt && rt.externalTemplateUrl)) {
            return { usesCustomExtensibility: true, reason: "an external template that cannot be inspected" };
        }

        const { templates, truncated } = this.collectResultsTemplates(input);

        // If the configuration was too large or deeply nested to fully inspect, we can't be certain
        // the templates are free of custom components/helpers — conservatively load (bias to a false
        // positive) rather than risk a false skip.
        if (truncated) {
            return { usesCustomExtensibility: true, reason: "a configuration too large to fully inspect" };
        }

        // 5. Adaptive Cards action handler (invokeCardAction). Adaptive Card actions are inert
        // without a library handler, so a card that declares actions needs the library.
        if (input.layoutRenderType === LayoutRenderType.AdaptiveCards) {
            if (templates.some(t => this.adaptiveCardHasActions(t))) {
                return { usesCustomExtensibility: true, reason: "an Adaptive Card action handler" };
            }
            return { usesCustomExtensibility: false, reason: "Adaptive Cards layout without custom actions" };
        }

        // 6. Custom web components (getCustomWebComponents) referenced in a template.
        const oobComponents = new Set((input.builtinComponentNames || []).map(n => (n || "").toLowerCase()));
        const customComponent = this.findCustomComponent(templates, oobComponents);
        if (customComponent) {
            return { usesCustomExtensibility: true, reason: `custom web component '<${customComponent}>'` };
        }

        // 7. Custom Handlebars helpers / partials (registerHandlebarsCustomizations). Ensure the
        // out-of-the-box helpers/partials are registered first so custom ones can be told apart.
        await input.templateService.ensureHandlebarsHelpersLoaded();
        const handlebars: any = input.templateService.Handlebars;
        if (!handlebars || typeof handlebars.parse !== "function") {
            return { usesCustomExtensibility: true, reason: "Handlebars namespace unavailable (conservative)" };
        }

        const customHandlebars = this.findCustomHandlebars(templates, handlebars);
        if (customHandlebars) {
            return { usesCustomExtensibility: true, reason: `custom Handlebars ${customHandlebars}` };
        }

        return { usesCustomExtensibility: false, reason: "only out-of-the-box features are used" };
    }

    /**
     * Evaluates whether a Search Box Web Part instance uses any custom extensibility feature.
     */
    public static getSearchBoxUsage(input: ISearchBoxExtensibilityInput): IExtensibilityUsageResult {

        const enabledCustom = (input.suggestionProviderConfiguration || []).some(
            p => p && p.enabled && (input.builtinSuggestionProviderKeys || []).indexOf(p.key) === -1
        );

        if (enabledCustom) {
            return { usesCustomExtensibility: true, reason: "an enabled custom suggestions provider" };
        }

        return { usesCustomExtensibility: false, reason: "only out-of-the-box suggestions are used" };
    }

    /**
     * Emits a diagnostic message to the browser console, but only when debug logging is enabled
     * (the `?debug=true` or `?pnpSearchDebug=1` URL flag). Mirrors the gating used by the
     * extensibility service so the load/skip decision is visible during troubleshooting without
     * polluting production browser consoles.
     */
    public static debugLog(message: string, ...args: unknown[]): void {
        try {
            const search = (globalThis.location?.search || "").toLowerCase();
            if (search.includes("debug=true") || search.includes("pnpsearchdebug=1")) {
                console.log(message, ...args);
            }
        } catch {
            // Location may be unavailable in some hosts; diagnostics are best-effort.
        }
    }

    /**
     * Gathers every inline template / field snippet configured on the Web Part so it can be
     * inspected for custom components, helpers or partials.
     */
    private static collectResultsTemplates(input: IResultsExtensibilityInput): { templates: string[]; truncated: boolean } {

        const templates: string[] = [];
        const state = { truncated: false };

        if (input.inlineTemplateContent) {
            templates.push(input.inlineTemplateContent);
        }

        // Column / field templates live under layoutProperties (e.g. Details List columns,
        // Cards fields, People fields). Their exact shape varies per layout, so collect every
        // string value defensively.
        this.collectStrings(input.layoutProperties, templates, 0, state);

        (input.resultTypes || []).forEach(rt => {
            if (rt && rt.inlineTemplateContent) {
                templates.push(rt.inlineTemplateContent);
            }
        });

        return { templates, truncated: state.truncated };
    }

    /**
     * Recursively collects string values from an arbitrary object/array, bounded in depth and count.
     * Sets `state.truncated` when a bound is hit so the caller can treat the inspection as
     * inconclusive and conservatively load rather than risk a false skip.
     */
    private static collectStrings(value: any, acc: string[], depth: number, state: { truncated: boolean }): void {

        if (value === null || value === undefined) {
            return;
        }

        if (depth > this.MAX_COLLECT_DEPTH || acc.length >= this.MAX_COLLECTED_STRINGS) {
            state.truncated = true;
            return;
        }

        if (typeof value === "string") {
            if (value) {
                acc.push(value);
            }
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (acc.length >= this.MAX_COLLECTED_STRINGS) { state.truncated = true; return; }
                this.collectStrings(item, acc, depth + 1, state);
            }
            return;
        }

        if (typeof value === "object") {
            for (const key of Object.keys(value)) {
                if (acc.length >= this.MAX_COLLECTED_STRINGS) { state.truncated = true; return; }
                this.collectStrings(value[key], acc, depth + 1, state);
            }
        }
    }

    /**
     * Returns true when an Adaptive Card template declares any action, which would be routed to
     * an extensibility library's `invokeCardAction` handler.
     */
    private static adaptiveCardHasActions(template: string): boolean {
        return !!template && template.indexOf("Action.") !== -1;
    }

    /**
     * Scans templates for a custom element tag that is not an out-of-the-box component. Returns
     * the offending tag name, or null if all custom elements are built-in.
     */
    private static findCustomComponent(templates: string[], oobComponents: Set<string>): string | null {

        // Matches an opening custom-element tag: a name containing a hyphen (per the Custom
        // Elements spec). Closing tags (</...>) and plain HTML elements are ignored.
        const tagRegex = /<\s*([a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]*)/g;

        for (const template of templates) {
            if (!template || template.indexOf("<") === -1) { continue; }

            let match: RegExpExecArray | null;
            tagRegex.lastIndex = 0;
            while ((match = tagRegex.exec(template)) !== null) {
                const tag = match[1].toLowerCase();

                if (oobComponents.has(tag)) { continue; }
                if (this.ALLOWED_CUSTOM_ELEMENT_PREFIXES.some(prefix => tag.indexOf(prefix) === 0)) { continue; }

                return tag;
            }
        }

        return null;
    }

    /**
     * Scans templates for a Handlebars helper or partial that is not registered in the
     * out-of-the-box namespace. Returns a short description of the first custom reference
     * found, or null.
     */
    private static findCustomHandlebars(templates: string[], handlebars: any): string | null {

        const helpers = handlebars.helpers || {};
        const partials = handlebars.partials || {};

        for (const template of templates) {
            // A snippet with no mustaches cannot reference a helper or partial.
            if (!template || template.indexOf("{{") === -1) { continue; }

            let ast: any;
            try {
                ast = handlebars.parse(template);
            } catch {
                // A template that cannot be parsed will also fail to render; be conservative.
                return "expression (a template could not be parsed)";
            }

            const found = this.walkForCustom(ast, helpers, partials);
            if (found) { return found; }
        }

        return null;
    }

    /**
     * Recursively walks a Handlebars AST node looking for a helper/partial reference that is not
     * registered out of the box. Returns a description of the first custom reference, or null.
     */
    private static walkForCustom(node: any, helpers: any, partials: any): string | null {

        if (!node || typeof node !== "object") { return null; }

        switch (node.type) {

            case "Program": {
                return this.walkList(node.body, helpers, partials);
            }

            case "MustacheStatement":
            case "SubExpression": {
                const isSubExpression = node.type === "SubExpression";
                const name = this.getPathName(node.path);
                if (name && !this.isFieldPath(name)) {
                    // A subexpression is always a helper call. A mustache is a helper call when it
                    // has arguments, or when its name looks like a helper/component (hyphenated).
                    const isHelperCall = isSubExpression || this.hasArguments(node) || this.looksLikeHelper(name);
                    if (isHelperCall && !helpers[name]) {
                        return `helper '${name}'`;
                    }
                }
                return this.walkArgs(node, helpers, partials);
            }

            case "BlockStatement": {
                const name = this.getPathName(node.path);
                if (name && !this.isFieldPath(name)) {
                    // A block with arguments (or a hyphenated name) is a helper; a plain
                    // `{{#field}}` block is context iteration and needs no helper.
                    const isHelperCall = this.hasArguments(node) || this.looksLikeHelper(name);
                    if (isHelperCall && !helpers[name]) {
                        return `block helper '${name}'`;
                    }
                }
                return this.walkArgs(node, helpers, partials)
                    || this.walkForCustom(node.program, helpers, partials)
                    || this.walkForCustom(node.inverse, helpers, partials);
            }

            case "PartialStatement":
            case "PartialBlockStatement": {
                const nameNode = node.name;
                if (nameNode && nameNode.type === "PathExpression") {
                    const partialName = nameNode.original;
                    if (!this.KNOWN_PARTIALS.has(partialName) && !partials[partialName]) {
                        return `partial '${partialName}'`;
                    }
                } else if (nameNode && nameNode.type === "SubExpression") {
                    // A dynamic partial (e.g. {{> (lookup ...)}}) cannot be resolved statically.
                    return "a dynamic partial";
                }
                return this.walkArgs(node, helpers, partials)
                    || this.walkForCustom(node.program, helpers, partials);
            }

            default:
                return null;
        }
    }

    /**
     * Walks the params and hash argument values of a node (only nested subexpressions matter).
     */
    private static walkArgs(node: any, helpers: any, partials: any): string | null {

        const fromParams = this.walkList(node.params, helpers, partials);
        if (fromParams) { return fromParams; }

        if (node.hash && Array.isArray(node.hash.pairs)) {
            for (const pair of node.hash.pairs) {
                const found = this.walkForCustom(pair && pair.value, helpers, partials);
                if (found) { return found; }
            }
        }

        return null;
    }

    private static walkList(list: any[], helpers: any, partials: any): string | null {
        if (!Array.isArray(list)) { return null; }
        for (const item of list) {
            const found = this.walkForCustom(item, helpers, partials);
            if (found) { return found; }
        }
        return null;
    }

    private static getPathName(path: any): string | null {
        if (path && path.type === "PathExpression" && typeof path.original === "string") {
            return path.original;
        }
        return null;
    }

    private static hasArguments(node: any): boolean {
        const hasParams = Array.isArray(node.params) && node.params.length > 0;
        const hasHash = node.hash && Array.isArray(node.hash.pairs) && node.hash.pairs.length > 0;
        return !!(hasParams || hasHash);
    }

    /**
     * Hyphenated names are almost certainly helpers/components rather than data fields — this
     * mirrors the heuristic already used by the Handlebars `helperMissing` fallback.
     */
    private static looksLikeHelper(name: string): boolean {
        return name.indexOf("-") !== -1;
    }

    /**
     * Returns true when a mustache path refers to a data field / context path rather than a
     * helper name (dotted or segmented paths, data variables like `@root`, or `this`).
     */
    private static isFieldPath(name: string): boolean {
        return name.indexOf(".") !== -1
            || name.indexOf("/") !== -1
            || name.indexOf("@") === 0
            || name === "this";
    }
}
