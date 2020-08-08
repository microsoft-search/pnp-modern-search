import { BaseSuggestionProvider, ISuggestion } from 'search-extensibility';
import * as strings from 'SearchExtensibilityReferenceExtensionLibraryStrings';

const PARKER_ICON_URL = 'https://raw.githubusercontent.com/pnp/media/master/parker/pnp/300w/parker.png';
const PNP_ICON_URL = 'https://raw.githubusercontent.com/pnp/media/master/pnp-logos-generics/png/teal/300w/pnp-samples-teal-300.png';

export default class CustomSuggestionProvider extends BaseSuggestionProvider  {

  private _zeroTermSuggestions: ISuggestion[] = [];

  public async onInit(): Promise<void> {
      this._onSuggestionSelected.bind(this);

      // this._ctx // SPFx Webpart Context
      this._zeroTermSuggestions = [
        {
          displayText: strings.Extensions.Suggestion.Custom.Zero.DisplayText,
          groupName: strings.Extensions.Suggestion.Custom.GroupName,
          icon: PARKER_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          description:strings.Extensions.Suggestion.Custom.Zero.Description,
          hoverText: strings.Extensions.Suggestion.Custom.Zero.HoverText,
          targetUrl: 'https://aka.ms/sppnp',
        }
      ];

  }

  public get isSuggestionsEnabled(): boolean {
      return true;
  }

  public get isZeroTermSuggestionsEnabled(): boolean {
      return true;
  }

  public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
      return this._getSampleSuggestions(queryText);
  }

  public async getZeroTermSuggestions(): Promise<ISuggestion[]> {
      return this._zeroTermSuggestions;
  }

  private _onSuggestionSelected = (suggestion: ISuggestion): void => {
      console.log(`Suggestion Selected`, suggestion);
  }

  private _getSampleSuggestions = async (queryText: string): Promise<ISuggestion[]> => {
      const sampleSuggestions = [
        {
          displayText: strings.Extensions.Suggestion.Custom.ResultOne.DisplayText,
          groupName: strings.Extensions.Suggestion.Custom.ResultOne.GroupName,
          icon: PNP_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          description: strings.Extensions.Suggestion.Custom.ResultTwo.Description,
          hoverText: `Sample Suggestion for ${queryText}`
        },
        {
          displayText: strings.Extensions.Suggestion.Custom.ResultTwo.DisplayText,
          groupName: strings.Extensions.Suggestion.Custom.ResultTwo.GroupName,
          icon: PARKER_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          description: strings.Extensions.Suggestion.Custom.ResultTwo.Description,
          hoverText: `Sample Suggestion for ${queryText}`
        }
      ];

      return sampleSuggestions.filter(sg => sg.displayText.toLowerCase().match(`\\b${queryText.trim().toLowerCase()}`));
  }

}
