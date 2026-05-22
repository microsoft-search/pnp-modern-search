import { SPComponentLoader } from "@microsoft/sp-loader";
import { ServiceScope, ServiceKey, Log } from "@microsoft/sp-core-library";
import type { IClientSideComponentManifest } from "@microsoft/sp-module-interfaces";
import IExtensibilityService from "./IExtensibilityService";
import { IExtensibilityLibrary } from "@pnp/modern-search-extensibility";
import { IExtensibilityConfiguration } from "../../models/common/IExtensibilityConfiguration";

const ExtensibilityService_ServiceKey = "PnPModernSearchExtensibilityService";

/**
 * Debug logger gated by the `?pnpSearchDebug=1` URL query parameter (or the
 * SPFx workbench `?debug=true` flag). When neither is set, returns no-op so
 * the rich diagnostic logs don't pollute production browser consoles.
 *
 * Even when disabled, the messages still flow through `Log.verbose` so they
 * remain available in the SPFx diagnostic stream for support scenarios.
 */
const isDebugMode = (): boolean => {
    try {
        const search = globalThis.location.search.toLowerCase();
        return search.includes('pnpsearchdebug=1') || search.includes('debug=true');
    } catch {
        return false;
    }
};
const _debugEnabled = isDebugMode();
const dbg = (message: string, ...args: unknown[]): void => {
    Log.verbose(ExtensibilityService_ServiceKey, message, undefined);
    if (_debugEnabled) {
        // eslint-disable-next-line no-console
        console.log(`[${ExtensibilityService_ServiceKey}] ${message}`, ...args);
    }
};

export class ExtensibilityService {

    private static readonly MAX_LOAD_RETRIES = 3;
    private static readonly RETRY_BASE_DELAY_MS = 500;

    private serviceScope: ServiceScope;

    /** Cached lookup of component id → current page manifest version */
    private _pageManifestVersions: Map<string, string> | undefined;

    public static ServiceKey: ServiceKey<IExtensibilityService> = ServiceKey.create(ExtensibilityService_ServiceKey, ExtensibilityService);

    public constructor(serviceScope: ServiceScope) {
        this.serviceScope = serviceScope;
    }

    /**
     * Builds a lookup map of component id → version for all manifests
     * registered on the current page. Used to rewrite extension manifests
     * for cross-SPFx-version compatibility.
     *
     * Caching note: we only cache a *non-empty* result. If SPComponentLoader
     * hasn't populated its manifest store yet (early page-load race) or
     * `getManifests()` throws, we don't memoize the empty map — a later
     * retry rebuilds it and can pick up newly-registered manifests, which
     * lets the patch path engage on subsequent attempts.
     */
    private getPageManifestVersions(): Map<string, string> {
        if (this._pageManifestVersions && this._pageManifestVersions.size > 0) {
            return this._pageManifestVersions;
        }
        const map = new Map<string, string>();
        try {
            const manifests = SPComponentLoader.getManifests();
            for (const m of manifests) {
                if (m.id && m.version) {
                    map.set(m.id, m.version);
                }
            }
        } catch (e) {
            Log.warn(ExtensibilityService_ServiceKey, `Could not build page manifest version map: ${e}`, this.serviceScope);
        }
        // Only memoize once we have at least one entry; otherwise leave
        // _pageManifestVersions unset so the next call rebuilds.
        if (map.size > 0) {
            this._pageManifestVersions = map;
        }
        return map;
    }

    /**
     * Returns true if a dependency can be safely patched at runtime.
     *
     * Any component-type dependency that is registered in the page's
     * ManifestStore is patchable: there is only one instance of that
     * component on the page (looked up by GUID), so the bundle must use
     * whatever version the page provides — patching the manifest is the
     * only way to make the loader resolve it.
     *
     * Returning `false` here means the loader will hard-fail ("Cannot
     * destructure property 'id' of 'e'") on any version mismatch, which is
     * strictly worse than patching. The only real risk is cross-major
     * version mismatches (e.g. react 18 → 17) — those are reported via a
     * separate warning in `patchManifestVersions` so users can see them.
     */
    private isSafeToPatch(_depName: string): boolean {
        return true;
    }

    /**
     * Returns true if two version strings differ in their major component
     * (e.g. "18.0.0" vs "17.0.1"). Used to warn when a patch crosses a
     * major-version boundary — those patches typically succeed at load time
     * but may break at runtime due to API differences.
     */
    private isCrossMajor(versionA: string, versionB: string): boolean {
        const majorA = Number.parseInt(versionA.split('.')[0], 10);
        const majorB = Number.parseInt(versionB.split('.')[0], 10);
        if (Number.isNaN(majorA) || Number.isNaN(majorB)) {
            return false;
        }
        return majorA !== majorB;
    }

    /**
     * Rewrites version-pinned component dependencies in an extension manifest
     * to match the versions available on the current page. This enables
     * extensions built against an older SPFx version — or against a slightly
     * different patch release of a shared lib like react — to load on the
     * current page runtime.
     *
     * Example: an extension built with SPFx 1.18.2 declares
     * `@microsoft/sp-core-library@1.18.2` in scriptResources. The page
     * running SPFx 1.22.2 has `@microsoft/sp-core-library@1.22.2`. Without
     * rewriting, the loader fails because it does an EXACT version lookup
     * by component GUID + version.
     *
     * Any component-type dependency is patchable. There is only one instance
     * of each component (by GUID) on the page, so the bundle MUST use the
     * page's version — patching is the only way to make the loader resolve
     * it. Cross-major-version mismatches (e.g. react 18 → 17) are flagged as
     * warnings since they may cause runtime API breakages.
     *
     * @param manifest - The extension's original manifest (will be cloned, not mutated)
     * @returns A patched manifest with updated dependency versions, or the original if no changes needed
     */
    private patchManifestVersions(manifest: IClientSideComponentManifest): IClientSideComponentManifest {
        const pageVersions = this.getPageManifestVersions();
        if (pageVersions.size === 0) {
            return manifest;
        }

        const scriptResources = (manifest as any).loaderConfig?.scriptResources;
        if (!scriptResources) {
            return manifest;
        }

        const mismatches = this.findVersionMismatches(scriptResources, pageVersions);
        if (mismatches.length === 0) {
            return manifest;
        }

        // Deep clone the manifest to avoid mutating the original in ManifestStore.
        // structuredClone handles complex shapes natively and is supported by
        // every browser SPFx 1.22 targets (Edge ≥92, Chrome ≥98, FF ≥94, Safari ≥15.4).
        const patched: any = structuredClone(manifest);
        const rewrites = this.applyPatchesToResources(
            patched.loaderConfig.scriptResources,
            mismatches,
            manifest.id
        );

        if (rewrites.length > 0) {
            // Always surfaced (info-level) — this is a meaningful one-time
            // diagnostic that helps support understand cross-version loading.
            const msg = `Patched extension manifest '${manifest.id}' for cross-version compatibility: ${rewrites.join(', ')}`;
            Log.info(ExtensibilityService_ServiceKey, msg, this.serviceScope);
            // eslint-disable-next-line no-console
            console.info(`[${ExtensibilityService_ServiceKey}] ${msg}`);
        }

        return patched as IClientSideComponentManifest;
    }

    /**
     * Walks `scriptResources` and returns the dep names whose declared
     * version differs from the page's version (i.e. need patching).
     */
    private findVersionMismatches(
        scriptResources: any,
        pageVersions: Map<string, string>
    ): string[] {
        const mismatches: string[] = [];
        for (const depName of Object.keys(scriptResources)) {
            const resource = scriptResources[depName];
            if (!this.isPatchableResource(resource, depName)) {
                continue;
            }
            const pageVersion = pageVersions.get(resource.id);
            if (pageVersion && pageVersion !== resource.version) {
                mismatches.push(depName);
            }
        }
        return mismatches;
    }

    /**
     * Returns true if `resource` is a component-type scriptResource with the
     * fields required for patching and is on the safe-to-patch list.
     */
    private isPatchableResource(resource: any, depName: string): boolean {
        return resource
            && resource.type === 'component'
            && !!resource.id
            && !!resource.version
            && this.isSafeToPatch(depName);
    }

    /**
     * Mutates `patchedResources` in place: for each dep in `mismatches`,
     * replaces its version with the page's version. Returns a list of
     * human-readable rewrite descriptions and emits a `console.warn` per
     * cross-major patch (those may break at runtime due to API differences).
     */
    private applyPatchesToResources(
        patchedResources: any,
        mismatches: string[],
        manifestId: string
    ): string[] {
        const pageVersions = this.getPageManifestVersions();
        const rewrites: string[] = [];
        for (const depName of mismatches) {
            const resource = patchedResources[depName];
            const pageVersion = pageVersions.get(resource.id);
            if (!pageVersion || pageVersion === resource.version) {
                continue;
            }
            const originalVersion = resource.version;
            const majorMismatch = this.isCrossMajor(originalVersion, pageVersion);
            rewrites.push(`${depName}: ${originalVersion} → ${pageVersion}${majorMismatch ? ' (CROSS-MAJOR — may break)' : ''}`);
            resource.version = pageVersion;
            if (majorMismatch) {
                // Warn loudly: patching across majors can succeed at load time
                // but break at runtime due to API differences.
                const warnMsg = `Cross-major version patch for '${manifestId}': ${depName} bundle was built against ${originalVersion} but page provides ${pageVersion}. Extension may misbehave.`;
                Log.warn(ExtensibilityService_ServiceKey, warnMsg, this.serviceScope);
                // eslint-disable-next-line no-console
                console.warn(`[${ExtensibilityService_ServiceKey}] ${warnMsg}`);
            }
        }
        return rewrites;
    }

    /**
     * Loads an SPFx component by ID with retry logic and cross-version support.
     *
     * Strategy:
     * 1. Inspect the extension's manifest upfront via tryGetManifestById/requestManifest
     * 2. Compare its component dependency versions to what's available on the page
     * 3. If versions match → use the standard SPComponentLoader.loadComponentById fast path
     * 4. If versions differ → proactively patch the manifest and load via loadComponent
     *    (avoids noisy SPFx internal fallback errors)
     * 5. If anything throws, retry with exponential backoff
     */
    private async loadComponentWithRetry(componentId: string): Promise<any> {
        dbg(`loadComponentWithRetry: START for '${componentId}'`);

        for (let attempt = 0; attempt <= ExtensibilityService.MAX_LOAD_RETRIES; attempt++) {
            // Re-resolve the strategy on every attempt. On the first call the
            // SPFx manifest store may not have populated entries for this
            // component yet (page-load race) — a later attempt can succeed in
            // inspecting the manifest and switch us onto the patch path.
            const manifestStrategy = await this.resolveLoadStrategy(componentId);
            dbg(`loadComponentWithRetry: attempt ${attempt + 1}/${ExtensibilityService.MAX_LOAD_RETRIES + 1} — strategy for '${componentId}':`, manifestStrategy.needsPatching ? 'PATCH then loadComponent' : 'standard loadComponentById');

            try {
                if (manifestStrategy.needsPatching && manifestStrategy.manifest) {
                    dbg(`loadComponentWithRetry: attempt ${attempt + 1}/${ExtensibilityService.MAX_LOAD_RETRIES + 1} — patching + loadComponent for '${componentId}'`);
                    const patched = this.patchManifestVersions(manifestStrategy.manifest);
                    const result = await SPComponentLoader.loadComponent(patched);
                    dbg(`loadComponentWithRetry: SUCCESS via patched loadComponent for '${componentId}' (attempt ${attempt + 1})`);
                    return result;
                }
                dbg(`loadComponentWithRetry: attempt ${attempt + 1}/${ExtensibilityService.MAX_LOAD_RETRIES + 1} — loadComponentById for '${componentId}'`);
                const result = await SPComponentLoader.loadComponentById(componentId);
                dbg(`loadComponentWithRetry: SUCCESS via loadComponentById for '${componentId}' (attempt ${attempt + 1})`);
                return result;
            } catch (error) {
                if (attempt < ExtensibilityService.MAX_LOAD_RETRIES) {
                    const delay = ExtensibilityService.RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                    dbg(`loadComponentWithRetry: attempt ${attempt + 1} FAILED for '${componentId}', retrying in ${delay}ms. Error:`, error);
                    Log.verbose(ExtensibilityService_ServiceKey, `Retry ${attempt + 1}/${ExtensibilityService.MAX_LOAD_RETRIES} loading component '${componentId}' after ${delay}ms`, this.serviceScope);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    dbg(`loadComponentWithRetry: ALL ATTEMPTS FAILED for '${componentId}'. Final error:`, error);
                    throw error;
                }
            }
        }
    }

    /**
     * Inspects the extension manifest and decides whether to patch versions
     * before loading. Returns the manifest and a flag indicating whether
     * any dependency versions differ from the current page.
     */
    private async resolveLoadStrategy(componentId: string): Promise<{ manifest: IClientSideComponentManifest | undefined; needsPatching: boolean }> {
        let manifest: IClientSideComponentManifest | undefined;
        let source: 'cache' | 'server' | 'none' = 'none';

        try {
            // Try local manifest cache first (fast, synchronous)
            manifest = (SPComponentLoader as any).tryGetManifestById?.(componentId);
            if (manifest) {
                source = 'cache';
            } else {
                // Fall back to server lookup if not yet cached
                manifest = await (SPComponentLoader as any).requestManifest?.(componentId);
                if (manifest) {
                    source = 'server';
                }
            }
        } catch (e) {
            dbg(`resolveLoadStrategy: could not inspect manifest for '${componentId}', will use standard load. Error:`, e);
            Log.verbose(ExtensibilityService_ServiceKey,
                `Could not inspect manifest for '${componentId}' upfront; will use standard load. Error: ${e}`,
                this.serviceScope);
            return { manifest: undefined, needsPatching: false };
        }

        if (!manifest) {
            dbg(`resolveLoadStrategy: no manifest available for '${componentId}' (will use standard load and let SPFx fetch it)`);
            return { manifest: undefined, needsPatching: false };
        }

        dbg(`resolveLoadStrategy: manifest for '${componentId}' obtained from ${source}`);

        // Log what we found for diagnostics
        const versionedDeps = this.summarizeVersionedDependencies(manifest);
        if (versionedDeps.length > 0) {
            dbg(`Extension '${componentId}' (v${manifest.version}) declares versioned dependencies: ${versionedDeps.join(', ')}`);
        }

        const needsPatching = this.manifestHasVersionMismatch(manifest);
        return { manifest, needsPatching };
    }

    /**
     * Returns a string summary of all component-type dependencies in a manifest
     * along with their declared and current page versions. Used for logging.
     */
    private summarizeVersionedDependencies(manifest: IClientSideComponentManifest): string[] {
        const pageVersions = this.getPageManifestVersions();
        const scriptResources = (manifest as any).loaderConfig?.scriptResources;
        if (!scriptResources) {
            return [];
        }

        const summary: string[] = [];
        for (const depName of Object.keys(scriptResources)) {
            const resource = scriptResources[depName];
            if (resource.type === 'component' && resource.id && resource.version) {
                const pageVersion = pageVersions.get(resource.id);
                let status: string;
                if (!pageVersion) {
                    status = 'not on page';
                } else if (pageVersion === resource.version) {
                    status = 'match';
                } else {
                    status = `page has ${pageVersion}, will patch`;
                }
                summary.push(`${depName}@${resource.version} (${status})`);
            }
        }
        return summary;
    }

    /**
     * Returns true if any component dependency in the manifest declares a
     * version that differs from what's currently on the page. Any component
     * (registered in the page's ManifestStore by GUID) is patchable, so any
     * mismatch triggers the patch path.
     */
    private manifestHasVersionMismatch(manifest: IClientSideComponentManifest): boolean {
        const pageVersions = this.getPageManifestVersions();
        if (pageVersions.size === 0) {
            return false;
        }

        const scriptResources = (manifest as any).loaderConfig?.scriptResources;
        if (!scriptResources) {
            return false;
        }

        for (const depName of Object.keys(scriptResources)) {
            const resource = scriptResources[depName];
            if (resource.type === 'component' && resource.id && resource.version && this.isSafeToPatch(depName)) {
                const pageVersion = pageVersions.get(resource.id);
                if (pageVersion && pageVersion !== resource.version) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Instantiates an extensibility library from a loaded SPFx component.
     */
    private instantiateLibrary(extensibilityLibraryComponent: any, configurationId: string): IExtensibilityLibrary | undefined {

        // Parse the library component properties to instantiate the library itself.
        // This way, we are not depending on a naming convention for the entry point name. We depend only on the component ID
        const libraryMainEntryPoints = Object.keys(extensibilityLibraryComponent).filter(property => {
            if (property.includes('__')) {
                return false;
            }

            // Guard: the bundle may export non-class values (objects,
            // constants, etc.). Only consider entries that are functions
            // (classes) with a prototype — otherwise `.prototype` would be
            // undefined and property access on it would throw.
            const candidate = extensibilityLibraryComponent[property];
            if (typeof candidate !== 'function' || !candidate.prototype) {
                return false;
            }

            // Return the library main entry point object by checking the prototype methods.
            // They should be matching the IExtensibilityLibrary interface.
            const extensibilityLibraryPrototype: IExtensibilityLibrary = candidate.prototype;
            return !!(
                extensibilityLibraryPrototype.getCustomSuggestionProviders ||
                extensibilityLibraryPrototype.getCustomWebComponents ||
                extensibilityLibraryPrototype.getCustomLayouts ||
                extensibilityLibraryPrototype.registerHandlebarsCustomizations ||
                extensibilityLibraryPrototype.getCustomQueryModifiers ||
                extensibilityLibraryPrototype.getCustomDataSources ||
                extensibilityLibraryPrototype.invokeCardAction
            );
        });

        dbg(`instantiateLibrary: '${configurationId}' — found ${libraryMainEntryPoints.length} matching entry point(s):`, libraryMainEntryPoints);

        // Load the library once
        if (libraryMainEntryPoints.length === 1) {

            let extensibilityLibrary: any;
            const entryName = libraryMainEntryPoints[0];
            const hasServiceKey = !!extensibilityLibraryComponent[entryName].serviceKey;

            if (hasServiceKey) {
                dbg(`instantiateLibrary: '${configurationId}' — instantiating '${entryName}' via serviceScope.consume(serviceKey)`);
                extensibilityLibrary = this.serviceScope.consume(extensibilityLibraryComponent[entryName].serviceKey);
            } else {
                dbg(`instantiateLibrary: '${configurationId}' — instantiating '${entryName}' via new ExtensionClass()`);
                extensibilityLibrary = new extensibilityLibraryComponent[entryName]();
            }

            dbg(`instantiateLibrary: '${configurationId}' — instance created, has methods:`, {
                getCustomLayouts: typeof extensibilityLibrary.getCustomLayouts === 'function',
                getCustomWebComponents: typeof extensibilityLibrary.getCustomWebComponents === 'function',
                getCustomDataSources: typeof extensibilityLibrary.getCustomDataSources === 'function',
                getCustomQueryModifiers: typeof extensibilityLibrary.getCustomQueryModifiers === 'function',
                getCustomSuggestionProviders: typeof extensibilityLibrary.getCustomSuggestionProviders === 'function',
                registerHandlebarsCustomizations: typeof extensibilityLibrary.registerHandlebarsCustomizations === 'function',
                invokeCardAction: typeof extensibilityLibrary.invokeCardAction === 'function'
            });

            Log.verbose(ExtensibilityService_ServiceKey, `Extensibility library component with id '${configurationId}' and name '${entryName}' loaded.`, this.serviceScope);
            return extensibilityLibrary as IExtensibilityLibrary;
        }

        dbg(`instantiateLibrary: '${configurationId}' — SKIPPED, expected 1 entry point but found ${libraryMainEntryPoints.length}`);
        return undefined;
    }

    /**
     * Loads the extensibility libraries from the global or site collection app catalog according to the configuration.
     */
    public async loadExtensibilityLibraries(librariesConfiguration: IExtensibilityConfiguration[]): Promise<IExtensibilityLibrary[]> {

        // Log the full incoming configuration so we can see exactly what the web part passed in
        dbg(`loadExtensibilityLibraries: incoming config (${librariesConfiguration.length} entries):`,
            librariesConfiguration.map(c => ({ id: c.id, name: c.name, enabled: c.enabled })));

        const enabled = librariesConfiguration.filter(c => c.enabled);
        dbg(`loadExtensibilityLibraries: START — ${enabled.length} enabled libraries:`, enabled.map(c => ({ id: c.id, name: c.name })));
        dbg(`loadExtensibilityLibraries: page has ${this.getPageManifestVersions().size} manifests registered`);

        let extensibilityLibraries: IExtensibilityLibrary[] = [];

        if (enabled.length === 0) {
            dbg(`loadExtensibilityLibraries: DONE — no enabled libraries to load`);
            return extensibilityLibraries;
        }

        try {

            // Load only "Enabled" configuration
            const promises = enabled.map(async (configuration) => {
                try {
                    const extensibilityLibraryComponent = await this.loadComponentWithRetry(configuration.id);
                    return this.instantiateLibrary(extensibilityLibraryComponent, configuration.id);
                } catch (error) {
                    const errorDetails = error instanceof Error ? error.message : String(error);
                    dbg(`loadExtensibilityLibraries: FAILED to load '${configuration.id}':`, error);
                    Log.warn(ExtensibilityService_ServiceKey, `Failed to load extensibility library component with id '${configuration.id}' after ${ExtensibilityService.MAX_LOAD_RETRIES} retries. Error: ${errorDetails}`, this.serviceScope);
                    return undefined;
                }
            });

            const responses = await Promise.all(promises);
            // Filter only on resolved libraries
            responses.filter(response => response).forEach(response => {
                extensibilityLibraries.push(response);
            });

            dbg(`loadExtensibilityLibraries: DONE — ${extensibilityLibraries.length}/${enabled.length} libraries loaded successfully`);
            return extensibilityLibraries;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {

            //Resovles empty array
            return Promise.resolve(extensibilityLibraries);
        }
    }
}