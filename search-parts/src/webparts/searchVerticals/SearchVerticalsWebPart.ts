import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Guid, DisplayMode, UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IPropertyPaneConfiguration, IPropertyPaneField, PropertyPaneDropdown, PropertyPaneToggle, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import * as strings from 'SearchVerticalsWebPartStrings';
import { ISearchVerticalsWebPartProps } from './ISearchVerticalsWebPartProps';
import ISearchVerticalsContainerProps from './components/SearchVerticalsContainer/ISearchVerticalsContainerProps';
import SearchVerticalsContainer from './components/SearchVerticalsContainer/SearchVerticalsContainer';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { SearchComponentType } from '../../models/SearchComponentType';
import ISearchVerticalSourceData from '../../models/ISearchVerticalSourceData';
import { ISearchVertical } from '../../models/ISearchVertical';
import IDynamicDataService from '../../services/DynamicDataService/IDynamicDataService';
import { DynamicDataService } from '../../services/DynamicDataService/DynamicDataService';
import ISearchResultSourceData from '../../models/ISearchResultSourceData';
import { DynamicProperty, ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import { cloneDeep, isEqual, find } from '@microsoft/sp-lodash-subset';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import { PageOpenBehavior } from '../../helpers/UrlHelper';
import { TokenService, ITokenService } from '../../services/TokenService';
import { TextField, ITextFieldProps, Dropdown, IDropdownProps } from 'office-ui-fabric-react';

export default class SearchVerticalsWebPart extends BaseClientSideWebPart<ISearchVerticalsWebPartProps> implements IDynamicDataCallables {

    private _propertyFieldCollectionData;
    private _customCollectionFieldType;
    private _dynamicDataService: IDynamicDataService;
    private _searchResultSourceData: DynamicProperty<ISearchResultSourceData>;
    private _selectedVertical: ISearchVertical;
    private _themeProvider: ThemeProvider;
    private _themeVariant: IReadonlyTheme;
    private _tokenService: ITokenService;

    public constructor() {
        super();

        this.onVerticalSelected = this.onVerticalSelected.bind(this);
    }

    public render(): void {

        let renderElement = null;
        let defaultVerticalKey: string = null;
        let searchVerticals: ISearchVertical[] = cloneDeep(this.properties.verticals);

        if (this.properties.verticals.length > 0) {

            // Check if we can find a default vertical to set
            if (this.properties.defaultVerticalQuerystringParam) {
                const queryParms: UrlQueryParameterCollection = new UrlQueryParameterCollection(window.location.href.toLowerCase());
                const defaultQueryVal: string = queryParms.getValue(this.properties.defaultVerticalQuerystringParam.toLowerCase());
                if (defaultQueryVal) {
                    const defaultSelected: ISearchVertical = find(this.properties.verticals, v => v.tabName.toLowerCase() == decodeURIComponent(defaultQueryVal));
                    if (defaultSelected) {
                        defaultVerticalKey = defaultSelected.key;
                    }
                }
            }

            let searchResultSourceData: ISearchResultSourceData = undefined;
            // If the dynamic property exists, it means the Web Part ins connected to a search results Web Part
            if (this._searchResultSourceData) {
                searchResultSourceData = this._searchResultSourceData.tryGetValue();

                if (searchResultSourceData) {

                    if (searchResultSourceData.verticalsInformation) {
                        // Updated vertical counts
                        searchVerticals = searchVerticals.map(configuredVertical => {
                            const verticalInfo = searchResultSourceData.verticalsInformation.filter(v => { return v.VerticalKey === configuredVertical.key; });
                            if (verticalInfo.length > 0) {
                                configuredVertical.count = verticalInfo[0].Count;
                            }

                            return configuredVertical;
                        });
                    }
                }
            }

            renderElement = React.createElement(
                SearchVerticalsContainer,
                {
                    verticals: searchVerticals,
                    onVerticalSelected: this.onVerticalSelected,
                    showCounts: this.properties.showCounts,
                    themeVariant: this._themeVariant,
                    defaultVerticalKey: defaultVerticalKey,
                    tokenService: this._tokenService,
                } as ISearchVerticalsContainerProps
            );

        } else {
            if (this.displayMode === DisplayMode.Edit) {
                renderElement = React.createElement(
                    Placeholder,
                    {
                        iconName: strings.PlaceHolderEditLabel,
                        iconText: strings.PlaceHolderIconText,
                        description: strings.PlaceHolderDescription,
                        buttonLabel: strings.PlaceHolderConfigureBtnLabel,
                        onConfigure: this._setupWebPart.bind(this)
                    }
                );
            } else {
                renderElement = React.createElement('div', null);
            }
        }

        ReactDom.render(renderElement, this.domElement);
    }

    public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {

        // Use the Web Part title as property title since we don't expose sub properties
        return [
            {
                id: SearchComponentType.SearchVerticalsWebPart,
                title: this.title
            }
        ];
    }

    public getPropertyValue(propertyId: string): ISearchVerticalSourceData {
        switch (propertyId) {

            case SearchComponentType.SearchVerticalsWebPart:
                return {
                    selectedVertical: this._selectedVertical,
                    verticalsConfiguration: this.properties.verticals,
                    showCounts: this.properties.showCounts
                } as ISearchVerticalSourceData;

            default:
                throw new Error('Bad property id');
        }
    }

    protected onInit(): Promise<void> {

        this._dynamicDataService = new DynamicDataService(this.context.dynamicDataProvider);
        this.ensureDataSourceConnection();

        this.initThemeVariant();

        this.initializeProperties();

        this._tokenService = new TokenService(this.context.pageContext, this.context.spHttpClient);

        this.properties.verticals = this.properties.verticals ? this.properties.verticals : [];

        this.context.dynamicDataSourceManager.initializeSource(this);

        return super.onInit();
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
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

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    groups: [
                        {
                            groupName: strings.SearchVerticalsGroupName,
                            groupFields: this._getVerticalsConfguration()
                        }
                    ],
                    displayGroupsAsAccordion: true
                }
            ]
        };
    }

    protected onPropertyPaneFieldChanged(propertyPath: string) {

        // Bind connected data sources
        if (this.properties.searchResultsDataSourceReference) {
            this.ensureDataSourceConnection();
        }

        if (propertyPath.localeCompare('verticals') === 0) {

            // Generate an unique key for verticals to be able to identify them precisely in sub components instead using the vertical display name (can be duplicated).
            this.properties.verticals = this.properties.verticals.map(vertical => {
                vertical.key = vertical.key ? vertical.key : Guid.newGuid().toString();
                return vertical;
            });
        }

        if (!this.properties.showCounts) {
            this.properties.searchResultsDataSourceReference = undefined;
            this._searchResultSourceData = undefined;
        }

        this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchVerticalsWebPart);
    }

    private _getVerticalsConfguration(): IPropertyPaneField<any>[] {

        let settingFields: IPropertyPaneField<any>[] = [
            this._propertyFieldCollectionData('verticals', {
                manageBtnLabel: strings.PropertyPane.Verticals.ButtonLabel,
                key: 'verticals',
                panelHeader: strings.PropertyPane.Verticals.PanelHeader,
                panelDescription: strings.PropertyPane.Verticals.PanelDescription,
                enableSorting: true,
                label: strings.PropertyPane.Verticals.PropertyLabel,
                value: this.properties.verticals,
                fields: [
                    {
                        id: 'tabName',
                        title: strings.PropertyPane.Verticals.Fields.TabName,
                        type: this._customCollectionFieldType.string,
                        required: true
                    },
                    {
                        id: 'queryTemplate',
                        title: strings.PropertyPane.Verticals.Fields.QueryTemplate,
                        type: this._customCollectionFieldType.string,
                        required: true,
                        defaultValue: "{searchTerms}"
                    },
                    {
                        id: 'resultSourceId',
                        title: strings.PropertyPane.Verticals.Fields.ResultSource,
                        type: this._customCollectionFieldType.string,
                        required: false,

                    },
                    {
                        id: 'iconName',
                        title: strings.PropertyPane.Verticals.Fields.IconName,
                        type: this._customCollectionFieldType.string,
                        required: false
                    },
                    {
                        id: 'isLink',
                        title: strings.PropertyPane.Verticals.Fields.IsLink,
                        type: this._customCollectionFieldType.boolean,
                        required: false
                      },
                      {
                        id: 'linkUrl',
                        title: strings.PropertyPane.Verticals.Fields.LinkUrl,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
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
                        title: strings.PropertyPane.Verticals.Fields.OpenBehavior,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: PageOpenBehavior.NewTab,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                          return (
                              React.createElement("div", null,
                                  React.createElement(Dropdown, {
                                    options: [
                                      {
                                        key: PageOpenBehavior.NewTab,
                                        text: strings.NewTabOpenBehavior
                                      },
                                      {
                                        key: PageOpenBehavior.Self,
                                        text: strings.SameTabOpenBehavior
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

        if (this.properties.verticals.length > 0) {
            settingFields.push(
                PropertyPaneToggle('showCounts', {
                    label: strings.PropertyPane.ShowCounts.PropertyLabel
                }),
                PropertyPaneTextField('defaultVerticalQuerystringParam', {
                    label: strings.PropertyPane.DefaultVerticalQuerystringParam.PropertyLabel
                })
            );
        }

        if (this.properties.showCounts) {
            settingFields.push(
                PropertyPaneDropdown('searchResultsDataSourceReference', {
                    options: this._dynamicDataService.getAvailableDataSourcesByType(SearchComponentType.SearchResultsWebPart),
                    label: strings.PropertyPane.SearchResultsDataSource.PropertyLabel
                })
            );
        }

        return settingFields;
    }

    private onVerticalSelected(itemKey: string): void {

        // Retrieve the search vertical using this id
        const verticals = this.properties.verticals.filter(vertical => {
            return vertical.key === itemKey;
        });

        this._selectedVertical = verticals.length > 0 ? verticals[0] : undefined;

        // Notify subscriber a new vertical has been selected
        this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchVerticalsWebPart);
    }

    /**
     * Make sure the dynamic property is correctly connected to the source if a search results component has been selected in options 
     */
    private ensureDataSourceConnection() {

        if (this.properties.searchResultsDataSourceReference) {

            // Register the data source manually since we don't want user select properties manually
            if (!this._searchResultSourceData) {
                this._searchResultSourceData = new DynamicProperty<ISearchResultSourceData>(this.context.dynamicDataProvider);
            }

            this._searchResultSourceData.setReference(this.properties.searchResultsDataSourceReference);
            this._searchResultSourceData.register(this.render);

        } else {
            if (this._searchResultSourceData) {
                this._searchResultSourceData.unregister(this.render);
            }
        }
    }

    private initializeProperties() {

        this.properties.verticals = this.properties.verticals ? this.properties.verticals : [
                                                                                                {
                                                                                                    key: "64db0487-0b73-4ffa-b250-d7869d85b7fe",
                                                                                                    queryTemplate: "{searchTerms}",
                                                                                                    resultSourceId: "78b793ce-7956-4669-aa3b-451fc5defebf",
                                                                                                    tabName: "Videos",
                                                                                                    iconName : "Video",
                                                                                                    openBehavior: PageOpenBehavior.NewTab,
                                                                                                    isLink: false,
                                                                                                    linkUrl: ''
                                                                                                },
                                                                                                {
                                                                                                    key: "afb855dc-7808-4366-a320-4a73be69a979",
                                                                                                    queryTemplate: "{searchTerms}",
                                                                                                    resultSourceId: "b09a7990-05ea-4af9-81ef-edfab16c4e31",
                                                                                                    tabName: "People",
                                                                                                    iconName : "People",
                                                                                                    openBehavior: PageOpenBehavior.NewTab,
                                                                                                    isLink: false,
                                                                                                    linkUrl: ''
                                                                                                },
                                                                                                {
                                                                                                    key: "9da0e1d9-4765-42ff-b562-cf7796d408f6",
                                                                                                    queryTemplate: "{searchTerms}",
                                                                                                    resultSourceId: "ba63bbae-fa9c-42c0-b027-9a878f16557c",
                                                                                                    tabName: "Recently changed items",
                                                                                                    iconName: "Documentation",
                                                                                                    openBehavior: PageOpenBehavior.NewTab,
                                                                                                    isLink: false,
                                                                                                    linkUrl: ''
                                                                                                }
                                                                                            ];
    }

    /**
     * Opens the Web Part property pane
     */
    private _setupWebPart() {
        this.context.propertyPane.open();
    }

    /**
     * Initializes theme variant properties
     */
    private initThemeVariant(): void {

        // Consume the new ThemeProvider service
        this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

        // If it exists, get the theme variant
        this._themeVariant = this._themeProvider.tryGetTheme();

        // Register a handler to be notified if the theme variant changes
        this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent.bind(this));
    }

    /**
     * Update the current theme variant reference and re-render.
     * @param args The new theme
     */
    private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
        if (!isEqual(this._themeVariant, args.theme)) {
            this._themeVariant = args.theme;
            this.render();
        }
    }
}
