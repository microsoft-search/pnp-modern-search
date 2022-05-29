import { BaseQueryModifier, IDataContext, IQueryModification } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import * as commonStrings from 'CommonStrings';
import { PropertyPaneAsyncCombo } from "../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import { IComboBoxOption } from "office-ui-fabric-react/lib/ComboBox";

export interface IWordModifierProperties {
  prefix: string;
  suffix: string;
  ignoreList: string[];
}

export class WordModifier extends BaseQueryModifier<IWordModifierProperties> {

  private _regex: RegExp;

  private _availableOptions=[{
    key: "AND",
    text: "AND",
} as IComboBoxOption,{
  key: "OR",
  text: "OR",
}as IComboBoxOption];
  public async onInit(): Promise<void> {
    this._regex = new RegExp('\\b[\\w.]+\\b', 'gm');
  }

  public async modifyQuery(searchQuery: IQueryModification, dataContext: IDataContext, resolveTokens:(string: string) => Promise<string>): Promise<IQueryModification> {

    this._regex.lastIndex = 0;

    const s = searchQuery?.queryText?.replace(this._regex, (match => {
      return  this.properties.ignoreList && this.properties.ignoreList.some(_ => _.toLocaleLowerCase() === match.toLocaleLowerCase()) ? match : `${this.properties.prefix}${match}${this.properties.suffix}`;      
    }));

    
    return {
      queryText: s,
      queryTemplate: searchQuery.queryTemplate
    };

  }

  
  private _onCustomPropertyUpdate(propertyPath: string, newValue: any): void {

       this.properties.ignoreList = newValue?.map(v => { return v.key as string; }) ?? [];
        
}

  public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

    return [
      {
        groupName: commonStrings.BuiltInQueryModifiers.WordModifier.GroupName,
        groupFields: [
          PropertyPaneTextField('queryModifierProperties.prefix', {
            label: commonStrings.BuiltInQueryModifiers.WordModifier.PrefixLabel,
            description: commonStrings.BuiltInQueryModifiers.WordModifier.PrefixDescription,
            placeholder: commonStrings.BuiltInQueryModifiers.WordModifier.PrefixPlaceholder,            
          }),
          PropertyPaneTextField('queryModifierProperties.suffix', {
            label: commonStrings.BuiltInQueryModifiers.WordModifier.SuffixLabel,
            description: commonStrings.BuiltInQueryModifiers.WordModifier.SuffixDescription,
            placeholder: commonStrings.BuiltInQueryModifiers.WordModifier.SuffixPlaceholder,            
          }),
          
            new PropertyPaneAsyncCombo('queryModifierProperties.ignoreList', {
              
                availableOptions: this._availableOptions,
                allowMultiSelect: true,
                allowFreeform: true,                
                description: commonStrings.BuiltInQueryModifiers.WordModifier.IgnoreListDescription,     
                label: commonStrings.BuiltInQueryModifiers.WordModifier.IgnoreListLabel,
                searchAsYouType: false,
                defaultSelectedKeys: this.properties.ignoreList,
                onPropertyChange: this._onCustomPropertyUpdate.bind(this),
                onUpdateOptions: ((options: IComboBoxOption[]) => {
                    this._availableOptions = options;
                }).bind(this)
            })
        ],
      },
    ];
  }
}