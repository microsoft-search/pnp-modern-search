import { Guid } from '@microsoft/sp-core-library';
import { IExtensibilityLibrary, IExtension, ExtensionType, IExtensionInstance } from '..';
import { IEditorLibrary } from './editors/IEditorLibrary';

export interface IExtensibilityService {

    /**
     * Loads the extensibility library component for specified id dynamically.
     * @param id the GUID for the component library to be loaded
     * @returns if present in the SharePoint app catalog, returns the library instance. Returns undefined otherwise.
     */
    tryLoadExtensibilityLibrary(id: Guid): Promise<IExtensibilityLibrary>;

    /**
     * Loads several extensibility libraries for a list of ids
     * @param libraries the libraries to be loaded
     * @returns loads all libraries that can be found or empty array if no components can be found.
     */
    loadExtensibilityLibraries(libraries:Guid[]) : Promise<IExtensibilityLibrary[]>;

    /**
     * Returns all the extensions in the specified extensibilty libraries
     * @param libraries the libraries we want to return extensions for
     * @returns all extensions in the libraries
     */
    getAllExtensions(libraries: IExtensibilityLibrary[]) : IExtension<any>[];

    /**
     * Returns all the extensions in the specified library
     * @param library loaded extensibilty library
     * @returns all extensions in the library
     */
    getExtensions(library: IExtensibilityLibrary) : IExtension<any>[];

    /**
     * Filters the list of extensions by extension type
     * @param lookIn the list of extensions to look in
     * @param extensionType the type of extensions to return
     * @returns the extensions of the specified type
     */
    filter<T extends IExtensionInstance>(lookIn: IExtension<ExtensionType>[], extensionType: string) : IExtension<T>[];

    /**
     * Load the editor library
     */
    getEditorLibrary() : Promise<IEditorLibrary>;
    
}