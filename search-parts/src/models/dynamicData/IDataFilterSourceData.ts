import { IDataFilterConfiguration, IDataFilter, FilterConditionOperator } from "@pnp/modern-search-extensibility";

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
}