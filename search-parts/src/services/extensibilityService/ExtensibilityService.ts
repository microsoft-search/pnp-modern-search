import { SPComponentLoader } from "@microsoft/sp-loader";
import { ServiceScope, ServiceKey, Log } from "@microsoft/sp-core-library";
import type { IClientSideComponentManifest } from "@microsoft/sp-module-interfaces";
import IExtensibilityService from "./IExtensibilityService";
import { IExtensibilityLibrary } from "@pnp/modern-search-extensibility";
import { IExtensibilityConfiguration } from "../../models/common/IExtensibilityConfiguration";

const ExtensibilityService_ServiceKey = "PnPModernSearchExtensibilityService";

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
     */
    private getPageManifestVersions(): Map<string, string> {
        if (!this._pageManifestVersions) {
            this._pageManifestVersions = new Map<string, string>();
            try {
                const manifests = SPComponentLoader.getManifests();
                for (const m of manifests) {
                    if (m.id && m.version) {
                        this._pageManifestVersions.set(m.id, m.version);
                    }
                }
            } catch (e) {
                Log.warn(ExtensibilityService_ServiceKey, `Could not build page manifest version map: ${e}`, this.serviceScope);
            }
        }
        return this._pageManifestVersions;
    }

    /**
     * Rewrites version-pinned component dependencies in an extension manifest
     * to match the versions available on the current page. This enables
     * extensions built against an older SPFx version to load on a newer page.
     *
     * For example, an extension built with SPFx 1.18.2 declares
     * `@microsoft/sp-core-library@1.18.2` in scriptResources. The page
     * running SPFx 1.22.2 has `@microsoft/sp-core-library@1.22.2`. Without
     * rewriting, the loader fails because it does an exact version lookup.
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

        let needsPatch = false;

        // Check if any component dependency has a version mismatch with the page
        for (const depName of Object.keys(scriptResources)) {
            const resource = scriptResources[depName];
            if (resource.type === 'component' && resource.id && resource.version) {
                const pageVersion = pageVersions.get(resource.id);
                if (pageVersion && pageVersion !== resource.version) {
                    needsPatch = true;
                    break;
                }
            }
        }

        if (!needsPatch) {
            return manifest;
        }

        // Deep clone the manifest to avoid mutating the original in ManifestStore
        const patched: any = JSON.parse(JSON.stringify(manifest));
        const patchedResources = patched.loaderConfig.scriptResources;
        const rewrites: string[] = [];

        for (const depName of Object.keys(patchedResources)) {
            const resource = patchedResources[depName];
            if (resource.type === 'component' && resource.id && resource.version) {
                const pageVersion = pageVersions.get(resource.id);
                if (pageVersion && pageVersion !== resource.version) {
                    rewrites.push(`${depName}: ${resource.version} → ${pageVersion}`);
                    resource.version = pageVersion;
                }
            }
        }

        if (rewrites.length > 0) {
            Log.info(ExtensibilityService_ServiceKey,
                `Patched extension manifest '${manifest.id}' for cross-version compatibility: ${rewrites.join(', ')}`,
                this.serviceScope);
        }

        return patched as IClientSideComponentManifest;
    }

    /**
     * Loads an SPFx component by ID with retry logic and cross-version support.
     *
     * First attempts a standard load via SPComponentLoader.loadComponentById().
     * If that fails (e.g., due to version-pinned dependencies), falls back to
     * manifest rewriting: fetches the manifest, patches dependency versions to
     * match the current page, and loads via SPComponentLoader.loadComponent().
     */
    private async loadComponentWithRetry(componentId: string): Promise<any> {
        for (let attempt = 0; attempt <= ExtensibilityService.MAX_LOAD_RETRIES; attempt++) {
            try {
                return await SPComponentLoader.loadComponentById(componentId);
            } catch (error) {
                // On the last retry, try the cross-version fallback before giving up
                if (attempt === ExtensibilityService.MAX_LOAD_RETRIES) {
                    try {
                        return await this.loadComponentWithVersionPatching(componentId);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (_patchError) {
                        // If patching also fails, throw the original error
                        throw error;
                    }
                }

                const delay = ExtensibilityService.RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                Log.verbose(ExtensibilityService_ServiceKey, `Retry ${attempt + 1}/${ExtensibilityService.MAX_LOAD_RETRIES} loading component '${componentId}' after ${delay}ms`, this.serviceScope);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Attempts to load a component by patching its manifest dependency versions
     * to match the current page. This is the cross-version compatibility fallback.
     */
    private async loadComponentWithVersionPatching(componentId: string): Promise<any> {
        Log.info(ExtensibilityService_ServiceKey,
            `Attempting cross-version load for component '${componentId}' via manifest patching`,
            this.serviceScope);

        // Get the manifest — try local cache first, then request from server
        let manifest: IClientSideComponentManifest | undefined =
            (SPComponentLoader as any).tryGetManifestById?.(componentId);

        if (!manifest) {
            manifest = await (SPComponentLoader as any).requestManifest?.(componentId);
        }

        if (!manifest) {
            throw new Error(`Could not retrieve manifest for component '${componentId}'`);
        }

        const patched = this.patchManifestVersions(manifest);
        return SPComponentLoader.loadComponent(patched);
    }

    /**
     * Instantiates an extensibility library from a loaded SPFx component.
     */
    private instantiateLibrary(extensibilityLibraryComponent: any, configurationId: string): IExtensibilityLibrary | undefined {

        // Parse the library component properties to instantiate the library itself.
        // This way, we are not depending on a naming convention for the entry point name. We depend only on the component ID
        const libraryMainEntryPoints = Object.keys(extensibilityLibraryComponent).filter(property => {

            // Return the library main entry point object by checking the prototype methods. They should be matching the IExtensibilityLibrary interface.
            const extensibilityLibraryPrototype: IExtensibilityLibrary = extensibilityLibraryComponent[property].prototype;
            return property.indexOf('__') === -1 && (
                extensibilityLibraryPrototype.getCustomSuggestionProviders ||
                extensibilityLibraryPrototype.getCustomWebComponents ||
                extensibilityLibraryPrototype.getCustomLayouts ||
                extensibilityLibraryPrototype.registerHandlebarsCustomizations ||
                extensibilityLibraryPrototype.getCustomQueryModifiers ||
                extensibilityLibraryPrototype.invokeCardAction);
        });

        // Load the library once
        if (libraryMainEntryPoints.length === 1) {

            let extensibilityLibrary: any;

            if (extensibilityLibraryComponent[libraryMainEntryPoints[0]].serviceKey) {
                // If the library provides a static serviceKey property
                // we use the serviceScope to create a new instance
                extensibilityLibrary = this.serviceScope.consume(extensibilityLibraryComponent[libraryMainEntryPoints[0]].serviceKey);
            } else {
                // Otherwise we just use the new syntax
                extensibilityLibrary = new extensibilityLibraryComponent[libraryMainEntryPoints[0]]();
            }

            Log.verbose(ExtensibilityService_ServiceKey, `Extensibility library component with id '${configurationId}' and name '${libraryMainEntryPoints[0]}' loaded.`, this.serviceScope);
            return extensibilityLibrary as IExtensibilityLibrary;
        }

        return undefined;
    }

    /**
     * Loads the extensibility libraries from the global or site collection app catalog acording to the configuration.
     */
    public async loadExtensibilityLibraries(librairiesConfiguration: IExtensibilityConfiguration[]): Promise<IExtensibilityLibrary[]> {

        let extensibilityLibraries: IExtensibilityLibrary[] = [];

        try {

            // Load only "Enabled" configuration
            const promises = librairiesConfiguration.filter(configuration => configuration.enabled).map(async (configuration) => {
                try {
                    const extensibilityLibraryComponent = await this.loadComponentWithRetry(configuration.id);
                    return this.instantiateLibrary(extensibilityLibraryComponent, configuration.id);
                } catch (error) {
                    const errorDetails = error instanceof Error ? error.message : String(error);
                    Log.warn(ExtensibilityService_ServiceKey, `Failed to load extensibility library component with id '${configuration.id}' after ${ExtensibilityService.MAX_LOAD_RETRIES} retries. Error: ${errorDetails}`, this.serviceScope);
                    return undefined;
                }
            });

            const responses = await Promise.all(promises);
            // Filter only on resolved libraries
            responses.filter(response => response).forEach(response => {
                extensibilityLibraries.push(response);
            });

            return extensibilityLibraries;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {

            //Resovles empty array
            return Promise.resolve(extensibilityLibraries);
        }
    }
}