import { IDataSourceData, IDataFilterInternal, IDataFilter, FilterConditionOperator, IDataFilterConfiguration } from "@pnp/modern-search-extensibility";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import ISearchResultsWebPartProps from "../../webparts/searchResults/ISearchResultsWebPartProps";
import { SPSite, SPWeb, SPUser, SPList, SPListItem, CultureInfo } from "@microsoft/sp-page-context";
import ISearchFiltersWebPartProps from "../../webparts/searchFilters/ISearchFiltersWebPartProps";

/**
 * Represents the context passed to the Handlebars template (Search Results)
 */
export interface IDataResultsTemplateContext {

    /**
     * Paging informations
     */
    paging: {
        /**
         * The current page number
         */
        currentPageNumber: number;
    };

    /**
     * Connected filters informations
     */
    filters: {
        
        /**
         * Current selected filters for the data source
         */
        selectedFilters: IDataFilter[];

        /**
         * Operator to use between filters
         */
        filterOperator: FilterConditionOperator;

        /**
         * The Filters Web Part instance ID
         */
        instanceId: string;

        /**
         * The current filters configuration
         */
        filtersConfiguration:IDataFilterConfiguration[];
    };

    /**
     * The current input query text
     */
    inputQueryText: string;

    /**
     * Hashtable of configured slots for the current data source.
     * Usage: {{slot item @root.slots}} 
     */
    slots: {[key: string]: string};

    /**
     * Current theme variables
     */
    theme: IReadonlyTheme;

    /**
     * Web Part properties from property bag
     */
    properties: ISearchResultsWebPartProps;

    /**
     * The current page context infos
     */
    context: {

        /**
         * Contextual information for the SharePoint site collection ("SPSite") that is hosting the page.
         */
        site: SPSite;

        /**
         * Contextual information for the SharePoint site ("SPWeb") that is hosting the page.
         */
        web: SPWeb;

        /**
         * Contextual information for the SharePoint list that is hosting the page.
         * If there is no list associated to the current page, this property will be undefined.
         */
        list: SPList;

        /**
         * Contextual information for the SharePoint list item that is hosting the page.
         * If there is no list item associated to the current page, this property will be undefined.
         */
        listItem: SPListItem;

        /**
         * It provides culture info for the current user of the application.
         */
        cultureInfo: CultureInfo;

        /**
         * It provides contextual information for the SharePoint user that is accessing the page.
         */
        user: SPUser; 
    };
    
    /**
     * The data source data
     */
    data: IDataSourceData;

    /**
     * The Web Part instance ID
     */
    instanceId: string;

    /**
     * Utils information to be used in your template
     */
    utils: {

        /**
         * The default image content to display when no thummbnail is available.
         */
        defaultImage: string;
    };
}

/**
 * Represents the context passed to the Handlebars template (Filters)
 */
export interface ISearchFiltersTemplateContext {

    /**
     * Current filters to display in the UI (selected/unseslected)
     */
    filters: IDataFilterInternal[];
    
    /**
     * The current submitted filters
     */
    selectedFilters: IDataFilter[];

    /**
     * The Web Part instance ID
     */
    instanceId: string;

    /**
     * Current theme variables
     */
    theme: IReadonlyTheme;

    /**
     * Localized strings that can be used in the Web Part
     */
    strings: any;

    /**
     * Flag indicating if a filter value has been selected at least once by the use
     */
    selectedOnce: boolean;

    /**
     * The filter Web Part properties
     */
    properties: ISearchFiltersWebPartProps;
}