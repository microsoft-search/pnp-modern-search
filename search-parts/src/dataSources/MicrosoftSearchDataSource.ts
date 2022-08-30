import { BaseDataSource, FilterSortType, FilterSortDirection, ITemplateSlot, BuiltinTemplateSlots, IDataContext, ITokenService, FilterBehavior, PagingBehavior, IDataFilterResult, IDataFilterResultValue, FilterComparisonOperator } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneLabel, IPropertyPaneField, PropertyPaneToggle, PropertyPaneHorizontalRule } from "@microsoft/sp-property-pane";
import { cloneDeep, isEmpty } from '@microsoft/sp-lodash-subset';
import { MSGraphClientFactory } from "@microsoft/sp-http";
import { TokenService } from "../services/tokenService/TokenService";
import { ServiceScope } from '@microsoft/sp-core-library';
import { Dropdown, IComboBoxOption, IDropdownProps, ITextFieldProps, TextField } from 'office-ui-fabric-react';
import { PropertyPaneAsyncCombo } from "../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import * as commonStrings from 'CommonStrings';
import { IMicrosoftSearchRequest, ISearchRequestAggregation, SearchAggregationSortBy, ISearchSortProperty, IMicrosoftSearchQuery, IQueryAlterationOptions } from '../models/search/IMicrosoftSearchRequest';
import { DateHelper } from '../helpers/DateHelper';
import { DataFilterHelper } from "../helpers/DataFilterHelper";
import { IMicrosoftSearchResultSet } from "../models/search/IMicrosoftSearchResponse";
import { ISortFieldConfiguration } from '../models/search/ISortFieldConfiguration';
import { AsyncCombo } from "../controls/PropertyPaneAsyncCombo/components/AsyncCombo";
import { IAsyncComboProps } from "../controls/PropertyPaneAsyncCombo/components/IAsyncComboProps";
import { PropertyPaneNonReactiveTextField } from "../controls/PropertyPaneNonReactiveTextField/PropertyPaneNonReactiveTextField";
import { ISharePointSearchService } from "../services/searchService/ISharePointSearchService";
import { SharePointSearchService } from "../services/searchService/SharePointSearchService";
import { IMicrosoftSearchDataSourceData } from "../models/search/IMicrosoftSearchDataSourceData";
import { SortFieldDirection } from "@pnp/modern-search-extensibility";
import * as React from "react";
import { IMicrosoftSearchResponse } from "../models/search/IMicrosoftSearchResponse";
import { BuiltinDataSourceProviderKeys } from "./AvailableDataSources";
import { SortableFields } from "../common/Constants";

export enum EntityType {
    Message = 'message',
    Event = 'event',
    Drive = 'drive',
    DriveItem = 'driveItem',
    ExternalItem = 'externalItem',
    List = 'list',
    ListItem = 'listItem',
    Site = 'site',
    Person = 'person'
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
}

export class MicrosoftSearchDataSource extends BaseDataSource<IMicrosoftSearchDataSourceProperties> {

    private _tokenService: ITokenService;
    private _propertyPaneWebPartInformation: any = null;
    private _availableFields: IComboBoxOption[] = [];
    private _microsoftSearchUrl: string;
    private _sortableFields: IComboBoxOption[] = SortableFields.map(field => {
        return {
            key: field,
            text: field,
        } as IComboBoxOption;
    });

    private _availableEntityTypeOptions: IComboBoxOption[] = [
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
    * The moment.js library reference
    */
    private moment: any;

    private _propertyFieldCollectionData: any = null;
    private _customCollectionFieldType: any = null;

    public constructor(serviceScope: ServiceScope) {
        super(serviceScope);

        serviceScope.whenFinished(() => {
            this._tokenService = serviceScope.consume<ITokenService>(TokenService.ServiceKey);
        });
    }

    public async onInit(): Promise<void> {

        this.dateHelper = this.serviceScope.consume<DateHelper>(DateHelper.ServiceKey);
        this.moment = await this.dateHelper.moment();

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
        } else {
            // If no entity is selected, manually set the results to prevent
            // having the previous search results items count displayed.
            this._itemsCount = 0;
        }

        return results;
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        const entityTypesDisplayValue = this._availableEntityTypeOptions.map((option) => {
            if (this.properties.entityTypes.indexOf(option.key as EntityType) !== -1) {
                return option.text;
            }
        });
        let selectFieldsFields: IPropertyPaneField<any>[] = [];
        let contentSourceConnectionIdsFields: IPropertyPaneField<any>[] = [];
        let enableTopResultsFields: IPropertyPaneField<any>[] = [];
        let sortPropertiesFields: IPropertyPaneField<any>[] = [];
        let queryAlterationFields: IPropertyPaneField<any>[] = [];
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
                onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                textDisplayValue: entityTypesDisplayValue.filter(e => e).join(",")
            }),
            new PropertyPaneAsyncCombo('dataSourceProperties.fields', {
                availableOptions: this._availableFields,
                allowMultiSelect: true,
                allowFreeform: true,
                description: commonStrings.DataSources.MicrosoftSearch.SelectedFieldsPropertiesFieldDescription,
                label: commonStrings.DataSources.MicrosoftSearch.SelectedFieldsPropertiesFieldLabel,
                placeholder: commonStrings.DataSources.MicrosoftSearch.SelectedFieldsPlaceholderLabel,
                searchAsYouType: false,
                defaultSelectedKeys: this.properties.fields,
                onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                onUpdateOptions: ((options: IComboBoxOption[]) => {
                    this._availableFields = options;
                }).bind(this)
            }),
            PropertyPaneToggle('dataSourceProperties.enableResultTypes', {
                label: "Enable result types",
                disabled: this.properties.entityTypes.indexOf(EntityType.ExternalItem) === -1
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
                PropertyPaneHorizontalRule()
            );
        }

        // Sorting results is currently only supported on the following SharePoint and OneDrive types: driveItem, listItem, list, site.
        if (this.properties.entityTypes.indexOf(EntityType.DriveItem) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.ListItem) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.Site) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.List) !== -1) {

            sortPropertiesFields.push(
                this._propertyFieldCollectionData('dataSourceProperties.sortProperties', {
                    manageBtnLabel: commonStrings.DataSources.SearchCommon.Sort.EditSortLabel,
                    key: 'sortProperties',
                    enableSorting: true,
                    panelHeader: commonStrings.DataSources.SearchCommon.Sort.EditSortLabel,
                    panelDescription: commonStrings.DataSources.SearchCommon.Sort.SortListDescription,
                    label: commonStrings.DataSources.SearchCommon.Sort.SortPropertyPaneFieldLabel,
                    value: this.properties.sortProperties,
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
                                        onUpdateOptions: ((options: IComboBoxOption[]) => {
                                            this._sortableFields = options;
                                        }).bind(this),
                                        clearTextOnFocus: true,
                                        onUpdate: (option: IComboBoxOption) => {
                                            onUpdate(field.id, option.key as string);
                                        },
                                        placeholder: commonStrings.DataSources.SearchCommon.Sort.SortFieldColumnPlaceholder,
                                        useComboBoxAsMenuWidth: false // Used when screen resolution is too small to display the complete value  
                                    } as IAsyncComboProps));
                            }).bind(this)
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

        if (this.properties.entityTypes.indexOf(EntityType.ExternalItem) !== -1) {
            contentSourceConnectionIdsFields.push(
                new PropertyPaneAsyncCombo('dataSourceProperties.contentSourceConnectionIds', {
                    availableOptions: [],
                    allowMultiSelect: true,
                    allowFreeform: true,
                    description: commonStrings.DataSources.MicrosoftSearch.ContentSourcesFieldDescriptionLabel,
                    label: commonStrings.DataSources.MicrosoftSearch.ContentSourcesFieldLabel,
                    placeholder: commonStrings.DataSources.MicrosoftSearch.ContentSourcesFieldPlaceholderLabel,
                    searchAsYouType: false,
                    defaultSelectedKeys: this.properties.contentSourceConnectionIds,
                    onPropertyChange: this.onCustomPropertyUpdate.bind(this)
                })
            );
        }

        if (this.properties.entityTypes.indexOf(EntityType.Message) !== -1 && this.properties.entityTypes.length === 1) {
            enableTopResultsFields.push(PropertyPaneToggle('dataSourceProperties.enableTopResults', {
                label: commonStrings.DataSources.MicrosoftSearch.EnableTopResultsLabel
            }));
        }

        // https://docs.microsoft.com/en-us/graph/search-concept-speller#known-limitations
        if ((this.properties.entityTypes.indexOf(EntityType.Message) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.Event) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.Site) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.Drive) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.DriveItem) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.List) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.ListItem) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.ExternalItem) !== -1)) {
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
                this._microsoftSearchUrl = "https://graph.microsoft.com/beta/search/query";
            } else {
                this._microsoftSearchUrl = "https://graph.microsoft.com/v1.0/search/query";
            }
        }

        if (propertyPath.localeCompare('dataSourceProperties.sortProperties') === 0) {
            this.properties.sortList = newValue;
        }
    }

    public onCustomPropertyUpdate(propertyPath: string, newValue: any, changeCallback?: (targetProperty?: string, newValue?: any) => void): void {

        if (propertyPath.localeCompare('dataSourceProperties.entityTypes') === 0) {
            this.properties.entityTypes = (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as EntityType; });

            if (this.properties.entityTypes.indexOf(EntityType.ExternalItem) === -1) {
                // Reset result types
                this.properties.enableResultTypes = false;
            }

            this.context.propertyPane.refresh();
            this.render();
        }

        if (propertyPath.localeCompare('dataSourceProperties.fields') === 0) {
            let options = this.parseAndCleanOptions((cloneDeep(newValue) as IComboBoxOption[]));
            this.properties.fields = options.map(v => { return v.key as string; });
            this.context.propertyPane.refresh();
            this.render();
        }

        if (propertyPath.localeCompare('dataSourceProperties.contentSourceConnectionIds') === 0) {
            this.properties.contentSourceConnectionIds = (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as string; });
            this.context.propertyPane.refresh();
            this.render();
        }
    }

    public getTemplateSlots(): ITemplateSlot[] {
        return [
            {
                slotName: BuiltinTemplateSlots.Title,
                slotField: 'resource.name'
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
                slotField: 'resource.webUrl'
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
                slotField: 'created'
            },
            {
                slotName: BuiltinTemplateSlots.SiteId,
                slotField: 'resource.fields.normSiteID'
            },
            {
                slotName: BuiltinTemplateSlots.WebId,
                slotField: 'resource.fields.normWebID'
            },
            {
                slotName: BuiltinTemplateSlots.ListId,
                slotField: 'resource.fields.normListID'
            },
            {
                slotName: BuiltinTemplateSlots.ItemId,
                slotField: 'resource.fields.normUniqueID'
            },
            {
                slotName: BuiltinTemplateSlots.IsFolder,
                slotField: 'resource.fields.contentTypeId'
            },
            {
                slotName: BuiltinTemplateSlots.Id,
                slotField: 'hitId'
            }
        ];
    }

    public getSortableFields(): string[] {
        return this.properties.sortProperties.filter(sort => sort.isUserSort).map(field => field.sortField);
    }

    private initProperties(): void {
        this.properties.entityTypes = this.properties.entityTypes !== undefined ? this.properties.entityTypes : [EntityType.DriveItem];

        const CommonFields = ["name", "webUrl", "filetype", "createdBy", "createdDateTime", "lastModifiedDateTime", "parentReference", "size", "description", "file", "folder", "subject", "bodyPreview", "replyTo", "from", "sender", "start", "end", "displayName", "givenName", "surname", "userPrincipalName", "phones", "department"];

        this.properties.fields = this.properties.fields !== undefined ? this.properties.fields : CommonFields;
        this.properties.sortProperties = this.properties.sortProperties !== undefined ? this.properties.sortProperties : [];
        this.properties.sortList = this.properties.sortProperties;
        this.properties.contentSourceConnectionIds = this.properties.contentSourceConnectionIds !== undefined ? this.properties.contentSourceConnectionIds : [];

        this.properties.queryAlterationOptions = this.properties.queryAlterationOptions ?? { enableModification: false, enableSuggestion: false };
        this.properties.queryTemplate = this.properties.queryTemplate ? this.properties.queryTemplate : "{searchTerms}";
        this.properties.useBetaEndpoint = this.properties.useBetaEndpoint !== undefined ? this.properties.useBetaEndpoint : false;
        this.properties.enableResultTypes = this.properties.enableResultTypes !== undefined ? this.properties.enableResultTypes : false;
        this.properties.trimDuplicates = this.properties.trimDuplicates !== undefined ? this.properties.trimDuplicates : false;

        if (this.properties.useBetaEndpoint) {
            this._microsoftSearchUrl = "https://graph.microsoft.com/beta/search/query";
        } else {
            this._microsoftSearchUrl = "https://graph.microsoft.com/v1.0/search/query";
        }
    }

    private async buildMicrosoftSearchQuery(dataContext: IDataContext): Promise<IMicrosoftSearchQuery> {

        let searchQuery: IMicrosoftSearchQuery = {
            requests: []
        };
        let aggregations: ISearchRequestAggregation[] = [];
        let aggregationFilters: string[] = [];
        let sortProperties: ISearchSortProperty[] = [];
        let contentSources: string[] = [];
        let queryText = '*'; // Default query string if not specified, the API does not support empty value
        let from = 0;

        // Query text
        if (dataContext.inputQueryText) {
            queryText = await this._tokenService.resolveTokens(dataContext.inputQueryText);
        }

        // Query modification
        let queryTemplate = await this._tokenService.resolveTokens(this.properties.queryTemplate);
        if (!isEmpty(queryTemplate.trim()) && !this.properties.useBetaEndpoint) {

            // Use {searchTerms} or {inputQueryText} to use orginal value
            // As of 06/06/2022 the query template is still in beta so we use the query text instead
            queryText = queryTemplate.trim();
        }

        // Paging
        if (dataContext.pageNumber > 1) {
            from = (dataContext.pageNumber - 1) * dataContext.itemsCountPerPage;
        }

        // Build aggregations
        aggregations = dataContext.filters.filtersConfiguration.map(filterConfig => {

            let aggregation: ISearchRequestAggregation = {
                field: filterConfig.filterName,
                bucketDefinition: {
                    isDescending: filterConfig.sortDirection === FilterSortDirection.Ascending ? false : true,
                    minimumCount: 0,
                    sortBy: filterConfig.sortBy === FilterSortType.ByCount ? SearchAggregationSortBy.Count : SearchAggregationSortBy.KeyAsString
                },
                size: filterConfig && filterConfig.maxBuckets ? filterConfig.maxBuckets : 10
            };

            if (filterConfig.selectedTemplate === "DateIntervalFilterTemplate") {

                const pastYear = this.moment(new Date()).subtract(1, 'years').subtract('minutes', 1).toISOString();
                const past3Months = this.moment(new Date()).subtract(3, 'months').subtract('minutes', 1).toISOString();
                const pastMonth = this.moment(new Date()).subtract(1, 'months').subtract('minutes', 1).toISOString();
                const pastWeek = this.moment(new Date()).subtract(1, 'week').subtract('minutes', 1).toISOString();
                const past24hours = this.moment(new Date()).subtract(24, 'hours').subtract('minutes', 1).toISOString();
                const today = new Date().toISOString();

                aggregation.bucketDefinition.ranges = [
                    {
                        to: pastYear
                    },
                    {
                        from: pastYear,
                        to: past3Months
                    },
                    {
                        from: past3Months,
                        to: pastMonth
                    },
                    {
                        from: pastMonth,
                        to: pastWeek
                    },
                    {
                        from: pastWeek,
                        to: past24hours
                    },
                    {
                        from: past24hours,
                        to: today
                    },
                    {
                        from: today
                    }
                ];
            }

            return aggregation;
        });

        // Build aggregation filters
        if (dataContext.filters.selectedFilters.length > 0) {

            // Make sure, if we have multiple filters, at least two filters have values to avoid apply an operator ('or','and') on only one condition failing the query.
            if (dataContext.filters.selectedFilters.length > 1 && dataContext.filters.selectedFilters.filter(selectedFilter => selectedFilter.values.length > 0).length > 1) {
                const refinementString = DataFilterHelper.buildFqlRefinementString(dataContext.filters.selectedFilters, dataContext.filters.filtersConfiguration, this.moment).join(',');
                if (!isEmpty(refinementString)) {
                    aggregationFilters = aggregationFilters.concat([`${dataContext.filters.filterOperator}(${refinementString})`]);
                }

            } else {
                aggregationFilters = aggregationFilters.concat(DataFilterHelper.buildFqlRefinementString(dataContext.filters.selectedFilters, dataContext.filters.filtersConfiguration, this.moment));
            }
        }

        if (this.properties.entityTypes.indexOf(EntityType.ExternalItem) !== -1) {
            // Build external connection ID
            this.properties.contentSourceConnectionIds.forEach(id => {
                contentSources.push(`/external/connections/${id}`);
            });
        }

        // Sort is only available for 'ListItem'
        if (this.properties.entityTypes.indexOf(EntityType.ListItem) !== -1) {

            if (dataContext.sorting?.selectedSortFieldName
                && dataContext.sorting?.selectedSortDirection) {

                // Manual user sorting
                sortProperties.push({
                    name: dataContext.sorting.selectedSortFieldName,
                    isDescending: dataContext.sorting.selectedSortDirection === SortFieldDirection.Descending ? true : false
                });

            } else {

                // Default sort
                this.properties.sortProperties.filter(s => s.sortField).forEach(sortProperty => {
                    sortProperties.push({
                        name: sortProperty.sortField,
                        isDescending: sortProperty.sortDirection === SortFieldDirection.Descending ? true : false
                    });
                });
            }
        }

        // Build search request
        let searchRequest: IMicrosoftSearchRequest = {
            entityTypes: this.properties.entityTypes,
            query: {
                queryString: queryText,
                queryTemplate: queryTemplate
            },
            from: from,
            size: dataContext.itemsCountPerPage
        };

        if (this.properties.fields.length > 0) {
            searchRequest.fields = this.properties.fields.filter(a => a); // Fix to remove null values
        }

        if (aggregations.length > 0) {
            searchRequest.aggregations = aggregations.filter(a => a);
        }

        if (aggregationFilters.length > 0) {
            searchRequest.aggregationFilters = aggregationFilters;
        }

        if (sortProperties.length > 0) {
            searchRequest.sortProperties = sortProperties;
        }

        if (contentSources.length > 0) {
            searchRequest.contentSources = contentSources;
        }

        if (this.properties.trimDuplicates) {
            // Default value is always 'false'
            searchRequest.trimDuplicates = this.properties.trimDuplicates;
        }

        searchRequest.queryAlterationOptions = {
            enableModification: this.properties.queryAlterationOptions.enableModification,
            enableSuggestion: this.properties.queryAlterationOptions.enableSuggestion
        };

        // Result types
        if (this.properties.enableResultTypes) {
            searchRequest.resultTemplateOptions = {
                enableResultTemplate: true
            };
        }

        searchQuery.requests.push(searchRequest);

        return searchQuery;
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

        // Get an instance to the MSGraphClient
        const msGraphClientFactory = this.serviceScope.consume<MSGraphClientFactory>(MSGraphClientFactory.serviceKey);
        const msGraphClient = await msGraphClientFactory.getClient();
        const request = await msGraphClient.api(this._microsoftSearchUrl);
        const jsonResponse: IMicrosoftSearchResponse = await request.headers({ 'SdkVersion': 'pnpmodernsearch/' + this.context.manifest.version }).post(searchQuery);

        if (jsonResponse.value && Array.isArray(jsonResponse.value)) {

            jsonResponse.value.forEach((value: IMicrosoftSearchResultSet) => {

                // Map results
                value.hitsContainers.forEach(hitContainer => {
                    itemsCount += hitContainer.total;

                    if (hitContainer.hits) {

                        const hits = hitContainer.hits.map(hit => {

                            if (hit.resource.fields) {

                                // Flatten 'fields' to be usable with the Search Fitler WP as refiners
                                Object.keys(hit.resource.fields).forEach(field => {
                                    hit[field] = hit.resource.fields[field];
                                });
                            }

                            return hit;
                        });

                        response.items = response.items.concat(hits);
                    }

                    if (hitContainer.aggregations) {

                        // Map refinement results
                        hitContainer.aggregations.forEach((aggregation) => {

                            let values: IDataFilterResultValue[] = [];
                            aggregation.buckets.forEach((bucket) => {
                                values.push({
                                    count: bucket.count,
                                    name: bucket.key,
                                    value: bucket.aggregationFilterToken,
                                    operator: FilterComparisonOperator.Contains
                                } as IDataFilterResultValue);
                            });

                            aggregationResults.push({
                                filterName: aggregation.field,
                                values: values
                            });
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

    private parseAndCleanOptions(options: IComboBoxOption[]): IComboBoxOption[] {
        let optionWithComma = options.find(o => (o.key as string).indexOf(",") > 0);
        if (optionWithComma) {
            return (optionWithComma.key as string).split(",").map(k => { return { key: k.trim(), text: k.trim(), selected: true }; });
        }
        return options;
    }
}