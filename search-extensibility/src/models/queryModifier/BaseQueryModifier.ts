import { ServiceScope } from '@microsoft/sp-core-library';
import { IPropertyPaneGroup } from '@microsoft/sp-property-pane';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQueryModifier } from './IQueryModifier';

export abstract class BaseQueryModifier<T> implements IQueryModifier {

    protected _properties!: T;
    private _context: WebPartContext;
    protected serviceScope: ServiceScope;
    protected _endWhenSuccessfull: boolean;

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

    get endWhenSuccessfull(): boolean {
        return this._endWhenSuccessfull;
    }

    set endWhenSuccessfull(endWhenSuccessfull: boolean) {
        this._endWhenSuccessfull = endWhenSuccessfull;
    }

    public constructor(serviceScope: ServiceScope) {
        this.serviceScope = serviceScope;
    }

    public onInit(): void | Promise<void> {
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        // Returns an empty configuration by default
        return [];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void {
        // Do nothing by default      
    }

    public modifyQuery(queryText: string): Promise<string> {
        throw new Error('Not implemented: modifyQuery');
    }
}