import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Text, Environment, EnvironmentType, DisplayMode } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
    PropertyPaneDynamicFieldSet,
    PropertyPaneDynamicField,
    DynamicDataSharedDepth,
    IPropertyPaneConditionalGroup,
    IPropertyPaneField,
    PropertyPaneToggle,
    PropertyPaneSlider,
    IPropertyPaneChoiceGroupOption,
    PropertyPaneChoiceGroup,
    PropertyPaneCheckbox,
    PropertyPaneHorizontalRule,
    PropertyPaneDropdown,
    IPropertyPaneDropdownOption,
    PropertyPaneLabel
} from "@microsoft/sp-property-pane";
import * as strings from 'SearchResultsWebPartStrings';
import SearchResultsContainer from './components/SearchResultsContainer/SearchResultsContainer';
import { ISearchResultsWebPartProps } from './ISearchResultsWebPartProps';
import BaseTemplateService from '../../services/TemplateService/BaseTemplateService';
import ISearchService from '../../services/SearchService/ISearchService';
import ITaxonomyService from '../../services/TaxonomyService/ITaxonomyService';
import ResultsLayoutOption from '../../models/ResultsLayoutOption';
import { TemplateService } from '../../services/TemplateService/TemplateService';
import { isEmpty, find, sortBy, cloneDeep, isEqual, findIndex } from '@microsoft/sp-lodash-subset';
import MockSearchService from '../../services/SearchService/MockSearchService';
import MockTemplateService from '../../services/TemplateService/MockTemplateService';
import SearchService from '../../services/SearchService/SearchService';
import TaxonomyService from '../../services/TaxonomyService/TaxonomyService';
import MockTaxonomyService from '../../services/TaxonomyService/MockTaxonomyService';
import ISearchResultsContainerProps from './components/SearchResultsContainer/ISearchResultsContainerProps';
import { SortDirection, Sort } from '@pnp/sp';
import { ISortFieldConfiguration, ISortFieldDirection } from '../../models/ISortFieldConfiguration';
import { ISynonymFieldConfiguration } from '../../models/ISynonymFieldConfiguration';
import { ResultTypeOperator } from '../../models/ISearchResultType';
import IResultService from '../../services/ResultService/IResultService';
import { ResultService, IRenderer } from '../../services/ResultService/ResultService';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { IRefinementFilter, ISearchVerticalInformation, IRefinementResult, IRefinementValue } from '../../models/ISearchResult';
import IDynamicDataService from '../../services/DynamicDataService/IDynamicDataService';
import { DynamicDataService } from '../../services/DynamicDataService/DynamicDataService';
import { DynamicProperty, ThemeProvider, IReadonlyTheme, ThemeChangedEventArgs } from '@microsoft/sp-component-base';
import IRefinerSourceData from '../../models/IRefinerSourceData';
import IRefinerConfiguration from '../../models/IRefinerConfiguration';
import { SearchComponentType } from '../../models/SearchComponentType';
import ISearchResultSourceData from '../../models/ISearchResultSourceData';
import ISynonymTable from '../../models/ISynonym';
import * as update from 'immutability-helper';
import ISearchVerticalSourceData from '../../models/ISearchVerticalSourceData';
import LocalizationHelper from '../../helpers/LocalizationHelper';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { SearchManagedProperties, ISearchManagedPropertiesProps } from '../../controls/SearchManagedProperties/SearchManagedProperties';
import { PropertyPaneSearchManagedProperties } from '../../controls/PropertyPaneSearchManagedProperties/PropertyPaneSearchManagedProperties';
import { ExtensibilityService } from '../../services/ExtensibilityService/ExtensibilityService';
import IExtensibilityService from '../../services/ExtensibilityService/IExtensibilityService';
import { IComponentDefinition } from '../../services/ExtensibilityService/IComponentDefinition';
import { AvailableComponents } from '../../components/AvailableComponents';
import { BaseClientSideWebPart, IWebPartPropertiesMetadata } from "@microsoft/sp-webpart-base";
import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";
import { IQueryModifierDefinition } from '../../services/ExtensibilityService/IQueryModifierDefinition';
import { IQueryModifierInstance } from '../../services/ExtensibilityService/IQueryModifierInstance';
import { ObjectCreator } from '../../services/ExtensibilityService/ObjectCreator';
import { BaseQueryModifier } from '../../services/ExtensibilityService/BaseQueryModifier';
import { Toggle, GlobalSettings } from 'office-ui-fabric-react';
import IQueryModifierConfiguration from '../../models/IQueryModifierConfiguration';
import { SearchHelper } from '../../helpers/SearchHelper';
import { StringHelper } from '../../helpers/StringHelper';

export default class SearchResultsWebPart extends BaseClientSideWebPart<ISearchResultsWebPartProps> implements IDynamicDataCallables {

    private _searchService: ISearchService;
    private _taxonomyService: ITaxonomyService;
    private _templateService: BaseTemplateService;
    private _extensibilityService: IExtensibilityService;
    private _textDialogComponent = null;
    private _propertyFieldCodeEditor = null;
    private _placeholder = null;
    private _propertyFieldCollectionData = null;
    private _customCollectionFieldType = null;
    private _queryModifierInstance: IQueryModifierInstance<any> = null;

    private _propertyFieldCodeEditorLanguages = null;
    private _resultService: IResultService;

    // Dynamic data related fields
    private _dynamicDataService: IDynamicDataService;

    private _refinerSourceData: DynamicProperty<IRefinerSourceData>;
    private _searchVerticalSourceData: DynamicProperty<ISearchVerticalSourceData>;
    private _verticalsInformation: ISearchVerticalInformation[];

    private _codeRenderers: IRenderer[];
    private _searchContainer: JSX.Element;
    private _synonymTable: ISynonymTable;

    /**
     * Available property pane options from Web Components
     */
    private _templatePropertyPaneOptions: IPropertyPaneField<any>[];

    private _availableLanguages: IPropertyPaneDropdownOption[];

    /**
     * The template to display at render time
     */
    private _templateContentToDisplay: string;

    /**
     * The list of available managed managed properties (managed globally for all property pane fiels if needed)
     */
    private _availableManagedProperties: IComboBoxOption[];

    private _themeProvider: ThemeProvider;
    private _themeVariant: IReadonlyTheme;
    private _initComplete = false;

    /**
     * Information about time zone bias (current user or web)
     */
    private _timeZoneBias: any;

    /**
     * The available web component definitions (not registered yet)
     */
    private availableWebComponentDefinitions: IComponentDefinition<any>[] = AvailableComponents.BuiltinComponents;

    /**
     * The available query modifier definitions (not instancied yet)
     */
    private availableQueryModifierDefinitions: IQueryModifierDefinition<any>[] = [];
    private queryModifierSelected: boolean = false;

    /**
     * The default selected filters
     */
    private defaultSelectedFilters: IRefinementFilter[] = [];

    /**
     * The current page number
     */
    private currentPageNumber: number = 1;

    public constructor() {
        super();
        this._templateContentToDisplay = '';
        this._availableLanguages = [];
        this._templatePropertyPaneOptions = [];
        this._availableManagedProperties = [];

        this.onPropertyPaneFieldChanged = this.onPropertyPaneFieldChanged.bind(this);
        this._onUpdateAvailableProperties = this._onUpdateAvailableProperties.bind(this);
    }

    public async render(): Promise<void> {

        if (!this._initComplete) {
            // Don't render until all init is complete
            return;
        }

        // Determine the template content to display
        // In the case of an external template is selected, the render is done asynchronously waiting for the content to be fetched
        await this._initTemplate();

        if (this.displayMode === DisplayMode.Edit) {
            const { Placeholder } = await import(
                /* webpackChunkName: 'search-property-pane' */
                '@pnp/spfx-controls-react/lib/Placeholder'
            );
            this._placeholder = Placeholder;
        }

        this.renderCompleted();
    }

    protected get disableReactivePropertyChanges(): boolean {
        // Set this to true if you don't want the reactive behavior.
        return false;
    }

    protected get isRenderAsync(): boolean {
        return true;
    }

    protected renderCompleted(): void {
        super.renderCompleted();
        let renderElement = null;
        let refinerConfiguration: IRefinerConfiguration[] = [];
        let selectedFilters: IRefinementFilter[] = [];
        let queryTemplate: string = this.properties.queryTemplate;
        let sourceId: string = this.properties.resultSourceId;
        let getVerticalsCounts: boolean = false;

        // Get default selected refiners from the URL
        this.defaultSelectedFilters = SearchHelper.getRefinementFiltersFromUrl();
        selectedFilters = this.defaultSelectedFilters;

        let queryDataSourceValue = this.properties.queryKeywords.tryGetValue();

        let queryKeywords = queryDataSourceValue ? queryDataSourceValue : this.properties.defaultSearchQuery;

        if (typeof(queryKeywords) == "object")
        {
            //https://github.com/microsoft-search/pnp-modern-search/issues/325
            //new issue with search body as object - 2020-06-23
            const refChunks = this.properties.queryKeywords.reference.split(':');
            if (refChunks.length >= 3) {
                const paramType = refChunks[2];
        
                if (paramType === 'fragment') { 
                    queryKeywords = queryDataSourceValue["fragment"]
                }
                else if (paramType.startsWith('queryParameters')) {
                    const paramChunks = paramType.split('.');
                    const queryTextParam = paramChunks.length === 2 ? paramChunks[1] : 'q';
                    queryKeywords = queryDataSourceValue["queryParameters"][queryTextParam]
                }
            }
        }

        // Get data from connected sources
        if (this._refinerSourceData && !this._refinerSourceData.isDisposed) {
            const refinerSourceData: IRefinerSourceData = this._refinerSourceData.tryGetValue();
            if (refinerSourceData) {
                refinerConfiguration = sortBy(refinerSourceData.refinerConfiguration, 'sortIdx');

                if (refinerSourceData.isDirty) {
                    selectedFilters = refinerSourceData.selectedFilters;

                    // Reset the default filters provided in URL when user starts to select/unselected values manually
                    this.defaultSelectedFilters = [];
                }
            }
        }

        if (this._searchVerticalSourceData && !this._searchVerticalSourceData.isDisposed) {
            const searchVerticalSourceData: ISearchVerticalSourceData = this._searchVerticalSourceData.tryGetValue();
            if (searchVerticalSourceData) {
                if (searchVerticalSourceData.selectedVertical) {
                    queryTemplate = searchVerticalSourceData.selectedVertical.queryTemplate;
                    sourceId = searchVerticalSourceData.selectedVertical.resultSourceId;
                    getVerticalsCounts = searchVerticalSourceData.showCounts;
                }
            }
        }

        const currentLocaleId = LocalizationHelper.getLocaleId(this.context.pageContext.cultureInfo.currentCultureName);
        const queryModifier = this._queryModifierInstance && this._queryModifierInstance.isInitialized ? this._queryModifierInstance.instance : null;

        // Configure the provider before the query according to our needs
        this._searchService = update(this._searchService, {
            timeZoneId: { $set: this._timeZoneBias && this._timeZoneBias.Id ? this._timeZoneBias.Id : null },
            resultsCount: { $set: this.properties.paging.itemsCountPerPage },
            queryTemplate: { $set: queryTemplate },
            resultSourceId: { $set: sourceId },
            sortList: { $set: this._searchService.sortList || this._convertToSortList(this.properties.sortList) },
            enableQueryRules: { $set: this.properties.enableQueryRules },
            includeOneDriveResults: { $set: this.properties.includeOneDriveResults },
            selectedProperties: { $set: this.properties.selectedProperties ? this.properties.selectedProperties.replace(/\s|,+$/g, '').split(',') : [] },
            synonymTable: { $set: this._synonymTable },
            queryCulture: { $set: this.properties.searchQueryLanguage !== -1 ? this.properties.searchQueryLanguage : currentLocaleId },
            refinementFilters: { $set: selectedFilters.length > 0 ? SearchHelper.buildRefinementQueryString(selectedFilters) : [this.properties.refinementFilters.replace(/\'/g, '"')] },
            refiners: { $set: refinerConfiguration },
            queryModifier: { $set: queryModifier },
        });

        const isValueConnected = !!this.properties.queryKeywords.tryGetSource();
        this._searchContainer = React.createElement(
            SearchResultsContainer,
            {
                searchService: this._searchService,
                taxonomyService: this._taxonomyService,
                queryKeywords: queryKeywords,
                sortList: this.properties.sortList,
                sortableFields: this.properties.sortableFields,
                showResultsCount: this.properties.showResultsCount,
                showBlank: this.properties.showBlank,
                displayMode: this.displayMode,
                templateService: this._templateService,
                templateContent: this._templateContentToDisplay,
                templateParameters: this.properties.templateParameters,
                webPartTitle: this.properties.webPartTitle,
                currentUICultureName: this.context.pageContext.cultureInfo.currentUICultureName,
                siteServerRelativeUrl: this.context.pageContext.site.serverRelativeUrl,
                webServerRelativeUrl: this.context.pageContext.web.serverRelativeUrl,
                resultTypes: this.properties.resultTypes,
                useCodeRenderer: this.codeRendererIsSelected(),
                customTemplateFieldValues: this.properties.customTemplateFieldValues,
                rendererId: this.properties.selectedLayout as any,
                enableLocalization: this.properties.enableLocalization,
                selectedPage: this.currentPageNumber,
                selectedLayout: this.properties.selectedLayout,
                onSearchResultsUpdate: async (results, mountingNodeId, searchService) => {
                    if (this.properties.selectedLayout in ResultsLayoutOption) {
                        let node = document.getElementById(mountingNodeId);
                        if (node) {
                            ReactDom.render(null, node);
                        }
                    }

                    if (getVerticalsCounts) {

                        const searchVerticalSourceData: ISearchVerticalSourceData = this._searchVerticalSourceData.tryGetValue();
                        const otherVerticals = searchVerticalSourceData.verticalsConfiguration.filter(v => { return v.key !== searchVerticalSourceData.selectedVertical.key; });
                        searchService.getSearchVerticalCounts(queryKeywords, otherVerticals, searchService.enableQueryRules).then((verticalsInfos) => {

                            let currentCount = results.PaginationInformation ? results.PaginationInformation.TotalRows : undefined;

                            if (currentCount !== undefined && currentCount !== null) {
                                // Add current vertical infos
                                let currentVerticalInfos: ISearchVerticalInformation = {
                                    Count: currentCount,
                                    VerticalKey: searchVerticalSourceData.selectedVertical.key
                                };

                                verticalsInfos.push(currentVerticalInfos);
                            }

                            this._verticalsInformation = update(this._verticalsInformation, { $set: verticalsInfos });
                            this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchResultsWebPart);
                        });
                    }

                    this._resultService.updateResultData(results, this.properties.selectedLayout as any, mountingNodeId, this.properties.customTemplateFieldValues);

                    // Send notification to the connected components
                    this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchResultsWebPart);
                },
                themeVariant: this._themeVariant,
                pagingSettings: this.properties.paging,
                instanceId: this.instanceId
            } as ISearchResultsContainerProps
        );

        if (isValueConnected && !this.properties.useDefaultSearchQuery ||
            isValueConnected && this.properties.useDefaultSearchQuery && this.properties.defaultSearchQuery ||
            !isValueConnected && !isEmpty(queryKeywords)) {
            renderElement = this._searchContainer;
        } else {
            if (this.displayMode === DisplayMode.Edit) {
                const placeholder: React.ReactElement<any> = React.createElement(
                    this._placeholder,
                    {
                        iconName: strings.PlaceHolderEditLabel,
                        iconText: strings.PlaceHolderIconText,
                        description: strings.PlaceHolderDescription,
                        buttonLabel: strings.PlaceHolderConfigureBtnLabel,
                        onConfigure: this._setupWebPart.bind(this)
                    }
                );
                renderElement = placeholder;
            } else {
                renderElement = React.createElement('div', null);
            }
        }

        ReactDom.render(renderElement, this.domElement);
    }

    protected async onInit(): Promise<void> {

        this.initializeRequiredProperties();

        // Get current theme info
        this.initThemeVariant();

        if (Environment.type === EnvironmentType.Local) {
            this._taxonomyService = new MockTaxonomyService();
            this._templateService = new MockTemplateService(this.context.pageContext.cultureInfo.currentUICultureName, this.context);
            this._searchService = new MockSearchService();

        } else {
            this._taxonomyService = new TaxonomyService(this.context.pageContext.site.absoluteUrl);

            this._timeZoneBias = {
                WebBias: this.context.pageContext.legacyPageContext.webTimeZoneData.Bias,
                WebDST: this.context.pageContext.legacyPageContext.webTimeZoneData.DaylightBias,
                UserBias: null,
                UserDST: null,
                Id: this.context.pageContext.legacyPageContext.webTimeZoneData.Id
            };
            if (this.context.pageContext.legacyPageContext.userTimeZoneData) {
                this._timeZoneBias.UserBias = this.context.pageContext.legacyPageContext.userTimeZoneData.Bias;
                this._timeZoneBias.UserDST = this.context.pageContext.legacyPageContext.userTimeZoneData.DaylightBias;
                this._timeZoneBias.Id = this.context.pageContext.legacyPageContext.webTimeZoneData.Id;
            }

            this._searchService = new SearchService(this.context.pageContext, this.context.spHttpClient);
            this._templateService = new TemplateService(this.context.spHttpClient, this.context.pageContext.cultureInfo.currentUICultureName, this._searchService, this._timeZoneBias, this.context);
        }

        this._resultService = new ResultService();
        this._extensibilityService = new ExtensibilityService();
        this._codeRenderers = this._resultService.getRegisteredRenderers();
        this._dynamicDataService = new DynamicDataService(this.context.dynamicDataProvider);
        this._verticalsInformation = [];

        // Load extensibility library if present
        const extensibilityLibrary = await this._extensibilityService.loadExtensibilityLibrary();

        // Load extensibility additions
        if (extensibilityLibrary) {

            // Add custom web components if any
            this.availableWebComponentDefinitions = this.availableWebComponentDefinitions.concat(extensibilityLibrary.getCustomWebComponents());

            // Get custom query modifiers if present
            this.availableQueryModifierDefinitions = extensibilityLibrary.getCustomQueryModifiers ? extensibilityLibrary.getCustomQueryModifiers() : [];

            // Initializes query modifiers property for selection
            this.properties.queryModifiers = this.availableQueryModifierDefinitions.map(definition => {
                return {
                    queryModifierDisplayName: definition.displayName,
                    queryModifierDescription: definition.description,
                    queryModifierEnabled: this.properties.selectedQueryModifierDisplayName && this.properties.selectedQueryModifierDisplayName === definition.displayName ? true : false
                } as IQueryModifierConfiguration;
            });

            // If we have a query modifier selected from config, we ensure it exists and is actually loaded fron the extensibility library
            const queryModifierDefinition = this.availableQueryModifierDefinitions.filter(definition => definition.displayName === this.properties.selectedQueryModifierDisplayName);
            if (this.properties.selectedQueryModifierDisplayName && queryModifierDefinition.length === 1) {
                this.queryModifierSelected = true;
                this._queryModifierInstance = await this._initQueryModifierInstance(queryModifierDefinition[0]);
            } else {
                this.properties.selectedQueryModifierDisplayName = null;
            }
        }

        // Set the default search results layout
        this.properties.selectedLayout = (this.properties.selectedLayout !== undefined && this.properties.selectedLayout !== null) ? this.properties.selectedLayout : ResultsLayoutOption.DetailsList;

        // Registers web components
        this._templateService.registerWebComponents(this.availableWebComponentDefinitions);

        this.context.dynamicDataSourceManager.initializeSource(this);

        this._synonymTable = this._convertToSynonymTable(this.properties.synonymList);

        this._initComplete = true;

        // Bind web component events
        this.bindPagingEvents();

        this.ensureDataSourceConnection();

        return super.onInit();
    }

    private async _initQueryModifierInstance(queryModifierDefinition: IQueryModifierDefinition<any>): Promise<IQueryModifierInstance<any>> {

        if (!queryModifierDefinition) {
            return null;
        }

        let isInitialized = false;
        let instance: BaseQueryModifier = null;

        try {
            instance = ObjectCreator.createEntity(queryModifierDefinition.class, this.context);
            await instance.onInit();
            isInitialized = true;
        }
        catch (error) {
            console.log(`Unable to initialize query modifier '${queryModifierDefinition.displayName}'. ${error}`);
        }
        finally {
            return {
                ...queryModifierDefinition,
                instance,
                isInitialized
            };
        }
    }

    private _convertToSortConfig(sortList: string): ISortFieldConfiguration[] {
        let pairs = sortList.split(',');
        return pairs.map(sort => {
            let direction;
            let kvp = sort.split(':');
            if (kvp[1].toLocaleLowerCase().trim() === "ascending") {
                direction = ISortFieldDirection.Ascending;
            } else {
                direction = ISortFieldDirection.Descending;
            }

            return {
                sortField: kvp[0].trim(),
                sortDirection: direction
            } as ISortFieldConfiguration;
        });
    }

    private _convertToSynonymTable(synonymList: ISynonymFieldConfiguration[]): ISynonymTable {
        let synonymsTable: ISynonymTable = {};

        if (synonymList) {
            synonymList.forEach(item => {
                const currentTerm = item.Term.toLowerCase();
                const currentSynonyms = this._splitSynonyms(item.Synonyms);

                //add to array
                synonymsTable[currentTerm] = currentSynonyms;

                if (item.TwoWays) {
                    // Loop over the list of synonyms
                    let tempSynonyms: string[] = currentSynonyms;
                    tempSynonyms.push(currentTerm.trim());

                    currentSynonyms.forEach(s => {
                        synonymsTable[s.toLowerCase().trim()] = tempSynonyms.filter(f => { return f !== s; });
                    });
                }
            });
        }
        return synonymsTable;
    }

    private _splitSynonyms(value: string) {
        return value.split(",").map(v => { return v.toLowerCase().trim().replace(/\"/g, ""); });
    }

    private _convertToSortList(sortList: ISortFieldConfiguration[]): Sort[] {
        return sortList.map(e => {

            let direction;

            switch (e.sortDirection) {
                case ISortFieldDirection.Ascending:
                    direction = SortDirection.Ascending;
                    break;

                case ISortFieldDirection.Descending:
                    direction = SortDirection.Descending;
                    break;

                default:
                    direction = SortDirection.Ascending;
                    break;
            }

            return {
                Property: e.sortField,
                Direction: direction
            } as Sort;
        });
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    /**
     * Initializes the Web Part required properties if there are not present in the manifest (i.e. during an update scenario)
     */
    private initializeRequiredProperties() {

        this.properties.queryTemplate = this.properties.queryTemplate ? this.properties.queryTemplate : "{searchTerms}";

        if (!Array.isArray(this.properties.sortList) && !isEmpty(this.properties.sortList)) {
            this.properties.sortList = this._convertToSortConfig(this.properties.sortList);
        }

        this.properties.sortList = Array.isArray(this.properties.sortList) ? this.properties.sortList : [
            {
                sortField: "Created",
                sortDirection: ISortFieldDirection.Ascending
            },
            {
                sortField: "Size",
                sortDirection: ISortFieldDirection.Descending
            }
        ];

        this.properties.sortableFields = Array.isArray(this.properties.sortableFields) ? this.properties.sortableFields : [];

        // Ensure the minmal managed properties are here        
        const defaultManagedProperties =    [
                                                "Title",
                                                "Path",
                                                "OriginalPath",
                                                "SiteLogo",
                                                "contentclass",
                                                "FileExtension",
                                                "Filename",
                                                "ServerRedirectedURL",
                                                "DefaultEncodingURL",
                                                "IsDocument",
                                                "IsContainer",
                                                "IsListItem",
                                                "FileType",
                                                "HtmlFileType",
                                                "NormSiteID",
                                                "NormListID",
                                                "NormUniqueID",
                                                "Created",
                                                "PreviewUrl",
                                                "PictureThumbnailURL",
                                                "ServerRedirectedPreviewURL",
                                                "HitHighlightedSummary",
                                                "ServerRedirectedEmbedURL",
                                                "ParentLink",
                                                "owstaxidmetadataalltagsinfo",
                                                "Author",
                                                "AuthorOWSUSER",
                                                "SPSiteUrl",
                                                "SiteTitle",
                                                "SiteId",
                                                "WebId",
                                                "UniqueID"
                                            ];

        if (this.properties.selectedProperties) {

            let properties = this.properties.selectedProperties.split(',');

            defaultManagedProperties.map(property => {

                const idx = findIndex(properties, item => property.toLowerCase() === item.toLowerCase());                
                if (idx === -1) {
                    properties.push(property);
                }
            });

            this.properties.selectedProperties = properties.join(',');
        } else {
            this.properties.selectedProperties = defaultManagedProperties.join(',');
        }
        
        this.properties.resultTypes = Array.isArray(this.properties.resultTypes) ? this.properties.resultTypes : [];
        this.properties.synonymList = Array.isArray(this.properties.synonymList) ? this.properties.synonymList : [];
        this.properties.searchQueryLanguage = this.properties.searchQueryLanguage ? this.properties.searchQueryLanguage : -1;
        this.properties.templateParameters = this.properties.templateParameters ? this.properties.templateParameters : {};
        this.properties.queryModifiers = !isEmpty(this.properties.queryModifiers) ? this.properties.queryModifiers : [];
        this.properties.refinementFilters = this.properties.refinementFilters ? this.properties.refinementFilters : "";

        if (!this.properties.paging) {

            this.properties.paging = {
                itemsCountPerPage: 10,
                pagingRange: 5,
                showPaging: true,
                hideDisabled: true,
                hideFirstLastPages: false,
                hideNavigation: false
            };
        }
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

        const templateParametersGroup = this._getTemplateFieldsGroup();

        let searchQueryGroups = [];
        searchQueryGroups.push(this._getSearchQueryFields());

        let stylingPageGroups: IPropertyPaneGroup[] = [
            {
                groupName: strings.StylingSettingsGroupName,
                groupFields: this._getStylingFields(),
                isCollapsed: false
            },
        ];

        if (templateParametersGroup) {
            stylingPageGroups.push(templateParametersGroup);
        }

        return {
            pages: [
                {
                    header: {
                        description: strings.SearchQuerySettingsGroupName
                    },
                    groups: searchQueryGroups,
                    displayGroupsAsAccordion: false
                },
                {
                    groups: [
                        {
                            groupFields: this._getSearchSettingsFields(),
                            isCollapsed: false,
                            groupName: strings.SearchSettingsGroupName
                        },
                        {
                            groupName: strings.Paging.PagingOptionsGroupName,
                            groupFields: this.getPagingGroupFields()
                        }
                    ],
                    displayGroupsAsAccordion: true
                },
                {
                    groups: stylingPageGroups,
                    displayGroupsAsAccordion: true
                }
            ]
        };
    }

    protected get propertiesMetadata(): IWebPartPropertiesMetadata {
        return {
            'queryKeywords': {
                dynamicPropertyType: 'string'
            }
        };
    }

    protected async loadPropertyPaneResources(): Promise<void> {

        // tslint:disable-next-line:no-shadowed-variable
        const { PropertyFieldCodeEditor, PropertyFieldCodeEditorLanguages } = await import(
            /* webpackChunkName: 'search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
        );
        this._propertyFieldCodeEditor = PropertyFieldCodeEditor;
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

        if (this._availableLanguages.length == 0) {
            const languages = await this._searchService.getAvailableQueryLanguages();

            this._availableLanguages = languages.map(language => {
                return {
                    key: language.Lcid,
                    text: `${language.DisplayName} (${language.Lcid})`
                };
            });
        }
    }

    protected async onPropertyPaneFieldChanged(propertyPath: string) {

        if (!this.properties.useDefaultSearchQuery) {
            this.properties.defaultSearchQuery = '';
        }

        // Bind connected data sources
        if (this.properties.refinerDataSourceReference || this.properties.searchVerticalDataSourceReference) {
            this.ensureDataSourceConnection();
        }

        if (propertyPath.localeCompare('useRefiners') === 0) {
            if (!this.properties.useRefiners) {
                this.properties.refinerDataSourceReference = undefined;
                this._refinerSourceData = undefined;
                this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchResultsWebPart);
            }
        }

        if (propertyPath.localeCompare('useSearchVerticals') === 0) {

            if (!this.properties.useSearchVerticals) {
                this.properties.searchVerticalDataSourceReference = undefined;
                this._searchVerticalSourceData = undefined;
                this._verticalsInformation = [];
                this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchResultsWebPart);
            }
        }

        if (propertyPath.localeCompare('searchVerticalDataSourceReference') === 0 || propertyPath.localeCompare('refinerDataSourceReference')) {
            this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchResultsWebPart);
        }

        if (this.properties.enableLocalization) {

            let udpatedProperties: string[] = this.properties.selectedProperties.split(',');
            if (udpatedProperties.indexOf('UniqueID') === -1) {
                udpatedProperties.push('UniqueID');
            }

            // Add automatically the UniqueID managed property for subsequent queries
            this.properties.selectedProperties = udpatedProperties.join(',');
        }

        // clean out duplicate ones
        let allProps = this.properties.selectedProperties.split(',');
        allProps = allProps.filter((item, index) => {
            return allProps.indexOf(item) === index;
        });
        this.properties.selectedProperties = allProps.join(',');


        if (propertyPath.localeCompare('selectedLayout') === 0) {
            // Refresh setting the right template for the property pane
            if (!this.codeRendererIsSelected()) {
                await this._initTemplate();
            }
            if (this.codeRendererIsSelected) {
                this.properties.customTemplateFieldValues = undefined;
            }

            this.context.propertyPane.refresh();
        }

        // Detect if the layout has been changed to custom...
        if (propertyPath.localeCompare('inlineTemplateText') === 0) {

            // Automatically switch the option to 'Custom' if a default template has been edited
            // (meaning the user started from a the list or tiles template)
            if (this.properties.inlineTemplateText && this.properties.selectedLayout !== ResultsLayoutOption.Custom) {
                this.properties.selectedLayout = ResultsLayoutOption.Custom;

                // Reset also the template URL
                this.properties.externalTemplateUrl = '';
            }
        }

        this._synonymTable = this._convertToSynonymTable(this.properties.synonymList);

        if (propertyPath.localeCompare('queryModifiers') === 0) {

            // Load only the selected query modifier (can only have one at once, blocked by the UI)
            const configuredQueryModifiers = this.properties.queryModifiers.filter(m => m.queryModifierEnabled);

            if (configuredQueryModifiers.length === 1) {

                // Get the corresponding query modifier definition
                const queryModifierDefinition = this.availableQueryModifierDefinitions.filter(definition => definition.displayName === configuredQueryModifiers[0].queryModifierDisplayName);
                if (queryModifierDefinition.length === 1) {

                    this.properties.selectedQueryModifierDisplayName = queryModifierDefinition[0].displayName;
                    this._queryModifierInstance = await this._initQueryModifierInstance(queryModifierDefinition[0]);
                }

            } else {
                this.properties.selectedQueryModifierDisplayName = null;
                this._queryModifierInstance = null;
            }

            this.context.dynamicDataSourceManager.notifyPropertyChanged(SearchComponentType.SearchResultsWebPart);
        }
    }

    protected async onPropertyPaneConfigurationStart() {
        await this.loadPropertyPaneResources();
    }

    /**
     * Opens the Web Part property pane
     */
    private _setupWebPart() {
        this.context.propertyPane.open();
    }

    /**
     * Checks if a field if empty or not
     * @param value the value to check
     */
    private _validateEmptyField(value: string): string {

        if (!value) {
            return strings.EmptyFieldErrorMessage;
        }

        return '';
    }

    private _validateNumber(value: string): string {
        let number = parseInt(value);
        if (isNaN(number)) {
            return strings.InvalidNumberIntervalMessage;
        }
        if (number < 1 || number > 500) {
            return strings.InvalidNumberIntervalMessage;
        }
        return '';
    }

    /**
     * Ensures the result source id value is a valid GUID
     * @param value the result source id
     */
    private validateSourceId(value: string): string {
        if (value.length > 0) {
            if (!(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/).test(value)) {
                return strings.InvalidResultSourceIdMessage;
            }
        }

        return '';
    }

    /**
     * Init the template according to the property pane current configuration
     * @returns the template content as a string
     */
    private async _initTemplate(): Promise<void> {

        if (this.properties.selectedLayout === ResultsLayoutOption.Custom) {

            // Reset options
            this._templatePropertyPaneOptions = [];

            if (this.properties.externalTemplateUrl) {
                this._templateContentToDisplay = await this._templateService.getFileContent(this.properties.externalTemplateUrl);
            } else {
                this._templateContentToDisplay = this.properties.inlineTemplateText ? this.properties.inlineTemplateText : TemplateService.getTemplateContent(ResultsLayoutOption.Custom);
            }
        } else {

            // Builtin templates with options
            this._templateContentToDisplay = TemplateService.getTemplateContent(this.properties.selectedLayout);
            this._templatePropertyPaneOptions = this._templateService.getTemplateParameters(this.properties.selectedLayout, this.properties, this._onUpdateAvailableProperties, this._availableManagedProperties);
        }

        // Register result types inside the template
        this._templateService.registerResultTypes(this.properties.resultTypes);

        await this._templateService.optimizeLoadingForTemplate(this._templateContentToDisplay);
    }

    /**
     * Custom handler when the external template file URL
     * @param value the template file URL value
     */
    private async _onTemplateUrlChange(value: string): Promise<String> {

        try {
            // Doesn't raise any error if file is empty (otherwise error message will show on initial load...)
            if (isEmpty(value)) {
                return '';
            }
            // Resolves an error if the file isn't a valid .htm or .html file
            else if (!TemplateService.isValidTemplateFile(value)) {
                return strings.ErrorTemplateExtension;
            }
            // Resolves an error if the file doesn't answer a simple head request
            else {
                await this._templateService.ensureFileResolves(value);
                return '';
            }
        } catch (error) {
            return Text.format(strings.ErrorTemplateResolve, error);
        }
    }

    /**
     * Determines the group fields for the search settings options inside the property pane
     */
    private _getSearchSettingsFields(): IPropertyPaneField<any>[] {

        // Get available data source Web Parts on the page
        const refinerWebParts = this._dynamicDataService.getAvailableDataSourcesByType(SearchComponentType.RefinersWebPart);
        const searchVerticalsWebParts = this._dynamicDataService.getAvailableDataSourcesByType(SearchComponentType.SearchVerticalsWebPart);

        let useRefiners = this.properties.useRefiners;
        let useSearchVerticals = this.properties.useSearchVerticals;

        if (this.properties.useRefiners && refinerWebParts.length === 0) {
            useRefiners = false;
        }

        if (this.properties.useSearchVerticals && searchVerticalsWebParts.length === 0) {
            useSearchVerticals = false;
        }

        // Sets up search settings fields
        const searchSettingsFields: IPropertyPaneField<any>[] = [
            PropertyPaneTextField('queryTemplate', {
                label: strings.QueryTemplateFieldLabel,
                value: this.properties.queryTemplate,
                disabled: this.properties.searchVerticalDataSourceReference ? true : false,
                multiline: true,
                resizable: true,
                placeholder: strings.SearchQueryPlaceHolderText,
                deferredValidationTime: 1000
            }),
            PropertyPaneTextField('resultSourceId', {
                label: strings.ResultSourceIdLabel,
                multiline: false,
                onGetErrorMessage: this.validateSourceId.bind(this),
                deferredValidationTime: 300
            }),
            this._propertyFieldCollectionData('sortList', {
                manageBtnLabel: strings.Sort.EditSortLabel,
                key: 'sortList',
                enableSorting: true,
                panelHeader: strings.Sort.EditSortLabel,
                panelDescription: strings.Sort.SortListDescription,
                label: strings.Sort.SortPropertyPaneFieldLabel,
                value: this.properties.sortList,
                fields: [
                    {
                        id: 'sortField',
                        title: "Field name",
                        type: this._customCollectionFieldType.custom,
                        required: true,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {

                            // Need to specify a React key to avoid item duplication when adding a new row
                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(SearchManagedProperties, {
                                    defaultSelectedKey: item[field.id] ? item[field.id] : '',
                                    onUpdate: (newValue: any, isSortable: boolean) => {

                                        if (!isSortable) {
                                            onCustomFieldValidation(field.id, strings.Sort.SortInvalidSortableFieldMessage);
                                        } else {
                                            onUpdate(field.id, newValue);
                                            onCustomFieldValidation(field.id, '');
                                        }
                                    },
                                    searchService: this._searchService,
                                    validateSortable: true,
                                    availableProperties: this._availableManagedProperties,
                                    onUpdateAvailableProperties: this._onUpdateAvailableProperties
                                } as ISearchManagedPropertiesProps));
                        }
                    },
                    {
                        id: 'sortDirection',
                        title: "Direction",
                        type: this._customCollectionFieldType.dropdown,
                        required: true,
                        options: [
                            {
                                key: ISortFieldDirection.Ascending,
                                text: strings.Sort.SortDirectionAscendingLabel
                            },
                            {
                                key: ISortFieldDirection.Descending,
                                text: strings.Sort.SortDirectionDescendingLabel
                            }
                        ]
                    }
                ]
            }),
            this._propertyFieldCollectionData('sortableFields', {
                manageBtnLabel: strings.Sort.EditSortableFieldsLabel,
                key: 'sortableFields',
                enableSorting: true,
                panelHeader: strings.Sort.EditSortableFieldsLabel,
                panelDescription: strings.Sort.SortableFieldsDescription,
                label: strings.Sort.SortableFieldsPropertyPaneField,
                value: this.properties.sortableFields,
                fields: [
                    {
                        id: 'sortField',
                        title: strings.Sort.SortableFieldManagedPropertyField,
                        type: this._customCollectionFieldType.custom,
                        required: true,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            // Need to specify a React key to avoid item duplication when adding a new row
                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(SearchManagedProperties, {
                                    defaultSelectedKey: item[field.id] ? item[field.id] : '',
                                    onUpdate: (newValue: any, isSortable: boolean) => {

                                        if (!isSortable) {
                                            onCustomFieldValidation(field.id, strings.Sort.SortInvalidSortableFieldMessage);
                                        } else {
                                            onUpdate(field.id, newValue);
                                            onCustomFieldValidation(field.id, '');
                                        }
                                    },
                                    searchService: this._searchService,
                                    validateSortable: true,
                                    availableProperties: this._availableManagedProperties,
                                    onUpdateAvailableProperties: this._onUpdateAvailableProperties
                                } as ISearchManagedPropertiesProps));
                        }
                    },
                    {
                        id: 'displayValue',
                        title: strings.Sort.SortableFieldDisplayValueField,
                        type: this._customCollectionFieldType.string
                    },
                    {
                        id: 'sortDirection',
                        title: "Direction",
                        type: this._customCollectionFieldType.dropdown,
                        required: true,
                        options: [
                            {
                                key: ISortFieldDirection.Ascending,
                                text: strings.Sort.SortDirectionAscendingLabel
                            },
                            {
                                key: ISortFieldDirection.Descending,
                                text: strings.Sort.SortDirectionDescendingLabel
                            }
                        ]
                    }
                ]
            }),
            PropertyPaneToggle('useRefiners', {
                label: strings.UseRefinersWebPartLabel,
                checked: useRefiners
            }),
            PropertyPaneToggle('useSearchVerticals', {
                label: "Connect to search verticals",
                checked: useSearchVerticals
            }),
            PropertyPaneToggle('enableQueryRules', {
                label: strings.EnableQueryRulesLabel,
                checked: this.properties.enableQueryRules,
            }),
            PropertyPaneToggle('includeOneDriveResults', {
                label: strings.IncludeOneDriveResultsLabel,
                checked: this.properties.includeOneDriveResults,
            }),
            new PropertyPaneSearchManagedProperties('selectedProperties', {
                label: strings.SelectedPropertiesFieldLabel,
                description: strings.SelectedPropertiesFieldDescription,
                allowMultiSelect: true,
                availableProperties: this._availableManagedProperties,
                defaultSelectedKeys: this.properties.selectedProperties.split(","),
                onPropertyChange: (propertyPath: string, newValue: any) => {
                    this.properties[propertyPath] = newValue.join(',');
                    this.onPropertyPaneFieldChanged(propertyPath);

                    // Refresh the WP with new selected properties
                    this.render();
                },
                onUpdateAvailableProperties: this._onUpdateAvailableProperties,
                searchService: this._searchService,
            }),
            PropertyPaneTextField('refinementFilters', {
                label: strings.RefinementFilters,
                multiline: true,
                deferredValidationTime: 300
            }),
            PropertyPaneToggle('enableLocalization', {
                checked: this.properties.enableLocalization,
                label: strings.EnableLocalizationLabel,
                onText: strings.EnableLocalizationOnLabel,
                offText: strings.EnableLocalizationOffLabel
            }),
            PropertyPaneDropdown('searchQueryLanguage', {
                label: strings.QueryCultureLabel,
                options: [{
                    key: -1,
                    text: strings.QueryCultureUseUiLanguageLabel
                } as IDropdownOption].concat(sortBy(this._availableLanguages, ['text'])),
                selectedKey: this.properties.searchQueryLanguage ? this.properties.searchQueryLanguage : 0
            }),
            this._propertyFieldCollectionData('synonymList', {
                manageBtnLabel: strings.Synonyms.EditSynonymLabel,
                key: 'synonymList',
                enableSorting: false,
                panelHeader: strings.Synonyms.EditSynonymLabel,
                panelDescription: strings.Synonyms.SynonymListDescription,
                label: strings.Synonyms.SynonymPropertyPanelFieldLabel,
                value: this.properties.synonymList,
                fields: [
                    {
                        id: 'Term',
                        title: strings.Synonyms.SynonymListTerm,
                        type: this._customCollectionFieldType.string,
                        required: true,
                        placeholder: strings.Synonyms.SynonymListTermExemple
                    },
                    {
                        id: 'Synonyms',
                        title: strings.Synonyms.SynonymListSynonyms,
                        type: this._customCollectionFieldType.string,
                        required: true,
                        placeholder: strings.Synonyms.SynonymListSynonymsExemple
                    },
                    {
                        id: 'TwoWays',
                        title: strings.Synonyms.SynonymIsTwoWays,
                        type: this._customCollectionFieldType.boolean,
                        required: false
                    }
                ]
            })
        ];

        // Conditional fields for data sources
        if (this.properties.useRefiners) {

            searchSettingsFields.splice(5, 0,
                PropertyPaneDropdown('refinerDataSourceReference', {
                    options: this._dynamicDataService.getAvailableDataSourcesByType(SearchComponentType.RefinersWebPart),
                    label: strings.UseRefinersFromComponentLabel
                }));
        }

        if (this.properties.useSearchVerticals) {
            searchSettingsFields.splice(this.properties.useRefiners ? 7 : 6, 0,
                PropertyPaneDropdown('searchVerticalDataSourceReference', {
                    options: this._dynamicDataService.getAvailableDataSourcesByType(SearchComponentType.SearchVerticalsWebPart),
                    label: "Use verticals from this component"
                }));
        }

        return searchSettingsFields;
    }

    /**
     * Make sure the dynamic property is correctly connected to the source if a search refiner component has been selected in options
     */
    private ensureDataSourceConnection() {

        // Refiner Web Part data source
        if (this.properties.refinerDataSourceReference) {

            if (!this._refinerSourceData) {
                this._refinerSourceData = new DynamicProperty<IRefinerSourceData>(this.context.dynamicDataProvider);
            }

            // Register the data source manually since we don't want user select properties manually
            this._refinerSourceData.setReference(this.properties.refinerDataSourceReference);
            this._refinerSourceData.register(this.render);

        } else {

            if (this._refinerSourceData) {
                this._refinerSourceData.unregister(this.render);
            }
        }

        // Search verticals Web Part data source
        if (this.properties.searchVerticalDataSourceReference) {

            if (!this._searchVerticalSourceData) {
                this._searchVerticalSourceData = new DynamicProperty<ISearchVerticalSourceData>(this.context.dynamicDataProvider);
            }

            // Register the data source manually since we don't want user select properties manually
            this._searchVerticalSourceData.setReference(this.properties.searchVerticalDataSourceReference);
            this._searchVerticalSourceData.register(this.render);

        } else {

            if (this._searchVerticalSourceData) {
                this._searchVerticalSourceData.unregister(this.render);
            }
        }
    }

    /**
     * Determines the group fields for the search query options inside the property pane
     */
    private _getSearchQueryFields(): IPropertyPaneConditionalGroup {

        let defaultSearchQueryFields: IPropertyPaneField<any>[] = [];
        let queryModifiersFields: IPropertyPaneField<any>[] = [];

        // Query modifier fields
        if (this.properties.queryModifiers.length > 0) {
            queryModifiersFields = [
                PropertyPaneHorizontalRule(),
                ...this._getQueryModfiersFields()
            ];
        }

        if (!!this.properties.queryKeywords.tryGetSource()) {
            defaultSearchQueryFields.push(
                PropertyPaneCheckbox('useDefaultSearchQuery', {
                    text: strings.UseDefaultSearchQueryKeywordsFieldLabel
                })
            );
        }

        if (this.properties.useDefaultSearchQuery) {
            defaultSearchQueryFields.push(
                PropertyPaneTextField('defaultSearchQuery', {
                    label: strings.DefaultSearchQueryKeywordsFieldLabel,
                    description: strings.DefaultSearchQueryKeywordsFieldDescription,
                    multiline: true,
                    resizable: true,
                    placeholder: strings.SearchQueryPlaceHolderText,
                    onGetErrorMessage: this._validateEmptyField.bind(this),
                    deferredValidationTime: 1000
                })
            );
        }

        return {
            primaryGroup: {
                groupFields: [
                    PropertyPaneTextField('queryKeywords', {
                        label: strings.SearchQueryKeywordsFieldLabel,
                        description: strings.SearchQueryKeywordsFieldDescription,
                        multiline: true,
                        resizable: true,
                        placeholder: strings.SearchQueryPlaceHolderText,
                        onGetErrorMessage: this._validateEmptyField.bind(this),
                        deferredValidationTime: 1000
                    }),
                    ...queryModifiersFields
                ]
            },
            secondaryGroup: {
                groupFields: [
                    PropertyPaneDynamicFieldSet({
                        label: strings.SearchQueryKeywordsFieldLabel,
                        fields: [
                            PropertyPaneDynamicField('queryKeywords', {
                                label: strings.SearchQueryKeywordsFieldLabel
                            })
                        ],
                        sharedConfiguration: {
                            depth: DynamicDataSharedDepth.Source,
                        },
                    }),
                    ...queryModifiersFields
                ].concat(defaultSearchQueryFields)
            },
            // Show the secondary group only if the web part has been
            // connected to a dynamic data source
            showSecondaryGroup: !!this.properties.queryKeywords.tryGetSource(),
            onShowPrimaryGroup: () => {

                // Reset dynamic data fields related values to be consistent
                this.properties.useDefaultSearchQuery = false;
                this.properties.defaultSearchQuery = '';
                this.properties.queryKeywords.setValue('');
                this.render();
            }
        } as IPropertyPaneConditionalGroup;
    }

    private _getQueryModfiersFields(): IPropertyPaneField<any>[] {

        let queryModificationFields: IPropertyPaneField<any>[] = [
            this._propertyFieldCollectionData('queryModifiers', {
                manageBtnLabel: strings.QueryModifier.ConfigureBtn,
                key: 'queryModifiers',
                panelHeader: strings.QueryModifier.PanelHeader,
                panelDescription: strings.QueryModifier.PanelDescription,
                enableSorting: false,
                label: strings.QueryModifier.FieldLbl,
                disableItemCreation: true,
                disableItemDeletion: true,
                disabled: this.availableQueryModifierDefinitions.length === 0,
                value: this.properties.queryModifiers,
                fields: [
                    {
                        id: 'queryModifierEnabled',
                        title: strings.QueryModifier.EnableColumnLbl,
                        type: this._customCollectionFieldType.custom,
                        required: true,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Toggle, {
                                        key: itemId,
                                        checked: value,
                                        disabled: this.queryModifierSelected && this.queryModifierSelected !== item[field.id] ? true : false,
                                        onChange: ((evt, checked) => {
                                            // Reset every time the selected modifier. This will be determined when the field will be saved
                                            this.properties.selectedQueryModifierDisplayName = null;
                                            this.queryModifierSelected = !value;
                                            onUpdate(field.id, checked);
                                        }).bind(this)
                                    })
                                )
                            );
                        }
                    },
                    {
                        id: 'queryModifierDisplayName',
                        title: strings.QueryModifier.DisplayNameColumnLbl,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", { style: { 'fontWeight': 600 } }, value)
                            );
                        }
                    },
                    {
                        id: 'queryModifierDescription',
                        title: strings.QueryModifier.DescriptionColumnLbl,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null, value)
                            );
                        }
                    }
                ]
            })
        ];

        if (this.properties.selectedQueryModifierDisplayName) {
            queryModificationFields.push(
                PropertyPaneLabel('', {
                    text: Text.format(strings.QueryModifier.SelectedQueryModifierLbl, this.properties.selectedQueryModifierDisplayName)
                })
            );
        }

        return queryModificationFields;
    }

    /**
     * Determines the group fields for styling options inside the property pane
     */
    private _getStylingFields(): IPropertyPaneField<any>[] {

        // Options for the search results layout
        const layoutOptions = [
            {
                iconProps: {
                    officeFabricIconFontName: 'List'
                },
                text: strings.SimpleListLayoutOption,
                key: ResultsLayoutOption.SimpleList,
            },
            {
                iconProps: {
                    officeFabricIconFontName: 'Table'
                },
                text: strings.DetailsListLayoutOption,
                key: ResultsLayoutOption.DetailsList,
            },
            {
                iconProps: {
                    officeFabricIconFontName: 'Tiles'
                },
                text: strings.TilesLayoutOption,
                key: ResultsLayoutOption.Tiles
            },
            {
                iconProps: {
                    officeFabricIconFontName: 'Slideshow'
                },
                text: strings.SliderLayoutOption,
                key: ResultsLayoutOption.Slider
            },
            {
                iconProps: {
                    officeFabricIconFontName: 'People'
                },
                text: strings.PeopleLayoutOption,
                key: ResultsLayoutOption.People
            },
            {
                iconProps: {
                    officeFabricIconFontName: 'Code'
                },
                text: strings.DebugLayoutOption,
                key: ResultsLayoutOption.Debug
            }
        ] as IPropertyPaneChoiceGroupOption[];

        layoutOptions.push(...this.getCodeRenderers());
        layoutOptions.push({
            iconProps: {
                officeFabricIconFontName: 'CodeEdit'
            },
            text: strings.CustomLayoutOption,
            key: ResultsLayoutOption.Custom,
        });

        const canEditTemplate = this.properties.externalTemplateUrl && this.properties.selectedLayout === ResultsLayoutOption.Custom ? false : true;

        let dialogTextFieldValue;
        if (!this.codeRendererIsSelected()) {
            switch (this.properties.selectedLayout) {
                case ResultsLayoutOption.DetailsList:
                    dialogTextFieldValue = BaseTemplateService.getDefaultResultTypeListItem();
                    break;

                case ResultsLayoutOption.Tiles:
                    dialogTextFieldValue = BaseTemplateService.getDefaultResultTypeTileItem();
                    break;

                default:
                    dialogTextFieldValue = BaseTemplateService.getDefaultResultTypeCustomItem();
                    break;
            }
        }

        // Sets up styling fields
        let stylingFields: IPropertyPaneField<any>[] = [
            PropertyPaneTextField('webPartTitle', {
                label: strings.WebPartTitle
            }),
            PropertyPaneToggle('showBlank', {
                label: strings.ShowBlankLabel,
                checked: this.properties.showBlank,
            }),
            PropertyPaneToggle('showResultsCount', {
                label: strings.ShowResultsCountLabel,
                checked: this.properties.showResultsCount,
            }),
            PropertyPaneHorizontalRule(),
            PropertyPaneChoiceGroup('selectedLayout', {
                label: strings.ResultsLayoutLabel,
                options: layoutOptions
            }),
        ];

        if (!this.codeRendererIsSelected()) {
            stylingFields.push(
                this._propertyFieldCodeEditor('inlineTemplateText', {
                    label: strings.DialogButtonLabel,
                    panelTitle: strings.DialogTitle,
                    initialValue: this._templateContentToDisplay,
                    deferredValidationTime: 500,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: !canEditTemplate,
                    key: 'inlineTemplateTextCodeEditor',
                    language: this._propertyFieldCodeEditorLanguages.Handlebars
                }),
                this._propertyFieldCollectionData('resultTypes', {
                    manageBtnLabel: strings.ResultTypes.EditResultTypesLabel,
                    key: 'resultTypes',
                    panelHeader: strings.ResultTypes.EditResultTypesLabel,
                    panelDescription: strings.ResultTypes.ResultTypesDescription,
                    enableSorting: true,
                    label: strings.ResultTypes.ResultTypeslabel,
                    value: this.properties.resultTypes,
                    fields: [
                        {
                            id: 'property',
                            title: strings.ResultTypes.ConditionPropertyLabel,
                            type: this._customCollectionFieldType.custom,
                            required: true,
                            onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                                // Need to specify a React key to avoid item duplication when adding a new row
                                return React.createElement("div", { key: itemId },
                                    React.createElement(SearchManagedProperties, {
                                        defaultSelectedKey: item[field.id] ? item[field.id] : '',
                                        onUpdate: (newValue: any, isSortable: boolean) => {
                                            onUpdate(field.id, newValue);
                                        },
                                        searchService: this._searchService,
                                        validateSortable: false,
                                        availableProperties: this._availableManagedProperties,
                                        onUpdateAvailableProperties: this._onUpdateAvailableProperties
                                    } as ISearchManagedPropertiesProps));
                            }
                        },
                        {
                            id: 'operator',
                            title: strings.ResultTypes.CondtionOperatorValue,
                            type: this._customCollectionFieldType.dropdown,
                            defaultValue: ResultTypeOperator.Equal,
                            required: true,
                            options: [
                                {
                                    key: ResultTypeOperator.Equal,
                                    text: strings.ResultTypes.EqualOperator
                                },
                                {
                                    key: ResultTypeOperator.NotEqual,
                                    text: strings.ResultTypes.NotEqualOperator
                                },
                                {
                                    key: ResultTypeOperator.Contains,
                                    text: strings.ResultTypes.ContainsOperator
                                },
                                {
                                    key: ResultTypeOperator.StartsWith,
                                    text: strings.ResultTypes.StartsWithOperator
                                },
                                {
                                    key: ResultTypeOperator.NotNull,
                                    text: strings.ResultTypes.NotNullOperator
                                },
                                {
                                    key: ResultTypeOperator.GreaterOrEqual,
                                    text: strings.ResultTypes.GreaterOrEqualOperator
                                },
                                {
                                    key: ResultTypeOperator.GreaterThan,
                                    text: strings.ResultTypes.GreaterThanOperator
                                },
                                {
                                    key: ResultTypeOperator.LessOrEqual,
                                    text: strings.ResultTypes.LessOrEqualOperator
                                },
                                {
                                    key: ResultTypeOperator.LessThan,
                                    text: strings.ResultTypes.LessThanOperator
                                }
                            ]
                        },
                        {
                            id: 'value',
                            title: strings.ResultTypes.ConditionValueLabel,
                            type: this._customCollectionFieldType.string,
                            required: false,
                        },
                        {
                            id: "inlineTemplateContent",
                            title: strings.ResultTypes.InlineTemplateContentLabel,
                            type: this._customCollectionFieldType.custom,
                            onCustomRender: (field, value, onUpdate) => {
                                return (
                                    React.createElement("div", null,
                                        React.createElement(this._textDialogComponent.TextDialog, {
                                            language: this._propertyFieldCodeEditorLanguages.Handlebars,
                                            dialogTextFieldValue: value ? value : dialogTextFieldValue,
                                            onChanged: (fieldValue) => onUpdate(field.id, fieldValue),
                                            strings: {
                                                cancelButtonText: strings.CancelButtonText,
                                                dialogButtonText: strings.DialogButtonText,
                                                dialogTitle: strings.DialogTitle,
                                                saveButtonText: strings.SaveButtonText
                                            }
                                        })
                                    )
                                );
                            }
                        },
                        {
                            id: 'externalTemplateUrl',
                            title: strings.ResultTypes.ExternalUrlLabel,
                            type: this._customCollectionFieldType.url,
                            onGetErrorMessage: this._onTemplateUrlChange.bind(this),
                            placeholder: 'https://mysite/Documents/external.html'
                        },
                    ]
                })
            );
        }
        // Only show the template external URL for 'Custom' option
        if (this.properties.selectedLayout === ResultsLayoutOption.Custom) {
            stylingFields.splice(6, 0, PropertyPaneTextField('externalTemplateUrl', {
                label: strings.TemplateUrlFieldLabel,
                placeholder: strings.TemplateUrlPlaceholder,
                deferredValidationTime: 500,
                onGetErrorMessage: this._onTemplateUrlChange.bind(this)
            }));
        }

        if (this.codeRendererIsSelected()) {
            const currentCodeRenderer = find(this._codeRenderers, (renderer) => renderer.id === (this.properties.selectedLayout as any));
            if (!this.properties.customTemplateFieldValues) {
                this.properties.customTemplateFieldValues = currentCodeRenderer.customFields.map(field => {
                    return {
                        fieldName: field,
                        searchProperty: ''
                    };
                });
            }
            if (currentCodeRenderer && currentCodeRenderer.customFields && currentCodeRenderer.customFields.length > 0) {
                const searchPropertyOptions = this.properties.selectedProperties.split(',').map(prop => {
                    return ({
                        key: prop,
                        text: prop
                    });
                });
                stylingFields.push(this._propertyFieldCollectionData('customTemplateFieldValues', {
                    key: 'customTemplateFieldValues',
                    label: strings.customTemplateFieldsLabel,
                    panelHeader: strings.customTemplateFieldsPanelHeader,
                    manageBtnLabel: strings.customTemplateFieldsConfigureButtonLabel,
                    value: this.properties.customTemplateFieldValues,
                    fields: [
                        {
                            id: 'fieldName',
                            title: strings.customTemplateFieldTitleLabel,
                            type: this._customCollectionFieldType.string,
                        },
                        {
                            id: 'searchProperty',
                            title: strings.customTemplateFieldPropertyLabel,
                            type: this._customCollectionFieldType.dropdown,
                            options: searchPropertyOptions
                        }
                    ]
                }));
            }
        }

        return stylingFields;
    }

    /**
     * Gets template parameters fields
     */
    private _getTemplateFieldsGroup(): IPropertyPaneGroup {

        let templateFieldsGroup: IPropertyPaneGroup = null;

        if (this._templatePropertyPaneOptions.length > 0) {

            templateFieldsGroup = {
                groupFields: this._templatePropertyPaneOptions,
                isCollapsed: false,
                groupName: strings.TemplateParameters.TemplateParametersGroupName
            };
        }

        return templateFieldsGroup;
    }

    protected getCodeRenderers(): IPropertyPaneChoiceGroupOption[] {
        const registeredRenderers = this._codeRenderers;
        if (registeredRenderers && registeredRenderers.length > 0) {
            return registeredRenderers.map(ca => {
                return {
                    key: ca.id,
                    text: ca.name,
                    iconProps: {
                        officeFabricIconFontName: ca.icon
                    },
                };
            });
        } else {
            return [];
        }
    }

    protected codeRendererIsSelected(): boolean {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        return guidRegex.test(this.properties.selectedLayout as any);
    }

    public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {

        // Use the Web Part title as property title since we don't expose sub properties
        return [
            {
                id: SearchComponentType.SearchResultsWebPart,
                title: this.properties.webPartTitle ? this.properties.webPartTitle : this.title
            }
        ];
    }

    public getPropertyValue(propertyId: string): ISearchResultSourceData {

        const refinementResults = (this._resultService && this._resultService.results) ? this._resultService.results.RefinementResults : [];

        const searchResultSourceData: ISearchResultSourceData = {
            queryKeywords: this.properties.queryKeywords.tryGetValue(),
            refinementResults: refinementResults,
            paginationInformation: (this._resultService && this._resultService.results) ? this._resultService.results.PaginationInformation : {
                CurrentPage: 1,
                MaxResultsPerPage: this.properties.paging.itemsCountPerPage,
                TotalRows: 0
            },
            searchServiceConfiguration: this._searchService.getConfiguration(),
            verticalsInformation: this._verticalsInformation,
            defaultSelectedRefinementFilters: this._mapDefaultSelectedFiltersToRefinementResults(refinementResults, this.defaultSelectedFilters)
        };

        switch (propertyId) {
            case SearchComponentType.SearchResultsWebPart:
                return searchResultSourceData;
        }

        throw new Error('Bad property id');
    }

    /**
     * Maps the default selected filter values with the actual refinement results values for common filters
     * - When the condition IS NOT an FQL expression (ex: "t":["docx"]), the value is converted to HEX and matched with the refinement results using this token to determine default selected state.
     * - When the condition IS an FQL expression (ex: "t":["equals('docx')","equals('pptx')"]), the value is left untouched and matched with the refinement results by determining the common substring values to determine default selected state. It means in this case, mutliple refinement results can match a single provided condition (ex: 'Franck*' will match 'Cornu, Franck' or 'Franck Cornu').
     * @param refinementResults the current refinement results retrieved from the search
     * @param defaultSelectedFilters the current default selected filters applied through the URL params
     */
    private _mapDefaultSelectedFiltersToRefinementResults(refinementResults: IRefinementResult[], defaultSelectedFilters: IRefinementFilter[]): IRefinementFilter[] {

        let updatedDefaultSelectedFilters: IRefinementFilter[] = [];

        if (refinementResults.length > 0 && this.defaultSelectedFilters.length > 0) {

            updatedDefaultSelectedFilters = this.defaultSelectedFilters.map(defaultSelectedFilter => {

                let updatedSelectedFilter = cloneDeep(defaultSelectedFilter);

                const matchingRefinementResults = refinementResults.filter(refinementResult => refinementResult.FilterName === defaultSelectedFilter.FilterName);
                if (matchingRefinementResults.length === 1) {

                    let updatedSelectedFilterValues: IRefinementValue[] = [];

                    updatedSelectedFilter.Values.map(updatedSelectedFilterValue => {

                        matchingRefinementResults[0].Values.map(refinementValue => {

                            if (refinementValue.RefinementToken.indexOf(updatedSelectedFilterValue.RefinementToken) !== -1) {
                                // Means the provided condition in URL is a text expression
                                updatedSelectedFilterValues.push(refinementValue);
                            } else if (StringHelper.longestCommonSubstring(updatedSelectedFilterValue.RefinementToken, refinementValue.RefinementValue) && updatedSelectedFilterValue.RefinementToken.indexOf("range") === -1) {
                                // Means the provided condition in URL is an FQL expression so we try to guess the corresponding refinement results using the text value contained in the expression itself
                                updatedSelectedFilterValues.push(refinementValue);
                            }
                        });

                        if (updatedSelectedFilterValues.length === 0) {
                            // Means the value hasn't been matched so we use the original value
                            updatedSelectedFilterValues.push(updatedSelectedFilterValue);
                        }
                    });

                    updatedSelectedFilter.Values = updatedSelectedFilterValues;
                }

                return updatedSelectedFilter;
            });
        }

        return updatedDefaultSelectedFilters;
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
    private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {

        if (!isEqual(this._themeVariant, args.theme)) {
            this._themeVariant = args.theme;
            this.render();
        }
    }

    /**
     * Binds event fired from pagination web components
     */
    private bindPagingEvents() {

        this.domElement.addEventListener('pageNumberUpdated', ((ev: CustomEvent) => {

            // We ensure the event if not propagated outside the component (i.e. other Web Part instances)
            ev.stopImmediatePropagation();

            // These information comes from the PaginationWebComponent class
            this.currentPageNumber = ev.detail.pageNumber;

            this.render();

        }).bind(this));
    }

    /**
     * Returns property pane 'Paging' group fields
     */
    private getPagingGroupFields(): IPropertyPaneField<any>[] {

        let groupFields: IPropertyPaneField<any>[] = [];


        groupFields.push(
            PropertyPaneToggle('paging.showPaging', {
                label: strings.Paging.ShowPagingFieldName,
            }),
            PropertyPaneTextField('paging.itemsCountPerPage', {
                label: strings.Paging.ItemsCountPerPageFieldName,
                value: this.properties.paging.itemsCountPerPage.toString(),
                maxLength: 3,
                deferredValidationTime: 300,
                onGetErrorMessage: this._validateNumber.bind(this),
            }),
            PropertyPaneSlider('paging.pagingRange', {
                label: strings.Paging.PagingRangeFieldName,
                max: 50,
                min: 0, // 0 = no page numbers displayed
                step: 1,
                showValue: true,
                value: this.properties.paging.pagingRange,
                disabled: !this.properties.paging.showPaging
            }),
            PropertyPaneHorizontalRule(),
            PropertyPaneToggle('paging.hideNavigation', {
                label: strings.Paging.HideNavigationFieldName,
                disabled: !this.properties.paging.showPaging
            }),
            PropertyPaneToggle('paging.hideFirstLastPages', {
                label: strings.Paging.HideFirstLastPagesFieldName,
                disabled: !this.properties.paging.showPaging
            }),
            PropertyPaneToggle('paging.hideDisabled', {
                label: strings.Paging.HideDisabledFieldName,
                disabled: !this.properties.paging.showPaging
            })
        );
        return groupFields;
    }
}
