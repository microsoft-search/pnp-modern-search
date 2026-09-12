import { IDataFilterResult } from "@pnp/modern-search-extensibility";
import { IExtensibilityConfiguration } from "../common/IExtensibilityConfiguration";

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
     * Indicates whether the results source is retrieving data.
     */
    isLoading?: boolean;

    /**
     * The Hanlebars context available for consumers
     */
    handlebarsContext?: typeof Handlebars;

    /**
     * The current selected items in the Search Results Web Part
     */
    selectedItems?: { [key: string]: string }[];

    /**
     * The count of items returned by the getItemCount method of a datasource
     */
    totalCount?: number;

    /**
     * The filter data source reference this results web part is connected to (used for bidirectional connection validation)
     */
    connectedFilterSourceReference?: string;

    /**
     * Enabled extensibility libraries configured on this Search Results Web Part.
     * Search Filters instances saved before they had their own extensibility setting
     * can inherit these through their existing dynamic-data connection.
     */
    extensibilityLibraryConfiguration?: IExtensibilityConfiguration[];
}