import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  IPropertyPaneField,
  IPropertyPaneChoiceGroupOption,
  PropertyPaneChoiceGroup,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from "@microsoft/sp-property-pane";
import * as strings from 'SearchRefinersWebPartStrings';
import { ExtensionTypes, IExtension, ExtensibilityService, IExtensibilityService, 
  IExtensibilityLibrary, IRefinementFilter, IUserService, ITimeZoneBias, 
  RefinersLayoutOption, RefinerTemplateOption,
  RefinersSortOption, RefinerSortDirection, IEditorLibrary, IRefinerConfiguration } from 'search-extensibility';
import SearchRefinersContainer from './components/SearchRefinersContainer/SearchRefinersContainer';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition, IDynamicDataSource } from '@microsoft/sp-dynamic-data';
import { ISearchRefinersWebPartProps } from './ISearchRefinersWebPartProps';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import IRefinerSourceData from '../../models/IRefinerSourceData';
import { DynamicProperty, ThemeChangedEventArgs, ThemeProvider, IReadonlyTheme } from '@microsoft/sp-component-base';
import { SearchComponentType } from '../../models/SearchComponentType';
import { ISearchRefinersContainerProps } from './components/SearchRefinersContainer/ISearchRefinersContainerProps';
import ISearchResultSourceData from '../../models/ISearchResultSourceData';
import { DynamicDataService } from '../../services/DynamicDataService/DynamicDataService';
import IDynamicDataService from '../../services/DynamicDataService/IDynamicDataService';
import MockSearchService from '../../services/SearchService/MockSearchService';
import SearchService from '../../services/SearchService/SearchService';
import ISearchService from '../../services/SearchService/ISearchService';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import BaseTemplateService from '../../services/TemplateService/BaseTemplateService';
import MockTemplateService from '../../services/TemplateService/MockTemplateService';
import { TemplateService } from '../../services/TemplateService/TemplateService';
import { cloneDeep, isEqual } from '@microsoft/sp-lodash-subset';
import { UserService } from '../../services/UserService/UserService';
import { MockUserService } from '../../services/UserService/MockUserService';
import { initializeFileTypeIcons } from '@uifabric/file-type-icons';
import PnPTelemetry from "@pnp/telemetry-js";
import { CssHelper } from '../../helpers/CssHelper';
import { AvailableComponents } from '../../components/AvailableComponents';
import { Guid } from '@microsoft/sp-core-library';

const STYLE_PREFIX :string = "pnp-filter-wp-";

export default class SearchRefinersWebPart extends BaseClientSideWebPart<ISearchRefinersWebPartProps> implements IDynamicDataCallables {

  private _dynamicDataService: IDynamicDataService;
  private _selectedFilters: IRefinementFilter[] = [];
  private _isDirty: boolean = false;
  private _searchResultSourceData: DynamicProperty<ISearchResultSourceData>;
  private _searchService: ISearchService;
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme;
  private _userService: IUserService;
  private _templateService: BaseTemplateService;
  private _contentClassName:string = null;
  private _customStyles:string = null;

  /**
   * Lazy loaded property pane controls
   */
  private _propertyFieldCodeEditor = null;
  private _propertyFieldCodeEditorLanguages = null;
  private _propertyFieldCollectionData = null;
  private _customCollectionFieldType = null;

  /**
   * Information about time zone bias (current user or web)
   */
  private _timeZoneBias: ITimeZoneBias;

  /**
   * The list of available managed managed properties (managed globally for all proeprty pane fiels if needed)
   */
  private _availableManagedProperties: IComboBoxOption[];


  /**
   * Extensibility functionality
   */
  private _extensibilityService: IExtensibilityService;
  private _loadedLibraries:IExtensibilityLibrary[] = [];
  private _extensibilityEditor = null;
  private _availableHelpers = null;
  private availableWebComponentDefinitions: IExtension<any>[] = AvailableComponents.BuiltinComponents;

  /**
   * Refiner editor functionality
   */
  private _refinerEditor = null;

  constructor() {
    super();
    this._onUpdateAvailableProperties = this._onUpdateAvailableProperties.bind(this);    
  }

  public render(): void {

    let renderElement = null;
    let availableRefiners = [];
    let queryKeywords = '';
    let selectedProperties: string[] = [];
    let queryTemplate: string = '';
    let resultSourceId: string = '';
    let defaultSelectedFilters: IRefinementFilter[] = [];

    if (this.properties.searchResultsDataSourceReference) {

      // If the dynamic property exists, it means the Web Part ins connected to a search results Web Part
      if (this._searchResultSourceData) {
        const searchResultSourceData: ISearchResultSourceData = this._searchResultSourceData.tryGetValue();

        if (searchResultSourceData) {
          availableRefiners = searchResultSourceData.refinementResults;
          queryKeywords = searchResultSourceData.queryKeywords;
          const searchServiceConfig = searchResultSourceData.searchServiceConfiguration;
          selectedProperties = (searchServiceConfig.selectedProperties) ? searchServiceConfig.selectedProperties : [];
          queryTemplate = (searchServiceConfig.queryTemplate) ? searchServiceConfig.queryTemplate : '';
          resultSourceId = searchServiceConfig.resultSourceId;
          defaultSelectedFilters = searchResultSourceData.defaultSelectedRefinementFilters;
        }
      }

      renderElement = React.createElement(
        SearchRefinersContainer,
        {
          webPartTitle: this.properties.webPartTitle,
          availableRefiners: availableRefiners,
          refinersConfiguration: this.properties.refinersConfiguration,
          showBlank: this.properties.showBlank,
          displayMode: this.displayMode,
          onUpdateFilters: (appliedRefiners: IRefinementFilter[]) => {
            this._isDirty = true;
            this._selectedFilters = appliedRefiners;
            this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.RefinersWebPart);
          },
          selectedLayout: this.properties.selectedLayout,
          language: this.context.pageContext.cultureInfo.currentUICultureName,
          query: queryKeywords + queryTemplate + selectedProperties + resultSourceId, // this is used as a generic key to check if the query is unique.
          themeVariant: this._themeVariant,
          userService: this._userService,
          defaultSelectedRefinementFilters: defaultSelectedFilters,
          contentClassName: this._contentClassName,
          styles: this._customStyles,
          templateService: this._templateService,
          domElement: this.domElement,
          instanceId: this.instanceId,
          webUrl: this.context.pageContext.web.serverRelativeUrl,
          siteUrl: this.context.pageContext.site.serverRelativeUrl
        } as ISearchRefinersContainerProps
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

  /**
   * Opens the Web Part property pane
   */
  private _setupWebPart() {
    this.context.propertyPane.open();
  }

  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {

    // Use the Web Part title as property title since we don't expose sub properties
    return [
      {
        id: SearchComponentType.RefinersWebPart,
        title: this.properties.webPartTitle ? this.properties.webPartTitle : this.title
      }
    ];
  }

  public getPropertyValue(propertyId: string): IRefinerSourceData {
    switch (propertyId) {

      case SearchComponentType.RefinersWebPart:
        return {
          selectedFilters: this._selectedFilters,
          refinerConfiguration: this.properties.refinersConfiguration,
          isDirty: this._isDirty
        } as IRefinerSourceData;

      default:
        throw new Error('Bad property id');
    }
  }

  protected async onInit(): Promise<void> {
    
    // assign the content class name to prefix styles
    this._contentClassName = STYLE_PREFIX + this.instanceId;

    // Disable PnP Telemetry
    const telemetry = PnPTelemetry.getInstance();
    telemetry.optOut();

    this._extensibilityService = new ExtensibilityService();

    this._initializeRequiredProperties();
    this.initThemeVariant();

    // Initialize File Type UI Fabric icon
    initializeFileTypeIcons(void 0, { disableWarnings: true });

    this._dynamicDataService = new DynamicDataService(this.context.dynamicDataProvider);
    this.ensureDataSourceConnection();

    if (Environment.type === EnvironmentType.Local) {
      this._searchService = new MockSearchService();
      this._userService = new MockUserService();
      this._templateService = new MockTemplateService(this.context.pageContext.cultureInfo.currentUICultureName, this.context, this._searchService, this._extensibilityService);
    } else {
      this._searchService = new SearchService(this.context.pageContext, this.context.spHttpClient);
      this._userService = new UserService(this.context.pageContext);
      
      this._timeZoneBias = {
          WebBias: this.context.pageContext.legacyPageContext.webTimeZoneData.Bias,
          WebDST: this.context.pageContext.legacyPageContext.webTimeZoneData.DaylightBias,
          UserBias: null,
          UserDST: null,
          Id:  this.context.pageContext.legacyPageContext.webTimeZoneData.Id
      };

      if (this.context.pageContext.legacyPageContext.userTimeZoneData) {
          this._timeZoneBias.UserBias = this.context.pageContext.legacyPageContext.userTimeZoneData.Bias;
          this._timeZoneBias.UserDST = this.context.pageContext.legacyPageContext.userTimeZoneData.DaylightBias;
          this._timeZoneBias.Id = this.context.pageContext.legacyPageContext.webTimeZoneData.Id;
      }

      this._templateService = new TemplateService(this.context.spHttpClient, 
                                      this.context.pageContext.cultureInfo.currentUICultureName, this._searchService,  this._extensibilityService,
                                      this._timeZoneBias, this.context);
    }

    this.context.dynamicDataSourceManager.initializeSource(this);

    if(!this.properties.styles || this.properties.styles.trim().length == 0) this.properties.styles = "<style></style>";
    
    this._customStyles = await this._processStyles();
         
    await this._loadExtensibility();

    return super.onInit();

  }

  /**
   * Load extensibility functionality
   */
  private async _loadExtensibility() : Promise<void> {
        
    // Load extensibility library if present
    this._loadedLibraries = await this._extensibilityService.loadExtensibilityLibraries(this.properties.extensibilityLibraries.map((i)=>Guid.parse(i)));
    
    // Disable PnP Telemetry
    const telemetry = PnPTelemetry.getInstance();
    if (telemetry.optOut) telemetry.optOut();

    // Load extensibility additions
    if (this._loadedLibraries && this._loadedLibraries.length>0) {

        const extensions = this._extensibilityService.getAllExtensions(this._loadedLibraries);

        // Add custom web components if any
        this.availableWebComponentDefinitions = AvailableComponents.BuiltinComponents;
        this.availableWebComponentDefinitions = this.availableWebComponentDefinitions.concat(
            this._extensibilityService.filter(extensions, ExtensionTypes.WebComponent)
        );

        this._availableHelpers = this._extensibilityService.filter(extensions, ExtensionTypes.HandlebarsHelper);
        
    } else {

        this.availableWebComponentDefinitions = AvailableComponents.BuiltinComponents;
        this._availableHelpers = [];
        
    }

    return await this._registerExtensions();

}

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private async _processStyles() : Promise<string> {
    
    if(this.properties.styles && this.properties.styles.length > 0 && this.properties.styles !== CssHelper.DEFAULT_STYLE_TAG) {
      
      const processedStyles = await this._templateService.processTemplate({themeVariant: this._themeVariant}, this.properties.styles);
      const styleDoc : Document = (new DOMParser()).parseFromString(processedStyles, 'text/html');
      return CssHelper.prefixStyleElements(styleDoc, CssHelper.convertToClassName(this._contentClassName), true);
      
    }

    return "";

  }

  /**
   * Determines the group fields for refiner settings
   */
  private _getRefinerSettings(): IPropertyPaneField<any>[] {

    const refinerSettings = [
      new this._refinerEditor('refinersConfiguration', {
        key: "refinersConfiguration",
        label: strings.Refiners.EditRefinersLabel,
        refiners: this.properties.refinersConfiguration,
        onAvailablePropertiesUpdated: this._onUpdateAvailableProperties.bind(this),
        onChange : (refiners: IRefinerConfiguration[]) =>{
          this.properties.refinersConfiguration = refiners;
          this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.RefinersWebPart);
        },
        searchService: this._searchService,
        templateService: this._templateService,
        availableProperties: this._availableManagedProperties
      }),
      PropertyPaneDropdown('searchResultsDataSourceReference', {
        options: this._dynamicDataService.getAvailableDataSourcesByType(SearchComponentType.SearchResultsWebPart),
        label: strings.ConnectToSearchResultsLabel
      })
    ];

    return refinerSettings;
  }

  /**
   * Determines the group fields for styling options inside the property pane
   */
  private _getStylingFields(): IPropertyPaneField<any>[] {

    // Options for the search results layout
    const layoutOptions = [
      {
        iconProps: {
          officeFabricIconFontName: 'BulletedList2'
        },
        text: 'Vertical',
        key: RefinersLayoutOption.Vertical,
      },
      {
        iconProps: {
          officeFabricIconFontName: 'ClosePane'
        },
        text: 'Panel',
        key: RefinersLayoutOption.LinkAndPanel 
      }
    ] as IPropertyPaneChoiceGroupOption[];

    // Sets up styling fields
    let stylingFields: IPropertyPaneField<any>[] = [
      PropertyPaneTextField('webPartTitle', {
        label: strings.WebPartTitle
      }),
      PropertyPaneToggle('showBlank', {
        label: strings.ShowBlankLabel,
        checked: this.properties.showBlank,
      }),
      PropertyPaneChoiceGroup('selectedLayout', {
        label: strings.RefinerLayoutLabel,
        options: layoutOptions
      }),
      this._propertyFieldCodeEditor('styles', {
        label: strings.DialogButtonLabel,
        panelTitle: strings.DialogButtonLabel,
        initialValue: this.properties.styles,
        deferredValidationTime: 500,
        onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
        properties: this.properties,
        key: 'inlineTemplateTextCodeEditor',
        language: this._propertyFieldCodeEditorLanguages.Handlebars
      })
    ];

    return stylingFields;
  }

  private _getExtensbilityGroupFields():IPropertyPaneField<any>[] {
    return [
        new this._extensibilityEditor('extensibilityGuid',{
            label: strings.Extensibility.ButtonLabel,
            allowedExtensions: [ ExtensionTypes.WebComponent, ExtensionTypes.HandlebarsHelper ],
            libraries: this._loadedLibraries,
            onLibraryAdded: async (id:Guid) => {
                this.properties.extensibilityLibraries.push(id.toString());
                await this._loadExtensibility();
                return false;
            },
            onLibraryDeleted: async (id:Guid) => {
                this.properties.extensibilityLibraries = this.properties.extensibilityLibraries.filter((lib)=> (lib != id.toString()));
                await this._loadExtensibility();
                return false;
            }       
        })
    ];
  }
  
  private async _registerExtensions() : Promise<void> {

    // Registers web components
    this._templateService.registerWebComponents(this.availableWebComponentDefinitions);

    // Register handlebars helpers
    this._templateService.registerHelpers(this._availableHelpers);
    
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: strings.RefinersConfigurationGroupName,
              groupFields: this._getRefinerSettings()
            },
            {
              groupName: strings.StylingSettingsGroupName,
              groupFields: this._getStylingFields()
            },
            {
              groupName: strings.Extensibility.GroupName,
              groupFields: this._getExtensbilityGroupFields()
            }
          ],
          displayGroupsAsAccordion: true
        }
      ]
    };
  }

  /**
   * Load the property pane code editor
   */
  protected async loadPropertyPaneResources(): Promise<void> {

    // tslint:disable-next-line:no-shadowed-variable
    const { PropertyFieldCodeEditor, PropertyFieldCodeEditorLanguages } = await import(
        /* webpackChunkName: 'search-property-pane' */
        '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
    );
    this._propertyFieldCodeEditor = PropertyFieldCodeEditor;
    this._propertyFieldCodeEditorLanguages = PropertyFieldCodeEditorLanguages;

    const lib : IEditorLibrary = await this._extensibilityService.getEditorLibrary();

    this._extensibilityEditor = lib.getExtensibilityEditor();

    this._refinerEditor = lib.getRefinersEditor();

    const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
        /* webpackChunkName: 'search-property-pane' */
        '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
    );
    this._propertyFieldCollectionData = PropertyFieldCollectionData;
    this._customCollectionFieldType = CustomCollectionFieldType;

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

  protected async onPropertyPaneFieldChanged(propertyPath: string) {

    if (propertyPath.localeCompare('searchResultsDataSourceReference') === 0) {
      this.ensureDataSourceConnection();
    }

    if (propertyPath.localeCompare('refinersConfiguration') === 0) {
      this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.RefinersWebPart);
    }

    if(propertyPath.localeCompare('styles') === 0){
      this._customStyles = await this._processStyles();
    }

  }

  /**
   * Initializes the property pane configuration
   */
  protected async onPropertyPaneConfigurationStart() {
      await this.loadPropertyPaneResources();
  }

  /**
   * Initializes the Web Part required properties if there are not present in the manifest (i.e. during an update scenario)
   */
  private _initializeRequiredProperties() {
    
    if(!this.properties.extensibilityLibraries) this.properties.extensibilityLibraries = [];

    if (<any>this.properties.refinersConfiguration === "") {
      this.properties.refinersConfiguration = [];
    }

    if (Array.isArray(this.properties.refinersConfiguration)) {

      this.properties.refinersConfiguration = this.properties.refinersConfiguration.map(config => {
        if (!config.template) {
          config.template = RefinerTemplateOption.CheckBox;
        }
        if (!config.refinerSortType) {
          config.refinerSortType = RefinersSortOption.ByNumberOfResults;
        }
        if (!config.refinerSortDirection) {
          config.refinerSortDirection = config.refinerSortType == RefinersSortOption.Alphabetical ? RefinerSortDirection.Ascending : RefinerSortDirection.Descending;
        }

        return config;
      });

    } else {

      // Default setup
      this.properties.refinersConfiguration = [
        {
          refinerName: "Created",
          displayValue: "Created Date",
          template: RefinerTemplateOption.CheckBox,
          refinerSortType: RefinersSortOption.Default,
          refinerSortDirection: RefinerSortDirection.Ascending,
          showExpanded: false,
          showValueFilter: false
        },
        {
          refinerName: "Size",
          displayValue: "Size of the file",
          template: RefinerTemplateOption.CheckBox,
          refinerSortType: RefinersSortOption.ByNumberOfResults,
          refinerSortDirection: RefinerSortDirection.Descending,
          showExpanded: false,
          showValueFilter: false
        },
        {
          refinerName: "owstaxidmetadataalltagsinfo",
          displayValue: "Tags",
          template: RefinerTemplateOption.CheckBox,
          refinerSortType: RefinersSortOption.Alphabetical,
          refinerSortDirection: RefinerSortDirection.Ascending,
          showExpanded: false,
          showValueFilter: false
        },
        {
          refinerName: "RefinableString06",
          displayValue: "Person",
          template: RefinerTemplateOption.Persona,
          refinerSortType: RefinersSortOption.Alphabetical,
          refinerSortDirection: RefinerSortDirection.Ascending,
          showExpanded: false,
          showValueFilter: false
        }
      ];
    }
    this.properties.selectedLayout = this.properties.selectedLayout ? this.properties.selectedLayout : RefinersLayoutOption.Vertical;
  }

  /**
   * Handler when the list of available managed properties is fetched by a property pane control¸or a field in a collection data control
   * @param properties the fetched properties
   */
  private _onUpdateAvailableProperties(properties: IComboBoxOption[]) {

    // Save the value in the root Web Part class to avoid fetching it again if the property list is requested again by any other property pane control
    this._availableManagedProperties = cloneDeep(properties);

    // Refresh all fields so other property controls can use the new list
    this.context.propertyPane.refresh();
    this.render();
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
  private async _handleThemeChangedEvent(args: ThemeChangedEventArgs): Promise<void> {
    if (!isEqual(this._themeVariant, args.theme)) {
      this._themeVariant = args.theme;
      this._customStyles = await this._processStyles();
      this.render();
    }
  }

}