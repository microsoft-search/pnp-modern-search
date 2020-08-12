import { IRefinementResult, IPaginationInformation, ISearchVerticalInformation, IRefinementFilter } from "./ISearchResult";
import { ISearchServiceConfiguration } from "./ISearchServiceConfiguration";

/**
 * Represents the data exposed by a search results Web Part for dynamic data connection
 */
interface ISearchResultSourceData {
    /**
     * The query keywords
     */
    queryKeywords: string;

    /**
     * The default selected refinement filters
     */
    defaultSelectedRefinementFilters: IRefinementFilter[];

    /**
     * The refinement results
     */
    refinementResults: IRefinementResult[];

    /**
     * The pagination information
     */
    paginationInformation: IPaginationInformation;

    /**
     * The search service configuration
     */
    searchServiceConfiguration: ISearchServiceConfiguration;

    /**
     * The search verticals information
     */
    verticalsInformation: ISearchVerticalInformation[];

    /**
     * Reset filter based on vertical switch
     */
    filterReset: boolean;
}

export default ISearchResultSourceData;