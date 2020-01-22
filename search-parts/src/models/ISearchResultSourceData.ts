import { IRefinementResult, IPaginationInformation, ISearchVerticalInformation } from "./ISearchResult";
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
     * The final quer query submitted to the search engine
     */
    queryModification: string;

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
}

export default ISearchResultSourceData;