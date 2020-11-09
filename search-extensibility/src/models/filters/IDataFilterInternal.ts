import { IDataFilter, IDataFilterValue } from "./IDataFilter";

/**
 * This interface is used to display filter information in the Handlebars template
 */
export interface IDataFilterInternal extends IDataFilter {
    
    /**
     * The filter values
     */
    values: IDataFilterValueInternal[];

    /**
     * The filter internal name (i.e the data source field to filter on)
     */
    filterName: string;

    /**
     * The filter display name
     */
    displayName: string;

    /**
     * The template to use for that filter
     */
    selectedTemplate: string;

    /**
     * Indicates if the filter has values currently selected
     */
    hasSelectedValues?: boolean;

    /**
     * If the filter should expand values by default
     */
    expandByDefault: boolean;

    /**
     * If the filter should show count for values
     */
    showCount: boolean;

    /**
     * Indicates if a filter value has been selected at least once
     */
    selectedOnce?: boolean;

    /**
     * Indicates if the filter supports multi values
     */
    isMulti: boolean;

    /**
     * The associated taxonomy items IDs (used for Taxonomy Picker control)
     */
    taxonomyItemIds?: string[];

    /**
     * Flag determining if the all filter values could be cleared
     */
    canClear?: boolean;

    /**
     * Flag determining if the selected filter values could be applied (ex: new values selected compared to the initial ones)
     */
    canApply?: boolean;

    /**
     * The index of this filter in the configuration
     */
    sortIdx: number;
}

export interface IDataFilterValueInternal extends IDataFilterValue {

    /**
     * Indicates if the value is currently selected
     */
    selected: boolean;

    /**
     * Indicates if the value should be disabled
     */
    disabled?: boolean;

    /**
     * Indicates if the value has been selected at least once
     */
    selectedOnce: boolean;

    /**
     * The number of results with this value
     */
    count?: number;
}