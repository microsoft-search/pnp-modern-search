import { SPComponentLoader } from "@microsoft/sp-loader";
import { ServiceScope, ServiceKey, Log } from "@microsoft/sp-core-library";
import IExtensibilityService from "./IExtensibilityService";
import { IExtensibilityLibrary } from "@pnp/modern-search-extensibility";
import { IExtensibilityConfiguration } from "../../models/common/IExtensibilityConfiguration";

const ExtensibilityService_ServiceKey = "PnPModernSearchExtensibilityService";

export class ExtensibilityService {

    private static readonly MAX_LOAD_RETRIES = 3;
    private static readonly RETRY_BASE_DELAY_MS = 500;

    private serviceScope: ServiceScope;

    public static ServiceKey: ServiceKey<IExtensibilityService> = ServiceKey.create(ExtensibilityService_ServiceKey, ExtensibilityService);

    public constructor(serviceScope: ServiceScope) {
        this.serviceScope = serviceScope;
    }

    /**
     * Loads an SPFx component by ID with retry logic.
     * SPComponentLoader.loadComponentById can fail intermittently during page load if the library
     * manifest hasn't been fully processed by the SPFx framework yet. Retrying with backoff
     * gives the framework time to complete manifest processing.
     */
    private async loadComponentWithRetry(componentId: string): Promise<any> {
        for (let attempt = 0; attempt <= ExtensibilityService.MAX_LOAD_RETRIES; attempt++) {
            try {
                return await SPComponentLoader.loadComponentById(componentId);
            } catch (error) {
                if (attempt < ExtensibilityService.MAX_LOAD_RETRIES) {
                    const delay = ExtensibilityService.RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                    Log.verbose(ExtensibilityService_ServiceKey, `Retry ${attempt + 1}/${ExtensibilityService.MAX_LOAD_RETRIES} loading component '${componentId}' after ${delay}ms`, this.serviceScope);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            }
        }
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