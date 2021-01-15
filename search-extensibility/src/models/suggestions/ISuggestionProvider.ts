import { ISuggestion } from './ISuggestion';
import { IPropertyPaneGroup } from '@microsoft/sp-property-pane';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ISuggestionProvider {

    /**
     * The Web Part properties in the property bag. Corresponds to the isolated 'suggestionsProperties' property in the global property bag.
     */
    properties: any;

    /**
     * Context of the main Web Part
     */
    context: WebPartContext;

    /**
     * Flag indicating if the provider supports zero term suggestions
     */
    isZeroTermSuggestionsEnabled: boolean;

    /**
     * Method called during the Web Part initialization.
     */
    onInit(): void | Promise<void>;

    /**
     * Retrieve suggestions according to the entered query text
     * @param queryText the input query text from the search box
     */
    getSuggestions(queryText: string): Promise<ISuggestion[]>;
    
    /**
     * Returns the zero term suggestions
     */
    getZeroTermSuggestions(): Promise<ISuggestion[]>;

    /**
     * Returns the data source property pane option fields if any.
     */
    getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[];

    /**
     * Method called when a property pane field in changed in the Web Part.
     * @param propertyPath the property path.
     * @param oldValue the old value.
     * @param newValue the new value.
     */
    onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void;
}