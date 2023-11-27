import * as React from 'react';
import { IDataSourceData, BaseDataSource, ITokenService, ITemplateSlot, IDataFilterResult, IDataFilterResultValue, BuiltinTemplateSlots, FilterBehavior, FilterSortType, FilterSortDirection } from "@pnp/modern-search-extensibility";
import {
    IPropertyPaneGroup,
    IPropertyPaneDropdownOption,
    PropertyPaneDropdownOptionType,
    PropertyPaneToggle,
    PropertyPaneDropdown,
    PropertyPaneLabel
} from "@microsoft/sp-property-pane";
import * as commonStrings from 'CommonStrings';
import { ServiceScope, Guid, Text } from '@microsoft/sp-core-library';
import { sortBy, isEmpty, uniq, cloneDeep } from "@microsoft/sp-lodash-subset";
import { PagingBehavior } from "@pnp/modern-search-extensibility";
import { IDataContext } from "@pnp/modern-search-extensibility";
import { SortFieldDirection } from "@pnp/modern-search-extensibility";
import { ISharePointSearchService } from "../services/searchService/ISharePointSearchService";
import { SharePointSearchService } from "../services/searchService/SharePointSearchService";
import LocalizationHelper from "../helpers/LocalizationHelper";
import { PageContext } from "@microsoft/sp-page-context";
import { TokenService } from "../services/tokenService/TokenService";
import { ITaxonomyService } from "../services/taxonomyService/ITaxonomyService";
import { TaxonomyService } from "../services/taxonomyService/TaxonomyService";
import { ISharePointSearchResult } from "../models/search/ISharePointSearchResults";
import { ILocalizableSearchResult, ILocalizableSearchResultProperty } from "../models/search/ILocalizableSearchResult";
import { PropertyPaneAsyncCombo } from "../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import { Dropdown, IComboBoxOption, IDropdownProps, ITextFieldProps, TextField } from "office-ui-fabric-react";
import { ISharePointSearchQuery, SortDirection, ISort } from "../models/search/ISharePointSearchQuery";
import { AsyncCombo } from '../controls/PropertyPaneAsyncCombo/components/AsyncCombo';
import { IAsyncComboProps } from '../controls/PropertyPaneAsyncCombo/components/IAsyncComboProps';
import { DateHelper } from '../helpers/DateHelper';
import { PropertyPaneNonReactiveTextField } from '../controls/PropertyPaneNonReactiveTextField/PropertyPaneNonReactiveTextField';
import { ITerm } from '../services/taxonomyService/ITaxonomyItems';
import { DataFilterHelper } from '../helpers/DataFilterHelper';
import { ISortFieldConfiguration, } from '../models/search/ISortFieldConfiguration';
import { EnumHelper } from '../helpers/EnumHelper';
import { BuiltinDataSourceProviderKeys } from './AvailableDataSources';
import { StringHelper } from '../helpers/StringHelper';
import { SortableFields } from '../common/Constants';

const TAXONOMY_REFINER_REGEX = /((L0)\|#.?([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}))\|?/;

export enum BuiltinSourceIds {
    Documents = 'e7ec8cee-ded8-43c9-beb5-436b54b31e84',
    ItemsMatchingContentType = '5dc9f503-801e-4ced-8a2c-5d1237132419',
    ItemsMatchingTag = 'e1327b9c-2b8c-4b23-99c9-3730cb29c3f7',
    ItemsRelatedToCurrentUser = '48fec42e-4a92-48ce-8363-c2703a40e67d',
    ItemsWithSameKeywordAsThisItem = '5c069288-1d17-454a-8ac6-9c642a065f48',
    LocalPeopleResults = 'b09a7990-05ea-4af9-81ef-edfab16c4e31',
    LocalReportsAndDataResults = '203fba36-2763-4060-9931-911ac8c0583b',
    LocalSharePointResults = '8413cd39-2156-4e00-b54d-11efd9abdb89',
    LocalVideoResults = '78b793ce-7956-4669-aa3b-451fc5defebf',
    Pages = '5e34578e-4d08-4edc-8bf3-002acf3cdbcc',
    Pictures = '38403c8c-3975-41a8-826e-717f2d41568a',
    Popular = '97c71db1-58ce-4891-8b64-585bc2326c12',
    RecentlyChangedItems = 'ba63bbae-fa9c-42c0-b027-9a878f16557c',
    RecommendedItems = 'ec675252-14fa-4fbe-84dd-8d098ed74181',
    Wiki = '9479bf85-e257-4318-b5a8-81a180f5faa1',
}

/**
 * SharePoint search data source property pane properties
 */
export interface ISharePointSearchDataSourceProperties {

    /**
     * The search query template
     */
    queryTemplate: string;

    /**
     * SharePoint result source GUID
     */
    resultSourceId: string;

    /**
     * Flag indicating if the query rules should enabled/disabled
     */
    enableQueryRules: boolean;

    /**
     * The KQL or FQL refinement filters to apply to the query
     */
    refinementFilters: string;

    /**
     * Flag indicating if the query should be localized
     */
    enableLocalization: boolean;

    /**
     * The search query language to use (locale ID)
     */
    searchQueryLanguage: number;

    /**
     * The search managed properties to retrieve
     */
    selectedProperties: string[];

    /**
     * The search managed properties in hit highligted,splited with ","
     */
    hitHighlightedProperties: string;

    /**
     * The sort fields configuration
     */
    sortList: ISortFieldConfiguration[];

    /**
     * Flag indicating if the audience targeting should be enabled
     */
    enableAudienceTargeting: boolean;

    /**
     * A Boolean value that specifies whether duplicate items are removed from the results. 
     * "true" to remove the duplicate items; otherwise, false. The default value is true.
     */
    trimDuplicates: boolean;

    /**
     * The CollapseSpecification property takes a Spec parameter that can contain multiple fields separated either by a comma or a space, 
     * which evaluated together specify a set of criteria used for collapsing. 
     * More information: https://learn.microsoft.com/en-us/sharepoint/dev/general-development/customizing-search-results-in-sharepoint#collapse-similar-search-results-using-the-collapsespecification-property
     */
    collapseSpecification: string;
}

export class SharePointSearchDataSource extends BaseDataSource<ISharePointSearchDataSourceProperties> {

    private _availableLanguages: IPropertyPaneDropdownOption[] = [];
    private _availableManagedProperties: IComboBoxOption[] = [];
    private _sortableFields: IComboBoxOption[] = SortableFields.map(field => {
        return {
            key: field,
            text: field,
        } as IComboBoxOption;
    });

    private _resultSourcesOptions: IComboBoxOption[] = [];
    private _sharePointSearchService: ISharePointSearchService;
    private _pageContext: PageContext;
    private _tokenService: ITokenService;
    private _taxonomyService: ITaxonomyService;
    private _currentLocaleId: number;

    private _propertyFieldCollectionData: any = null;
    private _customCollectionFieldType: any = null;
    private _propertyPaneWebPartInformation: any = null;

    /**
     * The data source items count
     */
    private _itemsCount: number;

    /*
    * A date helper instance
    */
    private dateHelper: DateHelper;

    /**
    * The moment.js library reference
    */
    private moment: any;

    public constructor(serviceScope: ServiceScope) {
        super(serviceScope);

        serviceScope.whenFinished(() => {
            this._sharePointSearchService = serviceScope.consume<ISharePointSearchService>(SharePointSearchService.ServiceKey);
            this._pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
            this._tokenService = serviceScope.consume<ITokenService>(TokenService.ServiceKey);
            this._taxonomyService = serviceScope.consume<ITaxonomyService>(TaxonomyService.ServiceKey);
        });
    }

    public async onInit(): Promise<void> {

        this.initProperties();

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

            this._propertyFieldCollectionData = PropertyFieldCollectionData;
            this._customCollectionFieldType = CustomCollectionFieldType;
            this._propertyPaneWebPartInformation = PropertyPaneWebPartInformation;
        }

        let culture = LocalizationHelper.getTranslatedCultureFromUrl();
        if (culture) {
            this._currentLocaleId = LocalizationHelper.getLocaleId(culture);
        }

        if (!culture || this._currentLocaleId === 0) {
            this._currentLocaleId = LocalizationHelper.getLocaleId(this._pageContext.cultureInfo.currentUICultureName);
        }

        // Initialize the list of available languages
        if (this._availableLanguages.length == 0) {
            const languages = await this._sharePointSearchService.getAvailableQueryLanguages();

            this._availableLanguages = languages.map(language => {
                return {
                    key: language.Lcid,
                    text: `${language.DisplayName} (${language.Lcid})`
                };
            });
        }
    }

    public async getData(dataContext: IDataContext): Promise<IDataSourceData> {

        const searchQuery = await this.buildSharePointSearchQuery(dataContext);
        const results = await this._sharePointSearchService.search(searchQuery);

        let data: IDataSourceData = {
            items: results.relevantResults,
            filters: results.refinementResults,
            queryModification: results.queryModification,
            secondaryResults: results.secondaryResults,
            spellingSuggestion: results.spellingSuggestion,
            promotedResults: results.promotedResults
        };

        // Translates taxonomy refiners and result values by using terms ID if applicable
        if (this.properties.enableLocalization) {
            const localizedFilters = await this._getLocalizedFilters(data.filters, this._currentLocaleId);
            data.filters = localizedFilters;

            const localizedResults = await this._getLocalizedMetadata(data.items, this._currentLocaleId);
            data.items = localizedResults;
        }

        this._itemsCount = results.totalRows;

        return data;
    }

    public getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] {

        return [
            {
                groupName: commonStrings.DataSources.SharePointSearch.SourceName,
                groupFields: [
                    PropertyPaneLabel('', {
                        text: commonStrings.DataSources.SharePointSearch.QueryTextFieldLabel
                    }),
                    this._propertyPaneWebPartInformation({
                        description: `<em>${commonStrings.DataSources.SharePointSearch.QueryTextFieldInfoMessage}</em>`,
                        key: 'queryText'
                    }),
                    new PropertyPaneNonReactiveTextField('dataSourceProperties.queryTemplate', {
                        componentKey: `${BuiltinDataSourceProviderKeys.SharePointSearch}-queryTemplate`,
                        defaultValue: this.properties.queryTemplate,
                        label: commonStrings.DataSources.SharePointSearch.QueryTemplateFieldLabel,
                        placeholderText: commonStrings.DataSources.SharePointSearch.QueryTemplatePlaceHolderText,
                        multiline: true,
                        description: commonStrings.DataSources.SharePointSearch.QueryTemplateFieldDescription,
                        applyBtnText: commonStrings.DataSources.SharePointSearch.ApplyQueryTemplateBtnText,
                        allowEmptyValue: false,
                        rows: 8
                    }),
                    new PropertyPaneAsyncCombo('dataSourceProperties.resultSourceId', {
                        availableOptions: this._resultSourcesOptions,
                        allowMultiSelect: false,
                        allowFreeform: true,
                        description: commonStrings.DataSources.SharePointSearch.ResultSourceIdDescription,
                        label: commonStrings.DataSources.SharePointSearch.ResultSourceIdLabel,
                        onLoadOptions: this.getBuiltinSourceIdOptions.bind(this),
                        searchAsYouType: false,
                        defaultSelectedKey: this.properties.resultSourceId,
                        textDisplayValue: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, this.properties.resultSourceId) !== null ? EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, this.properties.resultSourceId) : this.properties.resultSourceId,
                        onGetErrorMessage: this.validateSourceId.bind(this),
                        onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                        onUpdateOptions: ((options: IComboBoxOption[]) => {
                            this._resultSourcesOptions = options;
                        }).bind(this)
                    }),
                    new PropertyPaneAsyncCombo('dataSourceProperties.selectedProperties', {
                        availableOptions: this._availableManagedProperties,
                        allowMultiSelect: true,
                        allowFreeform: true,
                        description: commonStrings.DataSources.SharePointSearch.SelectedPropertiesFieldDescription,
                        label: commonStrings.DataSources.SharePointSearch.SelectedPropertiesFieldLabel,
                        placeholder: commonStrings.DataSources.SharePointSearch.SelectedPropertiesPlaceholderLabel,
                        onLoadOptions: this.getAvailableProperties.bind(this),
                        searchAsYouType: false,
                        clearTextOnFocus: true,
                        defaultSelectedKeys: this.properties.selectedProperties,
                        onPropertyChange: this.onCustomPropertyUpdate.bind(this),
                        onUpdateOptions: ((options: IComboBoxOption[]) => {
                            this._availableManagedProperties = this.parseAndCleanOptions(options);
                        }).bind(this)
                    }),
                    this._propertyFieldCollectionData('dataSourceProperties.sortList', {
                        manageBtnLabel: commonStrings.DataSources.SearchCommon.Sort.EditSortLabel,
                        key: 'sortList',
                        enableSorting: true,
                        panelHeader: commonStrings.DataSources.SearchCommon.Sort.EditSortLabel,
                        panelDescription: commonStrings.DataSources.SearchCommon.Sort.SortListDescription,
                        label: commonStrings.DataSources.SearchCommon.Sort.SortPropertyPaneFieldLabel,
                        value: this.properties.sortList,
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
                    }),
                    new PropertyPaneNonReactiveTextField('dataSourceProperties.refinementFilters', {
                        componentKey: `${BuiltinDataSourceProviderKeys.SharePointSearch}-refinementFilters`,
                        defaultValue: this.properties.refinementFilters,
                        label: commonStrings.DataSources.SharePointSearch.RefinementFilters,
                        placeholderText: `ex: FileType:equals("docx")`,
                        multiline: true,
                        allowEmptyValue: true,
                        description: commonStrings.DataSources.SharePointSearch.RefinementFiltersDescription,
                        applyBtnText: commonStrings.DataSources.SharePointSearch.ApplyQueryTemplateBtnText,
                        rows: 3
                    }),
                    PropertyPaneDropdown('dataSourceProperties.searchQueryLanguage', {
                        label: commonStrings.DataSources.SharePointSearch.QueryCultureLabel,
                        options: [{
                            type: PropertyPaneDropdownOptionType.Normal,
                            key: this._currentLocaleId,
                            text: commonStrings.DataSources.SharePointSearch.QueryCultureUseUiLanguageLabel
                        } as IPropertyPaneDropdownOption].concat(sortBy(this._availableLanguages, ['text'])),
                        selectedKey: this.properties.searchQueryLanguage ? this.properties.searchQueryLanguage : this._currentLocaleId
                    }),
                    PropertyPaneToggle('dataSourceProperties.enableQueryRules', {
                        label: commonStrings.DataSources.SharePointSearch.EnableQueryRulesLabel,
                        checked: this.properties.enableQueryRules,
                    }),
                    PropertyPaneToggle('dataSourceProperties.trimDuplicates', {
                        label: commonStrings.DataSources.SharePointSearch.TrimDuplicates
                    }),
                    new PropertyPaneNonReactiveTextField('dataSourceProperties.collapseSpecification', {
                        componentKey: `${BuiltinDataSourceProviderKeys.SharePointSearch}-collapseSpecification`,
                        defaultValue: this.properties.collapseSpecification,
                        label: commonStrings.DataSources.SharePointSearch.CollapseSpecificationLabel,
                        placeholderText: `ex: Author:1 ContentType:2`,
                        multiline: false,
                        allowEmptyValue: true,
                        applyBtnText: commonStrings.DataSources.SharePointSearch.ApplyQueryTemplateBtnText,
                        rows: 2
                    }),
                    PropertyPaneToggle('dataSourceProperties.enableAudienceTargeting', {
                        label: commonStrings.DataSources.SharePointSearch.EnableAudienceTargetingTglLabel,
                        checked: this.properties.enableAudienceTargeting,
                    }),
                    PropertyPaneToggle('dataSourceProperties.enableLocalization', {
                        checked: this.properties.enableLocalization,
                        label: commonStrings.DataSources.SharePointSearch.EnableLocalizationLabel,
                        onText: commonStrings.DataSources.SharePointSearch.EnableLocalizationOnLabel,
                        offText: commonStrings.DataSources.SharePointSearch.EnableLocalizationOffLabel
                    }),
                    new PropertyPaneNonReactiveTextField('dataSourceProperties.hitHighlightedProperties', {
                        componentKey: `${BuiltinDataSourceProviderKeys.SharePointSearch}-hitHighlightedProperties`,
                        defaultValue: this.properties.hitHighlightedProperties,
                        label: commonStrings.DataSources.SharePointSearch.HitHighlightedPropertiesFieldLabel,
                        placeholderText: `ex: Department,UserName`,
                        multiline: false,
                        allowEmptyValue: true,
                        description: commonStrings.DataSources.SharePointSearch.HitHighlightedPropertiesFieldDescription,
                        applyBtnText: commonStrings.DataSources.SharePointSearch.ApplyQueryTemplateBtnText,
                        rows: 1
                    })
                ]
            }
        ];
    }

    public onCustomPropertyUpdate(propertyPath: string, newValue: any): void {

        if (propertyPath.localeCompare('dataSourceProperties.selectedProperties') === 0) {
            let options = this.parseAndCleanOptions((cloneDeep(newValue) as IComboBoxOption[]));
            this.properties.selectedProperties = options.map(v => { return v.key as string; });
            this.context.propertyPane.refresh();
            this.render();
        }

        if (propertyPath.localeCompare('dataSourceProperties.resultSourceId') === 0) {
            this.properties.resultSourceId = (newValue as IComboBoxOption).key as string;
            this.context.propertyPane.refresh();
            this.render();
        }
    }

    public getPagingBehavior(): PagingBehavior {
        return PagingBehavior.Dynamic;
    }

    public getFilterBehavior(): FilterBehavior {
        return FilterBehavior.Dynamic;
    }

    public getItemCount(): number {
        return this._itemsCount;
    }

    public getTemplateSlots(): ITemplateSlot[] {
        return [
            {
                slotName: BuiltinTemplateSlots.Title,
                slotField: 'Title'
            },
            {
                slotName: BuiltinTemplateSlots.Path,
                slotField: 'DefaultEncodingURL'
            },
            {
                slotName: BuiltinTemplateSlots.Summary,
                slotField: 'HitHighlightedSummary'
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
                slotName: BuiltinTemplateSlots.Author,
                slotField: 'AuthorOWSUSER'
            },
            {
                slotName: BuiltinTemplateSlots.Tags,
                slotField: 'owstaxidmetadataalltagsinfo'
            },
            {
                slotName: BuiltinTemplateSlots.Date,
                slotField: 'Created'
            },
            {
                slotName: BuiltinTemplateSlots.SiteId,
                slotField: 'NormSiteID'
            },
            {
                slotName: BuiltinTemplateSlots.WebId,
                slotField: 'NormWebID'
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
            },
            {
                slotName: BuiltinTemplateSlots.ContentClass,
                slotField: 'contentclass'
            },
            {
                slotName: BuiltinTemplateSlots.PersonQuery,
                slotField: 'AADObjectID'
            },
            {
                slotName: BuiltinTemplateSlots.UserDisplayName,
                slotField: 'Title'
            },
            {
                slotName: BuiltinTemplateSlots.UserEmail,
                slotField: 'UserName'
            }
        ];
    }

    public getSortableFields(): string[] {
        return this.properties.sortList.filter(sort => sort.isUserSort).map(field => field.sortField);
    }

    private initProperties(): void {
        this.properties.queryTemplate = this.properties.queryTemplate ? this.properties.queryTemplate : "{searchTerms}";
        this.properties.enableQueryRules = this.properties.enableQueryRules !== undefined ? this.properties.enableQueryRules : false;
        this.properties.enableLocalization = this.properties.enableLocalization !== undefined ? this.properties.enableLocalization : false;
        this.properties.refinementFilters = this.properties.refinementFilters ? this.properties.refinementFilters : '';
        this.properties.selectedProperties = this.properties.selectedProperties !== undefined ? this.properties.selectedProperties :
            [
                'Title',
                'Path',
                'DefaultEncodingURL',
                'FileType',
                'HitHighlightedSummary',
                'HitHighlightedProperties',
                'AuthorOWSUSER',
                'owstaxidmetadataalltagsinfo',
                'Created',
                'UniqueID',
                'NormSiteID',
                'NormWebID',
                'NormListID',
                'NormUniqueID',
                'ContentTypeId',
                'contentclass',
                'UserName',
                'JobTitle',
                'WorkPhone',
                'SPSiteURL',
                'SPWebUrl',
                'SiteTitle',
                'CreatedBy',
                'HtmlFileType',
                'SiteLogo',
                'PictureThumbnailURL'
            ];
        this.properties.resultSourceId = this.properties.resultSourceId !== undefined ? this.properties.resultSourceId : BuiltinSourceIds.LocalSharePointResults;
        this.properties.hitHighlightedProperties = this.properties.hitHighlightedProperties ? this.properties.hitHighlightedProperties : '';
        this.properties.trimDuplicates = this.properties.trimDuplicates !== undefined ? this.properties.trimDuplicates : false;

        if (this.properties.sortList !== undefined) {
            // Convert to new schema 4.5.5
            this.properties.sortList = this.properties.sortList.map(sortConfiguration => {
                if (sortConfiguration.isDefaultSort === undefined) {
                    sortConfiguration.isDefaultSort = true;
                }

                return sortConfiguration;
            });
        } else {
            this.properties.sortList = [];
        }
    }

    private getBuiltinSourceIdOptions(): IComboBoxOption[] {

        this._resultSourcesOptions = [
            {
                key: BuiltinSourceIds.Documents,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.Documents)
            },
            {
                key: BuiltinSourceIds.ItemsMatchingContentType,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.ItemsMatchingContentType)
            },
            {
                key: BuiltinSourceIds.ItemsMatchingTag,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.ItemsMatchingTag)
            },
            {
                key: BuiltinSourceIds.ItemsRelatedToCurrentUser,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.ItemsRelatedToCurrentUser)
            },
            {
                key: BuiltinSourceIds.ItemsWithSameKeywordAsThisItem,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.ItemsWithSameKeywordAsThisItem)
            },
            {
                key: BuiltinSourceIds.LocalPeopleResults,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.LocalPeopleResults)
            },
            {
                key: BuiltinSourceIds.LocalReportsAndDataResults,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.LocalReportsAndDataResults)
            },
            {
                key: BuiltinSourceIds.LocalSharePointResults,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.LocalSharePointResults)
            },
            {
                key: BuiltinSourceIds.LocalVideoResults,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.LocalVideoResults)
            },
            {
                key: BuiltinSourceIds.Pages,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.Pages)
            },
            {
                key: BuiltinSourceIds.Pictures,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.Pictures)
            },
            {
                key: BuiltinSourceIds.Popular,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.Popular)
            },
            {
                key: BuiltinSourceIds.RecentlyChangedItems,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.RecentlyChangedItems)
            },
            {
                key: BuiltinSourceIds.RecommendedItems,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.RecommendedItems)
            },
            {
                key: BuiltinSourceIds.Wiki,
                text: EnumHelper.getEnumKeyByEnumValue(BuiltinSourceIds, BuiltinSourceIds.Wiki)
            },
        ];

        return this._resultSourcesOptions;
    }

    private async getAvailableProperties(): Promise<IComboBoxOption[]> {

        const searchManagedProperties = await this._sharePointSearchService.getAvailableManagedProperties();

        this._availableManagedProperties = searchManagedProperties.map(managedProperty => {
            return {
                key: managedProperty.name,
                text: managedProperty.name,
            } as IComboBoxOption;
        });

        return this._availableManagedProperties;
    }

    private _convertToSortList(sortList: ISortFieldConfiguration[]): ISort[] {
        return sortList.map(e => {

            let direction;

            switch (e.sortDirection) {
                case SortFieldDirection.Ascending:
                    direction = SortDirection.Ascending;
                    break;

                case SortFieldDirection.Descending:
                    direction = SortDirection.Descending;
                    break;

                default:
                    direction = SortDirection.Ascending;
                    break;
            }

            return {
                Property: e.sortField,
                Direction: direction
            } as ISort;
        });
    }

    private async buildSharePointSearchQuery(dataContext: IDataContext): Promise<ISharePointSearchQuery> {

        // Build the search query according to options
        let searchQuery: ISharePointSearchQuery = {};

        searchQuery.ClientType = 'PnPModernSearch';
        searchQuery.Properties = [{
            Name: "EnableDynamicGroups",
            Value: {
                BoolVal: true,
                QueryPropertyValueTypeIndex: 3
            }
        }, {
            Name: "EnableMultiGeoSearch",
            Value: {
                BoolVal: true,
                QueryPropertyValueTypeIndex: 3
            }
        }, {
            Name: "ClientFunction",
            Value: {
                StrVal: "PnPSearchWebPart",
                QueryPropertyValueTypeIndex: 1
            }
        }
            // , {
            //     // Sample query: foo:test
            //     // As "foo" is not an OOB schema property it will be treated as text "foo test" instead
            //     // of non-existing property query - yielding results instead of a blank page
            //     Name: "ImplicitPropertiesAsStrings",
            //     Value: {
            //         BoolVal: true,
            //         QueryPropertyValueTypeIndex: 3
            //     }
            // }
        ];
        if (this._pageContext.list) {
            searchQuery.Properties.push({
                Name: "ListId",
                Value: {
                    StrVal: this._pageContext.list.id.toString(),
                    QueryPropertyValueTypeIndex: 1
                }
            });
        }

        if (this._pageContext.listItem) {
            searchQuery.Properties.push({
                Name: "ListItemId",
                Value: {
                    StrVal: this._pageContext.listItem.id.toString(),
                    QueryPropertyValueTypeIndex: 1
                }
            });
        }

        searchQuery.Querytext = dataContext.inputQueryText;

        searchQuery.EnableQueryRules = this.properties.enableQueryRules;
        if (searchQuery.EnableQueryRules == true || searchQuery.EnableQueryRules == null) {
            searchQuery.EnableInterleaving = false;
        }

        searchQuery.QueryTemplate = await this._tokenService.resolveTokens(this.properties.queryTemplate);

        if (this.properties.resultSourceId) {

            if (Guid.isValid(this.properties.resultSourceId)) {
                searchQuery.SourceId = this.properties.resultSourceId;

                // enable phoenetic search for people result source
                if (searchQuery.SourceId && searchQuery.SourceId.toLocaleLowerCase() === BuiltinSourceIds.LocalPeopleResults) {
                    searchQuery.EnableNicknames = true;
                    searchQuery.EnablePhonetic = true;
                } else {
                    searchQuery.EnableNicknames = false;
                    searchQuery.EnablePhonetic = false;
                }

            } else { // result source specified by name: Level|Result source name (i.e: SPSiteSubscription|News in Spain)
                searchQuery = this._setResultSourceByName(this.properties.resultSourceId, searchQuery);
            }
        }

        searchQuery.Culture = this.properties.searchQueryLanguage !== undefined && this.properties.searchQueryLanguage !== null ? this.properties.searchQueryLanguage : this._currentLocaleId;

        // Determine time zone bias
        let timeZoneBias = {
            WebBias: this._pageContext.legacyPageContext.webTimeZoneData.Bias ? this._pageContext.legacyPageContext.webTimeZoneData.Bias : 0,
            WebDST: this._pageContext.legacyPageContext.webTimeZoneData.DaylightBias ? this._pageContext.legacyPageContext.webTimeZoneData.DaylightBias : 0,
            UserBias: null,
            UserDST: null,
            Id: this._pageContext.legacyPageContext.webTimeZoneData.Id
        };

        if (this._pageContext.legacyPageContext.userTimeZoneData) {
            timeZoneBias.UserBias = this._pageContext.legacyPageContext.userTimeZoneData.Bias ? this._pageContext.legacyPageContext.userTimeZoneData.Bias : 0;
            timeZoneBias.UserDST = this._pageContext.legacyPageContext.userTimeZoneData.DaylightBias ? this._pageContext.legacyPageContext.userTimeZoneData.DaylightBias : 0;
            timeZoneBias.Id = this._pageContext.legacyPageContext.webTimeZoneData.Id;
        }

        searchQuery['TimeZoneId'] = timeZoneBias.Id;

        let refinementFilters: string[] = !isEmpty(this.properties.refinementFilters) ? [await this._tokenService.resolveTokens(this.properties.refinementFilters)] : [];

        if (!isEmpty(dataContext.filters)) {

            // Set list of refiners to retrieve
            searchQuery.Refiners = dataContext.filters.filtersConfiguration.map(filterConfig => {

                // Special case with Date managed properties
                const regexExpr = "(RefinableDate\\d+)(?=,|$)|" +
                    "(RefinableDateInvariant00\\d+)(?=,|$)|" +
                    "(RefinableDateSingle\\d+)(?=,|$)|" +
                    "(LastModifiedTime)(?=,|$)|" +
                    "(LastModifiedTimeForRetention)(?=,|$)|" +
                    "(Created)(?=,|$)|" +
                    "(Date\\d+)(?=,|$)|" +
                    "(EndDate)(?=,|$)|" +
                    "(.+OWSDATE)(?=,|$)|" +
                    "(EventsRollUpEndDate)(?=,|$)|" +
                    "(EventsRollUpStartDate)(?=,|$)|" +
                    "(FirstPublishedDate)(?=,|$)|" +
                    "(ImageDateCreated)(?=,|$)|" +
                    "(LastAnalyticsUpdateTime)(?=,|$)|" +
                    "(ModifierDates)(?=,|$)|" +
                    "(ClassificationLastScan)(?=,|$)|" +
                    "(ComplianceTagWrittenTime)(?=,|$)|" +
                    "(ContentModifiedTime)(?=,|$)|" +
                    "(DocumentAnalyticsLastActivityTimestamp)(?=,|$)|" +
                    "(ExpirationTime)(?=,|$)|" +
                    "(LastSharedByTime)(?=,|$)|" +
                    "(StartDate)(?=,|$)|" +
                    "(TagEventDate)(?=,|$)|" +
                    "(processingtime)(?=,|$)|" +
                    "(ExtractedDate)(?=,|$)";

                const refinableDateRegex = new RegExp(regexExpr.replace(/\s+/gi, ''), 'gi');
                if (refinableDateRegex.test(filterConfig.filterName)) {

                    const pastYear = this.moment(new Date()).subtract(1, 'years').subtract('minutes', 1).toISOString();
                    const past3Months = this.moment(new Date()).subtract(3, 'months').subtract('minutes', 1).toISOString();
                    const pastMonth = this.moment(new Date()).subtract(1, 'months').subtract('minutes', 1).toISOString();
                    const pastWeek = this.moment(new Date()).subtract(1, 'week').subtract('minutes', 1).toISOString();
                    const past24hours = this.moment(new Date()).subtract(24, 'hours').subtract('minutes', 1).toISOString();
                    const today = new Date().toISOString();

                    return `${filterConfig.filterName}(discretize=manual/${pastYear}/${past3Months}/${pastMonth}/${pastWeek}/${past24hours}/${today})`;

                } else if (filterConfig.maxBuckets) {
                    const sort = filterConfig.sortBy == FilterSortType.ByName ? "name" : "frequency";
                    const direction = filterConfig.sortDirection == FilterSortDirection.Ascending ? "ascending" : "descending";
                    return `${filterConfig.filterName}(filter=${filterConfig.maxBuckets}/0/*,sort=${sort}/${direction},deephits=1000000)`;
                }
                else {
                    return filterConfig.filterName + "(deephits=1000000)";
                }

            }).join(',');

            // Get refinement filters
            if (dataContext.filters.selectedFilters.length > 0) {

                // Make sure, if we have multiple filters, at least two filters have values to avoid apply an operator ('or','and') on only one condition failing the query.
                if (dataContext.filters.selectedFilters.length > 1 && dataContext.filters.selectedFilters.filter(selectedFilter => selectedFilter.values.length > 0).length > 1) {
                    const refinementString = DataFilterHelper.buildFqlRefinementString(dataContext.filters.selectedFilters, dataContext.filters.filtersConfiguration, this.moment).join(',');
                    if (!isEmpty(refinementString)) {
                        refinementFilters = refinementFilters.concat([`${dataContext.filters.filterOperator}(${refinementString})`]);
                    }

                } else {
                    refinementFilters = refinementFilters.concat(DataFilterHelper.buildFqlRefinementString(dataContext.filters.selectedFilters, dataContext.filters.filtersConfiguration, this.moment));
                }
            }

        }

        searchQuery.RefinementFilters = refinementFilters;

        // Paging settings
        searchQuery.RowLimit = dataContext.itemsCountPerPage ? dataContext.itemsCountPerPage : 50;

        if (dataContext.pageNumber === 1) {
            searchQuery.StartRow = 0;
        } else {
            searchQuery.StartRow = (dataContext.pageNumber - 1) * searchQuery.RowLimit;
        }

        searchQuery.TrimDuplicates = this.properties.trimDuplicates;
        searchQuery.CollapseSpecification = this.properties.collapseSpecification;

        if (dataContext.sorting?.selectedSortFieldName
            && dataContext.sorting?.selectedSortDirection) {

            // Manual user sorting
            searchQuery.SortList = [{
                Property: dataContext.sorting.selectedSortFieldName,
                Direction: dataContext.sorting.selectedSortDirection === SortFieldDirection.Ascending ? SortDirection.Ascending : SortDirection.Descending
            }];

        } else {

            // Default sort
            searchQuery.SortList = this._convertToSortList(this.properties.sortList.filter(sort => sort.isDefaultSort));
        }

        searchQuery.SelectProperties = this.properties.selectedProperties.filter(a => a); // Fix to remove null values;

        // Audience targeting
        if (this.properties.enableAudienceTargeting) {
            searchQuery.QueryTemplate = `${searchQuery.QueryTemplate} (ModernAudienceAadObjectIds:{User.Audiences} OR NOT IsAudienceTargeted:true)`;
        }

        // HitHighlighted Properties
        if (this.properties.hitHighlightedProperties.length > 0) {
            searchQuery.HitHighlightedProperties = this.properties.hitHighlightedProperties.split(",");
        }

        return searchQuery;
    }

    /**
     * Ensures the result source id value is a valid GUID
     * @param value the result source id
     */
    private validateSourceId(value: string): string {
        if (value.length > 0) {
            if (!(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/).test(value)) {
                return this._validateSourceName(value);
            }
        }

        return '';
    }

    /**
     * 
     * @param value Ensures the result source name is a string format as Level|Name
     * @returns the result source id
     */
    private _validateSourceName(value: string): string {
        const validLevels: string[] = ["SPSiteSubscription", "SPSite", "SPWeb"];
        if (value.length > 0) {
            const parts: string[] = value.split("|");

            if (parts.length !== 2) return commonStrings.DataSources.SharePointSearch.InvalidResultSourceIdMessage;

            const level: string = parts[0];
            const resultSourceName: string = parts[1];
            if (validLevels.find(i => i.toLowerCase() === level.toLowerCase())) {
                if (!resultSourceName) {
                    return commonStrings.DataSources.SharePointSearch.InvalidResultSourceIdMessage;
                }
            } else {
                return commonStrings.DataSources.SharePointSearch.InvalidResultSourceIdMessage;
            }
        }

        return '';
    }

    /**
     * Configures the SearchQuery to allow search by Result source Name.
     * When searching by result source name, the Source name and level has to be set as properties
     * More info here: https://www.techmikael.com/2015/01/how-to-query-using-result-source-name.html
     * @param _resultSourceId the value from the properties
     * @param searchQuery the SearchQuery being configured
     */
    private _setResultSourceByName(_resultSourceId: string, searchQuery: ISharePointSearchQuery): ISharePointSearchQuery {
        const parts: string[] = _resultSourceId.split("|");
        const level: string = parts[0];
        const resultSourceName: string = parts[1];

        searchQuery.Properties.push({
            Name: "SourceLevel",
            Value: {
                StrVal: level,
                QueryPropertyValueTypeIndex: 1
            }
        });

        searchQuery.Properties.push({
            Name: "SourceName",
            Value: {
                StrVal: resultSourceName,
                QueryPropertyValueTypeIndex: 1
            }
        });

        return searchQuery;
    }

    /**
     * Translates all refinement results according the current culture
     * By default SharePoint stores the taxonomy values according to the current site language. Because we can't create a communication site in French (as of 08/12/2017)
     * we need to do the translation afterwards
     * @param rawFilters The raw refinement results to translate coming from SharePoint search results
     * @param lcid the current culture UI number (ex: '1044')
     */
    private async _getLocalizedFilters(rawFilters: IDataFilterResult[], lcid: number): Promise<IDataFilterResult[]> {
        let termsToLocalize: { uniqueIdentifier: string, termId: string, localizedTermLabel: string }[] = [];
        let updatedFilters: IDataFilterResult[] = [];
        let localizedTerms = [];

        // 1. Break down multi value strings like property bag properties formated with ';' into single filter value entries
        // The ';' is a reserved character so it can't appear in taxonomy labels
        updatedFilters = rawFilters.map((filterResult) => {

            let updatedValues: IDataFilterResultValue[] = [];

            filterResult.values.forEach((value) => {

                const isTerm = TAXONOMY_REFINER_REGEX.test(value.name);

                if (isTerm) {

                    // Check if it is a multi value term (i.e property bag property formatted with ';')
                    // The ';' is a reserved character so it can't appear in taxonomy labels
                    const values = value.name.split(';');

                    values.forEach((term) => {

                        const matches = TAXONOMY_REFINER_REGEX.exec(term);
                        // We strip the language specific part of the term and use the GP0 value as the filter value
                        // and use also the striped value as the new term/key...
                        // --> 'GP0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3' instead of 'L0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3|Category 1' for the value/filter
                        // --> 'L0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3|' instead of 'L0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3|Category 1' for the name
                        // If the same term is used on sites with different default language, the indexed taxid property value contains the 
                        // translation of that site collection and therefore it comes back as different values meaning the same with the same id but causing
                        // separate filters.
                        // (Example: 'L0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3|Food' and 'L0|#a2cf1afb-44b6-4cf4-bf37-642bb2e9bff3|Nahrung')
                        // Using the GP0 refinement will ensure content will be filtered regardless of translations
                        const strippedTerm = matches[1];

                        // Use FQL expression here to get the correct output. Otherwise a full match is performed
                        const fqlFilterValue = `"ǂǂ${StringHelper._bytesToHex(StringHelper._stringToUTF8Bytes(term))}"`;
                        const existingFilterIdx = updatedValues.map(updatedValue => updatedValue.name).indexOf(strippedTerm);

                        if (existingFilterIdx === -1) {
                            // Create a dedicated filter value entry
                            updatedValues.push({
                                count: value.count,
                                name: strippedTerm,
                                value: fqlFilterValue
                            } as IDataFilterResultValue);

                        } else {

                            // Increment the count for that filter
                            updatedValues[existingFilterIdx].count = updatedValues[existingFilterIdx].count + 1;

                            // The refinement filter value can't be an exact match anymore to include ';' concatenated strings so we use the FQL expression here
                            updatedValues[existingFilterIdx].value = fqlFilterValue;
                        }
                    });
                } else {
                    updatedValues.push(value);
                }
            });

            filterResult.values = cloneDeep(updatedValues);

            return filterResult;
        });

        // 2. Get term IDs to localize
        updatedFilters.forEach((filterResult) => {

            filterResult.values.forEach((value) => {

                // Check if the value seems to be a taxonomy term
                // If the field value looks like a taxonomy value, we get the label according to the current locale
                // To get this type of values, we need to map the RefinableStringXXX properties with ows_taxId_xxx crawled properties
                const isTerm = TAXONOMY_REFINER_REGEX.test(value.name);

                if (isTerm) {

                    let matches = TAXONOMY_REFINER_REGEX.exec(value.name);

                    if (matches.length > 0) {
                        let termId = matches[3];

                        // Duplicates can appear if multiple taxonomy filters with the same values are displayed at the same time.
                        if (termsToLocalize.map(t => t.uniqueIdentifier).indexOf(value.value) === -1) {
                            // The uniqueIdentifier is here to be able to match the original value with the localized one
                            // We use the refinement token, which is unique
                            termsToLocalize.push({
                                uniqueIdentifier: value.value,
                                termId: termId,
                                localizedTermLabel: null
                            });
                        }
                    }
                }
            });
        });

        // 3. Get terms label
        if (termsToLocalize.length > 0) {

            // Get the terms from taxonomy
            // If a term doesn't exist anymore, it won't be retrieved by the API so the termValues count could be less than termsToLocalize count
            const termValues = await this._taxonomyService.getTermsById(this._pageContext.site.absoluteUrl, termsToLocalize.map((t) => { return t.termId; }));

            termsToLocalize.forEach((termToLocalize) => {

                // Check if the term has been retrieved from taxonomy (i.e. exists)
                const termsFromTaxonomy = termValues.filter((taxonomyTerm: ITerm) => {
                    const termIdFromTaxonomy = taxonomyTerm.Id.substring(taxonomyTerm.Id.indexOf('(') + 1, taxonomyTerm.Id.indexOf(')'));
                    return termIdFromTaxonomy === termToLocalize.termId;
                });

                if (termsFromTaxonomy.length > 0) {

                    // Should be always unique since we can't have two terms with the same ids
                    const termFromTaxonomy: ITerm = termsFromTaxonomy[0];

                    // It supposes the 'Label' property has been selected in the underlying call
                    // A term always have a default label so the collection can't be empty
                    let localizedLabel = termFromTaxonomy["Labels"]._Child_Items_.filter((label: any) => {
                        return label.Language === lcid;
                    });

                    // Term does not have a translation for this LCID, get the default label
                    if (localizedLabel.length === 0) {
                        localizedLabel = termFromTaxonomy["Labels"]._Child_Items_;
                    }

                    localizedTerms.push({
                        uniqueIdentifier: termToLocalize.uniqueIdentifier,
                        termId: termToLocalize.termId,
                        localizedTermLabel: localizedLabel[0].Value
                    });

                } else {
                    localizedTerms.push({
                        uniqueIdentifier: termToLocalize.uniqueIdentifier,
                        termId: termToLocalize.termId,
                        localizedTermLabel: Text.format(commonStrings.DataSources.SharePointSearch.TermNotFound, termToLocalize.termId)
                    });
                }
            });

            // 4. Update original filters with localized values
            updatedFilters = updatedFilters.map((filter) => {

                filter.values = filter.values.map((value) => {

                    // Does a translation exist for that value?
                    const existingFilters = localizedTerms.filter((e) => { return e.uniqueIdentifier === value.value; });

                    if (existingFilters.length > 0) {

                        const isTerm = TAXONOMY_REFINER_REGEX.test(value.name);
                        if (isTerm) {
                            const matches = TAXONOMY_REFINER_REGEX.exec(value.name);
                            const termId = matches[3];
                            const termPrefix = matches[2]; // 'L0'
                            if (termPrefix.localeCompare("L0") === 0) {
                                const termFilterWithoutTranslations = `GP0|#${termId.toString()}`;
                                const termTextFilter = `L0|#0${termId.toString()}`;

                                // https://docs.microsoft.com/en-us/sharepoint/technical-reference/automatically-created-managed-properties-in-sharepoint

                                // termFilterWithoutTranslations => language agnostic term value
                                // termTextFilter => Text value in case the value is a litteral string (ex: a property bag value or a text column https://microsoft-search.github.io/pnp-modern-search/usage/search-filters/#use-indexed-property-bag-properties-with-taxonomy-values)
                                value.value = `or(${termFilterWithoutTranslations},${termTextFilter})`;
                            }
                        }

                        value.name = existingFilters[0].localizedTermLabel;
                    }

                    // Keep only terms (L0). The crawl property ows_taxid_xxx return term sets too.
                    if (!(/(GTSet|GPP|GP0)/i).test(value.name)) {
                        return value;
                    }

                }).filter(v => v); // Get non-null values

                return filter;
            });
        }

        return updatedFilters;
    }

    /**
     * Translates all result taxonomy values (owsTaxId...) according the current culture
     * @param rawResults The raw search results to translate coming from SharePoint search
     * @param lcid the current culture UI number (ex: '1044')
     */
    private async _getLocalizedMetadata(rawResults: ISharePointSearchResult[], lcid: number): Promise<ISharePointSearchResult[]> {
        let resultsToLocalize: ILocalizableSearchResult[] = [];

        let updatedResults: ISharePointSearchResult[] = [];
        let localizedTerms = [];

        // Step #1: identify all taxonomy like properties and gather corresponding term ids for such properties.
        rawResults.forEach((result, index) => {

            let properties = [];

            Object.keys(result).forEach((value) => {

                // Check if the value seems to be a taxonomy term value (single or multi)
                const isTerm = /L0\|#.?([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/.test(result[value]);

                if (isTerm) {

                    let termIds = [];

                    const regex = /L0\|#.?([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/g;
                    const str = result[value];
                    let m;

                    while ((m = regex.exec(str)) !== null) {
                        // This is necessary to avoid infinite loops with zero-width matches
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }

                        termIds.push(m[1]);
                    }

                    properties.push({
                        propertyName: value,
                        termIds: termIds
                    } as ILocalizableSearchResultProperty);
                }
            });

            if (properties.length > 0) {
                resultsToLocalize.push({
                    uniqueIdentifier: index,
                    properties: properties
                });
            }
        });

        // Step #2: flatten and concatenate all terms ids to retrieve them as a single query using the REST endpoint.
        if (resultsToLocalize.length > 0) {

            let allTerms: string[] = [];

            // Concat all term ids from all results to make a single query
            resultsToLocalize.forEach((result) => {
                result.properties.forEach((p) => {
                    allTerms = allTerms.concat(p.termIds);
                });
            });

            // Remove duplicates
            allTerms = uniq<string>(allTerms);

            // Get the terms from taxonomy
            // If a term doesn't exist anymore, it won't be retrieved by the API so the termValues count could be less than termsToLocalize count
            const termValues = await this._taxonomyService.getTermsById(this._pageContext.site.absoluteUrl, allTerms);

            resultsToLocalize.forEach((resultToLocalize) => {

                let updatedProperties: ILocalizableSearchResultProperty[] = [];

                // Browse each proeprty of each result
                resultToLocalize.properties.forEach(property => {

                    let termLabels: string[] = [];

                    // Check if the term has been retrieved from taxonomy (i.e. exists)
                    const termsFromTaxonomy = termValues.filter((taxonomyTerm: ITerm) => {
                        const termIdFromTaxonomy = taxonomyTerm.Id.substring(taxonomyTerm.Id.indexOf('(') + 1, taxonomyTerm.Id.indexOf(')'));
                        return property.termIds.indexOf(termIdFromTaxonomy) !== -1;
                    });

                    if (termsFromTaxonomy.length > 0) {
                        termsFromTaxonomy.forEach((taxonomyTerm: ITerm) => {

                            // It supposes the 'Label' property has been selected in the underlying service call
                            // A term always have a default label so the collection can't be empty
                            let localizedLabel = taxonomyTerm["Labels"]._Child_Items_.filter((label: any) => {
                                return label.Language === lcid && label.IsDefaultForLanguage;
                            });

                            // Term does not have a translation for this LCID, get the default label
                            if (localizedLabel.length === 0) {
                                localizedLabel = taxonomyTerm["Labels"]._Child_Items_;
                            }

                            if (localizedLabel.length > 0) {
                                // There is only one default label for a language
                                termLabels.push(localizedLabel[0].Value);
                            }
                        });

                        updatedProperties.push({
                            propertyName: property.propertyName,
                            termLabels: termLabels
                        });
                    }
                });

                localizedTerms.push({
                    uniqueIdentifier: resultToLocalize.uniqueIdentifier,
                    properties: updatedProperties,
                });
            });

            // Step #3: populate corresponding properties with term labels and returns new results
            updatedResults = rawResults.map((result, index) => {

                const existingResults = localizedTerms.filter((e) => {
                    return e.uniqueIdentifier === index;
                });

                if (existingResults.length > 0) {

                    existingResults[0].properties.forEach((res) => {

                        // Create a new property and keep the original value with the original property name
                        // This allow to let the original value accessible in templates 
                        result[`Auto${res.propertyName}`] = res.termLabels.join(', ');
                    });
                }

                return result;
            });

            return updatedResults;

        } else {
            return rawResults;
        }
    }


    private parseAndCleanOptions(options: IComboBoxOption[]): IComboBoxOption[] {
        let optionWithComma = options.find(o => (o.key as string).indexOf(",") > 0);
        if (optionWithComma) {
            return (optionWithComma.key as string).split(",").map(k => { return { key: k.trim(), text: k.trim(), selected: true }; });
        }
        return options;
    }
}
