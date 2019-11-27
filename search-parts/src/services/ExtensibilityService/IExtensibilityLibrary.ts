import { IComponentDefinition } from './IComponentDefinition';
import { ISuggestionProvider } from '../../models/ISuggestionProvider';

export interface IExtensibilityLibrary {

    /**
     * Returns custom web components
     */
    getCustomWebComponents(): IComponentDefinition<any>[];

    /**
     * Returns custom suggestion providers
     */
    getCustomSuggestionProviders(): ISuggestionProvider[];
}
