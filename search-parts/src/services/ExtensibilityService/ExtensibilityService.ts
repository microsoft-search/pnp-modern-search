import { SPComponentLoader } from "@microsoft/sp-loader";
import { Log } from "@microsoft/sp-core-library";
import { IExtensibilityLibrary } from './IExtensibilityLibrary';

/**
 * Unique ID for the extensibility SPFx library component
 */
const ExtensibilityService_LibraryComponentId = "2501f2fd-d601-4da4-a04d-9f0bd85b1f54";

const LogSource = "ExtensibilityService";

export class ExtensibilityService {

    /**
     * Loads the extensibility library component from the global or site collection app catalog.
     */
    public async loadExtensibilityLibrary(): Promise<IExtensibilityLibrary> {

        let extensibilityLibrary: any = undefined; 

        try {

            const extensibilityLibraryComponent: any = await SPComponentLoader.loadComponentById(ExtensibilityService_LibraryComponentId);

            // Parse the library component properties to instanciate the library itself. 
            // This way, we are not depending on a naming convention for the entry point name. We depend only on the component ID
            const libraryMainEntryPoints = Object.keys(extensibilityLibraryComponent).filter(property => {

                // Return the library main entry point object by checking the prototype methods. They should be matching the IExtensibilityLibrary interface.
                return property.indexOf('__') === -1 && extensibilityLibraryComponent[property].prototype.getCustomWebComponents;
            });

            if (libraryMainEntryPoints.length === 1) {
                extensibilityLibrary = new extensibilityLibraryComponent[libraryMainEntryPoints[0]]();
            }

            return extensibilityLibrary as IExtensibilityLibrary;

        } catch (error) {

            Log.info(LogSource, `No extensibility library component found. Details: ${error}`);
            return Promise.resolve(extensibilityLibrary);
        }
    }
}