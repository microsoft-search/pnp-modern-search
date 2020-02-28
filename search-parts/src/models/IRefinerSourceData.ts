import { IRefinementFilter } from "./ISearchResult";
import IRefinerConfiguration from "./IRefinerConfiguration";

/**
 * Represents the data exposeed by a search refiner Web Part for dynamic data connection
 */
interface IRefinerSourceData {
    
    /**
     * The current selected filters
     */
    selectedFilters: IRefinementFilter[];

    /**
     * The refiners configuration for the Web Part
     */
    refinerConfiguration: IRefinerConfiguration[];

    /**
     * Flag indicating values have been manually selected/unselected by the user
     */
    isDirty: boolean;
}

export default IRefinerSourceData;