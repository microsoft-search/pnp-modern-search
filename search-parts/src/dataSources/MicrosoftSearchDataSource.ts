import { BaseDataSource, FilterSortType, FilterSortDirection, ITemplateSlot, BuiltinTemplateSlots, IDataContext, ITokenService, FilterBehavior, PagingBehavior, IDataFilterResult, IDataFilterResultValue, FilterComparisonOperator, IDataSourceData, SortFieldDirection } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneLabel, IPropertyPaneField, PropertyPaneToggle, PropertyPaneHorizontalRule } from "@microsoft/sp-property-pane";
import { cloneDeep, isEmpty } from '@microsoft/sp-lodash-subset';
import { MSGraphClientFactory, SPHttpClient } from "@microsoft/sp-http";
import { TokenService } from "../services/tokenService/TokenService";
import { ServiceScope } from '@microsoft/sp-core-library';
import { PageContext } from '@microsoft/sp-page-context';
import { Dropdown, IComboBoxOption, IDropdownProps, ITextFieldProps, TextField } from '@fluentui/react';
import { PropertyPaneAsyncCombo } from "../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import * as commonStrings from 'CommonStrings';
import { IMicrosoftSearchRequest, ISearchRequestAggregation, SearchAggregationSortBy, ISearchSortProperty, IMicrosoftSearchQuery, IQueryAlterationOptions, ICollapseProperty } from '../models/search/IMicrosoftSearchRequest';
import { DateHelper } from '../helpers/DateHelper';
import { DataFilterHelper } from "../helpers/DataFilterHelper";
import { IMicrosoftSearchResultSet, IMicrosoftSearchResponse } from "../models/search/IMicrosoftSearchResponse";
import { ISortFieldConfiguration } from '../models/search/ISortFieldConfiguration';
import { AsyncCombo } from "../controls/PropertyPaneAsyncCombo/components/AsyncCombo";
import { DataSourceHelper } from '../helpers/DataSourceHelper';
import { IAsyncComboProps } from "../controls/PropertyPaneAsyncCombo/components/IAsyncComboProps";
import { PropertyPaneNonReactiveTextField } from "../controls/PropertyPaneNonReactiveTextField/PropertyPaneNonReactiveTextField";
import { IMicrosoftSearchDataSourceData } from "../models/search/IMicrosoftSearchDataSourceData";
import commonStyles from '../styles/Common.module.scss';
import * as React from "react";
import { BuiltinDataSourceProviderKeys } from "./AvailableDataSources";
import { AutoCalculatedDataSourceFields, SortableFields } from "../common/Constants";
import LocalizationHelper from "../helpers/LocalizationHelper";
import { ObjectHelper } from "../helpers/ObjectHelper";
import { BuiltinFilterTemplates } from "../layouts/AvailableTemplates";

const EDIT_MODE_AGGREGATION_LIMIT = 100;

export enum EntityType {
    Message = 'message',
    Event = 'event',
    Drive = 'drive',
    DriveItem = 'driveItem',
    ExternalItem = 'externalItem',
    List = 'list',
    ListItem = 'listItem',
    Site = 'site',
    Person = 'person',
    TeamsMessage = 'chatMessage',
    Bookmark = 'bookmark',
    Acronym = 'acronym'
}

export interface IMicrosoftSearchDataSourceProperties {

    /**
     * The entity types to search. See for the complete list
     */
    entityTypes: EntityType[];


    /**
     * Contains the fields to be returned for each resource object specified in entityTypes, allowing customization of the fields returned by default otherwise, including additional fields such as custom managed properties from SharePoint and OneDrive, or custom fields in externalItem from content ingested by Graph connectors.
     */
    fields: string[];

    /**
     * The sort fields configuration
     */
    sortProperties: ISortFieldConfiguration[];

    /**
     * The sort fields configuration (for the user sort control)
     */
    sortList: ISortFieldConfiguration[];

    /**
     * This triggers hybrid sort for messages : the first 3 messages are the most relevant. This property is only applicable to entityType=message
     */
    enableTopResults: boolean;

    /**
     * The content sources for external items
     */
    contentSourceConnectionIds: string[];

    /**
     * The query alteration options for spelling corrections
     */
    queryAlterationOptions: IQueryAlterationOptions;

    /**
    * The search query template
    */
    queryTemplate: string;

    /**
    * Flag indicating if the Microsoft Search beta endpoint should be used
     */
    useBetaEndpoint: boolean;

    /**
     * Enable Microsoft Search result types
     */
    enableResultTypes: boolean;

    /**
     * Indicates whether to trim away the duplicate SharePoint files from search results. Default value is false.
     */
    trimDuplicates: boolean;

    /**
     * Specifies the criteria used for collapsing search results. Applies only to sortable/refinable properties.
     * More information: https://learn.microsoft.com/en-us/graph/search-concept-collapse
     */
    collapseProperties: ICollapseProperty[];
    /**
     * Specifies if the search results should include the SharePoint embedded data.
     * More information: https://learn.microsoft.com/en-us/sharepoint/dev/embedded/concepts/content-experiences/search-content
     */
    showSPEmbeddedContent: boolean;

    /**
     * Specifies if the search results should include the Microsoft Search archived content.
     * More information: https://learn.microsoft.com/en-us/graph/api/resources/sharepointonedriveoptions?view=graph-rest-beta
     */
    showMSArchivedContent: boolean;
}

export class MicrosoftSearchDataSource extends BaseDataSource<IMicrosoftSearchDataSourceProperties> {

    private _tokenService: ITokenService;
    private _spHttpClient: SPHttpClient;
    private _pageContext: PageContext;
    private _propertyPaneWebPartInformation: any = null;
    private _availableFields: IComboBoxOption[] = [];
    private _availableSharePointSchemaFields: IComboBoxOption[] = [];
    private _availableExternalConnectionIds: IComboBoxOption[] = [];
    private readonly _availableFieldsFromResults = new Set<string>();
    private _externalConnectionsLoadPermissionError = false;
    private _externalConnectionsLoadGenericError = false;
    private _externalSchemaLoadPermissionError = false;
    private _externalSchemaLoadGenericError = false;
    private _microsoftSearchUrl: string;
    private _sortableFields: IComboBoxOption[] = SortableFields.map(field => {
        return {
            key: field,
            text: field,
        } as IComboBoxOption;
    });

    private _collapsibaleFields: IComboBoxOption[] = this._sortableFields;

    private readonly _availableEntityTypeOptions: IComboBoxOption[] = [
        {
            key: EntityType.Message,
            text: "Messages"
        },
        {
            key: EntityType.Event,
            text: "Events"
        },
        {
            key: EntityType.Drive,
            text: "Drive"
        },
        {
            key: EntityType.DriveItem,
            text: "Drive Items"
        },
        {
            key: EntityType.ExternalItem,
            text: "External Items"
        },
        {
            key: EntityType.ListItem,
            text: "List Items"
        },
        {
            key: EntityType.List,
            text: "List"
        },
        {
            key: EntityType.Site,
            text: "Sites"
        },
        {
            key: EntityType.Person,
            text: "People"
        },
        {
            key: EntityType.TeamsMessage,
            text: "Teams messages"
        },
        {
            key: EntityType.Bookmark,
            text: "Bookmarks"
        },
        {
            key: EntityType.Acronym,
            text: "Acronyms"
        }
    ];

    /**
     * The data source items count
     */
    private _itemsCount: number = 0;

    /**
     * A date helper instance
     */
    private dateHelper: DateHelper;

    /**
    * The dayjs library reference
    */
    private dayjs: any;

    private _propertyFieldCollectionData: any = null;
    private _customCollectionFieldType: any = null;
    private readonly _defaultDriveItemFields: string[] = ["title", "name", "webUrl", "fileType", "createdBy", "createdDateTime", "lastModifiedDateTime", "parentReference", "size", "description", "file", "folder", "subject", "bodyPreview", "replyTo", "from", "sender", "start", "end", "displayName", "givenName", "surname", "userPrincipalName", "mail", "phones", "department", "contentTypeId", "siteId", "webId", "contentClass", "siteTitle", "sitePath", "AuthorOWSUSER", "listId", "listItemId", "listItemUniqueId", "driveId", "owstaxidmetadataalltagsinfo"];
    props: any;

    public constructor(serviceScope: ServiceScope) {
        super(serviceScope);

        serviceScope.whenFinished(() => {
            this._tokenService = serviceScope.consume<ITokenService>(TokenService.ServiceKey);
            this._spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);
            this._pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
        });
    }

    public async onInit(): Promise<void> {

        this.dateHelper = this.serviceScope.consume(DateHelper.ServiceKey);
        this.dayjs = await this.dateHelper.moment();

        if (this.editMode) {
            // Use the same chunk name as the main Web Part to avoid recreating/loading a new one
            const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
                /* webpackChunkName: 'pnp-modern-search-property-pane' */
                '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
            );

            const { PropertyPaneWebPartInformation } = await import(
                /* webpackChunkName: 'pnp-modern-search-property-pane' */
                '@pnp/spfx-property-controls/lib/PropertyPaneWebPartInformation'
            );

            this._propertyPaneWebPartInformation = PropertyPaneWebPartInformation;
            this._propertyFieldCollectionData = PropertyFieldCollectionData;
            this._customCollectionFieldType = CustomCollectionFieldType;
        }

        this.initProperties();
    }

    public getItemCount(): number {
        return this._itemsCount;
    }

    public getFilterBehavior(): FilterBehavior {
        return FilterBehavior.Dynamic;
    }

    public getPagingBehavior(): PagingBehavior {
        return PagingBehavior.Dynamic;
    }

    public async getData(dataContext: IDataContext): Promise<IMicrosoftSearchDataSourceData> {

        let results: IMicrosoftSearchDataSourceData = {
            items: []
        };

        // Ensuring at least one entity type is selected before launching a search
        if (this._properties.entityTypes.length > 0) {
            const searchQuery = await this.buildMicrosoftSearchQuery(dataContext);
            results = await this.search(searchQuery);
            this.logAggregationCounts(dataContext, results.filters || []);
        } else {
            // If no entity is selected, manually set the results to prevent
            // having the previous search results items count displayed.
            this._itemsCount = 0;
        }

        return results;
    }

    private logAggregationCounts(dataContext: IDataContext, filters: IDataFilterResult[]): void {
        const defaultAggregationSize = 10;
        const configuredFilters = dataContext.filters?.filtersConfiguration || [];

        filters.forEach((filter) => {
            const filterConfiguration = configuredFilters.find((config) => config.filterName === filter.filterName);
            const configuredLimit = this.getEffectiveAggregationLimit(filterConfiguration?.maxBuckets ?? defaultAggregationSize);
            const returnedCount = filter.values?.length ?? 0;
            const filterWithLimitInfo = filter as IDataFilterResult & { isMaxBucketsExceeded?: boolean; configuredMaxBuckets?: number; returnedValueCount?: number; isEditModeCapApplied?: boolean; };

            filterWithLimitInfo.isMaxBucketsExceeded = returnedCount >= configuredLimit;
            filterWithLimitInfo.configuredMaxBuckets = configuredLimit;
            filterWithLimitInfo.returnedValueCount = returnedCount;
            filterWithLimitInfo.isEditModeCapApplied = this.editMode && Boolean(filterConfiguration?.maxBuckets && filterConfiguration.maxBuckets > EDIT_MODE_AGGREGATION_LIMIT);

            if (returnedCount >= configuredLimit) {
                console.warn(
                    `%c[PnP Modern Search][Microsoft Search] Aggregation '${filter.filterName}' returned ${returnedCount} item(s), matching or exceeding the configured limit of ${configuredLimit}. Additional values may have been truncated by the API.`,
                    'color:#8a1c00;background:#fff4ce;font-weight:bold;padding:2px 4px;'
                );
                return;
            }

            console.info(`[PnP Modern Search][Microsoft Search] Aggregation '${filter.filterName}' returned ${returnedCount} item(s) from the API (limit ${configuredLimit}).`);
        });
    }

    private getEffectiveAggregationLimit(configuredLimit: number = 10): number {
        return this.editMode ? Math.min(configuredLimit, EDIT_MODE_AGGREGATION_LIMIT) : configuredLimit;
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        const entityTypesDisplayValue = this._availableEntityTypeOptions.map((option) => {
            if (this.properties.entityTypes.includes(option.key as EntityType)) {
                return option.text;
            }
        });
        let selectFieldsFields: IPropertyPaneField<any>[] = [];
        let contentSourceConnectionIdsFields: IPropertyPaneField<any>[] = [];
        let enableTopResultsFields: IPropertyPaneField<any>[] = [];
        let sortPropertiesFields: IPropertyPaneField<any>[] = [];
        let queryAlterationFields: IPropertyPaneField<any>[] = [];
        const supportsResultTypes = (entityTypes: EntityType[] = []) => {
            return entityTypes.every(e => e === EntityType.ExternalItem || e === EntityType.ListItem);
        };

        let commonFields: IPropertyPaneField<any>[] = [
            PropertyPaneLabel('', {
                text: commonStrings.DataSources.MicrosoftSearch.QueryTextFieldLabel
            }),
            this._propertyPaneWebPartInformation({
                description: `<em>${commonStrings.DataSources.MicrosoftSearch.QueryTextFieldInfoMessage}</em>`,
                key: 'queryText'
            }),
            new PropertyPaneNonReactiveTextField('dataSourceProperties.queryTemplate', {
                componentKey: `${BuiltinDataSourceProviderKeys.MicrosoftSearch}-queryTemplate`,
                defaultValue: this.properties.queryTemplate,
                label: commonStrings.DataSources.MicrosoftSearch.QueryTemplateFieldLabel,
                placeholderText: commonStrings.DataSources.MicrosoftSearch.QueryTemplatePlaceHolderText,
                multiline: true,
                description: commonStrings.DataSources.MicrosoftSearch.QueryTemplateFieldDescription,
                applyBtnText: commonStrings.DataSources.MicrosoftSearch.ApplyQueryTemplateBtnText,
                allowEmptyValue: false,
                rows: 8
            }),
            new PropertyPaneAsyncCombo('dataSourceProperties.entityTypes', {
                availableOptions: this._availableEntityTypeOptions,
                allowMultiSelect: true,
                allowFreeform: false,
                description: "",
                label: commonStrings.DataSources.MicrosoftSearch.EntityTypesField,
                placeholder: "",
                searchAsYouType: false,
                defaultSelectedKeys: this.properties.entityTypes,
                onPropertyChange: (targetProperty: string, newValue: IComboBoxOption | IComboBoxOption[]) => {
                    const previousEnableResultTypes = this.properties.enableResultTypes;
                    this.onCustomPropertyUpdate(targetProperty, newValue);

                    const selectedEntityTypes = (Array.isArray(newValue) ? newValue : [newValue])
                        .filter(Boolean)
                        .map((option) => option.key as EntityType);

                    if (supportsResultTypes(selectedEntityTypes) && previousEnableResultTypes) {
                        this.properties.enableResultTypes = previousEnableResultTypes;
                    }
                },
                textDisplayValue: entityTypesDisplayValue.filter(Boolean).join(",")
            }),
            new PropertyPaneAsyncCombo('dataSourceProperties.fields', {
                availableOptions: this._availableFields,
                allowMultiSelect: true,
                allowFreeform: true,
                description: commonStrings.DataSources.MicrosoftSearch.SelectedFieldsPropertiesFieldDescription,
                label: commonStrings.DataSources.MicrosoftSearch.SelectedFieldsPropertiesFieldLabel,
                placeholder: commonStrings.DataSources.MicrosoftSearch.SelectedFieldsPlaceholderLabel,
                onLoadOptions: this.getAvailableFields.bind(this),
                searchAsYouType: false,
                defaultSelectedKeys: this.properties.fields,
                onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                onUpdateOptions: (options: IComboBoxOption[]) => {
                    this._availableFields = options;
                }
            }),
            PropertyPaneToggle('dataSourceProperties.enableResultTypes', {
                label: "Enable result types",
                disabled: !supportsResultTypes(this.properties.entityTypes)
            }),
            PropertyPaneToggle('dataSourceProperties.showSPEmbeddedContent', {
                label: commonStrings.DataSources.MicrosoftSearch.showSPEmbeddedContentLabel,

            }),
            PropertyPaneToggle('dataSourceProperties.showMSArchivedContent', {
                label: commonStrings.DataSources.MicrosoftSearch.showMSArchivedContentLabel,

            })
        ];

        let useBetaEndpointFields: IPropertyPaneField<any>[] = [
            PropertyPaneHorizontalRule(),
            PropertyPaneToggle('dataSourceProperties.useBetaEndpoint', {
                label: commonStrings.DataSources.MicrosoftSearch.UseBetaEndpoint
            })
        ];

        // Add beta options
        if (this.properties.useBetaEndpoint) {
            useBetaEndpointFields.push(
                PropertyPaneToggle('dataSourceProperties.trimDuplicates', {
                    label: commonStrings.DataSources.MicrosoftSearch.TrimDuplicates
                }),
                this._propertyFieldCollectionData('dataSourceProperties.collapseProperties', {
                    manageBtnLabel: commonStrings.DataSources.MicrosoftSearch.CollapseProperties.EditCollapsePropertiesLabel,
                    key: 'collapseProperties',
                    enableSorting: true,
                    panelHeader: commonStrings.DataSources.MicrosoftSearch.CollapseProperties.EditCollapsePropertiesLabel,
                    panelDescription: commonStrings.DataSources.MicrosoftSearch.CollapseProperties.CollapsePropertiesDescription,
                    label: commonStrings.DataSources.MicrosoftSearch.CollapseProperties.CollapsePropertiesPropertyPaneFieldLabel,
                    value: this.properties.collapseProperties,
                    tableClassName: commonStyles.slotTable,
                    fields: [
                        {
                            id: 'fields',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortFieldColumnLabel,
                            type: this._customCollectionFieldType.custom,
                            required: true,
                            onCustomRender: ((field, value, onUpdate, item, itemId, onError) => {

                                return React.createElement("div", { key: `${field.id}-${itemId}` },
                                    React.createElement(AsyncCombo, {
                                        defaultSelectedKeys: item[field.id] ? item[field.id] : '',
                                        allowMultiSelect: true,
                                        allowFreeform: true,
                                        availableOptions: this._collapsibaleFields,
                                        onUpdateOptions: (options: IComboBoxOption[]) => {
                                            this._collapsibaleFields = options;
                                        },
                                        clearTextOnFocus: true,
                                        onUpdate: (options: IComboBoxOption[]) => {
                                            const updateOptions = options?.length == 0 ? undefined : options.map(o => o.key as string);
                                            onUpdate(field.id, updateOptions);
                                        },
                                        placeholder: commonStrings.DataSources.MicrosoftSearch.CollapseProperties.CollapsePropertiesFieldColumnPlaceholder,
                                        useComboBoxAsMenuWidth: false // Used when screen resolution is too small to display the complete value  
                                    } as IAsyncComboProps))
                            })
                        },
                        {
                            id: 'limit',
                            title: commonStrings.DataSources.MicrosoftSearch.CollapseProperties.CollapseLimitFieldLabel,
                            type: this._customCollectionFieldType.number,
                            required: true
                        }
                    ]
                }),
                PropertyPaneHorizontalRule()
            );
        }





        // Sorting results is currently only supported on the following SharePoint and OneDrive types: driveItem, listItem, list, site , ExternalItem.
        if (this.properties.entityTypes.includes(EntityType.DriveItem) ||
            this.properties.entityTypes.includes(EntityType.ListItem) ||
            this.properties.entityTypes.includes(EntityType.Site) ||
            this.properties.entityTypes.includes(EntityType.List) ||
            this.properties.entityTypes.includes(EntityType.ExternalItem)) {

            sortPropertiesFields.push(
                this._propertyFieldCollectionData('dataSourceProperties.sortProperties', {
                    manageBtnLabel: commonStrings.DataSources.SearchCommon.Sort.EditSortLabel,
                    key: 'sortProperties',
                    enableSorting: true,
                    panelHeader: commonStrings.DataSources.SearchCommon.Sort.EditSortLabel,
                    panelDescription: commonStrings.DataSources.SearchCommon.Sort.SortListDescription,
                    label: commonStrings.DataSources.SearchCommon.Sort.SortPropertyPaneFieldLabel,
                    value: this.properties.sortProperties,
                    tableClassName: commonStyles.slotTable,
                    fields: [
                        {
                            id: 'sortField',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortFieldColumnLabel,
                            type: this._customCollectionFieldType.custom,
                            required: true,
                            onCustomRender: ((field, value, onUpdate, item, itemId, onError) => {

                                return React.createElement("div", { key: `${field.id}-${itemId}` },
                                    React.createElement(AsyncCombo, {
                                        defaultSelectedKey: item[field.id] ? item[field.id] : '',
                                        allowMultiSelect: false,
                                        allowFreeform: true,
                                        availableOptions: this._sortableFields,
                                        onUpdateOptions: (options: IComboBoxOption[]) => {
                                            this._sortableFields = options;
                                        },
                                        clearTextOnFocus: true,
                                        onUpdate: (option: IComboBoxOption) => {
                                            onUpdate(field.id, option.key as string);
                                        },
                                        placeholder: commonStrings.DataSources.SearchCommon.Sort.SortFieldColumnPlaceholder,
                                        useComboBoxAsMenuWidth: false // Used when screen resolution is too small to display the complete value  
                                    } as IAsyncComboProps))
                            })
                        },
                        {
                            id: 'isDefaultSort',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortFieldDefaultSortLabel,
                            type: this._customCollectionFieldType.boolean
                        },
                        {
                            id: 'sortDirection',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortDirectionColumnLabel,
                            type: this._customCollectionFieldType.custom,
                            onCustomRender: (field, value, onUpdate, item) => {
                                return (
                                    React.createElement("div", null,
                                        React.createElement(Dropdown, {
                                            options: [
                                                {
                                                    key: SortFieldDirection.Ascending,
                                                    text: commonStrings.DataSources.SearchCommon.Sort.SortDirectionAscendingLabel
                                                },
                                                {
                                                    key: SortFieldDirection.Descending,
                                                    text: commonStrings.DataSources.SearchCommon.Sort.SortDirectionDescendingLabel
                                                }
                                            ],
                                            disabled: !item.isDefaultSort,
                                            defaultSelectedKey: item.sortDirection ? item.sortDirection : SortFieldDirection.Ascending,
                                            onChange: (ev, option) => onUpdate(field.id, option.key),
                                        } as IDropdownProps)
                                    )
                                );
                            }
                        },
                        {
                            id: 'isUserSort',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortFieldUserSortLabel,
                            type: this._customCollectionFieldType.boolean
                        },
                        {
                            id: 'sortFieldDisplayName',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortFieldFriendlyNameLabel,
                            type: this._customCollectionFieldType.custom,
                            onCustomRender: (field, value, onUpdate, item) => {
                                return (
                                    React.createElement("div", null,
                                        React.createElement(TextField, {
                                            defaultValue: value,
                                            disabled: !item.isUserSort,
                                            onChange: (ev, newValue) => {
                                                onUpdate(field.id, newValue);
                                            }
                                        } as ITextFieldProps)
                                    )
                                );
                            },
                        }
                    ]
                })
            );
        }

        if (this.properties.entityTypes.includes(EntityType.ExternalItem)) {
            contentSourceConnectionIdsFields.push(
                new PropertyPaneAsyncCombo('dataSourceProperties.contentSourceConnectionIds', {
                    availableOptions: this._availableExternalConnectionIds,
                    allowMultiSelect: true,
                    allowFreeform: true,
                    description: commonStrings.DataSources.MicrosoftSearch.ContentSourcesFieldDescriptionLabel,
                    label: commonStrings.DataSources.MicrosoftSearch.ContentSourcesFieldLabel,
                    placeholder: commonStrings.DataSources.MicrosoftSearch.ContentSourcesFieldPlaceholderLabel,
                    onLoadOptions: this.getAvailableExternalConnectionIds.bind(this),
                    searchAsYouType: false,
                    defaultSelectedKeys: this.properties.contentSourceConnectionIds,
                    onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                    onUpdateOptions: (options: IComboBoxOption[]) => {
                        this._availableExternalConnectionIds = options;
                    }
                })
            );

            const metadataWarningMessage = this.getExternalMetadataWarningMessage();
            if (metadataWarningMessage) {
                contentSourceConnectionIdsFields.push(
                    PropertyPaneLabel('externalMetadataWarning', {
                        text: metadataWarningMessage
                    })
                );
            }
        }

        if (this.properties.entityTypes.includes(EntityType.Message) && this.properties.entityTypes.length === 1) {
            enableTopResultsFields.push(PropertyPaneToggle('dataSourceProperties.enableTopResults', {
                label: commonStrings.DataSources.MicrosoftSearch.EnableTopResultsLabel
            }));
        }

        // https://docs.microsoft.com/en-us/graph/search-concept-speller#known-limitations
        if ((this.properties.entityTypes.includes(EntityType.Message) ||
            this.properties.entityTypes.includes(EntityType.Event) ||
            this.properties.entityTypes.includes(EntityType.Site) ||
            this.properties.entityTypes.includes(EntityType.Drive) ||
            this.properties.entityTypes.includes(EntityType.DriveItem) ||
            this.properties.entityTypes.includes(EntityType.List) ||
            this.properties.entityTypes.includes(EntityType.ListItem) ||
            this.properties.entityTypes.includes(EntityType.ExternalItem))) {
            queryAlterationFields.push(
                PropertyPaneToggle('dataSourceProperties.queryAlterationOptions.enableSuggestion', {
                    label: commonStrings.DataSources.MicrosoftSearch.EnableSuggestionLabel,
                    checked: this.properties.queryAlterationOptions.enableSuggestion
                }),
                PropertyPaneToggle('dataSourceProperties.queryAlterationOptions.enableModification', {
                    label: commonStrings.DataSources.MicrosoftSearch.EnableModificationLabel,
                    checked: this.properties.queryAlterationOptions.enableModification
                })
            );
        }

        let groupFields: IPropertyPaneField<any>[] = [
            ...commonFields,
            ...selectFieldsFields,
            ...sortPropertiesFields,
            ...enableTopResultsFields,
            ...contentSourceConnectionIdsFields,
            ...useBetaEndpointFields,
            ...queryAlterationFields
        ];

        return [
            {
                groupName: commonStrings.DataSources.MicrosoftSearch.SourceConfigurationGroupName,
                groupFields: groupFields
            }
        ];
    }

    public onPropertyUpdate(propertyPath: string, oldValue: any, newValue: any) {

        if (propertyPath.localeCompare('dataSourceProperties.useBetaEndpoint') === 0) {

            if (newValue) {
                this._microsoftSearchUrl = `${this.context?.pageContext?.legacyPageContext?.msGraphEndpointUrl}/beta/search/query`;
            } else {
                this._microsoftSearchUrl = `${this.context?.pageContext?.legacyPageContext?.msGraphEndpointUrl}/v1.0/search/query`;
            }
        }

        if (propertyPath.localeCompare('dataSourceProperties.sortProperties') === 0) {
            this.properties.sortList = newValue;
        }
    }

    public onCustomPropertyUpdate(propertyPath: string, newValue: any, changeCallback?: (targetProperty?: string, newValue?: any) => void): void {

        if (propertyPath.localeCompare('dataSourceProperties.entityTypes') === 0) {
            const previousEntityTypes = [...this.properties.entityTypes];
            this.properties.entityTypes = (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as EntityType; });
            const hadExternalItem = previousEntityTypes.includes(EntityType.ExternalItem);
            const hasExternalItem = this.properties.entityTypes.includes(EntityType.ExternalItem);

            this._availableFieldsFromResults.clear();

            if (hasExternalItem) {
                // Reset result types
                this.properties.enableResultTypes = false;
            } else if (hadExternalItem) {
                this.properties.fields = [...this._defaultDriveItemFields];
                this.resetExternalMetadataLoadState();
            }

            // Reset and set appropriate fields for Bookmark, Acronym, or Person
            const hasBookmark = this.properties.entityTypes.includes(EntityType.Bookmark);
            const hasAcronym = this.properties.entityTypes.includes(EntityType.Acronym);
            const hasPerson = this.properties.entityTypes.includes(EntityType.Person);

            if (hasBookmark && hasAcronym) {
                // Both Bookmark and Acronym selected - union of both: id, displayName, description, webUrl, categories
                this.properties.fields = ['id', 'displayName', 'description', 'webUrl', 'categories'];
            } else if (hasBookmark) {
                // Bookmark only: id, displayName, description, webUrl, categories
                this.properties.fields = ['id', 'displayName', 'description', 'webUrl', 'categories'];
            } else if (hasAcronym) {
                // Acronym only: displayName, description, webUrl
                this.properties.fields = ['displayName', 'description', 'webUrl'];
            } else if (hasPerson) {
                // Person: all available fields
                this.properties.fields = ['id', 'displayName', 'givenName', 'surname', 'companyName', 'phones', 'jobTitle', 'department', 'officeLocation', 'additionalOfficeLocation', 'personType', 'userPrincipalName', 'imAddress'];
            }
            // If none of the above, leave fields as is

            this.context.propertyPane.refresh();
            this.render();
        }

        if (propertyPath.localeCompare('dataSourceProperties.fields') === 0) {
            let options = DataSourceHelper.parseAndCleanOptions((cloneDeep(newValue) as IComboBoxOption[]));
            this.properties.fields = options.map(v => { return v.key as string; });
            this.context.propertyPane.refresh();
            this.render();
        }

        if (propertyPath.localeCompare('dataSourceProperties.contentSourceConnectionIds') === 0) {
            this.properties.contentSourceConnectionIds = (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as string; });

            // Force schema fields to be recomputed when selected external connections change.
            this._availableFields = [];
            this.context.propertyPane.refresh();
            this.render();
        }
    }

    private async getAvailableFields(): Promise<IComboBoxOption[]> {
        const defaultFields = this.getDefaultFieldOptions();
        const resultFields = this.getResultFieldOptions();
        const sharePointSchemaFields = await this.getSharePointSchemaFieldOptions();

        if (!this.properties.entityTypes.includes(EntityType.ExternalItem) || this.properties.contentSourceConnectionIds.length === 0) {
            // Prefer live Microsoft Search payload fields first, then keep defaults,
            // and finally append schema candidates for broader discoverability.
            return this.mergeFieldOptions(resultFields, defaultFields, sharePointSchemaFields);
        }

        const schemaOptions = await this.getExternalConnectionSchemaFieldOptions(this.properties.contentSourceConnectionIds);
        return this.mergeFieldOptions(schemaOptions, resultFields, defaultFields, sharePointSchemaFields);
    }

    private async getSharePointSchemaFieldOptions(): Promise<IComboBoxOption[]> {
        if (!this.hasSharePointSchemaEntityType()) {
            return [];
        }

        if (this._availableSharePointSchemaFields.length > 0) {
            return this._availableSharePointSchemaFields;
        }

        try {
            const managedProperties = await this.getAvailableSharePointManagedProperties();
            this._availableSharePointSchemaFields = managedProperties
                .map((managedProperty) => ({
                    key: managedProperty.name,
                    text: managedProperty.name
                } as IComboBoxOption))
                .filter((option) => option.key);

            return this._availableSharePointSchemaFields;
        } catch (error) {
            console.warn('[PnP Modern Search][Microsoft Search] Unable to load SharePoint-backed schema fields from SharePoint search schema.', error);
            return [];
        }
    }

    private hasSharePointSchemaEntityType(): boolean {
        return this.properties.entityTypes.some((entityType) =>
            entityType === EntityType.Drive ||
            entityType === EntityType.DriveItem ||
            entityType === EntityType.List ||
            entityType === EntityType.ListItem ||
            entityType === EntityType.Site
        );
    }

    private async getAvailableSharePointManagedProperties(): Promise<Array<{ name: string }>> {
        const searchEndpointUrl = `${this._pageContext.web.absoluteUrl}/_api/search/postquery`;
        const searchQuery = {
            Querytext: '*',
            Refiners: 'ManagedProperties(filter=50000/0/*,deephits=50000,sort=name/ascending)',
            RowLimit: 1,
            SortList: [
                {
                    Property: '[DocId]',
                    Direction: 0
                }
            ]
        };

        const response = await this._spHttpClient.post(searchEndpointUrl, SPHttpClient.configurations.v1, {
            body: this.buildSharePointSearchRequestPayload(searchQuery),
            headers: {
                'odata-version': '3.0',
                'accept': 'application/json;odata=nometadata'
            }
        });

        if (!response.ok) {
            throw new Error(`${response['statusMessage']}`);
        }

        const searchResponse = await response.json() as any;
        const refiners = searchResponse?.PrimaryQueryResult?.RefinementResults?.Refiners || [];
        const managedProperties: Array<{ name: string }> = [];

        refiners.forEach((refiner) => {
            (refiner?.Entries || []).forEach((entry) => {
                if (entry?.RefinementName) {
                    managedProperties.push({
                        name: entry.RefinementName
                    });
                }
            });
        });

        return managedProperties;
    }

    private buildSharePointSearchRequestPayload(searchQuery: any): string {
        const queryPayload = cloneDeep(searchQuery);
        queryPayload.HitHighlightedProperties = this.fixSharePointSearchArrayProperty(queryPayload.HitHighlightedProperties);
        queryPayload.Properties = this.fixSharePointSearchArrayProperty(queryPayload.Properties);
        queryPayload.RefinementFilters = this.fixSharePointSearchArrayProperty(queryPayload.RefinementFilters);
        queryPayload.ReorderingRules = this.fixSharePointSearchArrayProperty(queryPayload.ReorderingRules);
        queryPayload.SelectProperties = this.fixSharePointSearchArrayProperty(queryPayload.SelectProperties);
        queryPayload.SortList = this.fixSharePointSearchArrayProperty(queryPayload.SortList);

        return JSON.stringify({
            request: {
                '__metadata': {
                    'type': 'Microsoft.Office.Server.Search.REST.SearchRequest'
                },
                ...queryPayload
            }
        });
    }

    private fixSharePointSearchArrayProperty(property: any): { results: any[] } {
        if (property == null) {
            return { results: [] };
        }

        return { results: Array.isArray(property) ? property : [property] };
    }

    private getDefaultFieldOptions(): IComboBoxOption[] {
        return this.properties.fields
            .filter(Boolean)
            .map((field) => ({
                key: field,
                text: field
            } as IComboBoxOption));
    }

    private getResultFieldOptions(): IComboBoxOption[] {
        return Array.from(this._availableFieldsFromResults)
            .map((field) => this.normalizeFieldName(field))
            .map((field) => ({
            key: field,
            text: field
        } as IComboBoxOption));
    }

    private mergeFieldOptions(...optionGroups: IComboBoxOption[][]): IComboBoxOption[] {
        const merged = new Map<string, IComboBoxOption>();

        optionGroups.filter(Boolean).forEach((options) => {
            options.forEach((option) => {
                if (option?.key !== undefined && option?.key !== null) {
                    const normalizedKey = this.normalizeFieldName(option.key.toString());
                    merged.set(normalizedKey, {
                        key: normalizedKey,
                        text: normalizedKey
                    });
                }
            });
        });

        return Array.from(merged.values());
    }

    private async getAvailableExternalConnectionIds(): Promise<IComboBoxOption[]> {
        const selectedConnectionOptions = (this.properties.contentSourceConnectionIds || []).map((id) => ({
            key: id,
            text: id
        } as IComboBoxOption));

        try {
            const msGraphClientFactory: MSGraphClientFactory = this.serviceScope.consume(MSGraphClientFactory.serviceKey);
            const msGraphClient = await msGraphClientFactory.getClient('3');

            let nextLink = '/external/connections?$top=200';
            const connections: IComboBoxOption[] = [];

            while (nextLink) {
                const response = await msGraphClient.api(nextLink).get() as { value?: Array<{ id?: string; name?: string; description?: string }>; '@odata.nextLink'?: string; };

                (response.value || []).forEach((connection) => {
                    if (connection.id) {
                        const connectionName = connection.name || connection.description || connection.id;
                        connections.push({
                            key: connection.id,
                            text: connectionName
                        });
                    }
                });

                nextLink = response['@odata.nextLink'] || null;
            }

            const deduped = new Map<string, IComboBoxOption>();
            [...selectedConnectionOptions, ...connections].forEach((option) => {
                deduped.set(option.key.toString(), option);
            });

            this.setExternalMetadataLoadState('connections', 'none');

            return Array.from(deduped.values());
        } catch (error) {
            // Expected until ExternalConnection.Read.All has been granted or when Graph external
            // connections are not available in the tenant. Keep manual/freeform entry working.
            const statusCode = this.getGraphErrorStatusCode(error);
            this.setExternalMetadataLoadState('connections', statusCode === 401 || statusCode === 403 ? 'permission' : 'generic');
            console.warn('[PnP Modern Search][Microsoft Search] Unable to load external connections from Microsoft Graph.', error);
            return selectedConnectionOptions;
        }
    }

    private async getExternalConnectionSchemaFieldOptions(connectionIds: string[]): Promise<IComboBoxOption[]> {
        const schemaFields = new Map<string, IComboBoxOption>();

        try {
            const msGraphClientFactory: MSGraphClientFactory = this.serviceScope.consume(MSGraphClientFactory.serviceKey);
            const msGraphClient = await msGraphClientFactory.getClient('3');

            for (const connectionId of connectionIds) {
                const response = await msGraphClient.api(`/external/connections/${connectionId}/schema`).get() as { properties?: Array<{ name?: string }>; };

                (response.properties || []).forEach((property) => {
                    if (property.name) {
                        schemaFields.set(property.name, {
                            key: property.name,
                            text: property.name
                        });
                    }
                });
            }

            this.setExternalMetadataLoadState('schema', 'none');
        } catch (error) {
            // Keep default fields available when permission isn't granted yet.
            const statusCode = this.getGraphErrorStatusCode(error);
            this.setExternalMetadataLoadState('schema', statusCode === 401 || statusCode === 403 ? 'permission' : 'generic');
            console.warn('[PnP Modern Search][Microsoft Search] Unable to load external connection schema properties from Microsoft Graph.', error);
        }

        return Array.from(schemaFields.values());
    }

    private getGraphErrorStatusCode(error: any): number | undefined {
        const status = error?.statusCode ?? error?.status ?? error?.response?.status;

        if (typeof status === 'number') {
            return status;
        }

        if (typeof status === 'string') {
            const parsedStatus = Number(status);
            return Number.isNaN(parsedStatus) ? undefined : parsedStatus;
        }

        return undefined;
    }

    private setExternalMetadataLoadState(scope: 'connections' | 'schema', state: 'none' | 'permission' | 'generic'): void {
        let hasChanged = false;

        if (scope === 'connections') {
            hasChanged = this._externalConnectionsLoadPermissionError !== (state === 'permission')
                || this._externalConnectionsLoadGenericError !== (state === 'generic');

            this._externalConnectionsLoadPermissionError = state === 'permission';
            this._externalConnectionsLoadGenericError = state === 'generic';
        } else {
            hasChanged = this._externalSchemaLoadPermissionError !== (state === 'permission')
                || this._externalSchemaLoadGenericError !== (state === 'generic');

            this._externalSchemaLoadPermissionError = state === 'permission';
            this._externalSchemaLoadGenericError = state === 'generic';
        }

        if (hasChanged) {
            this.context.propertyPane.refresh();
        }
    }

    private resetExternalMetadataLoadState(): void {
        this._externalConnectionsLoadPermissionError = false;
        this._externalConnectionsLoadGenericError = false;
        this._externalSchemaLoadPermissionError = false;
        this._externalSchemaLoadGenericError = false;
    }

    private getExternalMetadataWarningMessage(): string | undefined {
        if (this._externalConnectionsLoadPermissionError) {
            return commonStrings.DataSources.MicrosoftSearch.ExternalMetadataPermissionWarning;
        }

        if (this._externalConnectionsLoadGenericError) {
            return commonStrings.DataSources.MicrosoftSearch.ExternalMetadataLoadWarning;
        }

        // Schema metadata retrieval can still fail for specific connections even when
        // the connection list itself loaded successfully. If users already have selected
        // fields configured, the warning is not actionable and creates noise.
        const hasSelectedFields = (this.properties.fields || []).some(Boolean);
        if (!hasSelectedFields && (this._externalSchemaLoadPermissionError || this._externalSchemaLoadGenericError)) {
            return commonStrings.DataSources.MicrosoftSearch.ExternalMetadataLoadWarning;
        }

        return undefined;
    }

    public getTemplateSlots(): ITemplateSlot[] {
        // Return entity-type-specific slot fields
        const hasPerson = this.properties.entityTypes.includes(EntityType.Person);
        const hasBookmark = this.properties.entityTypes.includes(EntityType.Bookmark);
        const hasAcronym = this.properties.entityTypes.includes(EntityType.Acronym);
        const hasSharePointTypes = this.properties.entityTypes.some(et =>
            et === EntityType.ListItem ||
            et === EntityType.DriveItem ||
            et === EntityType.Site ||
            et === EntityType.List ||
            et === EntityType.Drive ||
            et === EntityType.ExternalItem
        );

        // If only Person, Bookmark, or Acronym (no SharePoint types), show specific slots
        if (!hasSharePointTypes) {
            // Person entity slots
            if (hasPerson) {
                return [
                    {
                        slotName: BuiltinTemplateSlots.Title,
                        slotField: 'displayName'
                    },
                    {
                        slotName: BuiltinTemplateSlots.Summary,
                        slotField: 'jobTitle'
                    },
                    {
                        slotName: BuiltinTemplateSlots.PreviewUrl,
                        slotField: 'AutoPreviewUrl'
                    },
                    {
                        slotName: BuiltinTemplateSlots.Id,
                        slotField: 'id'
                    },
                    {
                        slotName: 'Department',
                        slotField: 'department'
                    },
                    {
                        slotName: 'Office',
                        slotField: 'officeLocation'
                    },
                    {
                        slotName: 'Email',
                        slotField: 'userPrincipalName'
                    },
                    {
                        slotName: 'Phone',
                        slotField: 'phones'
                    }
                ];
            }

            // Bookmark entity slots
            if (hasBookmark) {
                return [
                    {
                        slotName: BuiltinTemplateSlots.Title,
                        slotField: 'displayName'
                    },
                    {
                        slotName: BuiltinTemplateSlots.Summary,
                        slotField: 'description'
                    },
                    {
                        slotName: BuiltinTemplateSlots.PreviewUrl,
                        slotField: 'AutoPreviewUrl'
                    },
                    {
                        slotName: BuiltinTemplateSlots.Id,
                        slotField: 'id'
                    },
                    {
                        slotName: 'Categories',
                        slotField: 'categories'
                    }
                ];
            }

            // Acronym entity slots
            if (hasAcronym) {
                return [
                    {
                        slotName: BuiltinTemplateSlots.Title,
                        slotField: 'displayName'
                    },
                    {
                        slotName: BuiltinTemplateSlots.Summary,
                        slotField: 'description'
                    },
                    {
                        slotName: BuiltinTemplateSlots.PreviewUrl,
                        slotField: 'AutoPreviewUrl'
                    }
                ];
            }
        }

        // Default SharePoint slots (for SharePoint entity types or mixed scenarios)
        return [
            {
                slotName: BuiltinTemplateSlots.Title,
                slotField: 'title'
            },
            {
                slotName: BuiltinTemplateSlots.Path,
                slotField: 'resource.webUrl'
            },
            {
                slotName: BuiltinTemplateSlots.Summary,
                slotField: 'summary'
            },
            {
                slotName: BuiltinTemplateSlots.FileType,
                slotField: 'FileType'
            },
            {
                slotName: BuiltinTemplateSlots.PreviewImageUrl,
                slotField: 'AutoPreviewImageUrl' // Field added automatically
            },
            {
                slotName: BuiltinTemplateSlots.PreviewUrl,
                slotField: 'AutoPreviewUrl' // Field added automatically
            },
            {
                slotName: BuiltinTemplateSlots.Tags,
                slotField: 'owstaxidmetadataalltagsinfo'
            },
            {
                slotName: BuiltinTemplateSlots.Date,
                slotField: 'resource.createdDateTime'
            },
            {
                slotName: BuiltinTemplateSlots.SiteId,
                slotField: 'resource.listItem.fields.siteId'
            },
            {
                slotName: BuiltinTemplateSlots.WebId,
                slotField: 'resource.fields.normWebID'
            },
            {
                slotName: BuiltinTemplateSlots.ListId,
                slotField: 'resource.parentReference.sharepointIds.listId'
            },
            {
                slotName: BuiltinTemplateSlots.ItemId,
                slotField: 'resource.listItem.id'
            },
            {
                slotName: BuiltinTemplateSlots.IsFolder,
                slotField: 'resource.fields.contentTypeId'
            },
            {
                slotName: BuiltinTemplateSlots.Id,
                slotField: 'hitId'
            },
            {
                slotName: BuiltinTemplateSlots.Author,
                slotField: 'AuthorOWSUSER'
            },
            {
                slotName: BuiltinTemplateSlots.ContentClass,
                slotField: 'resource.fields.contentClass'
            },
            {
                slotName: 'SPWebURL',
                slotField: 'sitePath'
            },
            {
                slotName: 'SiteTitle',
                slotField: 'siteTitle'
            },
        ];
    }

    public getSortableFields(): string[] {
        return this.properties.sortProperties.filter(sort => sort.isUserSort).map(field => field.sortField);
    }
    /**
    * Enhance items properties with preview information
    * @param data the data to enhance
    * @param slots the configured template slots
    */
    public async getItemsPreview(data: IDataSourceData, slots: { [key: string]: string }): Promise<IDataSourceData> {
        // Auto determined preview URL for Microsoft Search
        if (slots[BuiltinTemplateSlots.PreviewUrl] === AutoCalculatedDataSourceFields.AutoPreviewUrl) {
            data.items = data.items.map(item => this.generateItemPreviewUrl(item, slots));
        }

        // Auto determined preview image URL (thumbnail)
        if (slots[BuiltinTemplateSlots.PreviewImageUrl] === AutoCalculatedDataSourceFields.AutoPreviewImageUrl) {
            const validPreviewExt = DataSourceHelper.getValidPreviewExtensions();
            data.items = data.items.map(item => this.generateItemThumbnailUrl(item, slots, validPreviewExt));
        }

        return data;
    }

    private generateItemPreviewUrl(item: any, slots: { [key: string]: string }): any {
        const entityType = this.getEntityType(item);

        switch (entityType) {
            case EntityType.Message:
            case EntityType.TeamsMessage:
                this.applyMessagePreviewUrl(item);
                break;
            case EntityType.Event:
                this.applyEventPreviewUrl(item);
                break;
            case EntityType.Person:
                this.applyPersonPreviewUrl(item);
                break;
            case EntityType.Acronym:
                this.applyAcronymPreviewUrl(item);
                break;
            case EntityType.Bookmark:
                this.applyBookmarkPreviewUrl(item);
                break;
            case EntityType.ListItem:
            case EntityType.DriveItem:
            case EntityType.Drive:
            case EntityType.Site:
            case EntityType.List:
            case EntityType.ExternalItem:
                this.applySharePointPreviewUrl(item, slots, entityType);
                break;
            default:
                break;
        }

        return item;
    }

    private generateItemThumbnailUrl(item: any, slots: { [key: string]: string }, validPreviewExt: string[]): any {
        const entityType = this.getEntityType(item);

        switch (entityType) {
            case EntityType.Message:
            case EntityType.TeamsMessage:
            case EntityType.Event:
            case EntityType.Person:
                return item;
            case EntityType.ListItem:
            case EntityType.DriveItem:
            case EntityType.Drive:
            case EntityType.Site:
            case EntityType.List:
            case EntityType.ExternalItem:
                this.applySharePointPreviewImage(item, slots, validPreviewExt);
                break;
            default:
                break;
        }

        return item;
    }

    private generateGraphThumbnail(item: any, siteId: string, itemId: string, slots: { [key: string]: string }): void {
        const driveId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.DriveId]);
        if (driveId && siteId && itemId) {
            item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = DataSourceHelper.generateGraphThumbnailUrl({
                baseUrl: this.context.pageContext.site.absoluteUrl,
                siteId,
                driveId,
                itemId
            });
        }
    }

    private getEntityType(item: any): EntityType | undefined {
        const odataType = item?.resource?.['@odata.type'] as string | undefined;
        if (!odataType) {
            return undefined;
        }

        const normalized = odataType.replace('#microsoft.graph.', '');

        if (normalized === 'search.acronym') {
            return EntityType.Acronym;
        }

        if (normalized === 'search.bookmark') {
            return EntityType.Bookmark;
        }

        return normalized as EntityType;
    }

    private applyMessagePreviewUrl(item: any): void {
        const webLink = ObjectHelper.byPath(item, "resource.webLink");
        if (webLink) {
            item.AutoPreviewUrl = webLink;
        }
    }

    private applyEventPreviewUrl(item: any): void {
        this.applyMessagePreviewUrl(item);
    }

    private applyPersonPreviewUrl(item: any): void {
        const userPrincipalName = ObjectHelper.byPath(item, "resource.userPrincipalName");
        const mail = ObjectHelper.byPath(item, "resource.mail");
        const imAddress = ObjectHelper.byPath(item, "resource.imAddress");

        const email = userPrincipalName || mail;
        if (email) {
            item.AutoPreviewUrl = `mailto:${email}`;
            return;
        }

        if (imAddress) {
            item.AutoPreviewUrl = imAddress;
        }
    }

    private applyAcronymPreviewUrl(item: any): void {
        const webUrl = ObjectHelper.byPath(item, "resource.webUrl");
        if (webUrl) {
            item.AutoPreviewUrl = webUrl;
        }
    }

    private applyBookmarkPreviewUrl(item: any): void {
        this.applyAcronymPreviewUrl(item);
    }

    private applySharePointPreviewUrl(item: any, slots: { [key: string]: string }, entityType?: EntityType): void {
        const contentTypeId = this.getSharePointField(item, "contentTypeId");
        const isContainer = DataSourceHelper.isContainerContentType(contentTypeId) || this.isContainerEntityType(entityType);

        const webUrl = this.getSharePointField(item, "sitePath") || ObjectHelper.byPath(item, "resource.webUrl") || ObjectHelper.byPath(item, "webUrl");
        const pathProperty = this.getSlotValue(item, slots, BuiltinTemplateSlots.Path) || webUrl || item["DefaultEncodingURL"];
        const fileType = this.getSlotValue(item, slots, BuiltinTemplateSlots.FileType) || this.getSharePointField(item, "filetype") || this.getSharePointField(item, "fileType");

        const previewUrl = DataSourceHelper.generatePreviewUrl({
            webUrl: webUrl,
            uniqueId: this.getSharePointListItemId(item),
            fileType: fileType,
            pathProperty: pathProperty,
            isContainer: isContainer
        });

        if (previewUrl) {
            item.AutoPreviewUrl = previewUrl;
        }
    }

    private isContainerEntityType(entityType: EntityType | undefined): boolean {
        return entityType === EntityType.Site || entityType === EntityType.List || entityType === EntityType.Drive;
    }

    private getSlotValue(item: any, slots: { [key: string]: string }, slotName: string): string | undefined {
        const slotPath = slots[slotName];
        if (!slotPath) {
            return undefined;
        }

        return item[slotPath] || ObjectHelper.byPath(item, slotPath);
    }

    private getSharePointField(item: any, fieldName: string): string | undefined {
        return ObjectHelper.byPath(item, `resource.listItem.fields.${fieldName}`)
            || ObjectHelper.byPath(item, `resource.fields.${fieldName}`)
            || ObjectHelper.byPath(item, `resource.${fieldName}`)
            || ObjectHelper.byPath(item, fieldName);
    }

    private getSharePointListItemId(item: any): string | undefined {
        return ObjectHelper.byPath(item, "resource.listItem.id")
            || ObjectHelper.byPath(item, "resource.parentReference.sharepointIds.listItemUniqueId")
            || ObjectHelper.byPath(item, "listItemUniqueId")
            || ObjectHelper.byPath(item, "resource.id")
            || ObjectHelper.byPath(item, "id");
    }

    private applySharePointPreviewImage(item: any, slots: { [key: string]: string }, validPreviewExt: string[]): void {
        const contentClass = ObjectHelper.byPath(item, slots.ContentClass);

        if (this.isSiteOrWebContentClass(contentClass)) {
            item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = ObjectHelper.byPath(item, "SiteLogo");
        } else {
            this.applyNonSitePreviewImage(item, slots, validPreviewExt);
        }

        // Validate URL is from trusted domain
        item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = DataSourceHelper.validatePreviewImageUrl(
            item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl]
        );
    }

    private isSiteOrWebContentClass(contentClass: any): boolean {
        return !isEmpty(contentClass) && (contentClass.toLocaleLowerCase() === "sts_site" || contentClass.toLocaleLowerCase() === "sts_web");
    }

    private applyNonSitePreviewImage(item: any, slots: { [key: string]: string }, validPreviewExt: string[]): void {
        const siteId = ObjectHelper.byPath(item, slots.SiteId) || this.getSharePointField(item, "siteId");
        const webId = ObjectHelper.byPath(item, slots.WebId) || this.getSharePointField(item, "normWebID") || this.getSharePointField(item, "webId");
        const listId = ObjectHelper.byPath(item, slots.ListId) || this.getSharePointField(item, "listId") || ObjectHelper.byPath(item, "resource.parentReference.sharepointIds.listId");
        const itemId = ObjectHelper.byPath(item, slots.ItemId) || this.getSharePointListItemId(item);
        const isFolder = ObjectHelper.byPath(item, slots.IsFolder) || this.getSharePointField(item, "contentTypeId");
        const isContainerType = DataSourceHelper.isContainerType(isFolder);

        // Try thumbnail URL first
        const thumbNailUrl = DataSourceHelper.enhanceThumbnailUrl(ObjectHelper.byPath(item, "PictureThumbnailURL"));

        if (thumbNailUrl) {
            item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = thumbNailUrl;
        } else if (siteId && listId && itemId && !isContainerType) {
            this.applySharePointItemThumbnail(item, siteId, webId, listId, itemId, validPreviewExt);
        } else {
            this.generateGraphThumbnail(item, siteId, itemId, slots);
        }
    }

    private applySharePointItemThumbnail(item: any, siteId: string, webId: string, listId: string, itemId: string, validPreviewExt: string[]): void {
        const itemFileType = this.getSharePointField(item, "filetype") || this.getSharePointField(item, "fileType");

        if (itemFileType && validPreviewExt.includes(itemFileType.toUpperCase())) {
            const resourceWebUrl = ObjectHelper.byPath(item, "resource.webUrl") || ObjectHelper.byPath(item, "webUrl");
            let tenantUrl = resourceWebUrl;

            if (resourceWebUrl) {
                tenantUrl = resourceWebUrl.split('/sites/')[0];
                if (tenantUrl === resourceWebUrl) {
                    tenantUrl = resourceWebUrl.split('/teams/')[0];
                }
            }

            const resolvedSiteId = siteId || this.getSharePointField(item, "siteId");
            const resolvedListId = listId || ObjectHelper.byPath(item, "resource.parentReference.sharepointIds.listId");
            const resolvedItemId = ObjectHelper.byPath(item, "resource.parentReference.sharepointIds.listItemUniqueId") || itemId;

            if (tenantUrl && resolvedSiteId && resolvedListId && resolvedItemId) {
                item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = DataSourceHelper.generateSharePointThumbnailUrl({
                    baseUrl: tenantUrl,
                    siteId: resolvedSiteId,
                    webId: webId,
                    listId: resolvedListId,
                    itemId: resolvedItemId
                });
            }
        }
    }

    private initProperties(): void {
        this.properties.entityTypes = this.properties.entityTypes ?? [EntityType.DriveItem];

        this.properties.fields = this.properties.fields ?? this._defaultDriveItemFields;
        this.properties.sortProperties = this.properties.sortProperties ?? [];
        this.properties.sortList = this.properties.sortProperties;
        this.properties.contentSourceConnectionIds = this.properties.contentSourceConnectionIds ?? [];

        this.properties.queryAlterationOptions = this.properties.queryAlterationOptions ?? { enableModification: false, enableSuggestion: false };
        this.properties.queryTemplate = this.properties.queryTemplate ? this.properties.queryTemplate : "{searchTerms}";
        this.properties.useBetaEndpoint = this.properties.useBetaEndpoint ?? false;
        this.properties.enableResultTypes = this.properties.enableResultTypes ?? false;
        this.properties.trimDuplicates = this.properties.trimDuplicates ?? false;
        this.properties.collapseProperties = this.properties.collapseProperties ?? [];

        if (this.properties.useBetaEndpoint) {
            this._microsoftSearchUrl = `${this.context?.pageContext?.legacyPageContext?.msGraphEndpointUrl}/beta/search/query`;
        } else {
            this._microsoftSearchUrl = `${this.context?.pageContext?.legacyPageContext?.msGraphEndpointUrl}/v1.0/search/query`;
        }
        this.properties.showSPEmbeddedContent = this.properties.showSPEmbeddedContent ?? false;
        this.properties.showMSArchivedContent = this.properties.showMSArchivedContent ?? false;
    }

    private async buildMicrosoftSearchQuery(dataContext: IDataContext): Promise<IMicrosoftSearchQuery> {
        const queryText = await this.resolveQueryText(dataContext);
        let queryTemplate = await this.resolveQueryTemplate(dataContext, queryText);
        const from = this.calculatePagingOffset(dataContext);

        const aggregations = this.buildAggregations(dataContext);
        const filters = this.buildFilters(dataContext);
        const contentSources = this.buildContentSources();
        const sortProperties = this.buildSortProperties(dataContext);
        const { includeHiddenContent, queryTemplate: finalTemplate } = this.determineHiddenContentSettings(queryTemplate);

        const searchRequest = this.buildSearchRequest({
            queryText,
            queryTemplate: finalTemplate.concat(` ${filters}`),
            from,
            aggregations,
            aggregationFilters: [], // The aggregationFilters input cannot combine multiple filters under an OR relationship, so the queryTemplate field is used (issue #4813)
            contentSources,
            sortProperties,
            includeHiddenContent,
            itemsCountPerPage: dataContext.itemsCountPerPage
        });

        const searchQuery: IMicrosoftSearchQuery = {
            requests: [searchRequest]
        };

        return searchQuery;
    }

    private async resolveQueryText(dataContext: IDataContext): Promise<string> {
        if (dataContext.inputQueryText) {
            return await this._tokenService.resolveTokens(dataContext.inputQueryText);
        }
        return '*'; // Default query string
    }

    private async resolveQueryTemplate(dataContext: IDataContext, queryText: string): Promise<string> {
        let queryTemplate = await this._tokenService.resolveTokens(this.properties.queryTemplate);

        // For Bookmark and Acronym entities, if no input query text but queryTemplate exists, use template as queryString
        if ((this.properties.entityTypes.includes(EntityType.Bookmark) || this.properties.entityTypes.includes(EntityType.Acronym)) &&
            !dataContext.inputQueryText && queryTemplate?.trim()) {
            return ''; // Template was used as queryText, clear it
        }

        // People search does not support "*" as a wildcard. Use "?" when only searching for person.
        if (this.properties.entityTypes.length === 1 && this.properties.entityTypes[0] === EntityType.Person && queryText === '*') {
            // queryText would be adjusted but we return the template here
        }

        return queryTemplate;
    }

    private calculatePagingOffset(dataContext: IDataContext): number {
        if (dataContext.pageNumber > 1) {
            return (dataContext.pageNumber - 1) * dataContext.itemsCountPerPage;
        }
        return 0;
    }

    private buildAggregations(dataContext: IDataContext): ISearchRequestAggregation[] {
        return dataContext.filters.filtersConfiguration.filter(filterConfig => {
            return filterConfig.selectedTemplate !== BuiltinFilterTemplates.StaticPeople;
        }).map(filterConfig => {
            const aggregation: ISearchRequestAggregation = {
                field: filterConfig.filterName,
                bucketDefinition: {
                    isDescending: filterConfig.sortDirection !== FilterSortDirection.Ascending,
                    minimumCount: 1,
                    sortBy: filterConfig.sortBy === FilterSortType.ByCount ? SearchAggregationSortBy.Count : SearchAggregationSortBy.KeyAsString
                },
                size: this.getEffectiveAggregationLimit(filterConfig?.maxBuckets ?? 10)
            };

            if (filterConfig.selectedTemplate === "DateIntervalFilterTemplate") {
                aggregation.bucketDefinition.ranges = this.buildDateRanges();
            }

            return aggregation;
        });
    }

    private buildDateRanges(): any[] {
        const pastYear = this.dayjs(new Date()).subtract(1, 'years').subtract(1, 'minute').toISOString();
        const past3Months = this.dayjs(new Date()).subtract(3, 'months').subtract(1, 'minute').toISOString();
        const pastMonth = this.dayjs(new Date()).subtract(1, 'months').subtract(1, 'minute').toISOString();
        const pastWeek = this.dayjs(new Date()).subtract(1, 'week').subtract(1, 'minute').toISOString();
        const past24hours = this.dayjs(new Date()).subtract(24, 'hours').subtract(1, 'minute').toISOString();
        const today = new Date().toISOString();

        return [
            { to: pastYear },
            { from: pastYear, to: past3Months },
            { from: past3Months, to: pastMonth },
            { from: pastMonth, to: pastWeek },
            { from: pastWeek, to: past24hours },
            { from: past24hours, to: today },
            { from: today }
        ];
    }

    private buildFilters(dataContext: IDataContext): string {
        if (dataContext.filters.selectedFilters.length > 0) {
            // The Microsoft Search API expects KQL-formatted refinement strings in aggregationFilters.
            // Using FQL here causes multi-filter combinations to return 0 results (issue #4796).
            const refinementString = DataFilterHelper.buildKqlRefinementString(
                dataContext.filters.selectedFilters,
                this.dayjs,
                dataContext.filters.filterOperator
            );

            if (!isEmpty(refinementString)) {
                return refinementString;
            }
        }

        return "";
    }

    private buildContentSources(): string[] {
        const contentSources: string[] = [];

        if (this.properties.entityTypes.includes(EntityType.ExternalItem)) {
            this.properties.contentSourceConnectionIds.forEach(id => {
                contentSources.push(`/external/connections/${id}`);
            });
        }

        return contentSources;
    }

    private buildSortProperties(dataContext: IDataContext): ISearchSortProperty[] {
        const sortProperties: ISearchSortProperty[] = [];

        // Sort is only available for 'ListItem' and ExternalItem
        if (!this.properties.entityTypes.includes(EntityType.ListItem) &&
            !this.properties.entityTypes.includes(EntityType.ExternalItem)) {
            return sortProperties;
        }

        if (dataContext.sorting?.selectedSortFieldName && dataContext.sorting?.selectedSortDirection) {
            sortProperties.push({
                name: dataContext.sorting.selectedSortFieldName,
                isDescending: dataContext.sorting.selectedSortDirection === SortFieldDirection.Descending
            });
        } else {
            this.properties.sortProperties.filter(s => s.isDefaultSort).forEach(sortProperty => {
                sortProperties.push({
                    name: sortProperty.sortField,
                    isDescending: sortProperty.sortDirection === SortFieldDirection.Descending
                });
            });
        }

        return sortProperties;
    }

    private determineHiddenContentSettings(queryTemplate: string): { includeHiddenContent: boolean; queryTemplate: string } {
        let includeHiddenContent = false;
        let template = queryTemplate;

        if (this.properties.showMSArchivedContent && this.properties.showSPEmbeddedContent) {
            includeHiddenContent = true;
        } else if (this.properties.showMSArchivedContent && !this.properties.showSPEmbeddedContent) {
            includeHiddenContent = true;
            template = template + " AND isarchived:true";
        } else if (!this.properties.showMSArchivedContent && this.properties.showSPEmbeddedContent) {
            includeHiddenContent = true;
            template = template + " AND NOT isarchived:true";
        }

        return { includeHiddenContent, queryTemplate: template };
    }

    private buildSearchRequest(params: {
        queryText: string;
        queryTemplate: string;
        from: number;
        aggregations: ISearchRequestAggregation[];
        aggregationFilters: string[];
        contentSources: string[];
        sortProperties: ISearchSortProperty[];
        includeHiddenContent: boolean;
        itemsCountPerPage: number;
    }): IMicrosoftSearchRequest {
        let searchRequest: IMicrosoftSearchRequest = {
            entityTypes: this.properties.entityTypes,
            query: {
                queryString: params.queryText,
                queryTemplate: params.queryTemplate
            },
            sharePointOneDriveOptions: {
                includeHiddenContent: params.includeHiddenContent
            },
            size: params.itemsCountPerPage
        };

        this.applyPaging(searchRequest, params.from);
        this.applyFields(searchRequest);
        this.applyAggregations(searchRequest, params.aggregations);
        this.applyFilters(searchRequest, params.aggregationFilters);
        this.applySorting(searchRequest, params.sortProperties);
        this.applyContentSources(searchRequest, params.contentSources);
        this.applyBetaOptions(searchRequest);
        this.applyQueryAlterationOptions(searchRequest);
        this.applyResultTemplateOptions(searchRequest);

        return searchRequest;
    }

    private applyPaging(searchRequest: IMicrosoftSearchRequest, from: number): void {
        // If bookmark or Acronym, paging is not supported
        if (!(this.properties.entityTypes.includes(EntityType.Bookmark) && this.properties.entityTypes.includes(EntityType.Acronym))) {
            searchRequest.from = from;
        }
    }

    private applyFields(searchRequest: IMicrosoftSearchRequest): void {
        if (this.properties.fields.length > 0) {
            const fieldsToUse = this.properties.fields.filter(Boolean);

            if (!(this.properties.entityTypes.includes(EntityType.Acronym) ||
                this.properties.entityTypes.includes(EntityType.Bookmark)) && fieldsToUse.length > 0) {
                searchRequest.fields = fieldsToUse;
            }
        }
    }

    private applyAggregations(searchRequest: IMicrosoftSearchRequest, aggregations: ISearchRequestAggregation[]): void {
        if (aggregations.length > 0) {
            searchRequest.aggregations = aggregations.filter(Boolean);
        }
    }

    private applyFilters(searchRequest: IMicrosoftSearchRequest, aggregationFilters: string[]): void {
        if (aggregationFilters.length > 0) {
            searchRequest.aggregationFilters = aggregationFilters;
        }
    }

    private applySorting(searchRequest: IMicrosoftSearchRequest, sortProperties: ISearchSortProperty[]): void {
        if (sortProperties.length > 0) {
            searchRequest.sortProperties = sortProperties;
        }
    }

    private applyContentSources(searchRequest: IMicrosoftSearchRequest, contentSources: string[]): void {
        if (contentSources.length > 0) {
            searchRequest.contentSources = contentSources;
        }
    }

    private applyBetaOptions(searchRequest: IMicrosoftSearchRequest): void {
        if (this.properties.useBetaEndpoint) {
            if (this.properties.trimDuplicates) {
                searchRequest.trimDuplicates = this.properties.trimDuplicates;
            }

            if (this.properties.collapseProperties.length > 0) {
                searchRequest.collapseProperties = this.properties.collapseProperties;
            }
        }
    }

    private applyQueryAlterationOptions(searchRequest: IMicrosoftSearchRequest): void {
        searchRequest.queryAlterationOptions = {
            enableModification: this.properties.queryAlterationOptions.enableModification,
            enableSuggestion: this.properties.queryAlterationOptions.enableSuggestion
        };
    }

    private applyResultTemplateOptions(searchRequest: IMicrosoftSearchRequest): void {
        const supportedTypes = new Set([EntityType.ExternalItem, EntityType.ListItem]);
        if (this.properties.enableResultTypes && this.properties.entityTypes.every(e => supportedTypes.has(e))) {
            searchRequest.resultTemplateOptions = {
                enableResultTemplate: true
            };
        }
    }

    /**
     * Retrieves data from Microsoft Graph API
     * @param searchRequest the Microsoft Search search request
     */
    private async search(searchQuery: IMicrosoftSearchQuery): Promise<IMicrosoftSearchDataSourceData> {

        let itemsCount = 0;
        let response: IMicrosoftSearchDataSourceData = {
            items: [],
            filters: []
        };
        let aggregationResults: IDataFilterResult[] = [];
        this._availableFieldsFromResults.clear();

        // Get an instance to the MSGraphClient
        const msGraphClientFactory: MSGraphClientFactory = this.serviceScope.consume(MSGraphClientFactory.serviceKey);
        const msGraphClient = await msGraphClientFactory.getClient('3');
        const request = msGraphClient.api(this._microsoftSearchUrl);

        let culture = LocalizationHelper.getTranslatedCultureFromUrl();
        if (!culture) {
            culture = this.context.pageContext.cultureInfo.currentUICultureName;
        }

        const jsonResponse: IMicrosoftSearchResponse = await request.headers({ 'SdkVersion': 'pnpmodernsearch/' + this.context.manifest.version, 'accept-language': culture }).post(searchQuery);

        if (jsonResponse.value && Array.isArray(jsonResponse.value)) {

            jsonResponse.value.forEach((value: IMicrosoftSearchResultSet) => {

                // Map results
                value.hitsContainers.forEach(hitContainer => {
                    itemsCount += hitContainer.total;

                    if (hitContainer.hits) {
                        const hits = hitContainer.hits.map(hit => this.processSearchHit(hit));
                        response.items = response.items.concat(hits);
                    }

                    if (hitContainer.aggregations) {
                        // Map refinement results
                        hitContainer.aggregations.forEach((aggregation) => {
                            this.processAggregationResults(aggregation, aggregationResults);
                        });
                        response.filters = aggregationResults;
                    }
                });

                if (value?.queryAlterationResponse) {
                    response.queryAlterationResponse = value.queryAlterationResponse;
                }

                if (value?.resultTemplates) {
                    response.resultTemplates = value.resultTemplates;
                }
            });
        }

        this._itemsCount = itemsCount;

        return response;
    }

    private processSearchHit(hit: any): any {
        this.collectAvailableFields(hit);
        this.flattenResourceProperties(hit);
        this.flattenListItemFields(hit);
        this.buildAuthorOWSUSER(hit);
        this.createFileTypeAlias(hit);
        return hit;
    }

    private collectAvailableFields(hit: any): void {
        if (this.isExternalItemHit(hit)) {
            return;
        }

        const sources = this.getAvailableFieldSources(hit);

        sources.forEach((source) => {
            if (!source || typeof source !== 'object') {
                return;
            }

            Object.keys(source).forEach((field) => {
                if (field !== '@odata.type' && field !== 'listItem' && field !== 'fields' && field !== 'properties') {
                    this._availableFieldsFromResults.add(this.normalizeFieldName(field));
                }
            });
        });
    }

    private isExternalItemHit(hit: any): boolean {
        const resourceType = hit?.resource?.['@odata.type'];
        return typeof resourceType === 'string' && resourceType.toLowerCase().includes('externalitem');
    }

    private getAvailableFieldSources(hit: any): any[] {
        const resource = hit?.resource;
        const sources: any[] = [];

        if (resource?.listItem?.fields) {
            sources.push(resource.listItem.fields);
        }

        if (resource?.fields) {
            sources.push(resource.fields);
        } else if (!resource?.properties && resource) {
            // Site, Drive, List and similar entities expose their values directly on resource.
            sources.push(resource);
        }

        return sources;
    }

    private normalizeFieldName(fieldName: string): string {
        const normalized = (fieldName || '').trim();
        if (normalized.toLowerCase() === 'filetype') {
            return 'fileType';
        }

        return normalized;
    }

    private flattenResourceProperties(hit: any): void {
        // 'externalItem' will contain resource.properties but 'listItem' will be resource.fields
        // For other entity types like bookmark, acronym, person, message, event - flatten root properties from resource
        let propertiesFieldName: string | null = null;
        if (hit.resource.properties) {
            propertiesFieldName = 'properties';
        } else if (hit.resource.fields) {
            propertiesFieldName = 'fields';
        }

        if (propertiesFieldName) {
            Object.keys(hit.resource[propertiesFieldName]).forEach(field => {
                this.copyFieldWithAliases(hit, field, hit.resource[propertiesFieldName][field]);
            });
        } else {
            // For entity types without properties or fields (bookmark, acronym, person, etc.), 
            // flatten root properties from resource directly
            Object.keys(hit.resource).forEach(field => {
                if (field !== '@odata.type' && !(field in hit)) {
                    this.copyFieldWithAliases(hit, field, hit.resource[field]);
                }
            });
        }
    }

    private flattenListItemFields(hit: any): void {
        // Also flatten listItem.fields for driveItem entities backed by SharePoint
        if (hit.resource?.listItem?.fields) {
            Object.keys(hit.resource.listItem.fields).forEach(field => {
                this.copyFieldWithAliases(hit, field, hit.resource.listItem.fields[field]);
            });
        }
    }

    private copyFieldWithAliases(target: any, fieldName: string, value: any): void {
        if (!target || !fieldName) {
            return;
        }

        target[fieldName] = value;

        const normalizedFieldName = fieldName.trim();
        const pascalCaseFieldName = normalizedFieldName.charAt(0).toUpperCase() + normalizedFieldName.slice(1);
        const lowerCaseFieldName = normalizedFieldName.charAt(0).toLowerCase() + normalizedFieldName.slice(1);
        const camelCaseFieldName = normalizedFieldName.charAt(0).toLowerCase() + normalizedFieldName.slice(1);

        if (!(pascalCaseFieldName in target)) {
            target[pascalCaseFieldName] = value;
        }

        if (!(lowerCaseFieldName in target)) {
            target[lowerCaseFieldName] = value;
        }

        if (!(camelCaseFieldName in target)) {
            target[camelCaseFieldName] = value;
        }
    }

    private buildAuthorOWSUSER(hit: any): void {
        // Build a flat AuthorOWSUSER alias: Email|DisplayName|AADObjectId|UPN
        try {
            const resource = hit.resource || {};
            const createdByUser = resource?.createdBy?.user;

            // Get email, display name, and AAD Object ID from createdBy.user
            let email: string | undefined = createdByUser?.email;
            let dispName: string | undefined = createdByUser?.displayName?.trim();
            let aadObjectId: string | undefined = createdByUser?.id;

            // For UPN: try userPrincipalName from flat fields first (Person entity),
            // then fall back to email (common in M365)
            let upn: string | undefined = hit.userPrincipalName || email;

            // Additional fallbacks for messages where author may be in `from.emailAddress`
            if (!email) {
                email = resource?.from?.emailAddress?.address || hit.mail;
            }
            if (!dispName) {
                dispName = resource?.from?.emailAddress?.name?.trim();
            }
            if (!upn) {
                upn = email; // Final fallback
            }

            if (email || dispName || aadObjectId || upn) {
                hit.AuthorOWSUSER = `${email ?? ''}|${dispName ?? ''}|${aadObjectId ?? ''}|${upn ?? ''}`;
            }
        } catch {
            // Non-fatal: entity types may not include these shapes
        }
    }

    private createFileTypeAlias(hit: any): void {
        // Create FileType alias (capitalized) for compatibility with SharePoint Search field name
        if (hit.filetype) {
            hit.FileType = hit.filetype;
        }
    }

    private processAggregationResults(aggregation: any, aggregationResults: IDataFilterResult[]): void {
        const values: IDataFilterResultValue[] = this.mapBucketValues(aggregation.buckets);
        aggregationResults.push({
            filterName: aggregation.field,
            values: values
        });
    }

    private mapBucketValues(buckets: any[]): IDataFilterResultValue[] {
        return buckets.map((bucket) => ({
            count: bucket.count,
            name: bucket.key,
            value: bucket.aggregationFilterToken,
            operator: FilterComparisonOperator.Contains
        } as IDataFilterResultValue));
    }
}
