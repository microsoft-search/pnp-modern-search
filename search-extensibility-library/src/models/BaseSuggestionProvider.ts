import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISuggestion } from './ISuggestion';

export abstract class BaseSuggestionProvider {

  protected _ctx: WebPartContext;

  protected constructor(context: WebPartContext) {
      this._ctx = context;
  }

  // Override these in derived classes (abstract static types not supported in TypeScript)
  public static readonly ProviderName: string = 'basesuggestionprovider';
  public static readonly ProviderDisplayName: string = 'Base Suggestion Provider';
  public static readonly ProviderDescription: string = '';

  public abstract get isSuggestionsEnabled(): boolean;

  public abstract get isZeroTermSuggestionsEnabled(): boolean;

  public async onInit(): Promise<void> {

  }

  public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
      throw 'Not implemented';
  }

  public async getZeroTermSuggestions(): Promise<ISuggestion[]> {
      throw 'Not implemented';
  }

}
