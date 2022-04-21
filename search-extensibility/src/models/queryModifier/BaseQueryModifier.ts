import { ServiceScope } from '@microsoft/sp-core-library';
import { IPropertyPaneGroup } from '@microsoft/sp-property-pane';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IDataContext } from '../dataSources/IDataContext';
import { IQueryModification } from './IQueryModification';
import { IQueryModifier } from './IQueryModifier';


export abstract class BaseQueryModifier<T> implements IQueryModifier {
        
    protected _properties!: T;
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

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        // Returns an empty configuration by default
        return [];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any): void {
        // Do nothing by default      
    }

    public modifyQuery(searchQuery: IQueryModification, dataContext:IDataContext): Promise<IQueryModification> {
        throw 'Not implemented';
    }
}
