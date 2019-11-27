import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Environment, Text, EnvironmentType } from '@microsoft/sp-core-library';
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
  PropertyPaneLabel,
  PropertyPaneTextField,
  PropertyPaneToggle,
  DynamicDataSharedDepth
} from "@microsoft/sp-property-pane";
import * as strings from 'SearchBoxWebPartStrings';
import ISearchBoxWebPartProps from './ISearchBoxWebPartProps';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import ISearchQuery from '../../models/ISearchQuery';
import { ISearchBoxContainerProps } from './components/SearchBoxContainer/ISearchBoxContainerProps';
import ServiceHelper from '../../helpers/ServiceHelper';
import ISearchService from '../../services/SearchService/ISearchService';
import INlpService from '../../services/NlpService/INlpService';
import MockSearchService from '../../services/SearchService/MockSearchService';
import SearchService from '../../services/SearchService/SearchService';
import MockNlpService from '../../services/NlpService/MockNlpService';
import NlpService from '../../services/NlpService/NlpService';
import { PageOpenBehavior, QueryPathBehavior } from '../../helpers/UrlHelper';
import SearchBoxContainer from './components/SearchBoxContainer/SearchBoxContainer';
import { SearchComponentType } from '../../models/SearchComponentType';
import { ThemeProvider, ThemeChangedEventArgs } from '@microsoft/sp-component-base';
import IExtensibilityService from '../../services/ExtensibilityService/IExtensibilityService';
import { ExtensibilityService } from '../../services/ExtensibilityService/ExtensibilityService';
import { ISuggestionProvider } from '../../models/ISuggestionProvider';
import { ISuggestion } from '../../models/ISuggestion';

export default class SearchBoxWebPart extends BaseClientSideWebPart<ISearchBoxWebPartProps> implements IDynamicDataCallables {

  private _searchQuery: ISearchQuery;
  private _searchService: ISearchService;
  private _serviceHelper: ServiceHelper;
  private _nlpService: INlpService;
  private _themeProvider: ThemeProvider;
  private _extensibilityService: IExtensibilityService;
  private _suggestionProviders: ISuggestionProvider[];

  private _propertyFieldCodeEditorLanguages = null;
  private _propertyFieldCollectionData = null;
  private _customCollectionFieldType = null;
  private _textDialogComponent = null;

  constructor() {
    super();

    // Initialize default values for search query
    this._searchQuery = {
      rawInputValue: '',
      enhancedQuery: ''
    };

    this._bindHashChange = this._bindHashChange.bind(this);
  }

  public render(): void {

    let inputValue = this.properties.defaultQueryKeywords.tryGetValue();

    if (inputValue && typeof(inputValue) === 'string') {

      // Notify subscriber a new value if available
      this._searchQuery.rawInputValue = decodeURIComponent(inputValue);
      this.context.dynamicDataSourceManager.notifyPropertyChanged('searchQuery');
    }

    const element: React.ReactElement<ISearchBoxContainerProps> = React.createElement(
      SearchBoxContainer, {
        onSearch: this._onSearch,
        searchInNewPage: this.properties.searchInNewPage,
        pageUrl: this.properties.pageUrl,
        openBehavior: this.properties.openBehavior,
        queryPathBehavior: this.properties.queryPathBehavior,
        queryStringParameter: this.properties.queryStringParameter,
        inputValue: this._searchQuery.rawInputValue,
        enableQuerySuggestions: this.properties.enableQuerySuggestions,
        searchService: this._searchService,
        enableDebugMode: this.properties.enableDebugMode,
        enableNlpService: this.properties.enableNlpService,
        isStaging: this.properties.isStaging,
        NlpService: this._nlpService,
        placeholderText: this.properties.placeholderText,
        domElement: this.domElement
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
   * Returns the friendly annoted values for the property. This info will be used by default SPFx dynamic data property pane fields.
   * @param propertyId the property id
   */
  public getAnnotatedPropertyValue(propertyId: string) {

      switch (propertyId) {

          case 'searchQuery':

              const annotatedPropertyValue = {
                  sampleValue: {
                      'rawInputValue': "*",
                      'enhancedQuery': '(rawQuery) XRANK(cb=500) owsTaxIdrawQuery:5eb0b270-f8ce-42e9-866f-73b1466a26ac',
                  },
                  metadata: {
                      'rawInputValue': { title: strings.DynamicData.RawInputValuePropertyLabel},
                      'enhancedQuery': { title: strings.DynamicData.EnhancedQueryPropertyLabel },
                  }
              };

              return annotatedPropertyValue;

          default:
              throw new Error('Bad property id');
      }
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

    this._serviceHelper = new ServiceHelper(this.context.httpClient);
    this.context.dynamicDataSourceManager.initializeSource(this);

    this.initSearchService();
    this.initNlpService();

    this.initThemeVariant();

    this._extensibilityService = new ExtensibilityService();

    await this.initSuggestionProviders();

    this._bindHashChange();

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
            },
            {
                groupName: strings.SearchBoxQueryNlpSettings,
                groupFields: this._getSearchQueryOptimizationFields()
            },
          ],
          displayGroupsAsAccordion: true
        }
      ]
    };
  }

  protected onPropertyPaneFieldChanged(propertyPath: string) {
    this.initSearchService();
    this.initNlpService();

    if (!this.properties.useDynamicDataSource) {
      this.properties.defaultQueryKeywords.setValue("");
    }

    this._bindHashChange();
  }

  /**
   * Handler used to notify data source subscribers when the input query is updated
   */
  private _onSearch = (searchQuery: ISearchQuery): void => {

    this._searchQuery = searchQuery;
    this.context.dynamicDataSourceManager.notifyPropertyChanged('searchQuery');
  }

  /**
   * Verifies if the string is a correct URL
   * @param value the URL to verify
   */
  private _validatePageUrl(value: string) {

    if ((!/^(https?):\/\/[^\s/$.?#].[^\s]*/.test(value) || !value) && this.properties.searchInNewPage) {
      return strings.SearchBoxUrlErrorMessage;
    }

    return '';
  }

  /**
   * Ensures the service URL is valid
   * @param value the service URL
   */
  private async _validateServiceUrl(value: string) {

    if ((!/^(https?):\/\/[^\s/$.?#].[^\s]*/.test(value) || !value)) {
      return strings.SearchBoxUrlErrorMessage;
    } else {
      if (Environment.type !== EnvironmentType.Local) {
        try {
          await this._serviceHelper.ensureUrlResovles(value);
          return '';
        } catch (errorMessage) {
            return Text.format(strings.UrlNotResolvedErrorMessage, value, errorMessage);
        }
      } else {
        return '';
      }
    }
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

  /**
   * Initializes the query optimization data provider instance according to the current environment
   */
  private initNlpService() {

    if (this.properties.enableNlpService && this.properties.NlpServiceUrl) {
        if (Environment.type === EnvironmentType.Local) {
            this._nlpService = new MockNlpService();
            this.properties.NlpServiceUrl = 'https://localhost:7071/api/example';
        } else {
            this._nlpService = new NlpService(this.context, this.properties.NlpServiceUrl);
        }
    }
  }

  private async initSuggestionProviders(): Promise<void> {

    const [ defaultProviders, customProviders ] = await Promise.all([
        this.getDefaultSuggestionProviders(),
        this.getCustomSuggestionProviders()
    ]);

    this._suggestionProviders = [ ...defaultProviders, ...customProviders ];

    if (!this.properties.suggestionProviders || this.properties.suggestionProviders.length === 0) {
        //Add suggestion provider settings with default settings
        this.properties.suggestionProviders = this._suggestionProviders.map<ISuggestionProvider>(dp => {
            return {
                ...dp,
                enabled: undefined !== dp.enabled ? dp.enabled : true,
                inlineTemplateContent: dp.inlineTemplateContent || dp.defaultTemplateContent,
                externalTemplateUrl: dp.externalTemplateUrl || '',
            }
        });
    }
  }

  private async getDefaultSuggestionProviders(): Promise<ISuggestionProvider[]> {
    return [{
        id: "default",
        description: "Default SharePoint query suggestions.",
        displayName: "SharePoint",
        defaultTemplateContent: `<div>{{text}}</div>`,
        getSuggestions: async (queryText: string): Promise<ISuggestion[]> => {
          const suggestions = await this._searchService.suggest(queryText);
          return suggestions.map<ISuggestion>(textSuggestion => ({ text: textSuggestion }));
        },
    }]
  }

  private async getCustomSuggestionProviders(): Promise<ISuggestionProvider[]> {
    let customSuggestionProviders: ISuggestionProvider[] = [];

    // Load extensibility library if present
    const extensibilityLibrary = await this._extensibilityService.loadExtensibilityLibrary();

    // Load extensibility additions
    if (extensibilityLibrary && extensibilityLibrary.getCustomSuggestionProviders) {

        // Add custom suggestion providers if any
        customSuggestionProviders = extensibilityLibrary.getCustomSuggestionProviders();
    }

    return customSuggestionProviders;
  }

  protected get propertiesMetadata(): IWebPartPropertiesMetadata {
    return {
      'defaultQueryKeywords': {
        dynamicPropertyType: 'string'
      }
    };
  }

  protected async loadPropertyPaneResources(): Promise<void> {

    // tslint:disable-next-line:no-shadowed-variable
    const { PropertyFieldCodeEditorLanguages } = await import(
        /* webpackChunkName: 'search-property-pane' */
        '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
    );
    this._propertyFieldCodeEditorLanguages = PropertyFieldCodeEditorLanguages;

    // Code editor component for property pane controls
    this._textDialogComponent = await import(
        /* webpackChunkName: 'search-property-pane' */
        '../../controls/TextDialog'
    );

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
      this._propertyFieldCollectionData('suggestionProviders', {
        manageBtnLabel: strings.SuggestionProviders.EditSuggestionProvidersLabel,
        key: 'suggestionProviders',
        panelHeader: strings.SuggestionProviders.EditSuggestionProvidersLabel,
        panelDescription: strings.SuggestionProviders.SuggestionProvidersDescription,
        disableItemCreation: true,
        disableItemDeletion: true,
        label: strings.SuggestionProviders.SuggestionProvidersLabel,
        value: this.properties.suggestionProviders,
        fields: [
            {
                id: 'enabled',
                title: strings.SuggestionProviders.EnabledPropertyLabel,
                type: this._customCollectionFieldType.boolean,
            },
            {
                id: 'displayName',
                title: strings.SuggestionProviders.ProviderNamePropertyLabel,
                type: this._customCollectionFieldType.string,
                disableEdit: true,
            },
            {
                id: "inlineTemplateContent",
                title: strings.SuggestionProviders.InlineTemplateContentLabel,
                type: this._customCollectionFieldType.custom,
                onCustomRender: (field, value, onUpdate) => {
                    return (
                        React.createElement("div", null,
                            React.createElement(this._textDialogComponent.TextDialog, {
                                language: this._propertyFieldCodeEditorLanguages.Handlebars,
                                dialogTextFieldValue: value ? value : ``, //inline template default value
                                onChanged: (fieldValue) => onUpdate(field.id, fieldValue),
                                strings: {
                                    cancelButtonText: strings.CancelButtonText,
                                    dialogButtonText: strings.DialogButtonText,
                                    dialogTitle: strings.SuggestionProviders.InlineTemplateEditPanelTitle,
                                    saveButtonText: strings.SaveButtonText
                                }
                            })
                        )
                    );
                }
            },
            {
                id: 'externalTemplateUrl',
                title: strings.SuggestionProviders.ExternalUrlLabel,
                type: this._customCollectionFieldType.url,
                placeholder: 'https://mysite/Documents/external.html'
            },
        ]
      }),
      PropertyPaneHorizontalRule(),
      PropertyPaneTextField('placeholderText', {
        label: strings.SearchBoxPlaceholderTextLabel
      }),
      PropertyPaneHorizontalRule(),
      PropertyPaneToggle("searchInNewPage", {
        checked: false,
        label: strings.SearchBoxSearchInNewPageLabel
      })
    ];

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
   * Determines the group fields for the search query optimization inside the property pane
   */
  private _getSearchQueryOptimizationFields(): IPropertyPaneField<any>[] {

      let searchQueryOptimizationFields: IPropertyPaneField<any>[] = [
          PropertyPaneLabel("", {
              text: strings.SearchBoxQueryNlpSettingsDescription
          }),
          PropertyPaneToggle("enableNlpService", {
              checked: false,
              label: strings.SearchBoxUserQueryNlpLabel,
          })
      ];

      if (this.properties.enableNlpService) {

          searchQueryOptimizationFields.push(
              PropertyPaneTextField("NlpServiceUrl", {
                  label: strings.SearchBoxServiceUrlLabel,
                  disabled: !this.properties.enableNlpService,
                  onGetErrorMessage: this._validateServiceUrl.bind(this),
                  description: Text.format(strings.SearchBoxServiceUrlDescription, window.location.host)
              }),
              PropertyPaneToggle("enableDebugMode", {
                  label: strings.SearchBoxUseDebugModeLabel,
                  disabled: !this.properties.enableNlpService,
              }),
              PropertyPaneToggle("isStaging", {
                label: strings.SearchBoxUseStagingEndpoint,
                disabled: !this.properties.enableNlpService,
            }),
          );
      }

      return searchQueryOptimizationFields;
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

    // Register a handler to be notified if the theme variant changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent.bind(this));
  }

  /**
   * Update the current theme variant reference and re-render.
   * @param args The new theme
   */
  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
      this.render();
  }
}
