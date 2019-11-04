import { IExtensibilityLibrary } from './IExtensibilityLibrary';

export default interface IExtensibilityService {

    /**
     * Loads the extensibility library component dynamically.
     * @returns if present in the SharePoint app catalog, returns the library instance. Returns undefined otherwise.
     */
    loadExtensibilityLibrary(): Promise<IExtensibilityLibrary>;
}