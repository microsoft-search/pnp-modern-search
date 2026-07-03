import { IDataFilterConfiguration, IDataFilter, FilterConditionOperator } from "@pnp/modern-search-extensibility";

export interface IAllPeopleExpansionRequest {
    filterName: string;
    requestId: number;
    requestedAt: number;
}

export interface IDataFilterSourceData {

    /**
     * The current selected filters
     */
    selectedFilters: IDataFilter[];

    /**
     * The filters configuration for the Data Filter Web Part
     */
    filterConfiguration: IDataFilterConfiguration[];

    /**
     * The configured logical operator to use between filters
     */
    filterOperator: FilterConditionOperator;

    /**
     * The Web Part instance ID
     */
    instanceId: string;

    /**
     * The data source references this filter web part is connected to (used for bidirectional connection validation)
     */
    connectedResultsSourceReferences?: string[];

    /**
     * Optional manual expansion requests for the AllPeople template.
     * These are consumed by data sources to run additional segmented refiner calls.
     */
    allPeopleExpansionRequests?: IAllPeopleExpansionRequest[];
}