import { BaseSuggestionProvider, ISuggestion } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup } from '@microsoft/sp-property-pane';
import { ISharePointSearchService } from "../services/searchService/ISharePointSearchService";
import { SharePointSearchService } from "../services/searchService/SharePointSearchService";
import * as commonStrings from 'CommonStrings';

export interface ISharePointSuggestionProviderProperties {
  myProperty: string;
}

export class SharePointSuggestionProvider extends BaseSuggestionProvider<ISharePointSuggestionProviderProperties> {

    private _searchService: ISharePointSearchService;
  
    public async onInit(): Promise<void> {
        this.serviceScope.whenFinished(() => {
          this._searchService = this.serviceScope.consume<ISharePointSearchService>(SharePointSearchService.ServiceKey);
        });
    }
  
    public get isZeroTermSuggestionsEnabled(): boolean {
        return false;
    }
  
    public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
      const suggestions = await this._searchService.suggest(queryText);
      return suggestions.map<ISuggestion>(textSuggestion => ({
        displayText: textSuggestion,
        groupName: commonStrings.SuggestionProviders.SharePointStatic.ProviderName
      }));
    }
      
    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

       return [
       ];
    }
}