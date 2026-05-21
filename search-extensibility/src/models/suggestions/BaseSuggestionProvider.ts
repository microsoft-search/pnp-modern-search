import { ISuggestionProvider } from './ISuggestionProvider';
import { ISuggestion } from './ISuggestion';

export abstract class BaseSuggestionProvider<T, TContext = any> implements ISuggestionProvider {
    
    protected _isZeroTermSuggestionsEnabled: boolean;
    protected _properties!: T;
    private _context: TContext;
    protected serviceScope: any;

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
    
    get context(): TContext {
        return this._context;
    }

    set context(context: TContext) {
        this._context = context;
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

    public getSuggestions(queryText: string): Promise<ISuggestion[]> {
        throw 'Not implemented';
    }

    public getZeroTermSuggestions(): Promise<ISuggestion[]> {
        throw 'Not implemented';
    }
}
