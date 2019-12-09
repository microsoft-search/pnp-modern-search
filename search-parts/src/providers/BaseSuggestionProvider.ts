import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISuggestion } from '../models/ISuggestion';

export abstract class BaseSuggestionProvider {

    // Property set by the Suggestion via prototype
    protected _ctx: WebPartContext;

    constructor(context: WebPartContext) {
      this._ctx = context;
    }

    public async onInit(): Promise<void> {

    }

    public get isSuggestionsEnabled(): boolean {
      return false;
    }

    public get isZeroTermSuggestionsEnabled(): boolean {
      return false;
    }

    public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
      throw 'Not implemented';
    }

    public async getZeroTermSuggestions(): Promise<ISuggestion[]> {
      throw 'Not implemented';
    }

  }
