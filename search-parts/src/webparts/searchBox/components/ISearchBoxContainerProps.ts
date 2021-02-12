import { PageOpenBehavior, QueryPathBehavior } from "../../../helpers/UrlHelper";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { ISuggestionProvider, ITokenService } from "@pnp/modern-search-extensibility";
import { IToken } from "office-ui-fabric-react";

export interface ISearchBoxContainerProps {

    /**
     * Callback handler when the search query text is submitted
     */
    onSearch: (searchQueryText: string) => void;

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
     * The transformation to apply on the queryText before sending to a different page
     */
    inputTemplate: string;

    /**
     * Flag indicating if the search box should open a new tab or use the current page
     */
    openBehavior: PageOpenBehavior;

    /**
     * Enables/Disables query suggestions
     */
    enableQuerySuggestions: boolean;

    /**
     * List of available suggestions providers
     */
    suggestionProviders: ISuggestionProvider[];

    /**
     * The search box input value
     */
    inputValue: string;

    /**
     * The placeholder text to display in the search box
     */
    placeholderText: string;
    
    /**
     * The Web Part root DOM element
     */
    domElement: HTMLElement;

    /**
     * The number of suggestions to display for each group
     */
    numberOfSuggestionsPerGroup: number;

    /**
     * The current theme variant
     */
    themeVariant: IReadonlyTheme | undefined;

    tokenService: ITokenService;
}
