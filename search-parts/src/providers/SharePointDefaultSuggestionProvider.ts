import { BaseSuggestionProvider } from './BaseSuggestionProvider';
import { ISuggestion } from '../models/ISuggestion';
import SearchService from '../services/SearchService/SearchService';

export class SharePointDefaultSuggestionProvider extends BaseSuggestionProvider  {

  private _searchService: SearchService;

  public async onInit(): Promise<void> {
    this._searchService = new SearchService(this._ctx.pageContext, this._ctx.spHttpClient);
  }

  public get isSuggestionsEnabled(): boolean {
    return true;
  }

  public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
    const suggestions = await this._searchService.suggest(queryText);
    return suggestions.map<ISuggestion>(textSuggestion => ({ text: textSuggestion }));
  }

}
