import { ServiceScope } from '@microsoft/sp-core-library';
import { ISuggestionProvider } from './ISuggestionProvider';
import { ISuggestion } from './ISuggestion';
import { IPropertyPaneGroup } from '@microsoft/sp-property-pane';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export abstract class BaseSuggestionProvider<T> implements ISuggestionProvider {
    
    protected _isZeroTermSuggestionsEnabled: boolean;
    protected _properties!: T;
    private _context: WebPartContext;
    protected serviceScope: ServiceScope;

    get properties(): T {
        return this._properties;
    }

    set properties(properties: T) {
        this._properties = properties;
    }

    get isZeroTermSuggestionsEnabled(): boolean {
        return this._isZeroTermSuggestionsEnabled;
    }

    set isZeroTermSuggestionsEnabled(isZeroTermSuggestionsEnabled: boolean) {
        this._isZeroTermSuggestionsEnabled = isZeroTermSuggestionsEnabled;
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

    public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
        throw 'Not implemented';
    }

    public async getZeroTermSuggestions(): Promise<ISuggestion[]> {
        throw 'Not implemented';
    }
}
