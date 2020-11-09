import { SPComponentLoader } from "@microsoft/sp-loader";
import { ServiceScope, ServiceKey, Log } from "@microsoft/sp-core-library";
import IExtensibilityService from "./IExtensibilityService";
import { IExtensibilityLibrary } from "@pnp/modern-search-extensibility";
import { IExtensibilityConfiguration } from "../../models/common/IExtensibilityConfiguration";

const ExtensibilityService_ServiceKey = "PnPModernSearchExtensibilityService";

export class ExtensibilityService {

    private serviceScope: ServiceScope;

    public static ServiceKey: ServiceKey<IExtensibilityService> = ServiceKey.create(ExtensibilityService_ServiceKey, ExtensibilityService);

    public constructor(serviceScope: ServiceScope) {
        this.serviceScope = serviceScope;
    }

    /**
     * Loads the extensibility libraries from the global or site collection app catalog acording to the configuration.
     */
    public async loadExtensibilityLibraries(librairiesConfiguration: IExtensibilityConfiguration[]): Promise<IExtensibilityLibrary[]> {

        let extensibilityLibraries: IExtensibilityLibrary[] = []; 

        try {

            // Load only "Enabled" configuration
            const promises = librairiesConfiguration.filter(configuration => configuration.enabled).map(configuration => {

                return new Promise<any>((resolve, reject) => {

                    return SPComponentLoader.loadComponentById(configuration.id).then((extensibilityLibraryComponent: any) => {

                        let extensibilityLibrary: any = undefined;

                        // Parse the library component properties to instanciate the library itself. 
                        // This way, we are not depending on a naming convention for the entry point name. We depend only on the component ID
                        const libraryMainEntryPoints = Object.keys(extensibilityLibraryComponent).filter(property => {
            
                            // Return the library main entry point object by checking the prototype methods. They should be matching the IExtensibilityLibray interface.
                            const extensibilityLibraryPrototype: IExtensibilityLibrary = extensibilityLibraryComponent[property].prototype;
                            return property.indexOf('__') === -1 && (
                                extensibilityLibraryPrototype.getCustomSuggestionProviders ||
                                extensibilityLibraryPrototype.getCustomWebComponents ||
                                extensibilityLibraryPrototype.registerHandlebarsCustomizations);
                        });
            
                        // Load the library once
                        if (libraryMainEntryPoints.length === 1) {
                            extensibilityLibrary = new extensibilityLibraryComponent[libraryMainEntryPoints[0]]();
                        }
            
                        Log.verbose(ExtensibilityService_ServiceKey, `Extensibility library component with id '${configuration.id}' and name '${libraryMainEntryPoints[0]}' loaded.`, this.serviceScope);
                        resolve(extensibilityLibrary as IExtensibilityLibrary);   

                    }).catch(error => {
                        Log.warn(ExtensibilityService_ServiceKey, `No extensibility library component found with id '${configuration.id}'`, this.serviceScope);
                        resolve(undefined);
                    });
                });
            });

            const responses = await Promise.all(promises);

            // Filter only on resolved libraries
            responses.filter(response => response).forEach(response => {
                extensibilityLibraries.push(response);
            });

            return extensibilityLibraries;

        } catch (error) {

            //Resovles empty array
            return Promise.resolve(extensibilityLibraries);
        }
    }
}