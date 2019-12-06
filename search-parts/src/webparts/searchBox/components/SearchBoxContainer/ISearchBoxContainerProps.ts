import { PageOpenBehavior, QueryPathBehavior } from '../../../../helpers/UrlHelper';
import ISearchService from       '../../../../services/SearchService/ISearchService';
import INlpService from '../../../../services/NlpService/INlpService';
import ISearchQuery from '../../../../models/ISearchQuery';
import { ISuggestionProviderInstance } from '../../../../services/ExtensibilityService/ISuggestionProviderInstance';

export interface ISearchBoxContainerProps {
    onSearch: (searchQuery: ISearchQuery) => void;
    searchInNewPage: boolean;
    enableQuerySuggestions: boolean;
    suggestionProviders: ISuggestionProviderInstance<any>[];
    enableNlpService: boolean;
    searchService: ISearchService;
    pageUrl: string;
    openBehavior: PageOpenBehavior;
    queryPathBehavior: QueryPathBehavior;
    queryStringParameter: string;
    inputValue: string;
    NlpService: INlpService;
    enableDebugMode: boolean;
    isStaging: boolean;
    placeholderText: string;
    domElement: HTMLElement;
}
