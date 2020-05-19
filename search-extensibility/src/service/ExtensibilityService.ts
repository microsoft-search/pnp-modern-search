import { SPComponentLoader } from "@microsoft/sp-loader";
import { Log } from "@microsoft/sp-core-library";
import { IExtensibilityLibrary } from '../models/IExtensibilityLibrary';
import { Guid } from '@microsoft/sp-core-library';
import { IExtension } from '../models/IExtension';
import { ExtensionHelper } from '../utility/ExtensionHelper';
import { ExtensionTypes } from '../utility/ExtensionTypes';
import { IExtensionInstance } from '../models/instance/IExtensionInstance';
import { IExtensibilityService } from '../models/IExtensibilityService';

const LogSource = "ExtensibilityService";

export class ExtensibilityService implements IExtensibilityService {

    private _validators = new Map<string, (extensionClass:any) => boolean>();

    constructor() {
        
        this._validators[ExtensionTypes.WebComponent] = ExtensionHelper.IsWebComponent;
        this._validators[ExtensionTypes.QueryModifer] = ExtensionHelper.IsQueryModifier;
        this._validators[ExtensionTypes.SuggestionProvider] = ExtensionHelper.IsSuggestionProvider;
        this._validators[ExtensionTypes.HandlebarsHelper] = ExtensionHelper.IsHandlebarsHelper;

    }

    /**
     * Tries to loads the extensibility library component specified by id parameter (GUID)
     */
    public async tryLoadExtensibilityLibrary(id: Guid): Promise<IExtensibilityLibrary> {

        let library: any = undefined;

        try {

            Log.info(LogSource, `Loading extensibility library: ${id.toString()}`);
            const libraryComponent: any = await SPComponentLoader.loadComponentById(id.toString());
            Log.info(LogSource, `Library loaded: ${id.toString()}`);

            // Parse the library component properties to instanciate the library itself. 
            // This way, we are not depending on a naming convention for the entry point name. We depend only on the component ID
            const libraryMainEntryPoints = Object.keys(libraryComponent).filter(property => {
                // Return the library main entry point object by checking the prototype methods. They should be matching the IExtensibilityLibrary interface.
                return property.indexOf('__') === -1 && libraryComponent[property].prototype.getExtensions;
            });

            if (libraryMainEntryPoints.length === 1) {
                Log.info(LogSource, `Library has getExtensions() method: ${id.toString()}`);
                library = new libraryComponent[libraryMainEntryPoints[0]]();
                library.guid = id;
            } else {
                Log.info(LogSource, `Library has no getExtensions() method, returning null: ${id.toString()}`);
            }

            return library as IExtensibilityLibrary;

        } catch (error) {

            Log.info(LogSource, `Error loading extensibility library: ${id.toString()}. Details: ${error}`);
            Log.error(LogSource, error);
            return null;
            
        }
    }

    /**
     * Loads extensibility libraries specified by users
     */
    public async loadExtensibilityLibraries(libraries:Guid[]) : Promise<IExtensibilityLibrary[]> {

        if(libraries && libraries.length > 0) {

            let allLibraries : IExtensibilityLibrary[] = [];

            for(let i = 0; i < libraries.length; i++){
                
                allLibraries.push(
                    await this.tryLoadExtensibilityLibrary(libraries[i])
                );

            }

            return allLibraries;

        }

        return [];

    }

    public getExtensions(library: IExtensibilityLibrary) : IExtension<any>[] {

        let extensions: IExtension<any>[] = [];
        
        if(typeof library.getExtensions === "function") {

            const libraryExtensions = this.tryGetExtensions(library);

            if(libraryExtensions && libraryExtensions.length > 0) {

                libraryExtensions.forEach((testExtension) => {

                    if(typeof testExtension.extensionClass != undefined) {
                        extensions.push(testExtension as IExtension<any>);
                    }

                });

            }

        }

        return extensions;

    }

    private tryGetExtensions(library: IExtensibilityLibrary) : IExtension<any>[] {
        let extensions: IExtension<any>[] = null;
        try {
            extensions = library.getExtensions();
        } catch(e) {
            Log.info(LogSource, `Failure getting extensions from library: ${library.name}. Details: ${e}`);
            Log.error(LogSource, e);
        }
        return extensions;
    }

    public getAllExtensions(libraries: IExtensibilityLibrary[]) : IExtension<any>[] {

        let extensions : IExtension<any>[] = [];

        for(let i = 0; i < libraries.length; i++){
            const library : IExtensibilityLibrary = libraries[i];
            let extension = this.getExtensions(library);
            extensions = extensions.concat(extension);
        }

        return extensions;

    }

    public filter<T extends IExtensionInstance>(lookIn: IExtension<any>[], extensionType: string) : IExtension<T>[] {

        const validator = this._validators[extensionType];

        if(validator) {
            return lookIn.filter((value)=> validator(value.extensionClass));
        }

        return [];
        
    }

}