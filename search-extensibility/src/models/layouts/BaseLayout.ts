import { ILayout } from './ILayout';

export abstract class BaseLayout<T, TContext = any> implements ILayout {

    private _properties!: T;
    private _context: TContext;
    private _editMode: boolean;
    protected serviceScope: any;

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

    public constructor(serviceScope: any) {
        this.serviceScope = serviceScope;
    }

    get editMode() {
      return this._editMode;
    }
    
    set editMode(editMode: boolean) {
        this._editMode = editMode;
    }

    public onInit(): void | Promise<void> {
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): any[] {
        // Return no option by default
        return [];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void {
        // Do nothing by default      
    }
}