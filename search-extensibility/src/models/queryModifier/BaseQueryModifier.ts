import { IQueryModifier } from './IQueryModifier';

export abstract class BaseQueryModifier<T, TContext = any> implements IQueryModifier {

    protected _properties!: T;
    private _context: TContext;
    protected serviceScope: any;
    protected _endWhenSuccessfull: boolean;

    get properties(): T {
        return this._properties;
    }

    set properties(properties: T) {
        this._properties = properties;
    }

    get context(): TContext {
        return this._context;
    }

    set context(context: TContext) {
        this._context = context;
    }

    get endWhenSuccessfull(): boolean {
        return this._endWhenSuccessfull;
    }

    set endWhenSuccessfull(endWhenSuccessfull: boolean) {
        this._endWhenSuccessfull = endWhenSuccessfull;
    }

    public constructor(serviceScope: any) {
        this.serviceScope = serviceScope;
    }

    public onInit(): void | Promise<void> {
    }

    public getPropertyPaneGroupsConfiguration(): any[] {

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