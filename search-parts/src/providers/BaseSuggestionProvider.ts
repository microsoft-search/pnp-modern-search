import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ISuggestion } from '../models/ISuggestion';

export abstract class BaseSuggestionProvider {

    // Property set by the Suggestion via prototype
    public _ctx: WebPartContext;

    public async onInit(): Promise<void> {

    }

    public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
      throw 'Not implemented';
    }

    public async getZeroTermSuggestions(): Promise<ISuggestion[]> {
      throw 'Not implemented';
    }

  }
