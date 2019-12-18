import { BaseSuggestionProvider } from '../models/BaseSuggestionProvider';
import { ISuggestion } from '../models/ISuggestion';
import { SuggestionType } from '../models/SuggestionType';

const PARKER_ICON_URL = 'https://raw.githubusercontent.com/pnp/media/master/parker/pnp/300w/parker.png';
const PNP_ICON_URL = 'https://raw.githubusercontent.com/pnp/media/master/pnp-logos-generics/png/teal/300w/pnp-samples-teal-300.png';

export class CustomSuggestionProvider extends BaseSuggestionProvider  {

  private _zeroTermSuggestions: ISuggestion[] = [];

  public static readonly ProviderName: string = 'custom-suggestion-provider';
  public static readonly ProviderDisplayName: string = 'Custom Suggestion Provider';
  public static readonly ProviderDescription: string = 'An example custom suggestion provider.';

  public async onInit(): Promise<void> {
      this._onSuggestionSelected.bind(this);

      // this._ctx // SPFx Webpart Context

      this._zeroTermSuggestions = [
        {
          displayText: 'SharePoint Patterns and Practices',
          groupName: 'Custom Suggestions',
          type: SuggestionType.Content,
          icon: PARKER_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          targetUrl: 'https://aka.ms/sppnp'
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
      return [
        {
          displayText: `Sample Suggestion for ${queryText}`,
          groupName: 'Custom Suggestions',
          type: SuggestionType.Content,
          icon: PNP_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
        }
      ];
  }

}
