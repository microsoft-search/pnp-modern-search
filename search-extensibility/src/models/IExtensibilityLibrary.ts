/* eslint-disable @typescript-eslint/no-explicit-any */
import { IComponentDefinition } from './layouts/IComponentDefinition';
import { ILayoutDefinition } from './layouts/ILayoutDefinition';
import { ISuggestionProviderDefinition } from './suggestions/ISuggestionProviderDefinition';
import * as Handlebars from 'handlebars';
import { IAdaptiveCardAction } from './IAdaptiveCardAction';
import { IQueryModifierDefinition } from './queryModifier/IQueryModifierDefinition';
import { IDataSourceDefinition } from './dataSources/IDataSourceDefinition';

export interface IExtensibilityLibrary {

    /**
     * Returns custom layouts
     */
    getCustomLayouts(): ILayoutDefinition[];

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

    /**
     * Allows to handle an action for an actionable adaptive card
     * @param action the information about the action activated by the user
     */
    invokeCardAction(action: IAdaptiveCardAction): void;

    /**
     * Returns custom query modifiers
     */
    getCustomQueryModifiers?(): IQueryModifierDefinition[];

    /**
     * Returns custom data sources
     */
    getCustomDataSources?(): IDataSourceDefinition[];
}