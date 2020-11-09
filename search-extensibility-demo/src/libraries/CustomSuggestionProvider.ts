import { BaseSuggestionProvider, ISuggestion } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneTextField } from '@microsoft/sp-property-pane';

const PARKER_ICON_URL = 'https://raw.githubusercontent.com/pnp/media/master/parker/pnp/300w/parker.png';
const PNP_ICON_URL = 'https://raw.githubusercontent.com/pnp/media/master/pnp-logos-generics/png/teal/300w/pnp-samples-teal-300.png';

export interface ICustomSuggestionProviderProperties {
  myProperty: string;
}

export class CustomSuggestionProvider extends BaseSuggestionProvider<ICustomSuggestionProviderProperties> {

    private _zeroTermSuggestions: ISuggestion[] = [];
  
    public async onInit(): Promise<void> {

        this._onSuggestionSelected.bind(this);
    
        this._zeroTermSuggestions = [
          {
            displayText: 'SharePoint Patterns and Practices',
            groupName: 'Custom Suggestions',
            iconSrc: PARKER_ICON_URL,
            onSuggestionSelected: this._onSuggestionSelected,
            description:'aka.ms/sppnp',
            hoverText: `The SharePoint Development Community (also known as the SharePoint PnP community) is an open-source initiative coordinated by SharePoint engineering. This community controls SharePoint development documentation, samples, reusable controls, and other relevant open-source initiatives related to SharePoint development.`,
            targetUrl: 'https://aka.ms/sppnp',
          }
        ];
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
            displayText: `PnP Powershell`,
            groupName: 'PnP',
            iconSrc: PNP_ICON_URL,
            onSuggestionSelected: this._onSuggestionSelected,
            description: 'Sample Suggestion',
            hoverText: `Sample Suggestion for ${queryText}`
          },
          {
            displayText: `PnP Office 365 CLI`,
            groupName: 'PnP',
            iconSrc: PARKER_ICON_URL,
            onSuggestionSelected: this._onSuggestionSelected,
            description: 'Sample Suggestion',
            hoverText: `Sample Suggestion for ${queryText}`
          },
          {
            displayText: `SharePoint docs`,
            groupName: 'SharePoint 2019',
            iconSrc: PNP_ICON_URL,
            onSuggestionSelected: this._onSuggestionSelected,
            description: 'Sample Suggestion',
            hoverText: `Sample Suggestion for ${queryText}`
          },
          {
            displayText: `Boundaries`,
            groupName: 'SharePoint 2019',
            iconSrc: PARKER_ICON_URL,
            onSuggestionSelected: this._onSuggestionSelected,
            description: 'Sample Suggestion',
            hoverText: `Sample Suggestion for ${queryText}`
          }
        ];
  
        return sampleSuggestions.filter(sg => sg.displayText.toLowerCase().match(`\\b${queryText.trim().toLowerCase()}`));
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

       return [
         {
           groupName: 'Custom Search Suggestions',
           groupFields: [
             PropertyPaneTextField('providerProperties.myProperty', {
              label: 'My property'
             })
           ]
         }
       ];
    }
}