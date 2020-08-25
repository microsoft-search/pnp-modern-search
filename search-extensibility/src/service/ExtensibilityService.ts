import { SPComponentLoader } from "@microsoft/sp-loader";
import { Log } from "@microsoft/sp-core-library";
import { IExtensibilityLibrary } from '../models/IExtensibilityLibrary';
import { Guid } from '@microsoft/sp-core-library';
import { IExtension } from '../models/IExtension';
import { ExtensionHelper } from '../utility/ExtensionHelper';
import { ExtensionTypes } from '../utility/ExtensionTypes';
import { IExtensionInstance } from '../models/instance/IExtensionInstance';
import { IExtensibilityService } from '../models/IExtensibilityService';
import { IEditorLibrary } from "../models/editors/IEditorLibrary";

const LogSource = "ExtensibilityService";
const EDITOR_LIBRARY_ID = "b4c35af5-102d-4a2d-a448-4b25a7e66a94";

export class ExtensibilityService implements IExtensibilityService {

    private _validators = new Map<string, (extensionClass:any) => boolean>();

    constructor() {
        
        this._validators[ExtensionTypes.WebComponent] = ExtensionHelper.IsWebComponent;
        this._validators[ExtensionTypes.QueryModifer] = ExtensionHelper.IsQueryModifier;
        this._validators[ExtensionTypes.SuggestionProvider] = ExtensionHelper.IsSuggestionProvider;
        this._validators[ExtensionTypes.HandlebarsHelper] = ExtensionHelper.IsHandlebarsHelper;
        this._validators[ExtensionTypes.Refiner] = ExtensionHelper.IsRefiner;

    }

    /**
     * Tries to loads the extensibility library component specified by id parameter (GUID)
     */
    public async tryLoadExtensibilityLibrary(id: Guid): Promise<IExtensibilityLibrary> {

        let library: any = undefined;

        try {

            const libraryComponent = await this.tryLoadLibrary(id);

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
            const msg = `Error loading extensibility library: ${id.toString()}. Details: ${error}`;
            Log.info(LogSource, msg);
            Log.error(LogSource, error);
            return null;
            
        }
    }

    /**
     * Load a component library
     * @param id: The guid of the library to load
     */
    private async tryLoadLibrary(id: Guid) : Promise<any> {
        Log.info(LogSource, `Loading extensibility library: ${id.toString()}`);
        const libraryComponent: any = await SPComponentLoader.loadComponentById(id.toString());
        Log.info(LogSource, `Library loaded: ${id.toString()}`);
        return libraryComponent;
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
            const msg: string = `Failure getting extensions from library: ${library.name}. Details: ${e}`;
            Log.info(LogSource, msg);
            console.log(msg);
            console.log(e);
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

    public async getEditorLibrary() : Promise<IEditorLibrary> {

        let library: any = undefined;
        const editLibrary = await this.tryLoadLibrary(Guid.parse(EDITOR_LIBRARY_ID));
        const libraryMainEntryPoints = Object.keys(editLibrary).filter(property => {
            // Return the library main entry point object by checking the prototype methods. They should be matching the IEditorLibrary interface.
            return property.indexOf('__') === -1 
                && editLibrary[property].prototype.getExtensibilityEditor
                && editLibrary[property].prototype.getRefinersEditor
                && editLibrary[property].prototype.getSearchManagedPropertiesEditor
                && editLibrary[property].prototype.getPropertyPaneSearchManagedProperties
                && editLibrary[property].prototype.getTemplateValueFieldEditor;
        });

        if (libraryMainEntryPoints.length === 1) {
            Log.info(LogSource, `Library loaded, creating instance!`);
            library = new editLibrary[libraryMainEntryPoints[0]]();
        } else {
            Log.info(LogSource, `Cannot find edit library entry point!`);
        }

        return library as IEditorLibrary;

    }


}