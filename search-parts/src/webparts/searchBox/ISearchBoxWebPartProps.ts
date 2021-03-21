import { IBaseWebPartProps } from "../../models/common/IBaseWebPartProps";
import { QueryPathBehavior, PageOpenBehavior } from "../../helpers/UrlHelper";
import { DynamicProperty } from "@microsoft/sp-component-base";
import { ISuggestionProviderConfiguration } from "../../providers/ISuggestionProviderConfiguration";
import { IExtensibilityConfiguration } from "../../models/common/IExtensibilityConfiguration";

export interface ISearchBoxWebPartProps extends IBaseWebPartProps {

    /**
     * Flag indicating in the search query text should be sent to an other page
     */
    searchInNewPage: boolean;

    /**
     * The page URL to send the query text
     */
    pageUrl: string;

    /**
     * Whether to use an URL fragment (#) or query string parameter to pass the query text
     */
    queryPathBehavior: QueryPathBehavior;

    /**
     * The query string parameter to use to send the query text
     */
    queryStringParameter: string;

    /**
     * Flag indicating if the search box should open a new tab or use the current page
     */
    openBehavior: PageOpenBehavior;

    /**
     * Enables/Disables query suggestions
     */
    enableQuerySuggestions: boolean;

    /**
     * If the search box query text should be initialized from an existing dynamic data source
     */
    useDynamicDataSource: boolean;

    /**
     * The query keywords in the search box
     */
    queryText: DynamicProperty<string>;

    /**
     * The transformation to apply on the queryText before sending to a different page
     */
    inputTemplate: string;

    /**
     * Placeholder text to display in the search box
     */
    placeholderText: string;

    /**
     * Selected suggestion provider definition
     */
    suggestionProviderConfiguration: ISuggestionProviderConfiguration[];

    /**
     * The number of suggestions to display for each group
     */
    numberOfSuggestionsPerGroup: number;

    /**
     * The suggestions provider properties
     */
    providerProperties: {
        [key: string]: any;
    };

    /**
     * The extensibility configuraion to load
     */
    extensibilityLibraryConfiguration: IExtensibilityConfiguration[];
}