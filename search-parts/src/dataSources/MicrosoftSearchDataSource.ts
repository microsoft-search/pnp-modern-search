import { BaseDataSource, IDataSourceData, IDataFilter, IDataFilterConfiguration, FilterSortType, FilterSortDirection, ITemplateSlot, BuiltinTemplateSlots, IDataContext, ITokenService, FilterBehavior, PagingBehavior, IDataFilterResult, IDataFilterResultValue, FilterComparisonOperator } from "@pnp/modern-search-extensibility";
import { IPropertyPaneGroup, PropertyPaneLabel, IPropertyPaneField, PropertyPaneToggle } from "@microsoft/sp-property-pane";
import { cloneDeep, isEmpty } from '@microsoft/sp-lodash-subset';
import { MSGraphClientFactory } from "@microsoft/sp-http";
import { TokenService } from "../services/tokenService/TokenService";
import { ServiceScope } from '@microsoft/sp-core-library';
import { IComboBoxOption } from 'office-ui-fabric-react';
import { PropertyPaneAsyncCombo } from "../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import * as commonStrings from 'CommonStrings';
import { IMicrosoftSearchRequest, ISearchRequestAggregation, SearchAggregationSortBy, ISearchSortProperty } from '../models/search/IMicrosoftSearchRequest';
import { DateHelper } from '../helpers/DateHelper';
import { DataFilterHelper } from "../helpers/DataFilterHelper";
import { IMicrosoftSearchResponse } from "../models/search/IMicrosoftSearchResponse";
import { ISortFieldConfiguration, SortFieldDirection } from '../models/search/ISortFieldConfiguration';

const MICROSOFT_SEARCH_URL = "https://graph.microsoft.com/beta/search/query";

export enum EntityType {
    Message = 'message',
    Event = 'event',
    Drive = 'drive',
    DriveItem = 'driveItem',
    ExternalItem = 'externalItem',
    List = 'list',
    ListItem = 'listItem',
    Site = 'site'
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
     * This triggers hybrid sort for messages : the first 3 messages are the most relevant. This property is only applicable to entityType=message
     */
    enableTopResults: boolean;

    /**
     * The content sources for external items
     */
    contentSourceConnectionIds: string[];
}

export class MicrosoftSearchDataSource extends BaseDataSource<IMicrosoftSearchDataSourceProperties> {

    private _tokenService: ITokenService;
    private _propertyPaneWebPartInformation: any = null;
    private _availableFields: IComboBoxOption[] = [];

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
            key: EntityType.Site,
            text: "Sites"
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

        // Use the same chunk name as the main Web Part to avoid recreating/loading a new one
        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
            /* webpackChunkName: 'data-visualizer-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );

        const { PropertyPaneWebPartInformation } = await import(
            /* webpackChunkName: 'data-visualizer-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyPaneWebPartInformation'
        );

        this._propertyPaneWebPartInformation = PropertyPaneWebPartInformation;
        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;

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

    public async getData(dataContext: IDataContext): Promise<IDataSourceData> {

        let results: IDataSourceData = {
            items: []
        };

        const searchRequest = await this.buildMicrosoftSearchRequest(dataContext);
        results = await this.search(searchRequest);

        return results;
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        const entityTypesDisplayValue = this._availableEntityTypeOptions.map((option) => {
            if (this.properties.entityTypes.indexOf(option.key as EntityType) !== -1) {
                return option.text;
            }
        });

        let groupFields: IPropertyPaneField<any>[] = [

            PropertyPaneLabel('', {
                text: commonStrings.DataSources.MicrosoftSearch.QueryTextFieldLabel
            }),
            this._propertyPaneWebPartInformation({
                description: `<em>${commonStrings.DataSources.MicrosoftSearch.QueryTextFieldInfoMessage}</em>`,
                key: 'queryText'
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
            })
        ];

        // Sorting results is currently only supported on the following SharePoint and OneDrive types: driveItem, listItem, list, site.
        if (this.properties.entityTypes.indexOf(EntityType.DriveItem) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.ListItem) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.Site) !== -1 ||
            this.properties.entityTypes.indexOf(EntityType.List) !== -1) {

            groupFields.push(
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
                            type: this._customCollectionFieldType.string,
                        },
                        {
                            id: 'sortDirection',
                            title: commonStrings.DataSources.SearchCommon.Sort.SortDirectionColumnLabel,
                            type: this._customCollectionFieldType.dropdown,
                            required: true,
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
                            defaultValue: SortFieldDirection.Ascending
                        }
                    ]
                })
            );
        }

        if (this.properties.entityTypes.indexOf(EntityType.ExternalItem) !== -1) {
            groupFields.push(
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
            groupFields.push(PropertyPaneToggle('dataSourceProperties.enableTopResults', {
                label: commonStrings.DataSources.MicrosoftSearch.EnableTopResultsLabel
            }));
        }

        return [
            {
                groupName: commonStrings.DataSources.MicrosoftSearch.SourceConfigurationGroupName,
                groupFields: groupFields
            }
        ];
    }

    public onCustomPropertyUpdate(propertyPath: string, newValue: any): void {

        if (propertyPath.localeCompare('dataSourceProperties.entityTypes') === 0) {
            this.properties.entityTypes = (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as EntityType; });
            this.context.propertyPane.refresh();
            this.render();
        }

        if (propertyPath.localeCompare('dataSourceProperties.fields') === 0) {
            this.properties.fields = (cloneDeep(newValue) as IComboBoxOption[]).map(v => { return v.key as string; });
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
                slotField: 'NormSiteID'
            },
            {
                slotName: BuiltinTemplateSlots.ListId,
                slotField: 'NormListID'
            },
            {
                slotName: BuiltinTemplateSlots.ItemId,
                slotField: 'NormUniqueID'
            },
            {
                slotName: BuiltinTemplateSlots.IsFolder,
                slotField: 'ContentTypeId'
            }
        ];
    }

    private initProperties(): void {
        this.properties.entityTypes = this.properties.entityTypes !== undefined ? this.properties.entityTypes : [EntityType.DriveItem];

        const SharePointFields = ["Title", "Path", "DefaultEncodingUrl", , "ContentTypeId"];
        const CommonFields = ["name", "webUrl", "filetype", "createdBy", "createdDateTime", "lastModifiedDateTime", "parentReference", "size", "description", "file", "folder"];

        this.properties.fields = this.properties.fields !== undefined ? this.properties.fields : SharePointFields.concat(CommonFields);
        this.properties.sortProperties = this.properties.sortProperties !== undefined ? this.properties.sortProperties : [];
        this.properties.contentSourceConnectionIds = this.properties.contentSourceConnectionIds !== undefined ? this.properties.contentSourceConnectionIds : [];
    }

    private async buildMicrosoftSearchRequest(dataContext: IDataContext): Promise<IMicrosoftSearchRequest> {

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
                size: filterConfig?.maxBuckets ? filterConfig.maxBuckets : 10
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
                const refinementString = this.buildAggregationFilters(dataContext.filters.selectedFilters, dataContext.filters.filtersConfiguration).join(',');
                if (!isEmpty(refinementString)) {
                    aggregationFilters = aggregationFilters.concat([`${dataContext.filters.filterOperator}(${refinementString})`]);
                }

            } else {
                aggregationFilters = aggregationFilters.concat(this.buildAggregationFilters(dataContext.filters.selectedFilters, dataContext.filters.filtersConfiguration));
            }
        }

        // Build sort properties
        this.properties.contentSourceConnectionIds.forEach(id => {
            contentSources.push(`/external/connections/${id}`);
        });

        // Build sort properties
        this.properties.sortProperties.forEach(sortProperty => {

            sortProperties.push({
                name: sortProperty.sortField,
                isDescending: sortProperty.sortDirection === SortFieldDirection.Descending ? true : false
            });
        });

        // Build search request
        let searchRequest: IMicrosoftSearchRequest = {
            entityTypes: this.properties.entityTypes,
            query: {
                queryString: queryText
            },
            from: from,
            size: dataContext.itemsCountPerPage
        };

        if (this.properties.fields.length > 0) {
            searchRequest.fields = this.properties.fields;
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

        return searchRequest;
    }

    /**
     * Build the refinement condition in FQL format
     * @param selectedFilters The selected filter array
     * @param filtersConfiguration The current filters configuration
     * @param encodeTokens If true, encodes the taxonomy refinement tokens in UTF-8 to work with GET requests. Javascript encodes natively in UTF-16 by default.
     */
    private buildAggregationFilters(selectedFilters: IDataFilter[], filtersConfiguration: IDataFilterConfiguration[], encodeTokens?: boolean): string[] {

        let refinementQueryConditions: string[] = [];

        selectedFilters.forEach(filter => {

            let operator: any = filter.operator;

            // Get the configuration for this filter
            const filterConfiguration: IDataFilterConfiguration = DataFilterHelper.getConfigurationForFilter(filter, filtersConfiguration);

            // The configuration should always be here for a filter. Not a valid scenario otherwise.
            if (filterConfiguration) {

                // Mutli values
                if (filter.values.length > 1) {

                    let startDate = null;
                    let endDate = null;

                    // A refiner can have multiple values selected in a multi or mon multi selection scenario
                    // The correct operator is determined by the refiner display template according to its behavior
                    const conditions = filter.values.map(filterValue => {

                        let value = filterValue.value;

                        if (this.moment(value, this.moment.ISO_8601, true).isValid()) {

                            if (!startDate && (filterValue.operator === FilterComparisonOperator.Geq || filterValue.operator === FilterComparisonOperator.Gt)) {
                                startDate = value;
                            }

                            if (!endDate && (filterValue.operator === FilterComparisonOperator.Lt || filterValue.operator === FilterComparisonOperator.Leq)) {
                                endDate = value;
                            }
                        }

                        return /ǂǂ/.test(value) && encodeTokens ? encodeURIComponent(value) : value;
                    });

                    if (startDate && endDate) {
                        refinementQueryConditions.push(`${filter.filterName}:range(${startDate},${endDate})`);


                    } else {
                        refinementQueryConditions.push(`${filter.filterName}:${operator}(${conditions.join(',')})`);
                    }

                } else {

                    // Single value
                    if (filter.values.length === 1) {

                        const filterValue = filter.values[0];

                        // See https://sharepoint.stackexchange.com/questions/258081/how-to-hex-encode-refiners/258161
                        let refinementToken = /ǂǂ/.test(filterValue.value) && encodeTokens ? encodeURIComponent(filterValue.value) : filterValue.value;

                        // https://docs.microsoft.com/en-us/sharepoint/dev/general-development/fast-query-language-fql-syntax-reference#fql_range_operator
                        if (this.moment(refinementToken, this.moment.ISO_8601, true).isValid()) {

                            if (filterValue.operator === FilterComparisonOperator.Gt || filterValue.operator === FilterComparisonOperator.Geq) {
                                refinementToken = `range(${refinementToken},max)`;
                            }

                            // Ex: scenario ('older than a year')
                            if (filterValue.operator === FilterComparisonOperator.Leq || filterValue.operator === FilterComparisonOperator.Lt) {
                                refinementToken = `range(min,${refinementToken})`;
                            }
                        }

                        refinementQueryConditions.push(`${filter.filterName}:${refinementToken}`);
                    }
                }
            }
        });

        return refinementQueryConditions;
    }

    /**
     * Retrieves data from Microsoft Graph API
     * @param searchRequest the Microsoft Search search request
     */
    private async search(searchRequest: IMicrosoftSearchRequest): Promise<IDataSourceData> {

        let itemsCount = 0;
        let response: IDataSourceData = {
            items: [],
            filters: []
        };
        let aggregationResults: IDataFilterResult[] = [];

        // Get an instance to the MSGraphClient
        const msGraphClientFactory = this.serviceScope.consume<MSGraphClientFactory>(MSGraphClientFactory.serviceKey);
        const msGraphClient = await msGraphClientFactory.getClient();
        const request = await msGraphClient.api(MICROSOFT_SEARCH_URL).header('SdkVersion', `PnPModernSearch/${this.context.manifest.version}`);        

        const jsonResponse = await request.post({ requests: [searchRequest] });

        if (jsonResponse.value && Array.isArray(jsonResponse.value)) {

            jsonResponse.value.forEach((value: IMicrosoftSearchResponse) => {

                // Map results
                value.hitsContainers.forEach(hitContainer => {
                    itemsCount += hitContainer.total;

                    if (hitContainer.hits) {
                        response.items = response.items.concat(hitContainer.hits);
                    }

                    // Map refinement results
                    if (hitContainer.aggregations) {
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
                    }
                    
                    response.filters = aggregationResults;
                });
            });
        }

        this._itemsCount = itemsCount;

        return response;
    }
}