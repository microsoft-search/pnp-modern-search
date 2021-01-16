import { ILayout } from './ILayout';
import { IPropertyPaneField } from "@microsoft/sp-property-pane";
import { ServiceScope } from '@microsoft/sp-core-library';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export abstract class BaseLayout<T> implements ILayout {

    private _properties!: T;
    private _context: WebPartContext;
    protected serviceScope: ServiceScope;

    get properties(): T {
        return this._properties;
    }

    set properties(properties: T) {
        this._properties = properties;
    }

    get context(): WebPartContext {
        return this._context;
    }

    set context(context: WebPartContext) {
        this._context = context;
    }

    public constructor(serviceScope: ServiceScope) {
        this.serviceScope = serviceScope;
    }

    public onInit(): void | Promise<void> {
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {
        // Return no option by default
        return [];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void {
        // Do nothing by default      
    }
}