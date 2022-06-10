import { IDataSourceData } from "@pnp/modern-search-extensibility";

export interface ISearchResultsContainerState {

    /**
     * The current loaded data
     */
    data: IDataSourceData;

    /**
     * The current selected item keys in results regardless the page
     */
    selectedItemKeys: string[];    
    
    /**
     * Flag indicating if results are loading
     */
    isLoading: boolean;

    /**
     * Error message display in the message bar
     */
    errorMessage: string;

    /**
     * Indicates if the data have already been rendered once.
     */
    renderedOnce: boolean;    
}