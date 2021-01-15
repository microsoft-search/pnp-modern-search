import { IComponentDefinition } from './layouts/IComponentDefinition';
import { ISuggestionProviderDefinition } from './suggestions/ISuggestionProviderDefinition';
import * as Handlebars from 'handlebars';

export interface IExtensibilityLibrary {
    
    /**
     * Returns custom web components
     */
    getCustomWebComponents(): IComponentDefinition<any>[];

    /**
     * Returns custom suggestions providers
     */
    getCustomSuggestionProviders(): ISuggestionProviderDefinition[];

    /**
     * Allows to register Handlebars customizations like helpers or partials in the current Web Part Handlebars isolated namespace
     * @param namespace the current Web Part Handlebars namespace
     */
    registerHandlebarsCustomizations?(handlebarsNamespace: typeof Handlebars): void;
}