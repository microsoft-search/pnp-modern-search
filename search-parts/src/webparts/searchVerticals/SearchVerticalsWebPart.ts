import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Guid } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  IPropertyPanePage,
  IPropertyPaneField
} from '@microsoft/sp-property-pane';
import * as commonStrings from 'CommonStrings';
import * as webPartStrings from 'SearchVerticalsWebPartStrings';
import { ISearchVerticalsContainerProps } from './components/ISearchVerticalsContainerProps';
import { ISearchVerticalsWebPartProps } from './ISearchVerticalsWebPartProps';
import { TextField, ITextFieldProps, Dropdown, IDropdownProps } from 'office-ui-fabric-react';
import SearchVerticalsContainer from './components/SearchVerticalsContainer';
import { ComponentType } from '../../common/ComponentType';
import { IDataVertical } from '../../models/common/IDataVertical';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { IDataVerticalSourceData } from '../../models/dynamicData/IDataVerticalSourceData';
import { PageOpenBehavior } from '../../helpers/UrlHelper';
import { TokenService } from '../../services/tokenService/TokenService';
import { ITokenService } from '@pnp/modern-search-extensibility';
import { BaseWebPart } from '../../common/BaseWebPart';
import commonStyles from '../../styles/Common.module.scss';

export default class SearchVerticalsWebPart extends BaseWebPart<ISearchVerticalsWebPartProps> implements IDynamicDataCallables {

  /**
   * Dynamically loaded components for property pane
   */
  private _propertyFieldCollectionData: any = null;
  private _customCollectionFieldType: any = null;

  /**
   * The current selected vertical
   */
  private _selectedVertical: IDataVertical;

  /**
   * The token service instance
   */
  private tokenService: ITokenService;

  public constructor() {
    super();

    this.onVerticalSelected = this.onVerticalSelected.bind(this);
  }

  protected async onInit(): Promise<void> {

    // Initializes Web Part properties
    this.initializeProperties();

    // Initializes shared services
    await this.initializeBaseWebPart();

    // Initializes the Web Part instance services
    this.initializeWebPartServices();

    // Initializes this component as a discoverable dynamic data source
    this.context.dynamicDataSourceManager.initializeSource(this);
  }

  public render(): void {

    let renderRootElement: JSX.Element = null;

    renderRootElement = React.createElement(
      SearchVerticalsContainer,
      {
          verticals: this.properties.verticals,
          webPartTitleProps: {
          displayMode: this.displayMode,
          title: this.properties.title,
          updateProperty: (value: string) => {
            this.properties.title = value;
          },
          className: commonStyles.wpTitle
        },
        tokenService: this.tokenService,
        themeVariant: this._themeVariant,
        onVerticalSelected: this.onVerticalSelected.bind(this)
      } as ISearchVerticalsContainerProps
    );
    
    ReactDom.render(renderRootElement, this.domElement);
  }

  public getPropertyDefinitions(): IDynamicDataPropertyDefinition[] {
    // Use the Web Part title as property title since we don't expose sub properties
    return [
       {
           id: ComponentType.SearchVerticals,
           title: this.properties.title ? `${this.properties.title} - ${this.instanceId}` : `${webPartStrings.General.WebPartDefaultTitle} - ${this.instanceId}`
       }
    ];
  }  

  public getPropertyValue(propertyId: string) {
    switch (propertyId) {

      case ComponentType.SearchVerticals:
            return { 
              selectedVertical: this._selectedVertical,
              verticalsConfiguration: this.properties.verticals,
            } as IDataVerticalSourceData;

      default:
          throw new Error('Bad property id');
    }
  }

  protected onPropertyPaneFieldChanged(propertyPath: string) {
    
    if (propertyPath.localeCompare('verticals') === 0) {

      // Generate an unique key for verticals to be able to identify them precisely in sub components instead using the vertical display name (can be duplicated).
      this.properties.verticals = this.properties.verticals.map(vertical => {
        vertical.key = vertical.key ? vertical.key : Guid.newGuid().toString();
        return vertical;
      });
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    let propertyPanePages: IPropertyPanePage[] = [];

    propertyPanePages.push(
      {
        groups: [
          {
            groupName: webPartStrings.PropertyPane.SearchVerticalsGroupName,
            groupFields: this._getVerticalsConfguration()
          }
        ],
        displayGroupsAsAccordion: true
      }
    );

    // 'About' infos
    propertyPanePages.push(      
      {
        displayGroupsAsAccordion: true,
        groups: [
          ...this.getPropertyPaneWebPartInfoGroups()
        ]
      }
    );

    return {
      pages: propertyPanePages
    };
  }

  protected async onPropertyPaneConfigurationStart() {
    await this.loadPropertyPaneResources();
  }

  protected async loadPropertyPaneResources(): Promise<void> {

    // tslint:disable-next-line:no-shadowed-variable
    const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
        /* webpackChunkName: 'search-property-pane' */
        '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
    );

    this._propertyFieldCollectionData = PropertyFieldCollectionData;
    this._customCollectionFieldType = CustomCollectionFieldType;
  }

  private _getVerticalsConfguration(): IPropertyPaneField<any>[] {

    let settingFields: IPropertyPaneField<any>[] = [
      this._propertyFieldCollectionData('verticals', {
        manageBtnLabel: webPartStrings.PropertyPane.Verticals.ButtonLabel,
        key: 'verticals',
        panelHeader: webPartStrings.PropertyPane.Verticals.PanelHeader,
        panelDescription: webPartStrings.PropertyPane.Verticals.PanelDescription,
        enableSorting: true,
        label: webPartStrings.PropertyPane.Verticals.PropertyLabel,
        value: this.properties.verticals,
        fields: [
            {
              id: 'tabName',
              title: webPartStrings.PropertyPane.Verticals.Fields.TabName,
              type: this._customCollectionFieldType.string,
              required: true
            },
            {
              id: 'iconName',
              title: webPartStrings.PropertyPane.Verticals.Fields.IconName,
              type: this._customCollectionFieldType.string,
              required: false
            },
            {
              id: 'isLink',
              title: webPartStrings.PropertyPane.Verticals.Fields.IsLink,
              type: this._customCollectionFieldType.boolean,
              required: false
            },
            {
              id: 'linkUrl',
              title: webPartStrings.PropertyPane.Verticals.Fields.LinkUrl,
              type: this._customCollectionFieldType.custom,
              onCustomRender: (field, value, onUpdate, item) => {
                return (
                    React.createElement("div", null,
                        React.createElement(TextField, {
                            defaultValue: value,
                            disabled: item.isLink ? false : true,
                            placeholder: 'https://...',
                            onChange: (ev, newValue) => {
                              onUpdate(field.id, newValue);
                            } 
                        } as ITextFieldProps)
                    )
                );
              }
            },
            {
              id: 'openBehavior',
              title: webPartStrings.PropertyPane.Verticals.Fields.OpenBehavior,
              type: this._customCollectionFieldType.custom,
              onCustomRender: (field, value, onUpdate, item) => {
                return (
                    React.createElement("div", null,
                        React.createElement(Dropdown, {
                          options: [
                            {
                              key: PageOpenBehavior.NewTab,
                              text: commonStrings.General.NewTabOpenBehavior
                            },
                            {
                              key: PageOpenBehavior.Self,
                              text: commonStrings.General.SameTabOpenBehavior
                            },
                          ],
                          disabled: item.isLink ? false : true,
                          defaultSelectedKey: item.openBehavior,
                          onChange: (ev, option) => onUpdate(field.id, option.key),
                        } as IDropdownProps)
                    )
                );
              }
            }
        ]
      })
    ];

    return settingFields;
  }

  private initializeWebPartServices(): void {
    this.tokenService = this.context.serviceScope.consume<ITokenService>(TokenService.ServiceKey);
  }

  /**
   * Initializes required Web Part properties
   */
  private initializeProperties() {
  
    this.properties.verticals = this.properties.verticals ? this.properties.verticals : [
      {
        key: '0d8255b1-2d3d-4e88-add6-44708afec979',
        tabName: 'SharePoint',
        iconName: 'SharePointLogo',
        isLink: false,
        linkUrl: undefined,
        openBehavior: PageOpenBehavior.NewTab
      },
      {
        key: 'a8f958e5-5f4c-468e-a355-7f45bb6e37a1',
        tabName: 'Microsoft Graph',
        iconName: 'AzureAPIManagement',
        isLink: false,
        linkUrl: undefined,
        openBehavior: PageOpenBehavior.NewTab
      },
      {
        key: '21590a77-1756-4824-8cd5-c3b276547d0f',
        tabName: 'Documentation',
        iconName: 'TextDocument',
        isLink: true,
        linkUrl: 'https://microsoft-search.github.io/pnp-modern-search/',
        openBehavior: PageOpenBehavior.NewTab
      }
    ];
  }

  private async onVerticalSelected(itemKey: string): Promise<void> {
    
    // Retrieve the search vertical using this id
    const verticals = this.properties.verticals.filter(vertical => {
      return vertical.key === itemKey;
    });

    this._selectedVertical = verticals.length > 0 ? verticals[0] : undefined;

    // Notify subscriber a new vertical has been selected
    this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchVerticals);
  }
}
