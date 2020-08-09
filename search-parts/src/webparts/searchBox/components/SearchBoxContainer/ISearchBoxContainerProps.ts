import { PageOpenBehavior, QueryPathBehavior } from '../../../../helpers/UrlHelper';
import ISearchService from       '../../../../services/SearchService/ISearchService';
//import { ISuggestionProviderInstance } from '../../../../services/ExtensibilityService/ISuggestionProviderInstance';
import { ISuggestionProviderInstance } from 'search-extensibility';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface ISearchBoxContainerProps {
    onSearch: (searchQuery: string) => void;
    searchInNewPage: boolean;
    enableQuerySuggestions: boolean;
    suggestionProviders: ISuggestionProviderInstance[];
    searchService: ISearchService;
    pageUrl: string;
    openBehavior: PageOpenBehavior;
    queryPathBehavior: QueryPathBehavior;
    queryStringParameter: string;
    inputValue: string;
    placeholderText: string;
    domElement: HTMLElement;

    /**
     * The current theme variant
     */
    themeVariant: IReadonlyTheme | undefined;
}
