import { FilterConditionOperator } from '../..';

export enum FilterType {

    /**
     * A 'Refiner' filter means the filter gets the filters values from the data source and sends back the selected ones the data source.
     */
    Refiner = 'Refiner',

    /**
     * An 'Static' filter means the filter doesn't care about filter values sent by the data source and provides its own arbitrary values regardless of input values. 
     * A date picker or a taxonomy picker (or any picker) are good examples of what an 'Out' filter is.
     */
    StaticFilter = 'StaticFilter'
}

export enum FilterSortType {

    /**
     * Sort filter values by their count
     */
    ByCount = 'ByCount',

    /**
     * Sort filter values by their display name
     */
    ByName = 'ByName'
}

export enum FilterSortDirection {
    Ascending = 'Ascending',
    Descending = 'Descending'
}

export interface IDataFilterConfiguration {

    /**
     * The internal filter name (ex: corresponding either to data source field name or refinable search managed property in the case of SharePoint)
     */
    filterName: string;

    /**
     * The template to use for that filter
     */
    selectedTemplate: string;

    /**
     * The flter name to display in the UI
     */
    displayValue: string;

    /**
     * Specifies if the filter should show values count
     */
    showCount: boolean;

    /**
     * Flag indicating if the filter show be expanded by default or not
     */
    expandByDefault?: boolean;

    /**
     * The operator to use between filter values
     */
    operator: FilterConditionOperator;

    /**
     * Indicates if the filter allows multi values
     */
    isMulti: boolean;

    /**
     * The type of the filter ('Refiner' or 'Static Filter')
     */
    type: FilterType;

    /**
     * The associated taxonomy items IDs (used for Taxonomy Picker control)
     */
    taxonomyItemIds?: string[];

    /**
     * If the filter should be sorted by name or by count
     */
    sortBy: FilterSortType;

    /**
     * The filter values sort direction (ascending/descending)
     */
    sortDirection: FilterSortDirection;

    /**
     * The index of this filter in the configuration
     */
    sortIdx: number;

    /**
     * Number of buckets to fetch
     */
    maxBuckets: number;

    /**
    * Range definition
    */
    rangeDefinition: number;
}