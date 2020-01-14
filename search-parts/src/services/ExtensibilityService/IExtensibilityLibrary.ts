import { IComponentDefinition } from './IComponentDefinition';
import { ISuggestionProviderDefinition } from './ISuggestionProviderDefinition';
import { IQueryModifierDefinition } from './IQueryModifierDefinition';

export interface IExtensibilityLibrary {

    /**
     * Returns custom web components
     */
    getCustomWebComponents(): IComponentDefinition<any>[];

    /**
     * Returns custom suggestion providers
     */
    getCustomSuggestionProviders(): ISuggestionProviderDefinition<any>[];

    /**
     * Returns query modifier
     */
    getQueryModifier(): IQueryModifierDefinition<any>;
}
