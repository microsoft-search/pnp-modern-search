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

    /**
     * The Hanlebars context available for consumers
     */
    handlebarsContext?: typeof Handlebars;

    /**
     * The current selected items in the Search Results Web Part
     */
    selectedItems?: {[key: string]: string}[];

    /**
     * The count of items returned by the getItemCount method of a datasource
     */
    totalCount?:number;
}