import { IExtensibilityLibrary } from '@pnp/modern-search-extensibility';
import { IExtensibilityConfiguration } from '../../models/common/IExtensibilityConfiguration';

export default interface IExtensibilityService {

    /**
     * Loads the extensibility library component dynamically.
     * @returns if present in the SharePoint app catalog, returns the library instance. Returns undefined otherwise.
     */
    loadExtensibilityLibraries(librairiesConfiguration: IExtensibilityConfiguration[]): Promise<IExtensibilityLibrary[]>;
}