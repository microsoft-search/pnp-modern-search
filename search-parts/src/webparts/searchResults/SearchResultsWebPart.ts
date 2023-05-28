import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Text, DisplayMode, ServiceScope, Log } from '@microsoft/sp-core-library';
import { IComboBoxOption, Toggle, IToggleProps, MessageBarType, MessageBar, Link } from 'office-ui-fabric-react';
import { IWebPartPropertiesMetadata } from '@microsoft/sp-webpart-base';
import * as webPartStrings from 'SearchResultsWebPartStrings';
import * as commonStrings from 'CommonStrings';
import { ISearchResultsContainerProps } from './components/ISearchResultsContainerProps';
import { IDataSource, IDataSourceDefinition, IComponentDefinition, ILayoutDefinition, ILayout, IDataFilter, LayoutType, FilterComparisonOperator, BaseDataSource, IDataFilterValue, IDataFilterResult, FilterConditionOperator, IDataVertical, ExtensibilityConstants, ISortInfo, LayoutRenderType, IQueryModifierDefinition, IQueryModifier, BaseQueryModifier } from '@pnp/modern-search-extensibility';

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
    DynamicDataSharedDepth,
    PropertyPaneDynamicFieldSet,
} from "@microsoft/sp-property-pane";
import ISearchResultsWebPartProps, { QueryTextSource } from './ISearchResultsWebPartProps';
import { AvailableDataSources, BuiltinDataSourceProviderKeys } from '../../dataSources/AvailableDataSources';
import { ServiceKey } from "@microsoft/sp-core-library";
import SearchResultsContainer from './components/SearchResultsContainer';
import { AvailableLayouts, BuiltinLayoutsKeys } from '../../layouts/AvailableLayouts';
import { ITemplateService, FileFormat } from '../../services/templateService/ITemplateService';
import { TemplateService } from '../../services/templateService/TemplateService';
import { ServiceScopeHelper } from '../../helpers/ServiceScopeHelper';
import { cloneDeep, flatten, isEmpty, isEqual, uniq, uniqBy } from "@microsoft/sp-lodash-subset";
import { AvailableComponents } from '../../components/AvailableComponents';
import { DynamicProperty } from '@microsoft/sp-component-base';
import { ITemplateSlot, IDataFilterToken, IDataFilterTokenValue, IDataContext, ITokenService, SortFieldDirection, IExtensibilityLibrary } from '@pnp/modern-search-extensibility';
import { ResultTypeOperator } from '../../models/common/IDataResultType';
import { TokenService, BuiltinTokenNames } from '../../services/tokenService/TokenService';
import { TaxonomyService } from '../../services/taxonomyService/TaxonomyService';
import { SharePointSearchService } from '../../services/searchService/SharePointSearchService';
import IDynamicDataService from '../../services/dynamicDataService/IDynamicDataService';
import { IDataFilterSourceData } from '../../models/dynamicData/IDataFilterSourceData';
import { ComponentType, DynamicDataProperties } from '../../common/ComponentType';
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
import { UrlHelper } from '../../helpers/UrlHelper';
import { ObjectHelper } from '../../helpers/ObjectHelper';
import { ItemSelectionMode } from '../../models/common/IItemSelectionProps';
import { PropertyPaneAsyncCombo } from '../../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo';
import { DynamicPropertyHelper } from '../../helpers/DynamicPropertyHelper';
import { IQueryModifierConfiguration } from '../../queryModifier/IQueryModifierConfiguration';
import { PropertyPaneTabsField } from '../../controls/PropertyPaneTabsField/PropertyPaneTabsField';
import { loadMsGraphToolkit } from '../../helpers/GraphToolKitHelper';

const LogSource = "SearchResultsWebPart";

export default class SearchResultsWebPart extends BaseWebPart<ISearchResultsWebPartProps> implements IDynamicDataCallables {

    /**
     * The error message
     */
    private errorMessage: string = undefined;

    /**
     * Dynamic data related fields
     */
    private _filtersConnectionSourceData: DynamicProperty<IDataFilterSourceData>;
    private _verticalsConnectionSourceData: DynamicProperty<IDataVerticalSourceData>;

    private _currentDataResultsSourceData: IDataResultSourceData = {
        availableFieldsFromResults: [],
        availablefilters: [],
        selectedItems: []
    };

    /**
     * Dynamically loaded components for property pane
     */
    private _placeholderComponent: any = null;
    private _propertyFieldCodeEditor: any = null;
    private _propertyFieldCodeEditorLanguages: any = null;
    private _propertyFieldCollectionData: any = null;
    private _propertyFieldToogleWithCallout: any = null;
    private _propertyPaneWebPartInformation: any = null;
    private _propertyFieldCalloutTriggers: any = null;
    private _propertyFieldNumber: any = null;
    private _customCollectionFieldType: any = null;
    private _textDialogComponent: any = null;
    private _propertyPanePropertyEditor = null;

    /**
     * The selected data source for the WebPart
     */
    private dataSource: IDataSource;

    /**
     * Properties to avoid to recreate instances every render
     */
    private lastDataSourceKey: string;
    private lastLayoutKey: string;
    private lastQueryModifierKeys: string[] = [];

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
     * Available layouts to display in the property pane regarding the render ype
     */
    private availableLayoutsInPropertyPane: ILayoutDefinition[] = [];

    /**
     * The available web component definitions (not registered yet)
     */
    private availableWebComponentDefinitions: IComponentDefinition<any>[] = AvailableComponents.BuiltinComponents;

    /**
     * The available custom QueryModifier definitions (not registered yet)
     */
    private availableCustomQueryModifierDefinitions: IQueryModifierDefinition[] = [];

    /**
     * The current page number
     */
    private currentPageNumber: number = 1;

    /**
    * The current selected custom query modifiers
    */
    private _selectedCustomQueryModifier: IQueryModifier[] = [];

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

    /**
     * Sort related properties
     */
    private _currentSelectedSortFieldName: string = null;
    private _currentSelectedSortDirection: SortFieldDirection = SortFieldDirection.Ascending;

    private _pushStateCallback = null;

    /**
     * The available connections as property pane group
     */
    private propertyPaneConnectionsGroup: IPropertyPaneGroup[] = [];


    /**
     * The current DataContext - is updated in render method
     */
    private _currentDataContext: IDataContext;

    constructor() {
        super();

        this._bindHashChange = this._bindHashChange.bind(this);
        this._onDataRetrieved = this._onDataRetrieved.bind(this);
        this._onItemSelected = this._onItemSelected.bind(this);
    }

    public async render(): Promise<void> {

        // Determine the template content to display
        // In the case of an external template is selected, the render is done asynchronously waiting for the content to be fetched
        await this.initTemplate();

        // Refresh the token values with the latest information from environment (i.e connections and settings)
        await this.setTokens();

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


            const queryModifierKeys = this.properties.queryModifierConfiguration.filter(c => c.enabled).map(c => c.key);
            // Initialize custom query modifier instances if changed
            if (!isEqual(this.lastQueryModifierKeys, queryModifierKeys)) {
                this._selectedCustomQueryModifier = await this.initializeQueryModifiers(this.properties.queryModifierConfiguration);
                this.lastQueryModifierKeys = queryModifierKeys;

            }

        } catch (error) {
            // Catch instanciation or wrong definition errors for extensibility scenarios
            this.errorMessage = error.message ? error.message : error;
        }

        // Refresh the token values with the latest information from environment (i.e connections and settings)
        await this.setTokens();

        // Refresh the property pane to get layout and data source options
        if (this.context && this.context.propertyPane && this.context.propertyPane.isPropertyPaneOpen()) {
            this.context.propertyPane.refresh();
        }

        if (this.dataSource) {
            this._currentDataContext = await this.getDataContext();
        }
        return this.renderCompleted();
    }

    public getPropertyDefinitions(): IDynamicDataPropertyDefinition[] {

        // Use the Web Part title as property title since we don't expose sub properties
        let propertyDefinitions: IDynamicDataPropertyDefinition[] = [];

        if (this.properties.itemSelectionProps.allowItemSelection) {
            propertyDefinitions.push({
                id: DynamicDataProperties.AvailableFieldValuesFromResults,
                title: webPartStrings.PropertyPane.ConnectionsPage.AvailableFieldValuesFromResults,
            });
        }

        propertyDefinitions.push(
            {
                id: ComponentType.SearchResults,
                title: this.properties.title ? `${this.properties.title} - ${this.instanceId}` : `${webPartStrings.General.WebPartDefaultTitle} - ${this.instanceId}`,
            }
        );

        return propertyDefinitions;
    }

    public getPropertyValue(propertyId: string) {

        switch (propertyId) {
            case ComponentType.SearchResults:

                // Pass the Handlebars context to consumers, so they can register custom helpers for their own services 
                this._currentDataResultsSourceData.handlebarsContext = this.templateService.Handlebars;
                this._currentDataResultsSourceData.totalCount = this.dataSource?.getItemCount();

                return this._currentDataResultsSourceData;

            case DynamicDataProperties.AvailableFieldValuesFromResults:

                // Dynamic data values should be flatten https://docs.microsoft.com/en-us/sharepoint/dev/spfx/dynamic-data
                let fields = {};
                this._currentDataResultsSourceData.availableFieldsFromResults.forEach((field: string) => {

                    // Aggregate all values for this specific field across all items
                    // Ex:
                    // "FileType":['docx','pdf']
                    fields[field] = [];
                    this._currentDataResultsSourceData.selectedItems.forEach(selectedItem => {
                        const fieldValue = ObjectHelper.byPath(selectedItem, field);

                        // Special case where there value is a taxonomy item. In this case, we only take the GP0 part as it won't work otherwise with SharePoint search refiners or KQL conditions
                        const taxonomyItemRegExp = /GP0\|#0?((\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1})/gi;

                        if (taxonomyItemRegExp.test(fieldValue)) {
                            fieldValue.match(taxonomyItemRegExp).forEach(match => {
                                fields[field].push(match);
                            });
                        } else {

                            if (fieldValue) {
                                // Break down multiple values in a field value (like a multi choice or taxonomy column)
                                fieldValue.split(";").forEach(value => {
                                    fields[field].push(value);
                                });
                            } else {
                                fields[field].push(undefined);
                            }
                        }
                    });
                });

                return fields;
        }

        throw new Error('Bad property id');
    }

    protected renderCompleted(): void {

        let renderRootElement: JSX.Element = null;
        let renderDataContainer: JSX.Element = null;

        if (this.dataSource && this.instanceId) {

            // The main content WP logic
            renderDataContainer = React.createElement(SearchResultsContainer, {
                dataSource: this.dataSource,
                dataSourceKey: this.properties.dataSourceKey,
                templateContent: this.templateContentToDisplay,
                instanceId: this.instanceId,
                properties: JSON.parse(JSON.stringify(this.properties)), // Create a copy to avoid unexpected reference value updates from data sources 
                onDataRetrieved: this._onDataRetrieved,
                onItemSelected: this._onItemSelected,
                pageContext: this.context.pageContext,
                teamsContext: this.context.sdks.microsoftTeams ? this.context.sdks.microsoftTeams.context : null,
                renderType: this.properties.layoutRenderType,
                dataContext: this._currentDataContext,
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
                        onConfigure: () => { this.context.propertyPane.open(); }
                    }
                );
                renderRootElement = placeholder;
            } else {
                renderRootElement = null;
                Log.verbose(`[SearchResultsWebPart.renderCompleted]`, `The 'renderRootElement' was null during render.`, this.webPartInstanceServiceScope);
            }
        }

        // Check if the Web part is connected to a data vertical
        if (this._verticalsConnectionSourceData && this.properties.selectedVerticalKeys.length > 0) {
            const verticalData = DynamicPropertyHelper.tryGetValueSafe(this._verticalsConnectionSourceData);

            // Remove the blank space introduced by the control zone when the Web Part displays nothing
            // WARNING: in theory, we are not supposed to touch DOM outside of the Web Part root element, This will break if the page attribute change
            const parentControlZone = this.getParentControlZone();

            // If the current selected vertical is not the one configured for this Web Part, we show nothing
            if (verticalData && this.properties.selectedVerticalKeys.indexOf(verticalData.selectedVertical.key) === -1) {

                if (this.displayMode === DisplayMode.Edit) {

                    if (parentControlZone) {
                        parentControlZone.removeAttribute('style');
                    }

                    // Get tab name of selected verticals
                    const verticalNames = verticalData.verticalsConfiguration.filter(cfg => {
                        return this.properties.selectedVerticalKeys.indexOf(cfg.key) !== -1;
                    }).map(v => v.tabName);

                    renderRootElement = React.createElement('div', {},
                        React.createElement(
                            MessageBar, {
                            messageBarType: MessageBarType.info,
                        },
                            Text.format(commonStrings.General.CurrentVerticalNotSelectedMessage, verticalNames.join(','))
                        ),
                        renderRootElement
                    );
                } else {
                    renderRootElement = null;

                    // Reset data source information
                    this._currentDataResultsSourceData = {
                        availableFieldsFromResults: [],
                        availablefilters: []
                    };

                    // Remove margin and padding for the empty control zone
                    if (parentControlZone) {
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

        if(this.properties.showBlankIfNoResult){
            let element = this.domElement.parentElement;
                // check up to 3 levels up for padding and exit once found
                for (let i = 0; i < 3; i++) {
                    const style = window.getComputedStyle(element);
                    const hasPadding = style.paddingTop !== "0px";
                    if (hasPadding) {
                        element.style.paddingTop = "0px";
                        element.style.paddingBottom = "0px";
                        element.style.marginTop = "0px";
                        element.style.marginBottom = "0px";
                    }
                    element = element.parentElement;
                }
        }

        // This call set this.renderedOnce to 'true' so we need to execute it at the very end
        super.renderCompleted();
    }

    protected async onInit(): Promise<void> {
        try {
            // Disable PnP Telemetry
            const telemetry = PnPTelemetry.getInstance();
            telemetry.optOut();
        } catch (error) {
            Log.warn(LogSource, `Opt out for PnP Telemetry failed. Details: ${error}`, this.context.serviceScope);
        }

        // Initializes Web Part properties
        this.initializeProperties();

        // Initializes shared services
        await this.initializeBaseWebPart();

        // Initializes the Web Part instance services
        this.initializeWebPartServices();

        // Bind web component events
        this.bindPagingEvents();

        // Bind worting events
        this.bindSortingEvents();

        this._bindHashChange();
        this._handleQueryStringChange();

        // Load extensibility libaries extensions
        await this.loadExtensions(this.properties.extensibilityLibraryConfiguration);

        // Filter the layouts to be displayed in the property pane according to current render type
        this.availableLayoutsInPropertyPane = this.availableLayoutDefinitions.filter(layout => layout.renderType === this.properties.layoutRenderType);

        // Register Web Components in the global page context. We need to do this BEFORE the template processing to avoid race condition.
        // Web components are only defined once.
        await this.templateService.registerWebComponents(this.availableWebComponentDefinitions, this.instanceId);

        if (this.properties.dataSourceKey && this.properties.selectedLayoutKey && this.properties.enableTelemetry) {

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

            appInsights.loadAppInsights();
            appInsights.context.application.ver = this.manifest.version;
            appInsights.trackEvent(usageEvent);
        }

        // Initializes MS Graph Toolkit
        if (this.properties.useMicrosoftGraphToolkit) {
            await loadMsGraphToolkit(this.context);
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
        this.ensureDynamicDataSourcesConnection();

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


            let queryTransformationGroups: IPropertyPaneGroup[] = [];
            if (this._selectedCustomQueryModifier.length > 0 && !this.errorMessage) {
                this._selectedCustomQueryModifier.forEach(modifier => {
                    queryTransformationGroups = queryTransformationGroups.concat(modifier.getPropertyPaneGroupsConfiguration());
                });
            }

            // Other pages
            propertyPanePages.push(
                {
                    displayGroupsAsAccordion: true,
                    groups: this.getStylingPageGroups()
                },
                {
                    groups: [
                        ...this.propertyPaneConnectionsGroup,
                        ...queryTransformationGroups
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
                    ...extensibilityConfigurationGroups,
                    {
                        groupName: commonStrings.PropertyPane.InformationPage.ImportExport,
                        groupFields: [
                            this._propertyPanePropertyEditor({
                                webpart: this,
                                key: 'propertyEditor'
                            }),
                            PropertyPaneToggle('enableTelemetry', {
                                label: webPartStrings.PropertyPane.InformationPage.EnableTelemetryLabel,
                                offText: webPartStrings.PropertyPane.InformationPage.EnableTelemetryOn,
                                onText: webPartStrings.PropertyPane.InformationPage.EnableTelemetryOff,
                            })
                        ]
                    }
                ]
            }
        );

        return {
            pages: propertyPanePages
        };
    }

    protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {

        // Bind connected data sources
        if (propertyPath.localeCompare('filtersDataSourceReference') === 0 && this.properties.filtersDataSourceReference ||
            propertyPath.localeCompare('verticalsDataSourceReference') === 0 && this.properties.verticalsDataSourceReference
        ) {
            this.ensureDynamicDataSourcesConnection();
            this.context.propertyPane.refresh();
        }

        if (propertyPath.localeCompare('useFilters') === 0) {
            if (!this.properties.useFilters) {
                this.properties.filtersDataSourceReference = undefined;
                this._filtersConnectionSourceData = undefined;
                this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchResults);
            }
        }

        if (propertyPath.localeCompare('useVerticals') === 0) {
            if (!this.properties.useVerticals) {
                this.properties.verticalsDataSourceReference = undefined;
                this.properties.selectedVerticalKeys = [];
                this._verticalsConnectionSourceData = undefined;
            }
        }

        if (propertyPath.localeCompare('useDynamicFiltering') === 0 && !this.properties.useDynamicFiltering) {
            this.properties.selectedItemFieldValue.setValue('');
            this.properties.selectedItemFieldValue.unregister(this.render);
        }

        // Detect if the layout has been changed to custom
        if (propertyPath.localeCompare('inlineTemplateContent') === 0) {

            // Automatically switch the option to 'Custom' if a default template has been edited
            // (meaning the user started from a default template)
            if (this.properties.inlineTemplateContent && (this.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsCustomHandlebars || BuiltinLayoutsKeys.ResultsCustomAdaptiveCards)) {
                this.properties.selectedLayoutKey = this.properties.layoutRenderType === LayoutRenderType.Handlebars ? BuiltinLayoutsKeys.ResultsCustomHandlebars : BuiltinLayoutsKeys.ResultsCustomAdaptiveCards;

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
            this._currentDataResultsSourceData.availablefilters = [];
            this._currentDataResultsSourceData.availableFieldsFromResults = [];

            // Notfify dynamic data consumers data have changed
            this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchResults);

            this.properties.dataSourceProperties = {};
            this.properties.templateSlots = null;

            // Reset paging information
            this.currentPageNumber = 1;
        }

        // Reset layout properties
        if (propertyPath.localeCompare('selectedLayoutKey') === 0 && !isEqual(oldValue, newValue)) {

            if (this.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsDebug.toString()) {
                this.properties.layoutProperties = {};
            }

            // Update the layout definition
            const layouts = this.availableLayoutDefinitions.filter((layout) => {

                if (newValue === BuiltinLayoutsKeys.ResultsCustomAdaptiveCards || newValue === BuiltinLayoutsKeys.ResultsCustomHandlebars) {
                    // Return the custom template according to the last template type in case we have an inline template already saved
                    return layout.key === newValue && layout.renderType === this.properties.layoutRenderType;
                } else {
                    return layout.key === newValue;
                }
            });

            if (layouts.length > 0) {

                if (newValue === BuiltinLayoutsKeys.ResultsCustomHandlebars || BuiltinLayoutsKeys.ResultsCustomAdaptiveCards) {

                    // We reset the custom template to avoid mismatch between template type and content as we don't link the two
                    this.properties.inlineTemplateContent = null;
                    this.properties.externalTemplateUrl = '';
                } else {
                    // This option should follow the type of the template selected. The is way, if the current template is update, the custom layout will have the correct type to render.
                    this.properties.layoutRenderType = layouts[0].renderType;
                }
            }
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
            (propertyPath.localeCompare('queryTextSource') === 0 && oldValue === QueryTextSource.StaticValue && newValue === QueryTextSource.DynamicValue) ||
            (propertyPath.localeCompare('useInputQueryText') === 0 && !this.properties.useInputQueryText)) {

            const queryText = DynamicPropertyHelper.tryGetSourceSafe(this.properties.queryText);
            if (queryText && queryText.unregister) {
                queryText.unregister(this.render);
                queryText.queryText.setValue('');
            }
        }

        // Update template slots when default slots from data source change (ex: OData client type)
        if (propertyPath.indexOf('dataSourceProperties') !== -1 && this.dataSource && this._defaultTemplateSlots && !isEqual(this._defaultTemplateSlots, this.dataSource.getTemplateSlots())) {
            this.properties.templateSlots = this.dataSource.getTemplateSlots();
            this._defaultTemplateSlots = this.dataSource.getTemplateSlots();
        }

        if (propertyPath.localeCompare('extensibilityLibraryConfiguration') === 0) {

            // Remove duplicates if any
            const cleanConfiguration = uniqBy(this.properties.extensibilityLibraryConfiguration, 'id');

            // Reset existing definitions to default
            this.availableDataSourceDefinitions = AvailableDataSources.BuiltinDataSources;
            this.availableLayoutDefinitions = AvailableLayouts.BuiltinLayouts.filter(layout => { return layout.type === LayoutType.Results; });
            this.availableWebComponentDefinitions = AvailableComponents.BuiltinComponents;
            this.availableCustomQueryModifierDefinitions = [];
            this._selectedCustomQueryModifier = [];
            this.properties.queryModifierProperties = {};
            this.properties.queryModifierConfiguration = [];

            await this.loadExtensions(cleanConfiguration);
        }

        if (this.properties.queryTextSource === QueryTextSource.StaticValue || !this.properties.useDefaultQueryText || !this.properties.useInputQueryText) {
            // Reset the default query text
            this.properties.defaultQueryText = undefined;
        }

        if (propertyPath.localeCompare("useMicrosoftGraphToolkit") === 0 && this.properties.useMicrosoftGraphToolkit) {

            // We load this dynamically to avoid tokens renewal failure at page load and decrease the bundle size. Most of the time, MGT won't be used in templates.
            await loadMsGraphToolkit(this.context);
        }

        if (propertyPath.localeCompare('selectedItemFieldValue') === 0) {

            const reference = this.properties.selectedItemFieldValue.reference;

            // Reset the default SPFx property pane field automatically as this configuration is not allowed for this scenario
            if (reference && reference.indexOf(ComponentType.SearchResults) !== -1) {
                this.properties.selectedItemFieldValue.setValue('');
                this.properties.selectedItemFieldValue.unregister(this.render);
            } else {
                if (!oldValue.reference) {
                    this.properties.selectedItemFieldValue.register(this.render);
                }
            }
        }

        if (propertyPath.localeCompare('itemSelectionProps.destinationFieldName') === 0 && !isEqual(oldValue, newValue)) {

            const filterToken = this.tokenService.getTokenValue(BuiltinTokenNames.filters);

            if (filterToken) {
                // Reset previous token value 
                delete filterToken[oldValue];
            }
        }

        if (propertyPath.localeCompare('enableCustomQueryTransformation') === 0 && !newValue) {

            // Disable all providers
            this.properties.queryModifierConfiguration.forEach(modifier => {
                modifier.enabled = false;
            });

            this.properties.queryModifierProperties = {};
        }


        // Refresh list of available connections
        this.propertyPaneConnectionsGroup = await this.getConnectionOptionsGroup();
        this.context.propertyPane.refresh();

        // Reset the page number to 1 every time the Web Part properties change
        this.currentPageNumber = 1;
    }

    public onCustomPropertyUpdate(propertyPath: string, newValue: any, changeCallback?: (targetProperty?: string, newValue?: any) => void): void {

        if (propertyPath.localeCompare('selectedVerticalKeys') === 0) {
            changeCallback(propertyPath, (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as string; }));
            this.context.propertyPane.refresh();
        }

        if (propertyPath.localeCompare('itemSelectionProps.destinationFieldName') === 0) {
            changeCallback(propertyPath, cloneDeep((newValue as IComboBoxOption).key));
            this.context.propertyPane.refresh();
        }

        if (propertyPath.localeCompare("layoutRenderType") === 0) {

            this.availableLayoutsInPropertyPane = this.availableLayoutDefinitions.filter(layoutDefinition => layoutDefinition.renderType === LayoutRenderType[newValue as string]);

            // Reset the inline template if the templating mode is updated since they are not compatible between HTML and JSON
            this.properties.inlineTemplateContent = null;
            this.properties.selectedLayoutKey = this.availableLayoutsInPropertyPane[0].key;

            this.properties.layoutRenderType = LayoutRenderType[newValue as string];
            this.render();
            this.context.propertyPane.refresh();
        }
    }

    protected get isRenderAsync(): boolean {
        return true;
    }

    protected async onPropertyPaneConfigurationStart() {
        await this.loadPropertyPaneResources();
    }

    /**
     * Determines the input query text value based on Dynamic Data
     */
    private async _getInputQueryTextValue(): Promise<string> {

        let inputQueryText: string = undefined; // {inputQueryText} token should always resolve as '' by default

        // tryGetValue() will resolve to '' if no Web Part is connected or if the connection is removed
        // The value can be also 'undefined' if the data source is not already loaded on the page.
        let inputQueryFromDataSource = "";
        if (this.properties.queryText && this.properties.useInputQueryText) {
            try {
                inputQueryFromDataSource = DynamicPropertyHelper.tryGetValueSafe(this.properties.queryText);
                if (inputQueryFromDataSource !== undefined && typeof (inputQueryFromDataSource) === 'string') {
                    inputQueryFromDataSource = decodeURIComponent(inputQueryFromDataSource);
                }

            } catch (error) {
                // Likely issue when q=%25 in spfx
            }
        }

        if (!inputQueryFromDataSource) { // '' or 'undefined'

            if (this.properties.useDefaultQueryText) {
                inputQueryText = this.properties.defaultQueryText;
            } else if (inputQueryFromDataSource !== undefined) {
                inputQueryText = inputQueryFromDataSource;
            }

        } else if (typeof (inputQueryFromDataSource) === 'string') {
            inputQueryText = decodeURIComponent(inputQueryFromDataSource);
        }

        //Check if any custom query modifier is active and modify the inputQueryText
        if (this._selectedCustomQueryModifier && this._selectedCustomQueryModifier.length > 0) {
            inputQueryText = await this.getModifiedInputQueryText(inputQueryText);
        }

        return inputQueryText;
    }

    /**
     * Loads extensions from registered extensibility librairies
     */
    private async loadExtensions(librariesConfiguration: IExtensibilityConfiguration[]) {

        // Load extensibility library if present
        const extensibilityLibraries = await this.extensibilityService.loadExtensibilityLibraries(librariesConfiguration);
        const customQueryModifierConfiguration: IQueryModifierConfiguration[] = [];

        // Load extensibility additions
        if (extensibilityLibraries.length > 0) {

            // Load customizations from extensibility libraries
            extensibilityLibraries.forEach((extensibilityLibrary: IExtensibilityLibrary) => {

                // Add custom layouts if any
                if (extensibilityLibrary.getCustomLayouts)
                    this.availableLayoutDefinitions = this.availableLayoutDefinitions.concat(extensibilityLibrary.getCustomLayouts());

                // Add custom web components if any
                if (extensibilityLibrary.getCustomWebComponents)
                    this.availableWebComponentDefinitions = this.availableWebComponentDefinitions.concat(extensibilityLibrary.getCustomWebComponents());

                // Registers Handlebars customizations in the local namespace
                if (extensibilityLibrary.registerHandlebarsCustomizations)
                    extensibilityLibrary.registerHandlebarsCustomizations(this.templateService.Handlebars);

                // Registers event handler for custom action in Adaptive Cards
                if (extensibilityLibrary.invokeCardAction)
                    this.templateService.AdaptiveCardsExtensibilityLibraries = this.templateService.AdaptiveCardsExtensibilityLibraries.concat(extensibilityLibrary);

                // Add custom data sources if any
                if (extensibilityLibrary.getCustomDataSources)
                    this.availableDataSourceDefinitions = this.availableDataSourceDefinitions.concat(extensibilityLibrary.getCustomDataSources());

                // Add custom query modifiers if any
                if (extensibilityLibrary.getCustomQueryModifiers)
                    this.availableCustomQueryModifierDefinitions = this.availableCustomQueryModifierDefinitions.concat(extensibilityLibrary.getCustomQueryModifiers());
            });
        }

        this.availableCustomQueryModifierDefinitions.forEach(provider => {

            if (!this.properties.queryModifierConfiguration.some(p => p.key === provider.key)) {

                customQueryModifierConfiguration.push({
                    key: provider.key,
                    description: provider.description,
                    enabled: false,
                    name: provider.name,
                    endWhenSuccessfull: false
                });
            }
        });

        // Add custom providers to the available providers
        this.properties.queryModifierConfiguration = this.properties.queryModifierConfiguration.concat(customQueryModifierConfiguration);
    }

    public async loadPropertyPaneResources(): Promise<void> {

        const { PropertyFieldCodeEditor, PropertyFieldCodeEditorLanguages } = await import(
            /* webpackChunkName: 'pnp-modern-search-code-editor' */
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

        const { PropertyPaneWebPartInformation } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyPaneWebPartInformation'
        );

        this._propertyPaneWebPartInformation = PropertyPaneWebPartInformation;

        const { CalloutTriggers } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/common/callout/Callout'
        );

        const { PropertyFieldNumber } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldNumber'
        );

        const { PropertyPanePropertyEditor } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyPanePropertyEditor'
        );
        this._propertyPanePropertyEditor = PropertyPanePropertyEditor;

        this._propertyFieldToogleWithCallout = PropertyFieldToggleWithCallout;
        this._propertyFieldCalloutTriggers = CalloutTriggers;

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

            this.render();

        }).bind(this));
    }

    /**
     * Binds events fired from sorting web components
     */
    private bindSortingEvents() {

        this.domElement.addEventListener(ExtensibilityConstants.EVENT_SORT_BY, ((ev: CustomEvent) => {

            // We ensure the event if not propagated outside the component (i.e. other Web Part instances)
            ev.stopImmediatePropagation();

            const eventDetails: ISortInfo = ev.detail;

            // These information comes from the SortWebComponent class
            this._currentSelectedSortFieldName = eventDetails.sortFieldName;
            this._currentSelectedSortDirection = eventDetails.sortFieldDirection;

            this.render();

        }).bind(this));
    }

    /**
     * Initializes required Web Part properties
     */
    private initializeProperties() {
        this.properties.selectedLayoutKey = this.properties.selectedLayoutKey ? this.properties.selectedLayoutKey : BuiltinLayoutsKeys.Cards;
        this.properties.resultTypes = this.properties.resultTypes ? this.properties.resultTypes : [];
        this.properties.dataSourceProperties = this.properties.dataSourceProperties ? this.properties.dataSourceProperties : {};

        if (!this.properties.queryText) {
            this.properties.queryText = new DynamicProperty<string>(this.context.dynamicDataProvider);
            this.properties.queryText.setValue('');
        }

        this.properties.queryTextSource = this.properties.queryTextSource ? this.properties.queryTextSource : QueryTextSource.StaticValue;
        this.properties.layoutProperties = this.properties.layoutProperties ? this.properties.layoutProperties : {};

        // Common options 
        this.properties.showSelectedFilters = this.properties.showSelectedFilters !== undefined ? this.properties.showSelectedFilters : false;
        this.properties.showResultsCount = this.properties.showResultsCount !== undefined ? this.properties.showResultsCount : true;
        this.properties.showBlankIfNoResult = this.properties.showBlankIfNoResult !== undefined ? this.properties.showBlankIfNoResult : false;
        this.properties.useMicrosoftGraphToolkit = this.properties.useMicrosoftGraphToolkit !== undefined ? this.properties.useMicrosoftGraphToolkit : false;
        this.properties.enableTelemetry = this.properties.enableTelemetry !== undefined ? this.properties.enableTelemetry : true;

        // Item selection properties
        if (!this.properties.selectedItemFieldValue) {
            this.properties.selectedItemFieldValue = new DynamicProperty<string>(this.context.dynamicDataProvider);
            this.properties.selectedItemFieldValue.setValue('');
        }

        this.properties.itemSelectionProps = this.properties.itemSelectionProps !== undefined ? this.properties.itemSelectionProps : {
            allowItemSelection: false,
            destinationFieldName: undefined,
            selectionMode: ItemSelectionMode.AsDataFilter,
            allowMulti: false,
            valuesOperator: FilterConditionOperator.OR
        };

        this.properties.extensibilityLibraryConfiguration = this.properties.extensibilityLibraryConfiguration ? this.properties.extensibilityLibraryConfiguration : [{
            name: commonStrings.General.Extensibility.DefaultExtensibilityLibraryName,
            enabled: true,
            id: Constants.DEFAULT_EXTENSIBILITY_LIBRARY_COMPONENT_ID
        }];

        // Custom Query Modifier
        this.properties.queryModifierConfiguration = this.properties.queryModifierConfiguration ? this.properties.queryModifierConfiguration : [];
        this.properties.queryModifierProperties = this.properties.queryModifierProperties ? this.properties.queryModifierProperties : { endWhenSuccessfull: false };

        if (this.properties.selectedVerticalKeys === undefined) {
            this.properties.selectedVerticalKeys = [];
        }

        // Adapt to new schema since 4.1.0
        if (this.properties['selectedVerticalKey'] && this.properties.selectedVerticalKeys.indexOf(this.properties['selectedVerticalKey']) === -1) {
            this.properties.selectedVerticalKeys.push(this.properties['selectedVerticalKey']);
        }

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

        // Default adaptive cards host config
        if (!this.properties.adaptiveCardsHostConfig) {
            this.properties.adaptiveCardsHostConfig = JSON.stringify({
                fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
            }, null, "\t");
        }

        this.properties.layoutRenderType = this.properties.layoutRenderType !== undefined ? this.properties.layoutRenderType : LayoutRenderType.Handlebars;
    }

    /**
     * Returns property pane 'Styling' page groups
     */
    private getStylingPageGroups(): IPropertyPaneGroup[] {

        const canEditTemplate = this.properties.externalTemplateUrl && (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomHandlebars || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomAdaptiveCards) ? false : true;

        let stylingFields: IPropertyPaneField<any>[] = [
            new PropertyPaneTabsField('layoutRenderType', {
                onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                options: [
                    {
                        key: LayoutRenderType[LayoutRenderType.Handlebars],
                        text: webPartStrings.PropertyPane.LayoutPage.HandlebarsRenderTypeLabel,
                        title: webPartStrings.PropertyPane.LayoutPage.HandlebarsRenderTypeDesc,
                    },
                    {
                        key: LayoutRenderType[LayoutRenderType.AdaptiveCards],
                        text: webPartStrings.PropertyPane.LayoutPage.AdaptiveCardsRenderTypeLabel,
                        title: webPartStrings.PropertyPane.LayoutPage.AdaptiveCardsRenderTypeDesc,
                    }
                ],
                defaultSelectedKey: LayoutRenderType[this.properties.layoutRenderType]
            }),
            PropertyPaneChoiceGroup('selectedLayoutKey', {
                options: LayoutHelper.getLayoutOptions(this.availableLayoutsInPropertyPane)
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

            case BuiltinLayoutsKeys.ResultsCustomHandlebars:
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
                language: this.properties.layoutRenderType !== LayoutRenderType.Handlebars ? this._propertyFieldCodeEditorLanguages.JSON : this._propertyFieldCodeEditorLanguages.Handlebars
            }),
        );

        // Only show the template external URL for 'Custom' option
        if (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomAdaptiveCards || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomHandlebars) {
            stylingFields.push(
                PropertyPaneTextField('externalTemplateUrl', {
                    label: webPartStrings.PropertyPane.LayoutPage.TemplateUrlFieldLabel,
                    placeholder: this.properties.layoutRenderType === LayoutRenderType.Handlebars ? webPartStrings.PropertyPane.LayoutPage.TemplateUrlPlaceholder : "https://myfile.json",
                    deferredValidationTime: 500,
                    validateOnFocusIn: true,
                    validateOnFocusOut: true,
                    onGetErrorMessage: this.onTemplateUrlChange.bind(this)
                }));
        }

        // Only allow result types for Handlebars based layouts
        if (this.properties.layoutRenderType === LayoutRenderType.Handlebars) {
            stylingFields.push(
                this._propertyFieldCollectionData('resultTypes', {
                    manageBtnLabel: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.EditResultTypesLabel,
                    key: 'resultTypes',
                    panelHeader: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.EditResultTypesLabel,
                    panelDescription: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ResultTypesDescription,
                    enableSorting: true,
                    label: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ResultTypeslabel,
                    value: this.properties.resultTypes,
                    disabled: this.properties.selectedLayoutKey === BuiltinLayoutsKeys.DetailsList
                        || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsDebug
                        || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.Slider,
                    fields: [
                        {
                            id: 'property',
                            title: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ConditionPropertyLabel,
                            type: this._customCollectionFieldType.dropdown,
                            required: true,
                            options: this._currentDataResultsSourceData.availableFieldsFromResults.map(field => {
                                return {
                                    key: field,
                                    text: field
                                };
                            })
                        },
                        {
                            id: 'operator',
                            title: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.CondtionOperatorValue,
                            type: this._customCollectionFieldType.dropdown,
                            defaultValue: ResultTypeOperator.Equal,
                            required: true,
                            options: [
                                {
                                    key: ResultTypeOperator.Equal,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.EqualOperator
                                },
                                {
                                    key: ResultTypeOperator.NotEqual,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.NotEqualOperator
                                },
                                {
                                    key: ResultTypeOperator.Contains,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ContainsOperator
                                },
                                {
                                    key: ResultTypeOperator.StartsWith,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.StartsWithOperator
                                },
                                {
                                    key: ResultTypeOperator.NotNull,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.NotNullOperator
                                },
                                {
                                    key: ResultTypeOperator.GreaterOrEqual,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.GreaterOrEqualOperator
                                },
                                {
                                    key: ResultTypeOperator.GreaterThan,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.GreaterThanOperator
                                },
                                {
                                    key: ResultTypeOperator.LessOrEqual,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.LessOrEqualOperator
                                },
                                {
                                    key: ResultTypeOperator.LessThan,
                                    text: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.LessThanOperator
                                }
                            ]
                        },
                        {
                            id: 'value',
                            title: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ConditionValueLabel,
                            type: this._customCollectionFieldType.string,
                            required: false,
                        },
                        {
                            id: "inlineTemplateContent",
                            title: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.InlineTemplateContentLabel,
                            type: this._customCollectionFieldType.custom,
                            onCustomRender: ((field, value, onUpdate) => {
                                return (
                                    React.createElement("div", null,
                                        React.createElement(this._textDialogComponent.TextDialog, {
                                            language: this._propertyFieldCodeEditorLanguages.Handlebars,
                                            dialogTextFieldValue: value ? value : resultTypeInlineTemplate,
                                            onChanged: (fieldValue) => onUpdate(field.id, fieldValue),
                                            strings: {
                                                cancelButtonText: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.CancelButtonText,
                                                dialogButtonText: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.DialogButtonText,
                                                dialogTitle: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.DialogTitle,
                                                saveButtonText: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.SaveButtonText
                                            }
                                        })
                                    )
                                );
                            }).bind(this)
                        },
                        {
                            id: 'externalTemplateUrl',
                            title: webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ExternalUrlLabel,
                            type: this._customCollectionFieldType.url,
                            onGetErrorMessage: this.onTemplateUrlChange.bind(this),
                            placeholder: 'https://mysite/Documents/external.html'
                        }
                    ]
                }),
                PropertyPaneToggle('itemSelectionProps.allowItemSelection', {
                    label: webPartStrings.PropertyPane.LayoutPage.Handlebars.AllowItemSelection
                }),
            );

            if (this.properties.itemSelectionProps.allowItemSelection) {

                stylingFields.push(
                    PropertyPaneToggle('itemSelectionProps.allowMulti', {
                        label: webPartStrings.PropertyPane.LayoutPage.Handlebars.AllowMultipleItemSelection,
                    }),
                    PropertyPaneHorizontalRule()
                );
            }
        }

        // Adaptive cards fields
        if (this.properties.layoutRenderType === LayoutRenderType.AdaptiveCards) {
            stylingFields.push(
                this._propertyFieldCodeEditor('adaptiveCardsHostConfig', {
                    label: webPartStrings.PropertyPane.LayoutPage.AdaptiveCards.HostConfigFieldLabel,
                    panelTitle: webPartStrings.PropertyPane.LayoutPage.DialogTitle,
                    initialValue: this.properties.adaptiveCardsHostConfig,
                    deferredValidationTime: 500,
                    onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                    properties: this.properties,
                    key: 'adaptiveCardsHostConfig',
                    language: this._propertyFieldCodeEditorLanguages.JSON
                })
            );
        }

        stylingFields.push(
            PropertyPaneToggle('useMicrosoftGraphToolkit', {
                label: webPartStrings.PropertyPane.LayoutPage.Handlebars.UseMicrosoftGraphToolkit,
            })
        );

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
            }
        );

        if (layoutOptions.length > 0) {
            groups.push(
                {
                    groupName: webPartStrings.PropertyPane.LayoutPage.LayoutTemplateOptionsGroupName,
                    groupFields: layoutOptions
                }
            );
        }

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
                                        }).bind(this)
                                    } as IToggleProps)
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
    private getDataSourceOptions(): IPropertyPaneChoiceGroupOption[] {

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
            return this.layout.getPropertyPaneFieldsConfiguration(this._currentDataResultsSourceData.availableFieldsFromResults, this._currentDataContext);
        } else {
            return [];
        }
    }

    private getTemplateSlotOptions(): IPropertyPaneField<any>[] {

        let templateSlotFields: IPropertyPaneField<any>[] = [];
        if (this.dataSource) {

            let availableOptions: IComboBoxOption[];
            if (this._currentDataResultsSourceData.availableFieldsFromResults.length > 0) {
                availableOptions = this._currentDataResultsSourceData.availableFieldsFromResults.map(field => {
                    return {
                        key: field,
                        text: field
                    };
                });
            }
            else {
                availableOptions = this.dataSource.getTemplateSlots().map(slot => {
                    return {
                        key: slot.slotField,
                        text: slot.slotField
                    };
                });
            }

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
                                            onLoadOptions: () => {
                                                return Promise.resolve(availableOptions);
                                            },
                                            onUpdateOptions: () => { },
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
                calloutContent: React.createElement('p', { style: { maxWidth: 250, wordBreak: 'break-word' } }, webPartStrings.PropertyPane.ConnectionsPage.UseInputQueryTextHoverMessage),
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

            if (this.availableCustomQueryModifierDefinitions.length > 0) {

                searchQueryTextFields = searchQueryTextFields.concat(this.getQueryModifierFields());
            }

        }

        return searchQueryTextFields;
    }

    private async getDataResultsConnectionFields(): Promise<IPropertyPaneField<any>[]> {

        let dataResultsConnectionFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('useDynamicFiltering', {
                label: webPartStrings.PropertyPane.ConnectionsPage.UseDynamicFilteringsWebPartLabel,
                checked: this.properties.useDynamicFiltering
            })
        ];

        if (this.properties.useDynamicFiltering) {

            let isSourceFieldConfigured: boolean = false;

            // Make sure a property is selected in the source according to the reference format.
            // Ex: PageContext:UrlData:queryParameters.q = Page environment
            // Ex: WebPart.544c1372-42df-47c3-94d6-017428cd2baf.1272b161-3435-4815-99a1-996590334cff:AvailableFieldValuesFromResults:FileType = Search Results
            if (this.properties.selectedItemFieldValue.reference) {
                isSourceFieldConfigured = /^.+:.+:(.+)$/.test(this.properties.selectedItemFieldValue.reference);
            }

            dataResultsConnectionFields.push(

                // Allow both 'Search Results' Web Parts and OOTB SharePoint List Web Parts 
                PropertyPaneDynamicFieldSet({
                    label: webPartStrings.PropertyPane.ConnectionsPage.UseDataResultsFromComponentsLabel,
                    fields: [
                        PropertyPaneDynamicField('selectedItemFieldValue', {
                            label: webPartStrings.PropertyPane.ConnectionsPage.UseDataResultsFromComponentsLabel,
                        })
                    ],
                    sharedConfiguration: {
                        depth: DynamicDataSharedDepth.Property,
                        property: {
                            filters: {
                                propertyId: DynamicDataProperties.AvailableFieldValuesFromResults
                            }
                        }
                    }
                })
            );

            if (isSourceFieldConfigured) {

                const availableOptions: IComboBoxOption[] = this._currentDataResultsSourceData.availableFieldsFromResults.map(field => {
                    return {
                        key: field,
                        text: field
                    };
                });

                dataResultsConnectionFields.splice(4, 0,
                    new PropertyPaneAsyncCombo('itemSelectionProps.destinationFieldName', {
                        label: webPartStrings.PropertyPane.ConnectionsPage.SourceDestinationFieldLabel,
                        availableOptions: availableOptions,
                        description: webPartStrings.PropertyPane.ConnectionsPage.SourceDestinationFieldDescription,
                        allowMultiSelect: false,
                        allowFreeform: true,
                        searchAsYouType: false,
                        defaultSelectedKeys: this.properties.selectedVerticalKeys,
                        textDisplayValue: this.properties.itemSelectionProps.destinationFieldName,
                        onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                    })
                );
            }

            if (isSourceFieldConfigured && this.properties.itemSelectionProps.destinationFieldName) {

                dataResultsConnectionFields.splice(4, 0,
                    PropertyPaneChoiceGroup('itemSelectionProps.selectionMode', {
                        options: [
                            {
                                key: ItemSelectionMode.AsDataFilter,
                                text: webPartStrings.PropertyPane.LayoutPage.Handlebars.AsDataFiltersSelectionMode
                            },
                            {
                                key: ItemSelectionMode.AsTokenValue,
                                text: webPartStrings.PropertyPane.LayoutPage.Handlebars.AsTokensSelectionMode
                            }
                        ],
                        label: webPartStrings.PropertyPane.LayoutPage.Handlebars.SelectionModeLabel,
                    })
                );

                if (this.properties.itemSelectionProps.selectionMode === ItemSelectionMode.AsDataFilter) {
                    dataResultsConnectionFields.splice(5, 0,
                        this._propertyPaneWebPartInformation({
                            description: `<em>${webPartStrings.PropertyPane.LayoutPage.Handlebars.AsDataFiltersDescription}</em>`,
                            key: 'selectionModeText'
                        }),
                        PropertyPaneChoiceGroup('itemSelectionProps.valuesOperator', {
                            options: [
                                {
                                    key: FilterConditionOperator.OR,
                                    text: 'OR'
                                },
                                {
                                    key: FilterConditionOperator.AND,
                                    text: 'AND'
                                },
                            ],
                            label: webPartStrings.PropertyPane.LayoutPage.Handlebars.FilterValuesOperator
                        })
                    );
                } else {
                    dataResultsConnectionFields.splice(4, 0,
                        this._propertyPaneWebPartInformation({
                            description: `<em>${webPartStrings.PropertyPane.LayoutPage.Handlebars.AsTokensDescription}</em>`,
                            key: 'selectionModeText'
                        })
                    );
                }
            }
        }

        return dataResultsConnectionFields;
    }

    private async getFiltersConnectionFields(): Promise<IPropertyPaneField<any>[]> {

        let filtersConnectionFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('useFilters', {
                label: webPartStrings.PropertyPane.ConnectionsPage.UseFiltersWebPartLabel,
                checked: this.properties.useFilters
            })
        ];

        if (this.properties.useFilters) {
            filtersConnectionFields.splice(1, 0,
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
                checked: this.properties.useVerticals
            })
        ];

        if (this.properties.useVerticals) {
            verticalsConnectionFields.splice(1, 0,
                PropertyPaneDropdown('verticalsDataSourceReference', {
                    options: await this.dynamicDataService.getAvailableDataSourcesByType(ComponentType.SearchVerticals),
                    label: webPartStrings.PropertyPane.ConnectionsPage.UseSearchVerticalsFromComponentLabel
                })
            );

            if (this.properties.verticalsDataSourceReference) {

                // Get all available verticals
                if (this._verticalsConnectionSourceData) {
                    const availableVerticals = DynamicPropertyHelper.tryGetValueSafe(this._verticalsConnectionSourceData);

                    if (availableVerticals) {

                        // Get the corresponding text for selected keys
                        let selectedKeysAsText: string[] = [];

                        availableVerticals.verticalsConfiguration.forEach(verticalConfiguration => {
                            if (this.properties.selectedVerticalKeys.indexOf(verticalConfiguration.key) !== -1) {
                                selectedKeysAsText.push(verticalConfiguration.tabName);
                            }
                        });

                        verticalsConnectionFields.push(
                            new PropertyPaneAsyncCombo('selectedVerticalKeys', {
                                availableOptions: availableVerticals.verticalsConfiguration.filter(v => !v.isLink).map(verticalConfiguration => {
                                    return {
                                        key: verticalConfiguration.key,
                                        text: verticalConfiguration.tabName
                                    };
                                }),
                                allowMultiSelect: true,
                                allowFreeform: false,
                                description: webPartStrings.PropertyPane.ConnectionsPage.LinkToVerticalLabelHoverMessage,
                                label: webPartStrings.PropertyPane.ConnectionsPage.LinkToVerticalLabel,
                                searchAsYouType: false,
                                defaultSelectedKeys: this.properties.selectedVerticalKeys,
                                textDisplayValue: selectedKeysAsText.join(','),
                                onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                            }),
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
        const dataResultsConnectionsFields = await this.getDataResultsConnectionFields();

        let availableConnectionsGroup: IPropertyPaneGroup[] = [
            {
                groupName: webPartStrings.PropertyPane.ConnectionsPage.ConnectionsPageGroupName,
                groupFields: [
                    ...this.getSearchQueryTextFields(),
                    PropertyPaneHorizontalRule(),
                    ...filterConnectionFields,
                    PropertyPaneHorizontalRule(),
                    ...verticalConnectionFields,
                    PropertyPaneHorizontalRule(),
                    ...dataResultsConnectionsFields
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
                        /* webpackChunkName: 'pnp-modern-search-sharepoint-search-datasource' */
                        '../../dataSources/SharePointSearchDataSource'
                    );

                    serviceKey = ServiceKey.create<IDataSource>('ModernSearch:SharePointSearchDataSource', SharePointSearchDataSource);
                    break;

                // Microsoft Search API
                case BuiltinDataSourceProviderKeys.MicrosoftSearch:

                    const { MicrosoftSearchDataSource } = await import(
                        /* webpackChunkName: 'pnp-modern-search-microsoft-search-datasource' */
                        '../../dataSources/MicrosoftSearchDataSource'
                    );

                    serviceKey = ServiceKey.create<IDataSource>('ModernSearch:SharePointSearchDataSource', MicrosoftSearchDataSource);
                    break;

                default:
                    const source = this.availableDataSourceDefinitions.find(definition => definition.key === dataSourceKey);
                    serviceKey = source.serviceKey;
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
                    await this.setTokens();

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
                        dataSource.editMode = this.displayMode == DisplayMode.Edit;
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
                return Promise.resolve('');
            } else {

                // Resolves an error if the file isn't a valid .json, .htm or .html file
                let extensions: string[] = [];

                switch (this.properties.layoutRenderType) {
                    case LayoutRenderType.Handlebars:
                        extensions = [".htm", ".html", ".txt"];
                        break;

                    case LayoutRenderType.AdaptiveCards:
                        // Because of SharePoint restrictions, JSON files should be read as TXT files
                        extensions = [".txt", ".json"];
                        break;

                    default:
                        break;
                }

                if (!this.templateService.isValidTemplateFile(value, extensions)) {
                    return Promise.resolve(Text.format(webPartStrings.PropertyPane.LayoutPage.ErrorTemplateExtension, extensions.join(' or ')));
                } else {

                    // Resolves an error if the file doesn't answer a simple head request
                    await this.templateService.ensureFileResolves(value);
                    return Promise.resolve('');
                }
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

        if (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomHandlebars ||
            this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomAdaptiveCards) {

            if (this.properties.externalTemplateUrl) {
                let fileFormat: FileFormat = this.properties.layoutRenderType === LayoutRenderType.AdaptiveCards ? FileFormat.Json : FileFormat.Text;
                this.templateContentToDisplay = await this.templateService.getFileContent(this.properties.externalTemplateUrl, fileFormat);
            } else {
                this.templateContentToDisplay = this.properties.inlineTemplateContent ? this.properties.inlineTemplateContent : selectedLayoutTemplateContent;
            }

        } else {
            this.templateContentToDisplay = selectedLayoutTemplateContent;
        }

        // Register result types inside the template      
        if (this.properties.layoutRenderType === LayoutRenderType.Handlebars && this.templateService) {
            await this.templateService.registerResultTypes(this.properties.resultTypes);
        }

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
    private async setTokens() {

        if (this.tokenService) {

            // Input query text
            const inputQueryText = await this._getInputQueryTextValue();
            this.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, inputQueryText);
            this.tokenService.setTokenValue(BuiltinTokenNames.originalInputQueryText, inputQueryText);   

            if (inputQueryText) {
                // Legacy token for SharePoint and Microsoft Search data sources
                this.tokenService.setTokenValue(BuiltinTokenNames.searchTerms, inputQueryText);
            }

            // Selected filters
            if (this._filtersConnectionSourceData) {

                const filtersSourceData: IDataFilterSourceData = DynamicPropertyHelper.tryGetValueSafe(this._filtersConnectionSourceData);

                if (filtersSourceData) {

                    // Set the token as 'null' if no filter is selected meaning the token is available but with no data (different from 'undefined')
                    // It is the caller responsability to check if the value is empty before using it in an expression (ex: `if(empty('{filters}'),'doA','doB)`)
                    let filterTokens: IDataFilterToken = null;

                    const allValues = flatten(filtersSourceData.selectedFilters.map(f => f.values));

                    // Make sure we have values in selected filters
                    if (filtersSourceData.selectedFilters.length > 0 && !isEmpty(allValues)) {

                        filterTokens = {};

                        // Build the initial structure for the configured filter names
                        filtersSourceData.filterConfiguration.forEach(filterConfiguration => {

                            // Initialize to an empty object so the token service can resolve it to an empty string instead leaving the token '{filters}' as is
                            filterTokens[filterConfiguration.filterName] = null;
                        });

                        filtersSourceData.selectedFilters.forEach(filter => {

                            const configuration = DataFilterHelper.getConfigurationForFilter(filter, filtersSourceData.filterConfiguration);

                            if (configuration) {

                                let filterTokenValue: IDataFilterTokenValue = null;

                                const filterValues = filter.values.map(value => value.value).join(',');

                                // Don't tokenize the filter if there is no value.
                                if (filterValues.length > 0) {
                                    filterTokenValue = {
                                        valueAsText: filterValues
                                    };
                                }

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

                                    filterTokenValue.fromDate = fromDate;
                                    filterTokenValue.toDate = toDate;
                                }

                                filterTokens[filter.filterName] = filterTokenValue;
                            }
                        });
                    }

                    this.tokenService.setTokenValue(BuiltinTokenNames.filters, filterTokens);
                }
            }

            // Current selected Search Results or SharePoint List Web Part
            const destinationFieldName = this.properties.itemSelectionProps.destinationFieldName;

            const itemFieldValues: string[] = DynamicPropertyHelper.tryGetValuesSafe(this.properties.selectedItemFieldValue);

            if (destinationFieldName) {

                let filterTokens = {
                    [destinationFieldName]: {
                        valueAsText: null,
                    } as IDataFilterTokenValue
                };

                filterTokens[destinationFieldName].valueAsText = itemFieldValues.length > 0 ? itemFieldValues.join(',') : undefined;  // This allow the `{? <KQL expression>}` to work
                this.tokenService.setTokenValue(BuiltinTokenNames.filters, filterTokens);
            }

            // Current selected vertical
            if (this._verticalsConnectionSourceData) {
                const verticalSourceData = DynamicPropertyHelper.tryGetValueSafe(this._verticalsConnectionSourceData);

                // Tokens for verticals are resolved first locally in the Search Verticals WP itself. If some tokens are not recognized in the string (ex: undefined in their TokenService instance), they will be left untounched. 
                // In this case, we need to resolve them in the current Search Results WP context as they only exist here (ex: itemsCountPerPage)
                if (verticalSourceData && verticalSourceData.selectedVertical) {
                    const resolvedSelectedVertical: IDataVertical = {
                        key: verticalSourceData.selectedVertical.key,
                        name: verticalSourceData.selectedVertical.name,
                        value: await this.tokenService.resolveTokens(verticalSourceData.selectedVertical.value)
                    };

                    this.tokenService.setTokenValue(BuiltinTokenNames.verticals, resolvedSelectedVertical);
                }
            }
        }
    }

    /**
     * Make sure the dynamic properties are correctly connected to the corresponding sources according to the proeprty pane settings
     */
    private ensureDynamicDataSourcesConnection() {

        // Filters Web Part data source
        if (this.properties.filtersDataSourceReference) {

            if (!this._filtersConnectionSourceData) {
                this._filtersConnectionSourceData = new DynamicProperty<IDataFilterSourceData>(this.context.dynamicDataProvider);
            }

            this._filtersConnectionSourceData.setReference(this.properties.filtersDataSourceReference);
            this._filtersConnectionSourceData.register(this.render);

        } else {

            if (this._filtersConnectionSourceData) {
                this._filtersConnectionSourceData.unregister(this.render);
            }
        }

        // Verticals Web Part data source
        if (this.properties.verticalsDataSourceReference) {

            if (!this._verticalsConnectionSourceData) {
                this._verticalsConnectionSourceData = new DynamicProperty<IDataVerticalSourceData>(this.context.dynamicDataProvider);
            }

            this._verticalsConnectionSourceData.setReference(this.properties.verticalsDataSourceReference);
            this._verticalsConnectionSourceData.register(this.render);

        } else {
            if (this._verticalsConnectionSourceData) {
                this._verticalsConnectionSourceData.unregister(this.render);
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
   * Get the data context to be passed to the data source according to current connections/configurations
   */
    private async getDataContext(): Promise<IDataContext> {

        // Input query text
        const inputQueryText = await this._getInputQueryTextValue();

        // Build the data context to pass to the data source
        let dataContext: IDataContext = {
            pageNumber: this.currentPageNumber,
            itemsCountPerPage: this.properties.paging.itemsCountPerPage,
            filters: {
                selectedFilters: [],
                filtersConfiguration: [],
                instanceId: undefined,
                filterOperator: undefined
            },
            verticals: {
                selectedVertical: undefined
            },
            inputQueryText: inputQueryText,
            originalInputQueryText: inputQueryText,
            queryStringParameters: UrlHelper.getQueryStringParams(),
            sorting: {
                selectedSortableFields: this.dataSource.getSortableFields(),
                selectedSortFieldName: this._currentSelectedSortFieldName,
                selectedSortDirection: this._currentSelectedSortDirection
            }
        };

        // Connected Search Results or SharePoint List Web Part
        const itemFieldValues: string[] = DynamicPropertyHelper.tryGetValuesSafe(this.properties.selectedItemFieldValue);

        if (itemFieldValues && itemFieldValues.length > 0 && this.properties.itemSelectionProps.destinationFieldName) {

            // Set the selected items to the data context. This will force data to be fetched again
            dataContext.selectedItemValues = itemFieldValues;

            // Convert the current selection into search filters format, just like the Data Filter Web Part
            if (this.properties.itemSelectionProps.selectionMode === ItemSelectionMode.AsDataFilter) {

                const filterValues: IDataFilterValue[] = uniq(itemFieldValues) // Remove duplicate values selected by the user
                    .filter(value => !value || typeof value === 'string')
                    .map(fieldValue => {
                        return {
                            name: fieldValue,
                            value: fieldValue,
                            operator: FilterComparisonOperator.Eq
                        };
                    });
                if (filterValues.length > 0) {
                    dataContext.filters.selectedFilters.push({
                        filterName: this.properties.itemSelectionProps.destinationFieldName,
                        values: filterValues,
                        operator: this.properties.itemSelectionProps.valuesOperator
                    });
                }
            }
        }

        // Connected Search Filters
        if (this._filtersConnectionSourceData) {
            const filtersSourceData: IDataFilterSourceData = DynamicPropertyHelper.tryGetValueSafe(this._filtersConnectionSourceData);
            if (filtersSourceData) {

                // Reset the page number if filters have been updated by the user
                if (!isEqual(filtersSourceData.selectedFilters, this._lastSelectedFilters)) {
                    dataContext.pageNumber = 1;
                    this.currentPageNumber = 1;
                }

                // Use the filter confiugration and then get the corresponding values 
                dataContext.filters.filtersConfiguration = filtersSourceData.filterConfiguration;
                dataContext.filters.selectedFilters = dataContext.filters.selectedFilters.concat(filtersSourceData.selectedFilters);
                dataContext.filters.filterOperator = filtersSourceData.filterOperator;
                dataContext.filters.instanceId = filtersSourceData.instanceId;

                this._lastSelectedFilters = dataContext.filters.selectedFilters;
            }
        }

        // Connected Search Verticals
        if (this._verticalsConnectionSourceData) {
            const verticalsSourceData: IDataVerticalSourceData = DynamicPropertyHelper.tryGetValueSafe(this._verticalsConnectionSourceData);
            if (verticalsSourceData) {
                dataContext.verticals.selectedVertical = verticalsSourceData.selectedVertical;
            }
        }


        // If input query text changes, then we need to reset the paging
        if (!isEqual(dataContext.inputQueryText, this._lastInputQueryText)) {
            dataContext.pageNumber = 1;
            this.currentPageNumber = 1;
        }

        this._lastInputQueryText = dataContext.inputQueryText;
        return dataContext;
    }


    private async getModifiedInputQueryText(inputQueryText: string): Promise<string> {
        let queryText = inputQueryText;
        for (const modifier of this._selectedCustomQueryModifier) {

            //Cloned context won't be correct for inputQueryText after first modification!
            const modifiedQueryText = await modifier.modifyQuery(queryText);
            const doBreak = modifier.endWhenSuccessfull && (!isEqual(queryText, modifiedQueryText));
            queryText = modifiedQueryText;

            if (doBreak) {
                break;
            }
        }

        return queryText;
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
     * Handler when data are retreived from the source
     * @param availableFields the available fields
     * @param filters the available filters from the data source
     * @param pageNumber the current page number
     */
    private _onDataRetrieved(availableDataSourceFields: string[], filters?: IDataFilterResult[], pageNumber?: number, nextLinkUrl?: string, pageLinks?: string[]) {

        this._currentDataResultsSourceData.availableFieldsFromResults = availableDataSourceFields;
        this.currentPageNumber = pageNumber;

        // Set the available filters from the data source 
        if (filters) {
            this._currentDataResultsSourceData.availablefilters = filters;
        }

        // Check if the Web part is connected to a data vertical
        if (this._verticalsConnectionSourceData && this.properties.selectedVerticalKeys.length > 0) {
            const verticalData = DynamicPropertyHelper.tryGetValueSafe(this._verticalsConnectionSourceData);

            // For edit mode only, we want to see the data
            if (verticalData && this.properties.selectedVerticalKeys.indexOf(verticalData.selectedVertical.key) === -1 && this.displayMode === DisplayMode.Read) {

                // If the current selected vertical is not the one configured for this Web Part, we reset
                // the data soure information since we don't want to expose them to consumers
                this._currentDataResultsSourceData = {
                    availableFieldsFromResults: [],
                    availablefilters: []
                };
            }
        }

        // Notfify dynamic data consumers data have changed
        if (this.context && this.context.dynamicDataSourceManager && !this.context.dynamicDataSourceManager.isDisposed) {
            this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchResults);
        }

        // Extra call to refresh the property pane in the case where data sources rely on results fields in there configuration (ex: ODataDataSource)
        if (this.context && this.context.propertyPane) {
            this.context.propertyPane.refresh();
        }
    }

    /**
     * Handler when an item is selected in the results 
     * @param currentSelectedItems the current selected items
     */
    private _onItemSelected(currentSelectedItems: { [key: string]: any }[]) {

        this._currentDataResultsSourceData.selectedItems = cloneDeep(currentSelectedItems);

        // Notfify dynamic data consumers data have changed
        this.context.dynamicDataSourceManager.notifyPropertyChanged(DynamicDataProperties.AvailableFieldValuesFromResults);
    }

    /**
     * Subscribes to URL query string change events using SharePoint page router
     */
    private _handleQueryStringChange() {

        // To avoid pushState modification from many components on the page (ex: search box, etc.), 
        // only subscribe to query string changes if the connected source is either the searc queyr or explicit query string parameter
        if (/^(PageContext:SearchData:searchQuery)|(PageContext:UrlData:queryParameters)/.test(this.properties.queryText.reference)) {

            ((h) => {
                this._pushStateCallback = history.pushState;
                h.pushState = this.pushStateHandler.bind(this);
            })(window.history);
        }
    }

    private pushStateHandler(state, key, path) {

        this._pushStateCallback.apply(history, [state, key, path]);

        const source = DynamicPropertyHelper.tryGetSourceSafe(this.properties.queryText);

        if (source && source.id === ComponentType.PageEnvironment) {
            this.render();
        }
    }

    private async initializeQueryModifiers(queryModifierConfiguration: IQueryModifierConfiguration[]): Promise<IQueryModifier[]> {

        const promises: Promise<IQueryModifier>[] = [];
        let selectedQueryModifier: IQueryModifier[] = [];

        queryModifierConfiguration.forEach(configuration => {
            if (configuration.enabled) {
                promises.push(this.getQueryModifierInstance(configuration.key, configuration.endWhenSuccessfull, this.availableCustomQueryModifierDefinitions));
            }
        });

        if (promises.length > 0) {
            selectedQueryModifier = await Promise.all(promises);
        } else {
            selectedQueryModifier = [];
        }

        return selectedQueryModifier;
    }

    /**
     * Gets the queryModifier provider instance according to the selected one
     * @param providerKey the selected queryModifier provider key
     * @param queryModifierDefinitions the available source definitions
     * @returns the queryModifier instance
     */
    private async getQueryModifierInstance(providerKey: string, endWhenSuccessfull: boolean, queryModifierDefinitions: IQueryModifierDefinition[]): Promise<IQueryModifier> {

        let queryModifier: IQueryModifier = undefined;
        let serviceKey: ServiceKey<IQueryModifier> = undefined;

        if (providerKey) {

            // Gets the registered service key according to the selected provider definition 
            const matchingDefinitions = queryModifierDefinitions.filter((provider) => { return provider.key === providerKey; });

            // Can only have one data source instance per key
            if (matchingDefinitions.length > 0) {
                serviceKey = matchingDefinitions[0].serviceKey;
            } else {
                // Case when the extensibility library is removed from the catalog or the configuration
                throw new Error(Text.format(commonStrings.General.Extensibility.QueryModifierDefinitionNotFound, providerKey));
            }


            return new Promise<IQueryModifier>((resolve, reject) => {

                const childServiceScope = ServiceScopeHelper.registerChildServices(this.webPartInstanceServiceScope, [
                    serviceKey
                ]);

                childServiceScope.whenFinished(async () => {

                    queryModifier = childServiceScope.consume<IQueryModifier>(serviceKey);

                    // Verify a queryModifier is a valid QueryModifier
                    const isValidProvider = (providerInstance: IQueryModifier): providerInstance is BaseQueryModifier<any> => {
                        return (
                            (providerInstance as BaseQueryModifier<any>).getPropertyPaneGroupsConfiguration !== undefined &&
                            (providerInstance as BaseQueryModifier<any>).modifyQuery !== undefined &&
                            (providerInstance as BaseQueryModifier<any>).onPropertyUpdate !== undefined &&
                            (providerInstance as BaseQueryModifier<any>).onInit !== undefined
                        );
                    };


                    if (!isValidProvider(queryModifier)) {
                        reject(new Error(Text.format(commonStrings.General.Extensibility.InvalidQueryModifierInstance, providerKey)));
                    }

                    // Initialize the queryModifier
                    if (queryModifier) {

                        queryModifier.properties = this.properties.queryModifierProperties;
                        queryModifier.context = this.context;
                        queryModifier.endWhenSuccessfull = endWhenSuccessfull;
                        await queryModifier.onInit();

                        resolve(queryModifier);
                    }
                });
            });
        }
    }

    private getQueryModifierFields(): IPropertyPaneField<any>[] {

        let queryTransformationFields: IPropertyPaneField<any>[] = [];

        queryTransformationFields.push(
            this._propertyFieldCollectionData('queryModifierConfiguration', {
                manageBtnLabel: webPartStrings.PropertyPane.CustomQueryModifier.EditQueryModifiersLabel,
                key: 'queryModifierConfiguration',
                panelHeader: webPartStrings.PropertyPane.CustomQueryModifier.EditQueryModifiersLabel,
                panelDescription: webPartStrings.PropertyPane.CustomQueryModifier.QueryModifiersDescription,
                disableItemCreation: true,
                disableItemDeletion: true,
                enableSorting: true,
                label: webPartStrings.PropertyPane.CustomQueryModifier.QueryModifiersLabel,
                value: this.properties.queryModifierConfiguration,
                fields: [
                    {
                        id: 'enabled',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.EnabledPropertyLabel,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Toggle, {
                                        key: itemId, checked: value, onChange: (evt, checked) => {
                                            onUpdate(field.id, checked);
                                        },
                                        offText: commonStrings.General.OffTextLabel,
                                        onText: commonStrings.General.OnTextLabel
                                    })
                                )
                            );
                        }
                    },
                    {
                        id: 'endWhenSuccessfull',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.EndWhenSuccessfullPropertyLabel,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Toggle, {
                                        key: itemId, checked: value, onChange: (evt, checked) => {
                                            onUpdate(field.id, checked);
                                        },
                                        offText: commonStrings.General.OffTextLabel,
                                        onText: commonStrings.General.OnTextLabel
                                    })
                                )
                            );
                        }
                    },
                    {
                        id: 'name',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.ModifierNamePropertyLabel,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value) => {
                            return (
                                React.createElement("div", { style: { 'fontWeight': 600 } }, value)
                            );
                        }
                    },
                    {
                        id: 'description',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.ModifierDescriptionPropertyLabel,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value) => {
                            return (
                                React.createElement("div", null, value)
                            );
                        }
                    }
                ]
            })
        );

        return queryTransformationFields;
    }
}