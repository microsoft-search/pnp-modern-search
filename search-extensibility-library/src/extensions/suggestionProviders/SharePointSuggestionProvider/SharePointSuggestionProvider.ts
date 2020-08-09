import { BaseSuggestionProvider, ISuggestion } from 'search-extensibility';
import * as strings from 'SearchExtensibilityReferenceExtensionLibraryStrings';

export default class SharePointSuggestionProvider extends BaseSuggestionProvider  {
  
  public getZeroTermSuggestions(): Promise<ISuggestion[]> {
      throw new Error("Method not implemented.");
  }

  public async onInit(): Promise<void> {
    
  }

  public get isSuggestionsEnabled(): boolean {
    return true;
  }

  public get isZeroTermSuggestionsEnabled(): boolean {
    return false;
  }

  public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
    const suggestions = await this.context.search.suggest(queryText);
    return suggestions.map<ISuggestion>(textSuggestion => ({
      displayText: textSuggestion,
      groupName: strings.Extensions.Suggestion.SharePoint.GroupName
    }));
  }

}
