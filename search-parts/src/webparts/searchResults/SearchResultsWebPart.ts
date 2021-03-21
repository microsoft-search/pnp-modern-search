import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Text, DisplayMode, ServiceScope, Log } from '@microsoft/sp-core-library';
import { IComboBoxOption, Toggle, IToggleProps, MessageBarType, MessageBar, Link } from 'office-ui-fabric-react';
import { IWebPartPropertiesMetadata } from '@microsoft/sp-webpart-base';
import * as webPartStrings from 'SearchResultsWebPartStrings';
import * as commonStrings from 'CommonStrings';
import { ISearchResultsContainerProps } from './components/ISearchResultsContainerProps';
import { IDataSource, IDataSourceDefinition, IComponentDefinition, ILayoutDefinition, ILayout, IDataFilter, LayoutType, FilterType, FilterComparisonOperator, BaseDataSource } from '@pnp/modern-search-extensibility';
import { 
  IPropertyPaneConfiguration,
  IPropertyPaneChoiceGroupOption, 
  IPropertyPaneGroup, 
  PropertyPaneChoiceGroup, 
  IPropertyPaneField, 
  PropertyPaneHorizontalRule, 
  PropertyPaneToggle,
  PropertyPaneTextField, 
  PropertyPaneSlider,
  IPropertyPanePage,
  PropertyPaneDropdown,
  PropertyPaneCheckbox,
  PropertyPaneDynamicField,
} from "@microsoft/sp-property-pane";
import ISearchResultsWebPartProps, { QueryTextSource } from './ISearchResultsWebPartProps';
import { AvailableDataSources, BuiltinDataSourceProviderKeys } from '../../dataSources/AvailableDataSources';
import { ServiceKey } from "@microsoft/sp-core-library";
import SearchResultsContainer from './components/SearchResultsContainer';
import { AvailableLayouts, BuiltinLayoutsKeys } from '../../layouts/AvailableLayouts';
import { ITemplateService } from '../../services/templateService/ITemplateService';
import { TemplateService } from '../../services/templateService/TemplateService';
import { ServiceScopeHelper } from '../../helpers/ServiceScopeHelper';
import { isEmpty, isEqual, uniqBy } from "@microsoft/sp-lodash-subset";
import { AvailableComponents } from '../../components/AvailableComponents';
import { DynamicProperty } from '@microsoft/sp-component-base';
import { ITemplateSlot } from '@pnp/modern-search-extensibility';
import { IDataContext } from '@pnp/modern-search-extensibility';
import { ResultTypeOperator } from '../../models/common/IDataResultType';
import { TokenService, BuiltinTokenNames } from '../../services/tokenService/TokenService';
import { ITokenService } from '@pnp/modern-search-extensibility';
import { TaxonomyService } from '../../services/taxonomyService/TaxonomyService';
import { SharePointSearchService } from '../../services/searchService/SharePointSearchService';
import IDynamicDataService from '../../services/dynamicDataService/IDynamicDataService';
import { IDataFilterSourceData } from '../../models/dynamicData/IDataFilterSourceData';
import { ComponentType } from '../../common/ComponentType';
import { DynamicDataService } from '../../services/dynamicDataService/DynamicDataService';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { IDataResultSourceData } from '../../models/dynamicData/IDataResultSourceData';
import { LayoutHelper } from '../../helpers/LayoutHelper';
import { IAsyncComboProps } from '../../controls/PropertyPaneAsyncCombo/components/IAsyncComboProps';
import { AsyncCombo } from '../../controls/PropertyPaneAsyncCombo/components/AsyncCombo';
import { Constants } from '../../common/Constants';
import PnPTelemetry from "@pnp/telemetry-js";
import { IPageEventInfo } from '../../components/PaginationComponent';
import { DataFilterHelper } from '../../helpers/DataFilterHelper';
import { BuiltinFilterTemplates } from '../../layouts/AvailableTemplates';
import { IExtensibilityConfiguration } from '../../models/common/IExtensibilityConfiguration';
import { IDataVerticalSourceData } from '../../models/dynamicData/IDataVerticalSourceData';
import { BaseWebPart } from '../../common/BaseWebPart';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import commonStyles from '../../styles/Common.module.scss';

const LogSource = "SearchResultsWebPart";

export default class SearchResultsWebPart extends BaseWebPart<ISearchResultsWebPartProps> implements IDynamicDataCallables {

  /**
   * The error message
   */
  private errorMessage: string = undefined;

  /**
   * Dynamic data related fields
   */
  private _filtersSourceData: DynamicProperty<IDataFilterSourceData>;
  private _verticalsSourceData: DynamicProperty<IDataVerticalSourceData>;  

  private _dataResultsSourceData: IDataResultSourceData = {
    availableFieldsFromResults: [],
    availablefilters: []
  };

  /**
   * Dynamically loaded components for property pane
   */
  private _placeholderComponent: any = null;
  private _propertyFieldCodeEditor: any = null;
  private _propertyFieldCodeEditorLanguages: any = null;
  private _propertyFieldCollectionData: any = null;
  private _propertyFieldToogleWithCallout: any = null;
  private _propertyFieldDropownWithCallout: any = null;
  private _propertyFieldCalloutTriggers: any = null;
  private _propertyFieldNumber: any = null;
  private _customCollectionFieldType: any = null;
  private _textDialogComponent: any = null;

  /**
   * The selected data source for the WebPart
   */
  private dataSource: IDataSource;

  /**
   * Properties to avoid to recreate instances every render
   */
  private lastDataSourceKey: string;
  private lastLayoutKey: string;

  /**
   * The selected layout for the Web Part
   */
  private layout: ILayout;

  /**
   * The template content to display
   */
  private templateContentToDisplay: string;

  /**
   * The template service instance
   */
  private templateService: ITemplateService = undefined;

  /**
   * The available data source definitions (not instanciated)
   */
  private availableDataSourceDefinitions: IDataSourceDefinition[] = AvailableDataSources.BuiltinDataSources;

  /**
   * The available layout definitions (not instanciated)
   */
  private availableLayoutDefinitions: ILayoutDefinition[] = AvailableLayouts.BuiltinLayouts.filter(layout => { return layout.type === LayoutType.Results; });

  /**
   * The available web component definitions (not registered yet)
   */
  private availableWebComponentDefinitions: IComponentDefinition<any>[] = AvailableComponents.BuiltinComponents;

  /**
   * The current page number
   */
  private currentPageNumber: number = 1;

  /**
   * The page URL link if provided by the data source
   */
  private currentPageLinkUrl: string = null;

  /**
   * The available page links available in the pagination control
   */
  private availablePageLinks: string[] = [];

  /**
   * The token service instance
   */
  private tokenService: ITokenService;

  /**
   * the dynamic data service instance
   */
  private dynamicDataService: IDynamicDataService;

  /**
   * The service scope for this specific Web Part instance
   */
  private webPartInstanceServiceScope: ServiceScope;

  private _lastSelectedFilters: IDataFilter[] = [];
  private _lastInputQueryText: string = undefined;

  /**
   * The default template slots when the data source is instanciated for the first time
   */
  private _defaultTemplateSlots: ITemplateSlot[];

  private _pushStateCallback = null;

  /**
   * The available connections as property pane group
   */
  private propertyPaneConnectionsGroup: IPropertyPaneGroup[] = [];

  constructor() {
    super();

    this._bindHashChange = this._bindHashChange.bind(this);    
  }

  public async render(): Promise<void> {    

      // Determine the template content to display
      // In the case of an external template is selected, the render is done asynchronously waiting for the content to be fetched
      await this.initTemplate();

      // We resolve data source and layout instances directly in the render method to avoid unexpected render triggers due to Web Part property bag manipulation 
      // SPFx has an inner routine in reactive mode to trigger a render every time a property bag value is updated conflicting with the way data source and layouts share properties (see _afterPropertyUpdated)

      try {

        // Reset the error message every time
        this.errorMessage = undefined;

        // Get and initialize the data source instance if different (i.e avoid to create a new instance every time)
        if (this.lastDataSourceKey !== this.properties.dataSourceKey) {
          this.dataSource = await this.getDataSourceInstance(this.properties.dataSourceKey);          
          this.lastDataSourceKey = this.properties.dataSourceKey;
        }

        // Get and initialize layout instance if different (i.e avoid to create a new instance every time)
        if (this.lastLayoutKey !== this.properties.selectedLayoutKey) {
          this.layout = await LayoutHelper.getLayoutInstance(this.webPartInstanceServiceScope, this.context, this.properties, this.properties.selectedLayoutKey, this.availableLayoutDefinitions);
          this.lastLayoutKey = this.properties.selectedLayoutKey;
        }

      } catch (error) {
        // Catch instanciation or wrong definition errors for extensibility scenarios
        this.errorMessage = error.message ? error.message : error;
      }

      // Refresh the token values with the latest information from environment (i.e connections and settings)
      this.setTokens();
      
      // Refresh the property pane to get layout and data source options
      if (this.context.propertyPane.isPropertyPaneOpen()) {
        this.context.propertyPane.refresh();
      }
      
      return this.renderCompleted();
  }

  public getPropertyDefinitions(): IDynamicDataPropertyDefinition[] {
    // Use the Web Part title as property title since we don't expose sub properties
    return [
       {
           id: ComponentType.SearchResults,
           title: this.properties.title ? `${this.properties.title} - ${this.instanceId}` : `${webPartStrings.General.WebPartDefaultTitle} - ${this.instanceId}`
       }
    ];
  }    

  public getPropertyValue(propertyId: string) {

    switch (propertyId) {
      case ComponentType.SearchResults:
        return this._dataResultsSourceData;
    }

    throw new Error('Bad property id');
  }

  protected renderCompleted(): void {

    let renderRootElement: JSX.Element = null;
    let renderDataContainer: JSX.Element = null;

    const inputQueryFromDataSource = this.properties.queryText.tryGetValue();
    const inputQueryText = inputQueryFromDataSource ? inputQueryFromDataSource : this.properties.defaultQueryText;
    
    // Build the data context to pass to the data source
    let dataContext: IDataContext = {
      pageNumber: this.currentPageNumber,
      itemsCountPerPage: this.properties.paging.itemsCountPerPage,
      paging: {
        nextLinkUrl: this.currentPageLinkUrl,
        pageLinks: this.availablePageLinks
      },
      filters: {
        selectedFilters: [],
        filtersConfiguration: [],
        instanceId: undefined,
        filterOperator: undefined
      },
      inputQueryText: inputQueryText,
    };

    if (this.dataSource) {

      // The main content WP logic
      renderDataContainer = React.createElement(SearchResultsContainer, {
        dataSource: this.dataSource,
        dataSourceKey: this.properties.dataSourceKey,
        templateContent: this.templateContentToDisplay,
        instanceId: this.instanceId,
        properties: JSON.parse(JSON.stringify(this.properties)), // Create a copy to avoid unexpected reference value updates from data sources 
        onDataRetrieved: (availableFields, filters, pageNumber, nextLinkUrl, pageLinks) => {
          
          this._dataResultsSourceData.availableFieldsFromResults = availableFields;
          this.currentPageNumber = pageNumber;
          this.availablePageLinks = pageLinks;
          this.currentPageLinkUrl = nextLinkUrl;

          // Set the available filters from the data source 
          if (filters) {
            this._dataResultsSourceData.availablefilters = filters;
          }

          // Check if the Web part is connected to a data vertical
          if (this._verticalsSourceData && this.properties.selectedVerticalKey) {
            const verticalData = this._verticalsSourceData.tryGetValue();

            // For edit mode only, we want to see the data
            if (verticalData && verticalData.selectedVertical.key !== this.properties.selectedVerticalKey) {

              // If the current selected vertical is not the one configured for this Web Part, we reset
              // the data soure information since we don't want to expose them to consumers
              this._dataResultsSourceData = {
                availableFieldsFromResults: [],
                availablefilters: []
              };
            }
          }

          // Notfify dynamic data consumers data have changed
          this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchResults);
            
          // Extra call to refresh the property pane in the case where data sources rely on results fields in there configuration (ex: ODataDataSource)
          this.context.propertyPane.refresh();
        },
        pageContext: this.context.pageContext,
        dataContext: dataContext,
        themeVariant: this._themeVariant,
        serviceScope: this.webPartInstanceServiceScope,
        webPartTitleProps: {
          displayMode: this.displayMode,
          title: this.properties.title,
          updateProperty: (value: string) => {
            this.properties.title = value;
          },
          themeVariant: this._themeVariant,
          className: commonStyles.wpTitle
        }
      } as ISearchResultsContainerProps);

      // Get data from connected sources
      if (this._filtersSourceData) {
        const filtersSourceData: IDataFilterSourceData = this._filtersSourceData.tryGetValue();
        if (filtersSourceData) {

          // Reset the page number if filters have been updated by the user
          if (!isEqual(filtersSourceData.selectedFilters, this._lastSelectedFilters)) {
            dataContext.pageNumber = 1;
          }
        
          // Use the filter confiugration and then get the corresponding values 
          dataContext.filters.filtersConfiguration = filtersSourceData.filterConfiguration;
          dataContext.filters.selectedFilters = filtersSourceData.selectedFilters;
          dataContext.filters.filterOperator = filtersSourceData.filterOperator;
          dataContext.filters.instanceId = filtersSourceData.instanceId;

          this._lastSelectedFilters = dataContext.filters.selectedFilters;
        }
      }

      if (!isEqual(inputQueryText, this._lastInputQueryText)) {
        dataContext.pageNumber = 1;
        this.currentPageNumber = 1;
        this._resetPagingData();
      }

      this._lastInputQueryText = inputQueryText;

      renderRootElement = renderDataContainer; 

    } else {

        if (this.displayMode === DisplayMode.Edit) {
            const placeholder: React.ReactElement<any> = React.createElement(
                this._placeholderComponent,
                {
                    iconName: 'Database',
                    iconText: webPartStrings.General.PlaceHolder.IconText,
                    description: webPartStrings.General.PlaceHolder.Description,
                    buttonLabel: webPartStrings.General.PlaceHolder.ConfigureBtnLabel,
                    onConfigure: () => { this.context.propertyPane.openDetails(); }
                }
            );
            renderRootElement = placeholder;
        } else {
          renderRootElement = null;
          Log.verbose(`[SearchResultsWebPart.renderCompleted]`, `The 'renderRootElement' was null during render.`, this.webPartInstanceServiceScope);
        }
    }

    // Check if the Web part is connected to a data vertical
    if (this._verticalsSourceData && this.properties.selectedVerticalKey) {
      const verticalData = this._verticalsSourceData.tryGetValue();

      // Remove the blank space introduced by the control zone when the Web Part displays nothing
      // WARNING: in theory, we are not supposed to touch DOM outside of the Web Part root element, This will break if the page sttribute change
      
      // 1st attempt: use the DOM element with the Web Part instance id     
      let parentControlZone =  document.getElementById(this.instanceId);

      if (!parentControlZone) {

        // 2nd attempt: Try the data-automation-id attribute as we suppose MS tests won't change this name for a while for convenience.
        parentControlZone = this.domElement.closest(`div[data-automation-id='CanvasControl'], .CanvasControl`);

        if (!parentControlZone) {

          // 3rd attempt: try the Control zone with ID
          parentControlZone = this.domElement.closest(`div[data-sp-a11y-id="ControlZone_${this.instanceId}"]`);

          if (!parentControlZone) {
            Log.warn(LogSource,`Parent control zone DOM element was not found in the DOM.`, this.webPartInstanceServiceScope);
          }
        }
      }
      
      // If the current selected vertical is not the one configured for this Web Part, we show nothing
      if (verticalData && verticalData.selectedVertical.key !== this.properties.selectedVerticalKey) {

        if (this.displayMode === DisplayMode.Edit) {

          if (parentControlZone) {
            parentControlZone.removeAttribute('style');
          }

          renderRootElement = React.createElement('div', {}, 
                                React.createElement(
                                  MessageBar, {
                                    messageBarType: MessageBarType.info,
                                    }, 
                                    webPartStrings.General.CurrentVerticalNotSelectedMessage
                                ),
                                renderRootElement
                              );
        } else {
          renderRootElement = null;

          // Reset data source information
          this._dataResultsSourceData = {
            availableFieldsFromResults: [],
            availablefilters: []
          };

          if (parentControlZone) {
            // Remove margin and padding for the empty control zone
            parentControlZone.setAttribute('style', 'margin-top:0px;padding:0px');
          }
        }

      } else {

        if (parentControlZone) {
          parentControlZone.removeAttribute('style');
        }
      }
    }  
    
    // Error message
    if (this.errorMessage) {
      renderRootElement = React.createElement(MessageBar, {
        messageBarType: MessageBarType.error,
      }, this.errorMessage, React.createElement(Link, {
        target: '_blank',
        href: this.properties.documentationLink
      }, commonStrings.General.Resources.PleaseReferToDocumentationMessage));
    }

    ReactDom.render(renderRootElement, this.domElement);

    // This call set this.renderedOnce to 'true' so we need to execute it at the very end
    super.renderCompleted(); 
  }

  protected async onInit(): Promise<void> {

    // Initializes Web Part properties
    this.initializeProperties();

    // Initializes shared services
    await this.initializeBaseWebPart();

    // Initializes the Web Part instance services
    this.initializeWebPartServices();

    // Load extensibility libaries extensions
    await this.loadExtensions(this.properties.extensibilityLibraryConfiguration);

    // Bind web component events
    this.bindPagingEvents();

    this._bindHashChange();
    this._handleQueryStringChange();

    // Register Web Components in the global page context. We need to do this BEFORE the template processing to avoid race condition.
    // Web components are only defined once.
    await this.templateService.registerWebComponents(this.availableWebComponentDefinitions);
    
    try {
      // Disable PnP Telemetry
      const telemetry = PnPTelemetry.getInstance();
      telemetry.optOut();
    } catch(error) {
      Log.warn(LogSource, `Opt out for PnP Telemetry failed. Details: ${error}`, this.context.serviceScope);
    }

    if (this.properties.dataSourceKey && this.properties.selectedLayoutKey) {

      const usageEvent = {
        name: Constants.PNP_MODERN_SEARCH_EVENT_NAME,
        properties: {
          selectedDataSource: this.properties.dataSourceKey,
          selectedLayout: this.properties.selectedLayoutKey,
          useFilters: this.properties.useFilters,
          useVerticals: this.properties.useVerticals
        }
      };

      // Track event with application insights (PnP)
      const appInsights = new ApplicationInsights({ 
        config: {
          maxBatchInterval: 0,
          instrumentationKey: Constants.PNP_APP_INSIGHTS_INSTRUMENTATION_KEY,
          namePrefix: LogSource,
          disableFetchTracking: true,
          disableAjaxTracking: true
        } 
      });
  
      // Track event with application insights (Fallback)
      const appInsightsFallback = new ApplicationInsights({ 
        config: {
          maxBatchInterval: 0,
          instrumentationKey: Constants.PNP_APP_INSIGHTS_INSTRUMENTATION_KEY_FALLBACK,
          namePrefix: LogSource,
          disableFetchTracking: true,
          disableAjaxTracking: true
        } 
      });

      appInsights.loadAppInsights();
      appInsights.context.application.ver = this.manifest.version;
      appInsights.trackEvent(usageEvent);

      appInsightsFallback.loadAppInsights();   
      appInsightsFallback.context.application.ver = this.manifest.version;
      appInsightsFallback.trackEvent(usageEvent);
    }
   
    // Initializes MS Graph Toolkit
    if (this.properties.useMicrosoftGraphToolkit) {
      await this.loadMsGraphToolkit();
    }

    // Initializes this component as a discoverable dynamic data source
    this.context.dynamicDataSourceManager.initializeSource(this);
 
    if (this.displayMode === DisplayMode.Edit) {
      const { Placeholder } = await import(
          /* webpackChunkName: 'pnp-modern-search-property-pane' */
          '@pnp/spfx-controls-react/lib/Placeholder'
      );
      this._placeholderComponent = Placeholder;
    }
  
    // Initializes dynamic data connections. This could trigger a render if a connection is made with an other component resulting to a render race condition.
    this.ensureDataSourceConnection();

    return super.onInit();
  }

  protected onDispose(): void {
    if (this._pushStateCallback) {
        window.history.pushState = this._pushStateCallback;
    }
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get propertiesMetadata(): IWebPartPropertiesMetadata {
    return {
        'filtersData': {
            dynamicPropertyType: 'object'
        },
        'queryText': {
          dynamicPropertyType: 'string'
        }
    };
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    let propertyPanePages: IPropertyPanePage[] = [];
    let layoutSlotsGroup: IPropertyPaneGroup[] = [];
    let commonDataSourceProperties: IPropertyPaneGroup[] = [];
    let extensibilityConfigurationGroups: IPropertyPaneGroup[] = [];
    
    // Retrieve the property settings for the data source provider
    let dataSourceProperties: IPropertyPaneGroup[] = [];
    
    // Data source options page
    propertyPanePages.push(
      {
        groups: [
          {
            groupName: webPartStrings.PropertyPane.DataSourcePage.DataSourceConnectionGroupName,
            groupFields: [
              PropertyPaneChoiceGroup('dataSourceKey', {
                options: this.getDataSourceOptions()
              })
            ]
          }
        ],
        displayGroupsAsAccordion: true
      }
    );

    // A data source is selected
    if (this.dataSource && !this.errorMessage) {

      dataSourceProperties = this.dataSource.getPropertyPaneGroupsConfiguration();
    
      // Add template slots if any
      if (this.dataSource.getTemplateSlots().length > 0) {
        layoutSlotsGroup = [{
          groupName: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.GroupName,
          groupFields: this.getTemplateSlotOptions()
        }];
      }
  
      // Add data source options to the first page
      propertyPanePages[0].groups = propertyPanePages[0].groups.concat([
            ...layoutSlotsGroup,
            // Load data source specific properties
            ...dataSourceProperties,
            ...commonDataSourceProperties,
            {
              groupName: webPartStrings.PropertyPane.DataSourcePage.PagingOptionsGroupName,
              groupFields: this.getPagingGroupFields()
            }
      ]);

      // Other pages
      propertyPanePages.push(
        {
          displayGroupsAsAccordion: true,
          groups: this.getStylingPageGroups()
        },
        {
          groups: [
            ...this.propertyPaneConnectionsGroup
          ],
          displayGroupsAsAccordion: true
        }
      );
    } 

    // Extensibility configuration
    extensibilityConfigurationGroups.push({
      groupName: commonStrings.PropertyPane.InformationPage.Extensibility.GroupName,
      groupFields: this.getExtensibilityFields()
    });
     

    // 'About' infos
    propertyPanePages.push(      
      {
        displayGroupsAsAccordion: true,
        groups: [
          ...this.getPropertyPaneWebPartInfoGroups(),
          ...extensibilityConfigurationGroups
        ]
      }
    );

    return {
      pages: propertyPanePages
    };
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {

    // Bind connected data sources
    if (propertyPath.localeCompare('filtersDataSourceReference') === 0 && this.properties.filtersDataSourceReference) {
      this.ensureDataSourceConnection();
    }

    if (propertyPath.localeCompare('verticalsDataSourceReference') === 0 && this.properties.verticalsDataSourceReference) {
      this.ensureDataSourceConnection();
      this.context.propertyPane.refresh();
    }

    if (propertyPath.localeCompare('useFilters') === 0) {
      if (!this.properties.useFilters) {
          this.properties.filtersDataSourceReference = undefined;
          this._filtersSourceData = undefined;
          this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchResults);
      }
    }

    if (propertyPath.localeCompare('useVerticals') === 0) {
      if (!this.properties.useVerticals) {
          this.properties.verticalsDataSourceReference = undefined;
          this.properties.selectedVerticalKey = undefined;
          this._verticalsSourceData = undefined;
      }
    }
    
    // Detect if the layout has been changed to custom
    if (propertyPath.localeCompare('inlineTemplateContent') === 0) {

        // Automatically switch the option to 'Custom' if a default template has been edited
        // (meaning the user started from a default template)
        if (this.properties.inlineTemplateContent && this.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsCustom) {
            this.properties.selectedLayoutKey = BuiltinLayoutsKeys.ResultsCustom;

            // Reset also the template URL
            this.properties.externalTemplateUrl = '';

            // Reset the layout options (otherwise we stay with the previous layout options)
            this.context.propertyPane.refresh();
        }
    }

    // Notify data source a property has been updated (only if the data source is already selected)
    if ((propertyPath.localeCompare('dataSourceKey') !== 0) && this.dataSource) {
      this.dataSource.onPropertyUpdate(propertyPath, oldValue, newValue);
    }

    // Reset the data source properties
    if (propertyPath.localeCompare('dataSourceKey') === 0 && !isEqual(oldValue, newValue)) {

      // Reset dynamic data source data
      this._dataResultsSourceData.availablefilters = [];
      this._dataResultsSourceData.availableFieldsFromResults = [];
      
      // Notfify dynamic data consumers data have changed
      this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchResults);

      this.properties.dataSourceProperties = {};
      this.properties.templateSlots = null;
      
      // Reset paging information
      this.currentPageNumber = 1;

      this._resetPagingData();
    }

    // Reset layout properties
    if (propertyPath.localeCompare('selectedLayoutKey') === 0 && !isEqual(oldValue, newValue) && this.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsDebug.toString()) {
      this.properties.layoutProperties = {};
    }

    // Notify layout a property has been updated (only if the layout is already selected)
    if ((propertyPath.localeCompare('selectedLayoutKey') !== 0) && this.layout) {
        this.layout.onPropertyUpdate(propertyPath, oldValue, newValue);
    }

    // Remove the connection when static query text or unused
    if ((propertyPath.localeCompare('queryTextSource') === 0 && this.properties.queryTextSource === QueryTextSource.StaticValue) ||
        (propertyPath.localeCompare('queryTextSource') === 0 && oldValue  === QueryTextSource.StaticValue && newValue === QueryTextSource.DynamicValue) ||
        (propertyPath.localeCompare('useInputQueryText') === 0 && !this.properties.useInputQueryText)) {

        if (this.properties.queryText.tryGetSource()) {
          this.properties.queryText.unregister(this.render);
        }

        this.properties.queryText.setValue('');
    }

    // Update template slots when default slots from data source change (ex: OData client type)
    if (propertyPath.indexOf('dataSourceProperties') !== -1 && this.dataSource && this._defaultTemplateSlots && !isEqual(this._defaultTemplateSlots, this.dataSource.getTemplateSlots())) {
      this.properties.templateSlots = this.dataSource.getTemplateSlots();
      this._defaultTemplateSlots = this.dataSource.getTemplateSlots();
    }

    if (propertyPath.localeCompare('paging.itemsCountPerPage') === 0) {
      this._resetPagingData();
    }

    if (propertyPath.localeCompare('extensibilityLibraryConfiguration') === 0) {

      // Remove duplicates if any
      const cleanConfiguration = uniqBy(this.properties.extensibilityLibraryConfiguration , 'id');

      // Reset existing definitions to default
      this.availableDataSourceDefinitions = AvailableDataSources.BuiltinDataSources;
      this.availableLayoutDefinitions = AvailableLayouts.BuiltinLayouts.filter(layout => { return layout.type === LayoutType.Results; });
      this.availableWebComponentDefinitions = AvailableComponents.BuiltinComponents;

      await this.loadExtensions(cleanConfiguration);
    }

    if (this.properties.queryTextSource === QueryTextSource.StaticValue || !this.properties.useDefaultQueryText || !this.properties.useInputQueryText) {
      // Reset the default query text
      this.properties.defaultQueryText = undefined;
    }

    if (propertyPath.localeCompare("useMicrosoftGraphToolkit") === 0 && this.properties.useMicrosoftGraphToolkit) {

      // We load this dynamically to avoid tokens renewal failure at page load and decrease the bundle size. Most of the time, MGT won't be used in templates.
      await this.loadMsGraphToolkit();
    }

    // Refresh list of available connections
    this.propertyPaneConnectionsGroup = await this.getConnectionOptionsGroup();
    this.context.propertyPane.refresh();

    // Reset the page number to 1 every time the Web Part properties change
    this.currentPageNumber = 1;
  }

  protected get isRenderAsync(): boolean {
    return true;
  }

  protected async onPropertyPaneConfigurationStart() {
    await this.loadPropertyPaneResources();
  }

  /**
   * Loads the Microsoft Graph Toolkit library dynamically
   */
  private async loadMsGraphToolkit() {

    // Load Microsoft Graph Toolkit dynamically
    const { Providers, SharePointProvider } = await import(
        /* webpackChunkName: 'microsoft-graph-toolkit' */
        '@microsoft/mgt/dist/es6'
    );

    Providers.globalProvider = new SharePointProvider(this.context);
  }

  /**
   * Loads extensions from registered extensibility librairies
   */
  private async loadExtensions(librariesConfiguration: IExtensibilityConfiguration[]) {

     // Load extensibility library if present
     const extensibilityLibraries = await this.extensibilityService.loadExtensibilityLibraries(librariesConfiguration);

     // Load extensibility additions
     if (extensibilityLibraries.length > 0) {

       // Load customizations from extensibility libraries
       extensibilityLibraries.forEach(extensibilityLibrary => {
         
          // Add custom web components if any
          this.availableWebComponentDefinitions = this.availableWebComponentDefinitions.concat(extensibilityLibrary.getCustomWebComponents());
        
          // Registers Handlebars customizations in the local namespace
          extensibilityLibrary.registerHandlebarsCustomizations(this.templateService.Handlebars);
        });
     }
  }

  private async loadPropertyPaneResources(): Promise<void> {

    const { PropertyFieldCodeEditor, PropertyFieldCodeEditorLanguages } = await import(
        /* webpackChunkName: 'pnp-modern-search-property-pane' */
        '@pnp/spfx-property-controls/lib/propertyFields/codeEditor'
    );
    
    this._propertyFieldCodeEditor = PropertyFieldCodeEditor;
    this._propertyFieldCodeEditorLanguages = PropertyFieldCodeEditorLanguages;


    const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
      /* webpackChunkName: 'pnp-modern-search-property-pane' */
      '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
    );
    this._propertyFieldCollectionData = PropertyFieldCollectionData;
    this._customCollectionFieldType = CustomCollectionFieldType;

    // Code editor component for property pane controls
    this._textDialogComponent = await import(
        /* webpackChunkName: 'pnp-modern-search-property-pane' */
        '../../controls/TextDialog'
    );

    const { PropertyFieldToggleWithCallout } = await import(
      /* webpackChunkName: 'pnp-modern-search-property-pane' */
      '@pnp/spfx-property-controls/lib/PropertyFieldToggleWithCallout'
    );

    const { CalloutTriggers } = await import(
      /* webpackChunkName: 'pnp-modern-search-property-pane' */
      '@pnp/spfx-property-controls/lib/common/callout/Callout'
    );

    const { PropertyFieldNumber  } = await import(
      /* webpackChunkName: 'pnp-modern-search-property-pane' */
      '@pnp/spfx-property-controls/lib/PropertyFieldNumber'
    );

    const { PropertyFieldDropdownWithCallout  } = await import(
        /* webpackChunkName: 'pnp-modern-search-property-pane' */
        '@pnp/spfx-property-controls/lib/PropertyFieldDropdownWithCallout'
      );

    this._propertyFieldToogleWithCallout = PropertyFieldToggleWithCallout;
    this._propertyFieldCalloutTriggers = CalloutTriggers;

    this._propertyFieldDropownWithCallout = PropertyFieldDropdownWithCallout;

    this._propertyFieldNumber = PropertyFieldNumber;

    this.propertyPaneConnectionsGroup = await this.getConnectionOptionsGroup();
  }

  /**
   * Binds event fired from pagination web components
   */
  private bindPagingEvents() {

    this.domElement.addEventListener('pageNumberUpdated', ((ev: CustomEvent) => {

      // We ensure the event if not propagated outside the component (i.e. other Web Part instances)
      ev.stopImmediatePropagation();

      const eventDetails: IPageEventInfo = ev.detail;

      // These information comes from the PaginationWebComponent class
      this.currentPageNumber = eventDetails.pageNumber;
      this.currentPageLinkUrl = eventDetails.pageLink;
      this.availablePageLinks = eventDetails.pageLinks;

      this.render();
  
    }).bind(this));
  }
  
  /**
   * Initializes required Web Part properties
   */
  private initializeProperties() {
    this.properties.selectedLayoutKey  = this.properties.selectedLayoutKey ? this.properties.selectedLayoutKey : BuiltinLayoutsKeys.Cards;
    this.properties.resultTypes = this.properties.resultTypes ? this.properties.resultTypes : [];
    this.properties.dataSourceProperties = this.properties.dataSourceProperties ? this.properties.dataSourceProperties : {};
    this.properties.queryText = this.properties.queryText ? this.properties.queryText : new DynamicProperty<string>(this.context.dynamicDataProvider);
    this.properties.queryTextSource = this.properties.queryTextSource ? this.properties.queryTextSource : QueryTextSource.StaticValue;
    this.properties.layoutProperties = this.properties.layoutProperties ? this.properties.layoutProperties : {};

    this.properties.showSelectedFilters = this.properties.showSelectedFilters !== undefined  ? this.properties.showSelectedFilters : false;
    this.properties.showResultsCount = this.properties.showResultsCount !== undefined  ? this.properties.showResultsCount : true;
    this.properties.showBlankIfNoResult = this.properties.showBlankIfNoResult !== undefined  ? this.properties.showBlankIfNoResult : false;
    this.properties.useMicrosoftGraphToolkit = this.properties.useMicrosoftGraphToolkit !== undefined  ? this.properties.useMicrosoftGraphToolkit : false;

    this.properties.extensibilityLibraryConfiguration = this.properties.extensibilityLibraryConfiguration ? this.properties.extensibilityLibraryConfiguration : [{
      name: commonStrings.General.Extensibility.DefaultExtensibilityLibraryName,
      enabled: true,
      id: Constants.DEFAULT_EXTENSIBILITY_LIBRARY_COMPONENT_ID
    }];

    this.properties.useVerticals = this.properties.useVerticals !== undefined ? this.properties.useVerticals : false;
    
    if (!this.properties.paging) {

      this.properties.paging = {
        itemsCountPerPage: 10,
        pagingRange: 5,
        showPaging: true,
        hideDisabled: true,
        hideFirstLastPages: false,
        hideNavigation: false,
        useNextLinks: false
      };
    }
  }

  /**
   * Returns property pane 'Styling' page groups
   */
  private getStylingPageGroups(): IPropertyPaneGroup[] {

    const canEditTemplate = this.properties.externalTemplateUrl && this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustom ? false : true;

    let stylingFields: IPropertyPaneField<any>[] = [
      PropertyPaneChoiceGroup('selectedLayoutKey', {
        options: LayoutHelper.getLayoutOptions(this.availableLayoutDefinitions)
      })
    ];

    let resultTypeInlineTemplate = undefined;

    switch (this.properties.selectedLayoutKey) {
      case BuiltinLayoutsKeys.SimpleList:
        resultTypeInlineTemplate = require('../../layouts/resultTypes/default_simple_list.html');
        break;

      case BuiltinLayoutsKeys.Cards:
        resultTypeInlineTemplate = require('../../layouts/resultTypes/default_cards.html');
        break;

      case BuiltinLayoutsKeys.ResultsCustom:
        resultTypeInlineTemplate = require('../../layouts/resultTypes/default_custom.html');
        break;

      case BuiltinLayoutsKeys.People:
        resultTypeInlineTemplate = require('../../layouts/resultTypes/default_people.html');
        break;

      default:
          break;
    }

    // We can customize the template for any layout
    stylingFields.push(
      this._propertyFieldCodeEditor('inlineTemplateContent', {
          label: webPartStrings.PropertyPane.LayoutPage.DialogButtonLabel,
          panelTitle: webPartStrings.PropertyPane.LayoutPage.DialogTitle,
          initialValue: this.templateContentToDisplay,
          deferredValidationTime: 500,
          onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
          properties: this.properties,
          disabled: !canEditTemplate,
          key: 'inlineTemplateContentCodeEditor',
          language: this._propertyFieldCodeEditorLanguages.Handlebars
      }),
      this._propertyFieldCollectionData('resultTypes', {
        manageBtnLabel: webPartStrings.PropertyPane.LayoutPage.ResultTypes.EditResultTypesLabel,
        key: 'resultTypes',
        panelHeader: webPartStrings.PropertyPane.LayoutPage.ResultTypes.EditResultTypesLabel,
        panelDescription: webPartStrings.PropertyPane.LayoutPage.ResultTypes.ResultTypesDescription,
        enableSorting: true,
        label: webPartStrings.PropertyPane.LayoutPage.ResultTypes.ResultTypeslabel,
        value: this.properties.resultTypes,
        disabled: this.properties.selectedLayoutKey === BuiltinLayoutsKeys.DetailsList 
                  || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsDebug 
                  || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.Slider ? true : false,
        fields: [
            {
                id: 'property',
                title: webPartStrings.PropertyPane.LayoutPage.ResultTypes.ConditionPropertyLabel,
                type: this._customCollectionFieldType.dropdown,
                required: true,
                options: this._dataResultsSourceData.availableFieldsFromResults.map(field => {
                  return {
                    key: field,
                    text: field
                  };
                })
            },
            {
                id: 'operator',
                title: webPartStrings.PropertyPane.LayoutPage.ResultTypes.CondtionOperatorValue,
                type: this._customCollectionFieldType.dropdown,
                defaultValue: ResultTypeOperator.Equal,
                required: true,
                options: [
                    {
                        key: ResultTypeOperator.Equal,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.EqualOperator
                    },
                    {
                        key: ResultTypeOperator.NotEqual,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.NotEqualOperator
                    },
                    {
                        key: ResultTypeOperator.Contains,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.ContainsOperator
                    },
                    {
                        key: ResultTypeOperator.StartsWith,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.StartsWithOperator
                    },
                    {
                        key: ResultTypeOperator.NotNull,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.NotNullOperator
                    },
                    {
                        key: ResultTypeOperator.GreaterOrEqual,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.GreaterOrEqualOperator
                    },
                    {
                        key: ResultTypeOperator.GreaterThan,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.GreaterThanOperator
                    },
                    {
                        key: ResultTypeOperator.LessOrEqual,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.LessOrEqualOperator
                    },
                    {
                        key: ResultTypeOperator.LessThan,
                        text: webPartStrings.PropertyPane.LayoutPage.ResultTypes.LessThanOperator
                    }
                ]
            },
            {
                id: 'value',
                title: webPartStrings.PropertyPane.LayoutPage.ResultTypes.ConditionValueLabel,
                type: this._customCollectionFieldType.string,
                required: false,
            },
            {
                id: "inlineTemplateContent",
                title: webPartStrings.PropertyPane.LayoutPage.ResultTypes.InlineTemplateContentLabel,
                type: this._customCollectionFieldType.custom,
                onCustomRender: ((field, value, onUpdate) => {
                    return (
                        React.createElement("div", null,
                            React.createElement(this._textDialogComponent.TextDialog, {
                                language: this._propertyFieldCodeEditorLanguages.Handlebars,
                                dialogTextFieldValue: value ? value : resultTypeInlineTemplate,
                                onChanged: (fieldValue) => onUpdate(field.id, fieldValue),
                                strings: {
                                    cancelButtonText: webPartStrings.PropertyPane.LayoutPage.ResultTypes.CancelButtonText,
                                    dialogButtonText: webPartStrings.PropertyPane.LayoutPage.ResultTypes.DialogButtonText,
                                    dialogTitle: webPartStrings.PropertyPane.LayoutPage.ResultTypes.DialogTitle,
                                    saveButtonText: webPartStrings.PropertyPane.LayoutPage.ResultTypes.SaveButtonText
                                }
                            })
                        )
                    );
                }).bind(this)
            },
            {
                id: 'externalTemplateUrl',
                title: webPartStrings.PropertyPane.LayoutPage.ResultTypes.ExternalUrlLabel,
                type: this._customCollectionFieldType.url,
                onGetErrorMessage: this.onTemplateUrlChange.bind(this),
                placeholder: 'https://mysite/Documents/external.html'
            },
        ]
      })
    );

    // Only show the template external URL for 'Custom' option
    if (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustom) {
      stylingFields.push(
        PropertyPaneTextField('externalTemplateUrl', {
          label: webPartStrings.PropertyPane.LayoutPage.TemplateUrlFieldLabel,
          placeholder: webPartStrings.PropertyPane.LayoutPage.TemplateUrlPlaceholder,
          deferredValidationTime: 500,
          validateOnFocusIn: true,
          validateOnFocusOut: true,
          onGetErrorMessage: this.onTemplateUrlChange.bind(this)
      }));
    }

    let groups: IPropertyPaneGroup[] = [
      {
        groupName: webPartStrings.PropertyPane.LayoutPage.LayoutSelectionGroupName,
        groupFields: stylingFields
      }
    ];

    let layoutOptionsFields: IPropertyPaneField<any>[] = [
      PropertyPaneToggle('showBlankIfNoResult', {
        label: webPartStrings.PropertyPane.LayoutPage.ShowBlankIfNoResult,
      }),
      PropertyPaneToggle('showResultsCount', {
        label: webPartStrings.PropertyPane.LayoutPage.ShowResultsCount,
      }),
      PropertyPaneToggle('useMicrosoftGraphToolkit', {
        label: webPartStrings.PropertyPane.LayoutPage.UseMicrosoftGraphToolkit,
      })
    ];

    if (this.properties.filtersDataSourceReference) {
      layoutOptionsFields.push(
        PropertyPaneToggle('showSelectedFilters', {
          label: webPartStrings.PropertyPane.LayoutPage.ShowSelectedFilters,
        })
      );
    }

    // Add template options if any
    const layoutOptions = this.getLayoutTemplateOptions();

    groups.push(
      {
        groupName: webPartStrings.PropertyPane.LayoutPage.CommonOptionsGroupName,
        groupFields: layoutOptionsFields
      },
      {
        groupName: webPartStrings.PropertyPane.LayoutPage.LayoutTemplateOptionsGroupName,
        groupFields: layoutOptions
      }
    );


    return groups;
  }

  /**
   * Returns property pane 'Paging' group fields
   */
  private getPagingGroupFields(): IPropertyPaneField<any>[] {

    let groupFields: IPropertyPaneField<any>[] = [];

    if (this.dataSource) {

      // Only show paging option if the data source supports it (dynamic or static)
      if (this.dataSource.getPagingBehavior()) {

        groupFields.push(
          PropertyPaneToggle('paging.showPaging', {
            label: webPartStrings.PropertyPane.DataSourcePage.ShowPagingFieldName,
          }),
          this._propertyFieldNumber('paging.itemsCountPerPage', {
            label: webPartStrings.PropertyPane.DataSourcePage.ItemsCountPerPageFieldName,
            maxValue: 500,
            minValue: 1,            
            value: this.properties.paging.itemsCountPerPage,
            disabled: !this.properties.paging.showPaging,
            key: 'paging.itemsCountPerPage'
          }),
          PropertyPaneSlider('paging.pagingRange', {
            label: webPartStrings.PropertyPane.DataSourcePage.PagingRangeFieldName,
            max: 50,
            min: 0, // 0 = no page numbers displayed
            step: 1,
            showValue: true,
            value: this.properties.paging.pagingRange,
            disabled: !this.properties.paging.showPaging
          }),
          PropertyPaneHorizontalRule(),
          PropertyPaneToggle('paging.hideNavigation', {
            label: webPartStrings.PropertyPane.DataSourcePage.HideNavigationFieldName,
            disabled: !this.properties.paging.showPaging
          }),
          PropertyPaneToggle('paging.hideFirstLastPages', {
            label: webPartStrings.PropertyPane.DataSourcePage.HideFirstLastPagesFieldName,
            disabled: !this.properties.paging.showPaging
          }),
          PropertyPaneToggle('paging.hideDisabled', {
            label: webPartStrings.PropertyPane.DataSourcePage.HideDisabledFieldName,
            disabled: !this.properties.paging.showPaging
          })
        );
      }
    }

    return groupFields;
  }

  private getExtensibilityFields(): IPropertyPaneField<any>[] {

    let extensibilityFields: IPropertyPaneField<any>[] = [
     this._propertyFieldCollectionData('extensibilityLibraryConfiguration', {
      manageBtnLabel: commonStrings.PropertyPane.InformationPage.Extensibility.ManageBtnLabel,
      key: 'extensibilityLibraryConfiguration',
      enableSorting: true,
      panelHeader: webPartStrings.PropertyPane.InformationPage.Extensibility.PanelHeader,
      panelDescription: webPartStrings.PropertyPane.InformationPage.Extensibility.PanelDescription,
      label: commonStrings.PropertyPane.InformationPage.Extensibility.FieldLabel,
      value: this.properties.extensibilityLibraryConfiguration,
      fields: [
        {
          id: 'name',
          title: commonStrings.PropertyPane.InformationPage.Extensibility.Columns.Name,
          type: this._customCollectionFieldType.string
        },
        {
          id: 'id',
          title: commonStrings.PropertyPane.InformationPage.Extensibility.Columns.Id,
          type: this._customCollectionFieldType.string,
          onGetErrorMessage: this._validateGuid.bind(this)
        },
        {
          id: 'enabled',
          title: commonStrings.PropertyPane.InformationPage.Extensibility.Columns.Enabled,
          type: this._customCollectionFieldType.custom,
          required: true,
          onCustomRender: (field, value, onUpdate, item, itemId) => {
          return (
                  React.createElement("div", null,
                      React.createElement(Toggle, { 
                          key: itemId, 
                          checked: value,
                          offText: commonStrings.General.OffTextLabel,
                          onText: commonStrings.General.OnTextLabel, 
                          onChange: ((evt, checked) => {
                              onUpdate(field.id, checked);
                          }).bind(this)} as IToggleProps)
                  )
              );
          }
        }
      ]
     })
    ];

    return extensibilityFields;
  }

  /**
   * Builds the data source options list from the available data sources
   */
  private getDataSourceOptions(): IPropertyPaneChoiceGroupOption[]  {

    let dataSourceOptions: IPropertyPaneChoiceGroupOption[] = [];
    
    this.availableDataSourceDefinitions.forEach((source) => {
      dataSourceOptions.push({
        iconProps: {
          officeFabricIconFontName: source.iconName
        },
        imageSize: {
          width: 200,
          height: 100
        },
        key: source.key,
        text: source.name,
      });
    });

    return dataSourceOptions;
  }

  /**
   * Returns layout template options if any
   */
  private getLayoutTemplateOptions(): IPropertyPaneField<any>[] {

    if (this.layout && !this.errorMessage) {
      return this.layout.getPropertyPaneFieldsConfiguration(this._dataResultsSourceData.availableFieldsFromResults);
    } else {
      return [];
    }
  }

  private getTemplateSlotOptions(): IPropertyPaneField<any>[] {

    let templateSlotFields: IPropertyPaneField<any>[] = [];
  
    if (this.dataSource) {

      const availableOptions: IComboBoxOption[]= this._dataResultsSourceData.availableFieldsFromResults.map(field => {
        return {
          key: field,
          text: field
        };
      });

      templateSlotFields.push(
        this._propertyFieldCollectionData('templateSlots', {
          manageBtnLabel: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.ConfigureSlotsBtnLabel,
          key: 'templateSlots',
          enableSorting: false,
          panelHeader: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.ConfigureSlotsPanelHeader,
          panelDescription: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.ConfigureSlotsPanelDescription,
          label: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.ConfigureSlotsLabel,
          value: this.properties.templateSlots,
          fields: [
            {
              id: 'slotName',
              title: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.SlotNameFieldName,
              type: this._customCollectionFieldType.string
            },
            {
              id: 'slotField',
              title: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.SlotFieldFieldName,
              type: this._customCollectionFieldType.custom,
              required: false,
              onCustomRender: (field, value, onUpdate, item) => {
                return (
                  React.createElement("div", null,
                    React.createElement(AsyncCombo, {
                      allowFreeform: true,
                      availableOptions: availableOptions, 
                      placeholder: webPartStrings.PropertyPane.DataSourcePage.TemplateSlots.SlotFieldPlaceholderName,
                      textDisplayValue: item[field.id] ? item[field.id] : '',
                      defaultSelectedKey: item[field.id] ? item[field.id] : '',
                      loadOptions: () => {
                        return Promise.resolve(availableOptions);
                      },
                      onUpdateOptions: () => {},
                      onUpdate: (filterValue: IComboBoxOption) => {
                        onUpdate(field.id, filterValue.key);
                      }                            
                    } as IAsyncComboProps)
                  )
                );
              }
            }
          ]
        })
      );
    }

    return templateSlotFields;
  }

  private getSearchQueryTextFields(): IPropertyPaneField<any>[] {
    let searchQueryTextFields: IPropertyPaneField<any>[] = [
      this._propertyFieldToogleWithCallout('useInputQueryText', {
        label: webPartStrings.PropertyPane.ConnectionsPage.UseInputQueryText,
        calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
        key: 'useInputQueryText',
        calloutContent: React.createElement('p', { style:{ maxWidth: 250, wordBreak: 'break-word' }}, webPartStrings.PropertyPane.ConnectionsPage.UseInputQueryTextHoverMessage),
        onText: commonStrings.General.OnTextLabel,
        offText: commonStrings.General.OffTextLabel,
        checked: this.properties.useInputQueryText
      })
    ];

    if (this.properties.useInputQueryText) {

      searchQueryTextFields.push(
        PropertyPaneChoiceGroup('queryTextSource', {
          options: [
            {
              key: QueryTextSource.StaticValue,
              text: webPartStrings.PropertyPane.ConnectionsPage.InputQueryTextStaticValue
            },
            {
              key: QueryTextSource.DynamicValue,
              text: webPartStrings.PropertyPane.ConnectionsPage.InputQueryTextDynamicValue
            }
          ]
        })
      );

      switch (this.properties.queryTextSource) {

        case QueryTextSource.StaticValue: 
          searchQueryTextFields.push(
            PropertyPaneTextField('queryText', {
              label: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextFieldLabel,
              description: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextFieldDescription,
              multiline: true,
              resizable: true,
              placeholder: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryPlaceHolderText,
              onGetErrorMessage: this._validateEmptyField.bind(this),
              deferredValidationTime: 500
            })
          );
          break;
        
        case QueryTextSource.DynamicValue:
          searchQueryTextFields.push(
            PropertyPaneDynamicField('queryText', {
              label: ''
            }),
            PropertyPaneCheckbox('useDefaultQueryText', {
              text: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextUseDefaultQuery,
              disabled: this.properties.queryText.reference === undefined
            })
          );

          if (this.properties.useDefaultQueryText && this.properties.queryText.reference !== undefined) {
            searchQueryTextFields.push(
              PropertyPaneTextField('defaultQueryText', {
                label: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextDefaultValue,
                multiline: true
              })
            );
          }

          break;

        default:
            break;
      }
    }

    return searchQueryTextFields;
  }

  private async getFiltersConnectionFields(): Promise<IPropertyPaneField<any>[]> {

    let filtersConnectionFields: IPropertyPaneField<any>[] = [
      PropertyPaneToggle('useFilters', {
        label: webPartStrings.PropertyPane.ConnectionsPage.UseFiltersWebPartLabel,
        checked: this.properties.useFilters
      })
    ];

    if (this.properties.useFilters) {
      filtersConnectionFields.splice(1,0,
        PropertyPaneDropdown('filtersDataSourceReference', {
          options: await this.dynamicDataService.getAvailableDataSourcesByType(ComponentType.SearchFilters),
          label: webPartStrings.PropertyPane.ConnectionsPage.UseFiltersFromComponentLabel
        })
      );
    }

    return filtersConnectionFields;
  }

  private async getVerticalsConnectionFields(): Promise<IPropertyPaneField<any>[]> {
  
    let verticalsConnectionFields: IPropertyPaneField<any>[] = [
      PropertyPaneToggle('useVerticals', {
        label: webPartStrings.PropertyPane.ConnectionsPage.UseSearchVerticalsWebPartLabel,
        checked: this.properties.useFilters
      })
    ];

    if (this.properties.useVerticals) {
      verticalsConnectionFields.splice(1,0,
        PropertyPaneDropdown('verticalsDataSourceReference', {
          options: await this.dynamicDataService.getAvailableDataSourcesByType(ComponentType.SearchVerticals),
          label: webPartStrings.PropertyPane.ConnectionsPage.UseSearchVerticalsFromComponentLabel
        })
      );

      if (this.properties.verticalsDataSourceReference) {

        // Get all available verticals
        if (this._verticalsSourceData) {
          const availableVerticals = this._verticalsSourceData.tryGetValue();

          if (availableVerticals) {
            verticalsConnectionFields.push(
              this._propertyFieldDropownWithCallout('selectedVerticalKey', {
                calloutTrigger: this._propertyFieldCalloutTriggers.Hover,
                key: 'selectedVerticalKey',
                label: webPartStrings.PropertyPane.ConnectionsPage.LinkToVerticalLabel,
                options: availableVerticals.verticalsConfiguration.filter(v => !v.isLink).map(verticalConfiguration => {
                  return {
                    key: verticalConfiguration.key,
                    text: verticalConfiguration.tabName
                  };
                }),
                selectedKey: this.properties.selectedVerticalKey,
                calloutContent: React.createElement('p', { style:{ maxWidth: 250, wordBreak: 'break-word' }}, webPartStrings.PropertyPane.ConnectionsPage.LinkToVerticalLabelHoverMessage),
              })
            );
          }
        }
      }
    }

    return verticalsConnectionFields;
  }

  private async getConnectionOptionsGroup(): Promise<IPropertyPaneGroup[]> {

    const filterConnectionFields = await this.getFiltersConnectionFields();
    const verticalConnectionFields = await this.getVerticalsConnectionFields();
    
    let availableConnectionsGroup: IPropertyPaneGroup[] = [
      {
        groupName: webPartStrings.PropertyPane.ConnectionsPage.ConnectionsPageGroupName,
        groupFields: [
          ...this.getSearchQueryTextFields(),
          PropertyPaneHorizontalRule(),
          ...filterConnectionFields,
          PropertyPaneHorizontalRule(),
          ...verticalConnectionFields,
        ]
      }
    ];

    return availableConnectionsGroup;
  }

  /**
   * Gets the data source instance according to the current selected one
   * @param dataSourceKey the selected data source provider key
   * @param dataSourceDefinitions the available source definitions
   * @returns the data source provider instance
   */
  private async getDataSourceInstance(dataSourceKey: string): Promise<IDataSource> {
        
      let dataSource: IDataSource = undefined;
      let serviceKey: ServiceKey<IDataSource> = undefined;

      if (dataSourceKey) {

        // If it is a builtin data source, we load the corresponding known class file asynchronously for performance purpose
        // We also create the service key at the same time to be able to get an instance
        switch (dataSourceKey) {

            // SharePoint Search API
            case BuiltinDataSourceProviderKeys.SharePointSearch:

              const { SharePointSearchDataSource } = await import(
                /* webpackChunkName: 'sharepoint-search-datasource' */
                '../../dataSources/SharePointSearchDataSource'
              );

              serviceKey = ServiceKey.create<IDataSource>('ModernSearch:SharePointSearchDataSource', SharePointSearchDataSource);
              break;

            // Microsoft Search API
            case BuiltinDataSourceProviderKeys.MicrosoftSearch:

              const { MicrosoftSearchDataSource } = await import(
                /* webpackChunkName: 'microsoft-search-datasource' */
                '../../dataSources/MicrosoftSearchDataSource'
              );

              serviceKey = ServiceKey.create<IDataSource>('ModernSearch:SharePointSearchDataSource', MicrosoftSearchDataSource);
              break;

            default:              
              break;
        }

        return new Promise<IDataSource>((resolve, reject) => {

          // Register here services we want to expose to custom data sources (ex: TokenService)
          // The instances are shared across all data sources. It means when properties will be set once for all consumers. Be careful manipulating these instance properties. 
          const childServiceScope = ServiceScopeHelper.registerChildServices(this.webPartInstanceServiceScope, [
            serviceKey,
            TaxonomyService.ServiceKey,
            SharePointSearchService.ServiceKey,
            TokenService.ServiceKey
          ]);

          childServiceScope.whenFinished(async () => {

            this.tokenService = childServiceScope.consume<ITokenService>(TokenService.ServiceKey);

            // Initialize the token values
            this.setTokens();

            // Register the data source service in the Web Part scope only (child scope of the current scope)
            dataSource = childServiceScope.consume<IDataSource>(serviceKey);

            // Verifiy if the data source implements correctly the IDataSource interface and BaseDataSource methods
            const isValidDataSource = (dataSourceInstance: IDataSource): dataSourceInstance is BaseDataSource<any> => {
              return (
                (dataSourceInstance as BaseDataSource<any>).getAppliedFilters !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).getData !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).getFilterBehavior !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).getItemCount !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).getPagingBehavior !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).getPropertyPaneGroupsConfiguration !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).getTemplateSlots !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).onInit !== undefined &&
                (dataSourceInstance as BaseDataSource<any>).onPropertyUpdate !== undefined
              );
            };

            if (!isValidDataSource(dataSource)) {
              reject(new Error(Text.format(commonStrings.General.Extensibility.InvalidDataSourceInstance, dataSourceKey)));
            }

            // Initialize the data source with current Web Part properties
            if (dataSource) {
              
              // Initializes Web part lifecycle methods and properties
              dataSource.properties = this.properties.dataSourceProperties;
              dataSource.context = this.context;
              dataSource.render = this.render;
            
              // Initializes available services
              dataSource.serviceKeys = {
                TokenService: TokenService.ServiceKey
              };

              await dataSource.onInit();

              // Initialize slots
              if (isEmpty(this.properties.templateSlots)) {
                this.properties.templateSlots = dataSource.getTemplateSlots();
                this._defaultTemplateSlots = dataSource.getTemplateSlots();
              }

              resolve(dataSource);
            }
          });
        });          
      }
  }

 /**
   * Custom handler when the external template file URL
   * @param value the template file URL value
   */
  private async onTemplateUrlChange(value: string): Promise<string> {

      try {
          // Doesn't raise any error if file is empty (otherwise error message will show on initial load...)
          if (isEmpty(value)) {
            Promise.resolve('');
          }
          // Resolves an error if the file isn't a valid .htm or .html file
          else if (!this.templateService.isValidTemplateFile(value)) {
              return Promise.resolve(webPartStrings.PropertyPane.LayoutPage.ErrorTemplateExtension);
          }
          // Resolves an error if the file doesn't answer a simple head request
          else {
              await this.templateService.ensureFileResolves(value);
              return Promise.resolve('');
          }
      } catch (error) {
          return Promise.resolve(Text.format(webPartStrings.PropertyPane.LayoutPage.ErrorTemplateResolve, error));
      }
  }

  /**
   * Initializes the template according to the property pane current configuration
   * @returns the template content as a string
   */
  private async initTemplate(): Promise<void> {

    // Gets the template content according to the selected key
    const selectedLayoutTemplateContent = this.availableLayoutDefinitions.filter(layout => { return layout.key === this.properties.selectedLayoutKey; })[0].templateContent;

    if (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustom) {
         
        if (this.properties.externalTemplateUrl) {
            this.templateContentToDisplay = await this.templateService.getFileContent(this.properties.externalTemplateUrl);
        } else {
            this.templateContentToDisplay = this.properties.inlineTemplateContent ? this.properties.inlineTemplateContent :selectedLayoutTemplateContent;
        }

    } else {
      this.templateContentToDisplay = selectedLayoutTemplateContent;
    }

    // Register result types inside the template      
    await this.templateService.registerResultTypes(this.properties.resultTypes);

    return;
  }

  /**
    * Initializes the service scope manager singleton instance
    * The scopes whithin the solution are as follow 
    *   Top root scope (Shared by all client side components)     
    *   |--- ExtensibilityService
    *   |--- DateHelper
    *   |--- Client side component scope (i.e shared with all Web Part instances)
    *     |--- SPHttpClient
    *     |--- <other SPFx http services>
    *     |--- (Web Part Scope (created with startNewChild))
    *       |--- DynamicDataService
    *       |--- TemplateService
    *       |--- (Data Source scope)
    *         |--- SharePointSearchDataSource
    *         |--- TokenService, SearchService, etc.       
  */
  private initializeWebPartServices(): void {

    // Register specific Web Part service instances
    this.webPartInstanceServiceScope = this.context.serviceScope.startNewChild();
    this.templateService = this.webPartInstanceServiceScope.createAndProvide(TemplateService.ServiceKey, TemplateService);
    this.dynamicDataService = this.webPartInstanceServiceScope.createAndProvide(DynamicDataService.ServiceKey, DynamicDataService);
    this.dynamicDataService.dynamicDataProvider = this.context.dynamicDataProvider;
    this.webPartInstanceServiceScope.finish();
  }

  /**
   * Set token values from Web Part property bag
   */
  private setTokens() {

    if (this.tokenService) {

      // Input query text
      const inputQueryFromDataSource = this.properties.queryText.tryGetValue();
      const inputQueryText = inputQueryFromDataSource ? inputQueryFromDataSource : this.properties.defaultQueryText;
      this.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, inputQueryText);

      // Selected filters
      if (this._filtersSourceData) {
        const filtersSourceData: IDataFilterSourceData = this._filtersSourceData.tryGetValue();
        if (filtersSourceData) {

          /* Example structure
            {
              filterName: value(GUID), // Taxonomy
              filterName:{ // Date range
                startDate: <ISO_Date>,
                endDate: <ISO_Date>
            }
          }*/
          let filterTokens: { [key: string]: string | { [key:string]: string } } = {};
    
          filtersSourceData.selectedFilters.forEach(filter => {
      
            const configuration = DataFilterHelper.getConfigurationForFilter(filter, filtersSourceData.filterConfiguration);

            if (configuration && configuration.type === FilterType.StaticFilter) {

              if (configuration.selectedTemplate === BuiltinFilterTemplates.DateRange) {

                let fromDate = undefined;
                let toDate = undefined;

                // Determine start and end dates by operator
                filter.values.forEach(filterValue => {
                  if (filterValue.operator === FilterComparisonOperator.Geq && !fromDate) {
                    fromDate = filterValue.value;
                  }

                  if (filterValue.operator === FilterComparisonOperator.Lt && !toDate) {
                    toDate = fromDate = filterValue.value;
                  }
                });
                 
                filterTokens[filter.filterName] = {
                  startDate: fromDate,
                  endDate: toDate
                };
              }
            }
          });

          this.tokenService.setTokenValue(BuiltinTokenNames.filters, filterTokens);  
        }
      }
    }
  }

  /**
   * Make sure the dynamic properties are correctly connected to the corresponding sources according to the proeprty pane settings
   */
  private ensureDataSourceConnection() {

      // Filters Web Part data source
      if (this.properties.filtersDataSourceReference) {

          if (!this._filtersSourceData) {
            this._filtersSourceData = new DynamicProperty<IDataFilterSourceData>(this.context.dynamicDataProvider);
          }

          this._filtersSourceData.setReference(this.properties.filtersDataSourceReference);
          this._filtersSourceData.register(this.render);

      } else {

          if (this._filtersSourceData) {
              this._filtersSourceData.unregister(this.render);
          }
      }

      // Verticals Web Part data source
      if (this.properties.verticalsDataSourceReference) {

        if (!this._verticalsSourceData) {
          this._verticalsSourceData = new DynamicProperty<IDataVerticalSourceData>(this.context.dynamicDataProvider);
        }

        this._verticalsSourceData.setReference(this.properties.verticalsDataSourceReference);
        this._verticalsSourceData.register(this.render);

      } else {
        if (this._verticalsSourceData) {
          this._verticalsSourceData.unregister(this.render);
        }
      }

  }

  /**
   * Checks if a field if empty or not
   * @param value the value to check
   */
  private _validateEmptyField(value: string): string {

    if (!value) {
        return commonStrings.General.EmptyFieldErrorMessage;
    }

    return '';
  }

  /**
   * Ensures the string value is a valid GUID
   * @param value the result source id
   */
  private _validateGuid(value: string): string {
    if (value.length > 0) {
        if (!(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/).test(value)) {
            return 'Invalid GUID';
        }
    }

    return '';
  }

  /**
   * Reset the paging information for PagingBehavior.Dynamic data sources
   */
  private _resetPagingData() {
    this.availablePageLinks = [];
    this.currentPageLinkUrl = null;
  }

    /**
   * Subscribes to URL hash change if the dynamic property is set to the default 'URL Fragment' property
   */
  private _bindHashChange() {
    
    if (this.properties.queryText.tryGetSource() && this.properties.queryText.reference.localeCompare('PageContext:UrlData:fragment') === 0) {
        // Manually subscribe to hash change since the default property doesn't
        window.addEventListener('hashchange', this.render);
    } else {
        window.removeEventListener('hashchange', this.render);
    }
  }

  /**
   * Subscribes to URL query string change events using SharePoint page router
   */
  private _handleQueryStringChange() {
      ((h) => {
          this._pushStateCallback = history.pushState;
          h.pushState = this.pushStateHandler.bind(this);
      })(window.history);
  }

  private pushStateHandler(state, key, path) {        
      this._pushStateCallback.apply(history, [state, key, path]);
      if (this.properties.queryText.isDisposed) return;
      const source = this.properties.queryText.tryGetSource();
      if (source && source.id === ComponentType.PageEnvironment) this.render();
  }
}
