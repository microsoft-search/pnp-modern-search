import { IDataSourceData } from "./IDataSourceData";
import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";
import { PagingBehavior } from './PagingBehavior';
import { IDataContext } from './IDataContext';
import { ServiceKey } from "@microsoft/sp-core-library";
import { FilterBehavior } from '../filters/FilterBehavior';
import { ITemplateSlot } from './ITemplateSlot';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IDataFilter } from '../filters/IDataFilter';

export interface IServiceKeysConfiguration {

    /***
     * The token service service key
     */
    TokenService: ServiceKey<any>;
}

export interface IDataSource {

    /**
     * The Web Part properties in the property bag. Corresponds to the isolated 'dataSourceProperties' property in the global property bag.
     */
    properties: any;

    /**
     * This API is called to render the web part.
     */
    render: () => void | Promise<void>;

    /**
     * Context of the main Web Part
     */
    context: WebPartContext;

    /**
     * List of available service keys you can use in your data source to consume shared services.
     */
    serviceKeys: IServiceKeysConfiguration;

    /**
     * Method called during the Web Part initialization.
     */
    onInit(): void | Promise<void>;

    /**
     * Retrieves the data from this data source.
     * @param dataContext useful information about the current Web Part context (for instance, current page number, etc.).
     */
    getData(dataContext?: IDataContext): Promise<IDataSourceData>;

    /**
     * Returns the data source property pane option fields if any.
     */
    getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[];

    /**
     * The paging behavior for the data source. Will be 'None' if not specified.
     */
    getPagingBehavior(): PagingBehavior;

    /**
     * The filter behavior for the data source. Will be 'Static' if not specified.
     */
    getFilterBehavior(): FilterBehavior;

    /**
     * If any, returns the list of filters (i.e data source fields) applied by the data source to filter results.
     * Set this information in your data source is FilterType.Static but you still want filter initial result with 'Static' filters (like Taxonomy Picker and Date Range)
     * These will be excluded by the main Web Part during the static filtering operation. If you forgot to set these values, data will be filtered statically using the current selected filters.
     */
    getAppliedFilters(): IDataFilter[];

    /**
     * Returns the total of items. This can be the `items` array length or the total of items in general. This information will be used to generate page numbers.
     */
    getItemCount(): number;
    
    /**
     * Returns the available template slots for this data source.
     */
    getTemplateSlots(): ITemplateSlot[];

    /**
     * Method called when a property pane field in changed in the Web Part.
     * @param propertyPath the property path.
     * @param oldValue the old value.
     * @param newValue the new value.
     */
    onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void;
}