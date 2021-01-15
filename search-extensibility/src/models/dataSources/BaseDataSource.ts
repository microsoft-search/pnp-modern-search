import { IDataSource, IServiceKeysConfiguration } from "./IDataSource";
import { IDataSourceData } from "./IDataSourceData";
import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";
import { ServiceScope, ServiceKey } from '@microsoft/sp-core-library';
import { PagingBehavior } from './PagingBehavior';
import { IDataContext } from './IDataContext';
import { FilterBehavior } from '../filters/FilterBehavior';
import { ITemplateSlot } from './ITemplateSlot';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataFilter } from '../..';

export abstract class BaseDataSource<T> implements IDataSource {

    protected serviceScope: ServiceScope;

    protected _properties: T;
    private _serviceKeys: IServiceKeysConfiguration;
    private _context: WebPartContext;
    private _render: () => void | Promise<void>;

    get properties(): T {
        return this._properties;
    }

    set properties(properties: T) {
        this._properties = properties;
    }

    get render(): () => void | Promise<void> {
        return this._render;
    }

    set render(renderFunc: () => void | Promise<void>) {
        this._render = renderFunc;
    }

    get context(): WebPartContext {
        return this._context;
    }

    set context(context: WebPartContext) {
        this._context = context;
    }

    get serviceKeys(): IServiceKeysConfiguration {
        return this._serviceKeys;
    }

    set serviceKeys(keys: IServiceKeysConfiguration) {
        this._serviceKeys = keys;
    }

    public constructor(serviceScope: ServiceScope) {
        this.serviceScope = serviceScope;
    }

    public onInit(): void | Promise<void> {
    }

    public abstract async getData(dataContext?: IDataContext): Promise<IDataSourceData>;

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        // Returns an empty configuration by default
        return [];
    }

    public getPagingBehavior(): PagingBehavior {

        // Paging by default
        return PagingBehavior.Dynamic;
    }

    public getFilterBehavior(): FilterBehavior {

        // Filtering capabilioty by default
        return FilterBehavior.Static;
    }

    public getAppliedFilters(): IDataFilter[] {
        return [];
    }

    public abstract getItemCount(): number;

    public getTemplateSlots(): ITemplateSlot[] {

        // No slots by default
        return [];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void {
        // Do nothing by default      
    }
}