import { BaseSuggestionProvider } from '../models/BaseSuggestionProvider';
import { ISuggestion } from '../models/ISuggestion';

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
          icon: PARKER_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          description:'aka.ms/sppnp',
          hoverText: `The SharePoint Development Community (also known as the SharePoint PnP community) is an open-source initiative coordinated by SharePoint engineering. This community controls SharePoint development documentation, samples, reusable controls, and other relevant open-source initiatives related to SharePoint development.`,
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
          displayText: `SPFx Training`,
          groupName: 'SharePoint Framework',
          icon: PNP_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          description: 'Sample Suggestion',
          hoverText: `Sample Suggestion for ${queryText}`
        },
        {
          displayText: `SPFx Documentation`,
          groupName: 'SharePoint Framework',
          icon: PARKER_ICON_URL,
          onSuggestionSelected: this._onSuggestionSelected,
          description: 'Sample Suggestion',
          hoverText: `Sample Suggestion for ${queryText}`
        }
      ];

      return sampleSuggestions.filter(sg => sg.displayText.toLowerCase().match(`\\b${queryText.trim().toLowerCase()}`));
  }

}
