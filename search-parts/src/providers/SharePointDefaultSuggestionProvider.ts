import { BaseSuggestionProvider } from './BaseSuggestionProvider';
import { ISuggestion } from '../models/ISuggestion';
import SearchService from '../services/SearchService/SearchService';
import * as strings from 'SearchBoxWebPartStrings';

export class SharePointDefaultSuggestionProvider extends BaseSuggestionProvider  {

  private _searchService: SearchService;

  public static readonly ProviderName: string = 'default';
  public static readonly ProviderDisplayName: string = 'SharePoint Query Suggestions';
  public static readonly ProviderDescription: string = 'Default SharePoint query suggestions.';

  public async onInit(): Promise<void> {
    this._searchService = new SearchService(this._ctx.pageContext, this._ctx.spHttpClient);
  }

  public get isSuggestionsEnabled(): boolean {
    return true;
  }

  public get isZeroTermSuggestionsEnabled(): boolean {
    return false;
  }

  public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
    const suggestions = await this._searchService.suggest(queryText);
    return suggestions.map<ISuggestion>(textSuggestion => ({
      displayText: textSuggestion,
      groupName: strings.SuggestionProviders.SharePointSuggestionGroupName
    }));
  }
}
