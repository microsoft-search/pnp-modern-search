import { IComponentDefinition } from './IComponentDefinition';
import { ISuggestionProviderDefinition } from './ISuggestionProviderDefinition';

export interface IExtensibilityLibrary {

    /**
     * Returns custom web components
     */
    getCustomWebComponents(): IComponentDefinition<any>[];

    /**
     * Returns custom suggestion providers
     */
    getCustomSuggestionProviders(): ISuggestionProviderDefinition<any>[];
}
