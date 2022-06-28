import { IDataFilterConfiguration } from '../filters/IDataFilterConfiguration';
import { IDataFilter, FilterConditionOperator } from '../filters/IDataFilter';
import { SortFieldDirection } from './SortFieldDirection';
import { IDataVertical } from '../verticals/IDataVertical';

/**
 * Provides useful information about the current Web Part context.
 */
export interface IDataContext {

    /**
     * The input query text if used (ex: from the page environment or search box dynamic data sources)
     */
    inputQueryText: string;

    /**
     * The current selected page number
     */
    pageNumber: number;

    /**
     * The number of items to show per page
     */
    itemsCountPerPage: number;

    /**
     * Information about connected filters
     */
    filters?: {

        /**
         * If connected to a 'Filters' Web Part, the filters configuration (will remain null otherwise)
         */
        filtersConfiguration?: IDataFilterConfiguration[];

        /**
         * The current selected filters for this data source
         */
        selectedFilters?: IDataFilter[];

        /**
         * The configured logical operator to use between filters
         */
        filterOperator?: FilterConditionOperator;

        /**
         * The connected filters Web Part instance ID
         */
        instanceId?: string;
    };

    /**
     * The sorting options
     */
    sorting?: {

        /**
         * The selected sortable fields configured by the user
         */
        selectedSortableFields?: string[];
 
        /**
         * The selected sort field name
         */
        selectedSortFieldName?: string;

        /**
         * The selected sort direction
         */
        selectedSortDirection?: SortFieldDirection;
    };

    /**
     * Information about connected verticals
     */
     verticals?: {
        /**
         * The current selected vertical information
         */
        selectedVertical: IDataVertical;
    };

    /**
     * Information about connected Data Visualizer or OOTB SharePoint sources
     */
    selectedItemValues?: string[];

    /**
     * Information about current query string parameters
     */
    queryStringParameters?: {[name: string]: string };
}