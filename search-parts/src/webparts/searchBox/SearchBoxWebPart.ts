import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IWebPartPropertiesMetadata,
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneField,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneDynamicField,
  PropertyPaneDynamicFieldSet,
  PropertyPaneHorizontalRule,
  PropertyPaneTextField,
  PropertyPaneToggle,
  DynamicDataSharedDepth
} from "@microsoft/sp-property-pane";
import * as strings from 'SearchBoxWebPartStrings';
import ISearchBoxWebPartProps from './ISearchBoxWebPartProps';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { ISearchBoxContainerProps } from './components/SearchBoxContainer/ISearchBoxContainerProps';
import ISearchService from '../../services/SearchService/ISearchService';
import MockSearchService from '../../services/SearchService/MockSearchService';
import SearchService from '../../services/SearchService/SearchService';
import { PageOpenBehavior, QueryPathBehavior, UrlHelper } from '../../helpers/UrlHelper';
import SearchBoxContainer from './components/SearchBoxContainer/SearchBoxContainer';
import { SearchComponentType } from '../../models/SearchComponentType';
import IExtensibilityService from '../../services/ExtensibilityService/IExtensibilityService';
import { ExtensibilityService } from '../../services/ExtensibilityService/ExtensibilityService';
import { ISuggestionProviderDefinition } from '../../services/ExtensibilityService/ISuggestionProviderDefinition';
import { SharePointDefaultSuggestionProvider } from '../../providers/SharePointDefaultSuggestionProvider';
import { ISuggestionProviderInstance } from '../../services/ExtensibilityService/ISuggestionProviderInstance';
import { ObjectCreator } from '../../services/ExtensibilityService/ObjectCreator';
import { BaseSuggestionProvider } from '../../providers/BaseSuggestionProvider';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import { isEqual, find } from '@microsoft/sp-lodash-subset';
import { GlobalSettings } from 'office-ui-fabric-react';

export default class SearchBoxWebPart extends BaseClientSideWebPart<ISearchBoxWebPartProps> implements IDynamicDataCallables {

  private _searchQuery: string;
  private _searchService: ISearchService;
  private _themeProvider: ThemeProvider;
  private _extensibilityService: IExtensibilityService;
  private _suggestionProviderInstances: ISuggestionProviderInstance<any>[];
  private _initComplete: boolean = false;
  private _foundCustomSuggestionProviders: boolean = false;

  private _propertyFieldCollectionData = null;
  private _customCollectionFieldType = null;
  private _themeVariant: IReadonlyTheme;

  constructor() {
    super();

    // Initialize default values for search query
    this._searchQuery = '';

    this._bindHashChange = this._bindHashChange.bind(this);
  }

  public render(): void {

    if (!this._initComplete) {
      return;
    }

    let inputValue = this.properties.defaultQueryKeywords.tryGetValue();

    if (inputValue && typeof(inputValue) === 'string') {

      // Notify subscriber a new value if available
      this._searchQuery = decodeURIComponent(inputValue);
      this.context.dynamicDataSourceManager.notifyPropertyChanged('searchQuery');
    }

    const enableSuggestions = this.properties.enableQuerySuggestions && this.properties.suggestionProviders.some(sp => sp.providerEnabled);

    const element: React.ReactElement<ISearchBoxContainerProps> = React.createElement(
      SearchBoxContainer, {
        onSearch: this._onSearch,
        searchInNewPage: this.properties.searchInNewPage,
        pageUrl: this.properties.pageUrl,
        openBehavior: this.properties.openBehavior,
        queryPathBehavior: this.properties.queryPathBehavior,
        queryStringParameter: this.properties.queryStringParameter,
        inputValue: this._searchQuery,
        enableQuerySuggestions: enableSuggestions,
        suggestionProviders: this._suggestionProviderInstances,
        searchService: this._searchService,
        placeholderText: this.properties.placeholderText,
        domElement: this.domElement,
        themeVariant: this._themeVariant
      } as ISearchBoxContainerProps);

    ReactDom.render(element, this.domElement);
  }

  /**
   * Return list of dynamic data properties that this dynamic data source
   * returns
   */
  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {
    return [
      {
          id: SearchComponentType.SearchBoxWebPart,
          title: strings.DynamicData.SearchQueryPropertyLabel
      },
    ];
  }

  /**
   * Return the current value of the specified dynamic data set
   * @param propertyId ID of the dynamic data set to retrieve the value for
   */
  public getPropertyValue(propertyId: string) {

    switch (propertyId) {

        case 'searchQuery':
            return this._searchQuery;

        default:
            throw new Error('Bad property id');
    }
  }

  protected async onInit(): Promise<void> {

    this.context.dynamicDataSourceManager.initializeSource(this);

    this.initSearchService();
    this.initThemeVariant();

    this._bindHashChange();

    this._extensibilityService = new ExtensibilityService();
    await this.initSuggestionProviders();

    this._initComplete = true;
    return super.onInit();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: strings.SearchBoxQuerySettings,
              groupFields: this._getSearchQueryFields()
            },
            {
              groupName: strings.SearchBoxNewPage,
              groupFields: this._getSearchBehaviorOptionsFields()
            }
          ],
          displayGroupsAsAccordion: true
        }
      ]
    };
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string): Promise<void> {

    this.initSearchService();

    if (!this.properties.useDynamicDataSource) {
      this.properties.defaultQueryKeywords.setValue("");
    }

    if (propertyPath.localeCompare('suggestionProviders') === 0) {
      await this.initSuggestionProviders();
    }

    this._bindHashChange();
  }

  /**
   * Handler used to notify data source subscribers when the input query is updated
   */
  private _onSearch = (searchQuery: string): void => {

    this._searchQuery = searchQuery;
    this.context.dynamicDataSourceManager.notifyPropertyChanged('searchQuery');

    // Save this value in a global context
    GlobalSettings.setValue('searchBoxQuery', searchQuery);

    // Update URL with raw search query
    if (this.properties.useDynamicDataSource && this.properties.defaultQueryKeywords && this.properties.defaultQueryKeywords.reference) {

      // this.properties.defaultQueryKeywords.reference
      // "PageContext:UrlData:queryParameters.query"
      const refChunks = this.properties.defaultQueryKeywords.reference.split(':');

      if (refChunks.length >= 3) {
        const paramType = refChunks[2];

        if (paramType === 'fragment') {
          window.history.pushState(undefined, undefined, `#${searchQuery}`);
        }
        else if(paramType.startsWith('queryParameters')) {
          const paramChunks = paramType.split('.');
          const queryTextParam = paramChunks.length === 2 ? paramChunks[1] : 'q';
          const newUrl = UrlHelper.addOrReplaceQueryStringParam(window.location.href, queryTextParam, searchQuery);

          if (window.location.href !== newUrl) {
            window.history.pushState({ path: newUrl }, undefined, newUrl);
          }
        }
      }

    }
  }

  /**
   * Verifies if the string is a correct URL
   * @param value the URL to verify
   */
  private _validatePageUrl(value: string) {

    if ((!(/^(https?):\/\/[^\s/$.?#].[^\s]*/).test(value) || !value) && this.properties.searchInNewPage) {
      return strings.SearchBoxUrlErrorMessage;
    }

    return '';
  }

  /**
   * Initializes the query suggestions data provider instance according to the current environnement
   */
  private initSearchService() {

      if (this.properties.enableQuerySuggestions) {
        if (Environment.type === EnvironmentType.Local ) {
          this._searchService = new MockSearchService();
        } else {
          this._searchService = new SearchService(this.context.pageContext, this.context.spHttpClient);
        return "";
      }
    }
  }

  private async initSuggestionProviders(): Promise<void> {

    this.properties.suggestionProviders = await this.getAllSuggestionProviders();

    this._suggestionProviderInstances = await this.initSuggestionProviderInstances(this.properties.suggestionProviders);

  }

  private async getAllSuggestionProviders(): Promise<ISuggestionProviderDefinition<any>[]> {
    const [ defaultProviders, customProviders ] = await Promise.all([
        this.getDefaultSuggestionProviders(),
        this.getCustomSuggestionProviders()
    ]);

    //Track if we have any custom suggestion providers
    if (customProviders && customProviders.length > 0) {
      this._foundCustomSuggestionProviders = true;
    }

    //Merge all providers together and set defaults
    const savedProviders = this.properties.suggestionProviders && this.properties.suggestionProviders.length > 0 ? this.properties.suggestionProviders : [];
    const providerDefinitions = [ ...defaultProviders, ...customProviders ].map(provider => {
        const existingSavedProvider = find(savedProviders, sp => sp.providerName === provider.providerName);

        provider.providerEnabled = existingSavedProvider && undefined !== existingSavedProvider.providerEnabled
                                    ? existingSavedProvider.providerEnabled
                                    : undefined !== provider.providerEnabled
                                      ? provider.providerEnabled
                                      : true;

        return provider;
    });
    return providerDefinitions;
  }

  private async getDefaultSuggestionProviders(): Promise<ISuggestionProviderDefinition<any>[]> {
    return [{
        providerName: SharePointDefaultSuggestionProvider.ProviderName,
        providerDisplayName: SharePointDefaultSuggestionProvider.ProviderDisplayName,
        providerDescription: SharePointDefaultSuggestionProvider.ProviderDescription,
        providerClass: SharePointDefaultSuggestionProvider
    }];
  }

  private async getCustomSuggestionProviders(): Promise<ISuggestionProviderDefinition<any>[]> {
    let customSuggestionProviders: ISuggestionProviderDefinition<any>[] = [];

    // Load extensibility library if present
    const extensibilityLibrary = await this._extensibilityService.loadExtensibilityLibrary();

    // Load extensibility additions
    if (extensibilityLibrary && extensibilityLibrary.getCustomSuggestionProviders) {

        // Add custom suggestion providers if any
        customSuggestionProviders = extensibilityLibrary.getCustomSuggestionProviders();
    }

    return customSuggestionProviders;
  }

  private async initSuggestionProviderInstances(providerDefinitions: ISuggestionProviderDefinition<any>[]): Promise<ISuggestionProviderInstance<any>[]> {

    const webpartContext = this.context;

    let providerInstances = await Promise.all(providerDefinitions.map<Promise<ISuggestionProviderInstance<any>>>(async (provider) => {
      let isInitialized = false;
      let instance: BaseSuggestionProvider = null;

      try {
        instance = ObjectCreator.createEntity(provider.providerClass, webpartContext);
        await instance.onInit();
        isInitialized = true;
      }
      catch (error) {
        console.log(`Unable to initialize '${provider.providerName}'. ${error}`);
      }
      finally {
        return {
          ...provider,
          instance,
          isInitialized
        };
      }
    }));

    // Keep only the onces that initialized successfully
    providerInstances = providerInstances.filter(pi => pi.isInitialized);

    return providerInstances;
  }

  protected get propertiesMetadata(): IWebPartPropertiesMetadata {
    return {
      'defaultQueryKeywords': {
        dynamicPropertyType: 'string'
      }
    };
  }

  protected async loadPropertyPaneResources(): Promise<void> {

    const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
        /* webpackChunkName: 'search-property-pane' */
        '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
    );
    this._propertyFieldCollectionData = PropertyFieldCollectionData;
    this._customCollectionFieldType = CustomCollectionFieldType;
  }

  /**
   * Determines the group fields for the search query options inside the property pane
   */
  private _getSearchQueryFields(): IPropertyPaneField<any>[] {

    // Sets up search query fields
    let searchQueryConfigFields: IPropertyPaneField<any>[] = [
        PropertyPaneCheckbox('useDynamicDataSource', {
            checked: false,
            text: strings.DynamicData.UseDynamicDataSourceLabel,
        })
    ];

    if (this.properties.useDynamicDataSource) {
      searchQueryConfigFields.push(
        PropertyPaneDynamicFieldSet({
          label: strings.DynamicData.DefaultQueryKeywordsPropertyLabel,
          fields: [
            PropertyPaneDynamicField('defaultQueryKeywords', {
              label: strings.DynamicData.DefaultQueryKeywordsPropertyLabel,
            })
          ],
          sharedConfiguration: {
            depth: DynamicDataSharedDepth.Source,
          }
        })
      );
    }

    return searchQueryConfigFields;
}

  /**
   * Determines the group fields for the search options inside the property pane
   */
  private _getSearchBehaviorOptionsFields(): IPropertyPaneField<any>[] {

    let searchBehaviorOptionsFields: IPropertyPaneField<any>[]  = [
      PropertyPaneToggle("enableQuerySuggestions", {
        checked: false,
        label: strings.SearchBoxEnableQuerySuggestions
      }),
    ];

    if (this._foundCustomSuggestionProviders) {
      searchBehaviorOptionsFields = searchBehaviorOptionsFields.concat([
        this._propertyFieldCollectionData('suggestionProviders', {
          manageBtnLabel: strings.SuggestionProviders.EditSuggestionProvidersLabel,
          key: 'suggestionProviders',
          panelHeader: strings.SuggestionProviders.EditSuggestionProvidersLabel,
          panelDescription: strings.SuggestionProviders.SuggestionProvidersDescription,
          disableItemCreation: true,
          disableItemDeletion: true,
          disabled: !this.properties.enableQuerySuggestions,
          label: strings.SuggestionProviders.SuggestionProvidersLabel,
          value: this.properties.suggestionProviders,
          fields: [
              {
                  id: 'providerEnabled',
                  title: strings.SuggestionProviders.EnabledPropertyLabel,
                  type: this._customCollectionFieldType.custom,
                  onCustomRender: (field, value, onUpdate, item, itemId) => {
                    return (
                      React.createElement("div", null,
                        React.createElement(Toggle, { key: itemId, checked: value, onChange: (evt, checked) => {
                          onUpdate(field.id, checked);
                        }})
                      )
                    );
                  }
              },
              {
                  id: 'providerDisplayName',
                  title: strings.SuggestionProviders.ProviderNamePropertyLabel,
                  type: this._customCollectionFieldType.custom,
                  onCustomRender: (field, value) => {
                    return (
                      React.createElement("div", { style: { 'fontWeight': 600 } }, value)
                    );
                  }
              },
              {
                  id: 'providerDescription',
                  title: strings.SuggestionProviders.ProviderDescriptionPropertyLabel,
                  type: this._customCollectionFieldType.custom,
                  onCustomRender: (field, value) => {
                    return (
                      React.createElement("div", null, value)
                    );
                  }
              }
          ]
        })
      ]);
    }

    searchBehaviorOptionsFields = searchBehaviorOptionsFields.concat([
      PropertyPaneHorizontalRule(),
      PropertyPaneTextField('placeholderText', {
        label: strings.SearchBoxPlaceholderTextLabel
      }),
      PropertyPaneHorizontalRule(),
      PropertyPaneToggle("searchInNewPage", {
        checked: false,
        label: strings.SearchBoxSearchInNewPageLabel
      })
    ]);

    if (this.properties.searchInNewPage) {
      searchBehaviorOptionsFields = searchBehaviorOptionsFields.concat([
        PropertyPaneTextField('pageUrl', {
          disabled: !this.properties.searchInNewPage,
          label: strings.SearchBoxPageUrlLabel,
          onGetErrorMessage: this._validatePageUrl.bind(this)
        }),
        PropertyPaneDropdown('openBehavior', {
          label:  strings.SearchBoxPageOpenBehaviorLabel,
          options: [
            { key: PageOpenBehavior.Self, text: strings.SearchBoxSameTabOpenBehavior },
            { key: PageOpenBehavior.NewTab, text: strings.SearchBoxNewTabOpenBehavior }
          ],
          disabled: !this.properties.searchInNewPage,
          selectedKey: this.properties.openBehavior
        }),
        PropertyPaneDropdown('queryPathBehavior', {
          label:  strings.SearchBoxQueryPathBehaviorLabel,
          options: [
            { key: QueryPathBehavior.URLFragment, text: strings.SearchBoxUrlFragmentQueryPathBehavior },
            { key: QueryPathBehavior.QueryParameter, text: strings.SearchBoxQueryStringQueryPathBehavior }
          ],
          disabled: !this.properties.searchInNewPage,
          selectedKey: this.properties.queryPathBehavior
        })
      ]);
    }

    if (this.properties.searchInNewPage && this.properties.queryPathBehavior === QueryPathBehavior.QueryParameter) {
      searchBehaviorOptionsFields = searchBehaviorOptionsFields.concat([
        PropertyPaneTextField('queryStringParameter', {
          disabled: !this.properties.searchInNewPage || this.properties.searchInNewPage && this.properties.queryPathBehavior !== QueryPathBehavior.QueryParameter,
          label: strings.SearchBoxQueryStringParameterName,
          onGetErrorMessage: (value) => {
            if (this.properties.queryPathBehavior === QueryPathBehavior.QueryParameter) {
              if (value === null ||
                value.trim().length === 0) {
                return strings.SearchBoxQueryParameterNotEmpty;
              }
            }
            return '';
          }
        })
      ]);
    }

    return searchBehaviorOptionsFields;
  }

  /**
   * Subscribes to URL hash change if the dynamic property is set to the default 'URL Fragment' property
   */
  private _bindHashChange() {
    if (this.properties.defaultQueryKeywords.tryGetSource() && this.properties.defaultQueryKeywords.reference.localeCompare('PageContext:UrlData:fragment') === 0) {
        // Manually subscribe to hash change since the default property doesn't
        window.addEventListener('hashchange', this.render);
    } else {
        window.removeEventListener('hashchange', this.render);
    }
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
