import { ISearchResult, IPromotedResult } from '../../../../models/ISearchResult';

/**
 * Handlebars template context for search results
 */
interface ISearchResultsTemplateContext {
    items: ISearchResult[];
    promotedResults?: IPromotedResult[];
    strings: ISearchResultsWebPartStrings;
    keywords?: string;
    showResultsCount?: boolean;
    siteUrl?: string;
    webUrl?: string;
    paging?: {
        showPaging?: boolean;
        currentPageNumber?: number;
        totalItemsCount: number;
        hideFirstLastPages?: boolean;
        hideDisabled?: boolean;
        hideNavigation?: boolean;
        pagingRange?: number;
        itemsCountPerPage?: number;
    },
    actualResultsCount?: number;
    spellingSuggestion?: string;
}

export default ISearchResultsTemplateContext;