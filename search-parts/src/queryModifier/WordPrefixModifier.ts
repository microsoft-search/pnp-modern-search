import { BaseQueryModifier, IDataContext, IQueryModification } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneTextField, PropertyPaneToggle } from '@microsoft/sp-property-pane';
// todo
import * as commonStrings from 'CommonStrings';

export interface IWordPrefixModifierProperties {
  modifierText: string;
}

export class WordPrefixModifier extends BaseQueryModifier<IWordPrefixModifierProperties> {

  private _regex: RegExp;

  public async onInit(): Promise<void> {
    this._regex = new RegExp('\\b[\\w.]+\\b', 'gm');
  }

  public async modifyQuery(searchQuery: IQueryModification, dataContext: IDataContext): Promise<IQueryModification> {

    this._regex.lastIndex = 0;

    const s = searchQuery?.queryText.replace(this._regex, (match => {
      return  ['OR', 'AND'].some(_ => _ === match) ? match : `${match}${this.properties.modifierText}`;      
    }));

    
    return {
      queryText: s,
      queryTemplate: searchQuery.queryTemplate
    };

  }

  public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

    return [
      {
        groupName: commonStrings.BuiltInQueryModifiers.WordPrefixModifier.GroupName,
        groupFields: [
          PropertyPaneTextField('queryModifierProperties.modifierText', {
            label: commonStrings.BuiltInQueryModifiers.WordPrefixModifier.ModifierTextLabel,
            description: commonStrings.BuiltInQueryModifiers.WordPrefixModifier.ModifierTextDescription,
            placeholder: commonStrings.BuiltInQueryModifiers.WordPrefixModifier.ModifierTextPlaceholder,            
          })
        ],
      },
    ];
  }
}