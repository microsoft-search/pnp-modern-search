import { IDataFilterResult } from "@pnp/modern-search-extensibility";

export interface IDataResultSourceData {

    /**
     * The available fields extracted from the data source results 
     */
    availableFieldsFromResults: string[];

    /**
     * The available filters from the data source results
     */
    availablefilters: IDataFilterResult[];
}