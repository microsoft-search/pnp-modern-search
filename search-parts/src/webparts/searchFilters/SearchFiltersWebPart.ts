import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Text, DisplayMode, Log } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    IPropertyPaneField,
    PropertyPaneTextField,
    IPropertyPaneGroup,
    PropertyPaneChoiceGroup,
} from '@microsoft/sp-property-pane';
import { DynamicProperty } from '@microsoft/sp-component-base';
import { IPropertyPanePage } from '@microsoft/sp-property-pane';
import * as webPartStrings from 'SearchFiltersWebPartStrings';
import * as commonStrings from 'CommonStrings';
import SearchFilters from './components/SearchFiltersContainer';
import { ISearchFiltersContainerProps } from './components/ISearchFiltersContainerProps';
import ISearchFiltersWebPartProps from './ISearchFiltersWebPartProps';
import IDynamicDataService from '../../services/dynamicDataService/IDynamicDataService';
import { IDataResultSourceData } from '../../models/dynamicData/IDataResultSourceData';
import { DynamicDataService } from '../../services/dynamicDataService/DynamicDataService';
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import { ComponentType } from '../../common/ComponentType';
import { IDataFilterSourceData } from '../../models/dynamicData/IDataFilterSourceData';
import { IDataFilter, ILayoutDefinition, LayoutType, ILayout, FilterConditionOperator, IDataFilterResult, IDataFilterConfiguration, FilterType, IDataFilterResultValue, IComponentDefinition, FilterSortType, FilterSortDirection } from '@pnp/modern-search-extensibility';
import { AsyncCombo } from '../../controls/PropertyPaneAsyncCombo/components/AsyncCombo';
import { IAsyncComboProps } from '../../controls/PropertyPaneAsyncCombo/components/IAsyncComboProps';
import { AvailableLayouts, BuiltinLayoutsKeys } from '../../layouts/AvailableLayouts';
import { LayoutHelper } from '../../helpers/LayoutHelper';
import { TemplateService } from '../../services/templateService/TemplateService';
import { ITemplateService } from '../../services/templateService/ITemplateService';
import { isEmpty, isEqual, uniqBy, cloneDeep, uniq, sortBy } from '@microsoft/sp-lodash-subset';
import { Dropdown, IDropdownProps, IDropdownOption, Checkbox, Icon, IComboBoxOption } from 'office-ui-fabric-react';
import { BuiltinFilterTemplates, BuiltinFilterTypes } from '../../layouts/AvailableTemplates';
import { ServiceScope } from '@microsoft/sp-core-library';
import { AvailableComponents } from '../../components/AvailableComponents';
import { PropertyPaneAsyncCombo } from '../../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo';
import { BaseWebPart } from '../../common/BaseWebPart';
import commonStyles from '../../styles/Common.module.scss';

export default class SearchFiltersWebPart extends BaseWebPart<ISearchFiltersWebPartProps> implements IDynamicDataCallables {

    /**
     * Dynamic properties for all connected sources
     */
    private _dataSourceDynamicProperties: DynamicProperty<IDataResultSourceData>[] = [];
    private _selectedFilters: IDataFilter[] = [];

    /**
     * Dynamically loaded components for property pane
     */
    private _placeholderComponent: any = null;
    private _propertyFieldCollectionData: any = null;
    private _propertyFieldCodeEditor: any = null;
    private _propertyFieldCodeEditorLanguages: any = null;
    private _customCollectionFieldType: any = null;

    /**
     * Properties to avoid to recreate instances every render
     */
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
     * the dynamic data service instance
     */
    private dynamicDataService: IDynamicDataService;

    /**
     * The available layout definitions (not instanciated)
     */
    private availableLayoutDefinitions: ILayoutDefinition[] = AvailableLayouts.BuiltinLayouts.filter(layout => { return layout.type === LayoutType.Filter; });

    /**
     * The service scope for this specific Web Part instance
     */
    private webPartInstanceServiceScope: ServiceScope;

    /**
     * The available web component definitions (not registered yet)
     */
    private availableWebComponentDefinitions: IComponentDefinition<any>[] = AvailableComponents.BuiltinComponents;

    /**
     * The available connections as property pane fields
     */
    private propertyPaneConnectionsFields: IPropertyPaneField<any>[] = [];

    protected async onInit() {

        this.initializeProperties();

        // Initializes shared services
        await this.initializeBaseWebPart();

        // Initializes the Web Part instance services
        this.initializeWebPartServices();

        if (this.displayMode === DisplayMode.Edit) {
            const { Placeholder } = await import(
                /* webpackChunkName: 'pnp-modern-search-property-pane' */
                '@pnp/spfx-controls-react/lib/Placeholder'
            );
            this._placeholderComponent = Placeholder;
        }

        this.context.dynamicDataSourceManager.initializeSource(this);

        // Initializes dynamic data connections. This could trigger a render if a connection is made with an other component resulting to a render race condition.
        // That's why we need to fetch the licence info before calling this method
        this.ensureDataSourcesConnection();

        // Register Web Components in the global page context. We need to do this BEFORE the template processing to avoid race condition.
        // Web components are only defined once.
        // We need to register components here in the case where the Search Results WP is not present on the page
        await this.templateService.registerWebComponents(this.availableWebComponentDefinitions);

        return super.onInit();
    }

    public async render(): Promise<void> {

        // Determine the template content to display
        // In the case of an external template is selected, the render is done asynchronously waiting for the content to be fetched
        await this.initTemplate();

        // Get and initialize layout instance if different (i.e avoid to create a new instance every time)
        if (this.lastLayoutKey !== this.properties.selectedLayoutKey) {
            this.layout = await LayoutHelper.getLayoutInstance(this.webPartInstanceServiceScope, this.context, this.properties, this.properties.selectedLayoutKey, this.availableLayoutDefinitions);
            this.lastLayoutKey = this.properties.selectedLayoutKey;
        }

        // Refresh the property pane to get layout and data source options
        if (this.context.propertyPane.isPropertyPaneOpen()) {
            this.context.propertyPane.refresh();
        }

        return this.renderCompleted();
    }

    protected renderCompleted(): void {

        let renderRootElement: JSX.Element = null;

        let filterResults: IDataFilterResult[] = [];

        // Display the Web Part only if a valid configuration is set
        if (this.templateContentToDisplay && this.properties.filtersConfiguration.length > 0) {

            // Get data from connected sources
            if (this._dataSourceDynamicProperties.length > 0) {

                // Merge available filters and values from multiple sources
                const dataResultsSourceData = this.mergeFiltersDataFromSources(this._dataSourceDynamicProperties);

                // Get filter results
                filterResults = dataResultsSourceData.availablefilters;
            }

            // Case when no search results WP is connected and we have 'Static' filters configured.
            // OR the data results don't contain this filter name. 
            // We create fake entries for those filters to be able to render them in the template
            // We do this by convenience to avoid refactoring the Handlebars templates
            filterResults = this._initStaticFilters(filterResults, this.properties.filtersConfiguration);

            renderRootElement = React.createElement(
                SearchFilters,
                {
                    templateContent: this.templateContentToDisplay,
                    availableFilters: filterResults,
                    filtersConfiguration: this.properties.filtersConfiguration,
                    domElement: this.domElement,
                    instanceId: this.instanceId,
                    selectedLayoutKey: this.properties.selectedLayoutKey,
                    properties: JSON.parse(JSON.stringify(this.properties)),
                    themeVariant: this._themeVariant,
                    onUpdateFilters: (updatedFilters: IDataFilter[]) => {

                        this._selectedFilters = updatedFilters;

                        // Notfify dynamic data consumers data have changed
                        this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchFilters);
                    },
                    templateService: this.templateService,
                    webPartTitleProps: {
                        displayMode: this.displayMode,
                        title: this.properties.title,
                        updateProperty: (value: string) => {
                            this.properties.title = value;
                        },
                        className: commonStyles.wpTitle
                    }
                } as ISearchFiltersContainerProps
            );

        } else {
            if (this.displayMode === DisplayMode.Edit) {
                const placeholder: React.ReactElement<any> = React.createElement(
                    this._placeholderComponent,
                    {
                        iconName: 'Filter',
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

        ReactDom.render(renderRootElement, this.domElement);

        // This call set this.renderedOnce to 'true' so we need to execute it at the very end
        super.renderCompleted();
    }

    public getPropertyDefinitions(): IDynamicDataPropertyDefinition[] {
        return [
            {
                id: ComponentType.SearchFilters,
                title: this.properties.title ? `${this.properties.title} - ${this.instanceId}` : `${webPartStrings.General.WebPartDefaultTitle} - ${this.instanceId}`
            }
        ];
    }

    public getPropertyValue(propertyId: string) {

        switch (propertyId) {

            case propertyId:
                return {
                    filterConfiguration: this.properties.filtersConfiguration,
                    selectedFilters: this._selectedFilters,
                    filterOperator: this.properties.filterOperator,
                    instanceId: this.instanceId
                } as IDataFilterSourceData;

            default:
                throw new Error('Bad property id');
        }
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

        let propertyPanePages: IPropertyPanePage[] = [];

        propertyPanePages.push(
            {
                groups: [
                    {
                        groupName: commonStrings.PropertyPane.ConnectionsPage.DataConnectionsGroupName,
                        groupFields: this.propertyPaneConnectionsFields,
                    },
                    {
                        groupName: webPartStrings.PropertyPane.FiltersSettingsPage.SettingsGroupName,
                        groupFields: this.getFilterSettings()
                    }
                ],
                displayGroupsAsAccordion: true
            },
            {
                groups: this.getStylingPageGroups(),
                displayGroupsAsAccordion: true
            }
        );

        // 'About' infos
        propertyPanePages.push(
            {
                displayGroupsAsAccordion: true,
                groups: [
                    ...this.getPropertyPaneWebPartInfoGroups()
                ]
            }
        );

        return {
            pages: propertyPanePages
        };
    }

    protected async onPropertyPaneConfigurationStart() {
        await this.loadPropertyPaneResources();
    }

    protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {

        if (propertyPath.localeCompare('filtersConfiguration') === 0 && !isEqual(oldValue, newValue)) {

            // Remove duplicate fields. We can't have multiple filters with the same field
            this.properties.filtersConfiguration = uniqBy(this.properties.filtersConfiguration, 'filterName');

            // Set correct default values according to the template
            this.properties.filtersConfiguration = (newValue as IDataFilterConfiguration[]).map(configuration => {
                if (configuration.selectedTemplate === BuiltinFilterTemplates.DateRange
                    || configuration.selectedTemplate === BuiltinFilterTemplates.DateInterval) {
                    configuration.isMulti = false;
                    configuration.operator = FilterConditionOperator.AND;
                }

                // Set the correct type according to the filter tempalte
                configuration.type = BuiltinFilterTypes[configuration.selectedTemplate];

                return configuration;
            });

            // Reset filters
            this._selectedFilters = [];

            this.context.dynamicDataSourceManager.notifyPropertyChanged(ComponentType.SearchFilters);
        }

        // Detect if the layout has been changed to custom
        if (propertyPath.localeCompare('inlineTemplateContent') === 0) {

            // Automatically switch the option to 'Custom' if a default template has been edited
            // (meaning the user started from a default template)
            if (this.properties.inlineTemplateContent && this.properties.selectedLayoutKey !== BuiltinLayoutsKeys.FiltersCustom) {
                this.properties.selectedLayoutKey = BuiltinLayoutsKeys.FiltersCustom;

                // Reset also the template URL
                this.properties.externalTemplateUrl = '';

                // Reset the layout options (otherwise we stay with the previous layout options)
                if (this.context.propertyPane.isPropertyPaneOpen()) {
                    this.context.propertyPane.refresh();
                }
            }
        }

        // Notify layout a property has been updated (only if the layout is already selected)
        if ((propertyPath.localeCompare('selectedLayoutKey') !== 0) && this.layout) {
            this.layout.onPropertyUpdate(propertyPath, oldValue, newValue);
        }

        // Reset layout properties
        if (propertyPath.localeCompare('selectedLayoutKey') === 0 && !isEqual(oldValue, newValue) && this.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsDebug.toString()) {
            this.properties.layoutProperties = {};
        }

        // Refresh list of available connections
        this.propertyPaneConnectionsFields = await this.getConnectionOptions();
        this.context.propertyPane.refresh();
    }

    protected get isRenderAsync(): boolean {
        return true;
    }

    private async getConnectionOptions(): Promise<IPropertyPaneField<any>[]> {

        const availableSources = await this.dynamicDataService.getAvailableDataSourcesByType(ComponentType.SearchResults);

        const sourceOptions = availableSources.map(source => {
            return {
                text: source.text,
                key: source.key
            } as IComboBoxOption;
        });

        // The text to display in the combo
        const textDisplayValues: string[] = [];
        sourceOptions.forEach(option => {
            if (this.properties.dataResultsDataSourceReferences.indexOf(option.key as string) !== -1) {
                textDisplayValues.push(option.text);
            }
        });

        const connectionOptions: IPropertyPaneField<any>[] = [
            new PropertyPaneAsyncCombo('dataResultsDataSourceReferences', {
                availableOptions: sourceOptions,
                allowFreeform: false,
                textDisplayValue: textDisplayValues.join(','),
                label: webPartStrings.PropertyPane.ConnectionsPage.UseDataResultsFromComponentsLabel,
                description: webPartStrings.PropertyPane.ConnectionsPage.UseDataResultsFromComponentsDescription,
                onPropertyChange: (propertyPath, newValue: IComboBoxOption[]) => {
                    // Persist the new data sources references
                    this.properties.dataResultsDataSourceReferences = newValue.map(option => option.key as string);
                    this.ensureDataSourcesConnection();

                    // Refresh the property pane for available fields
                    this.context.propertyPane.refresh();
                },
                defaultSelectedKeys: this.properties.dataResultsDataSourceReferences,
                allowMultiSelect: true
            })
        ];
        return connectionOptions;
    }

    /**
     * Returns property pane 'Styling' page groups
     */
    private getStylingPageGroups(): IPropertyPaneGroup[] {

        let stylingFields: IPropertyPaneField<any>[] = [
            PropertyPaneChoiceGroup('selectedLayoutKey', {
                options: LayoutHelper.getLayoutOptions(this.availableLayoutDefinitions)
            })
        ];

        // We can customize the template for any layout
        stylingFields.push(
            this._propertyFieldCodeEditor('inlineTemplateContent', {
                label: webPartStrings.PropertyPane.LayoutPage.FiltersTemplateFieldLabel,
                panelTitle: webPartStrings.PropertyPane.LayoutPage.FiltersTemplatePanelHeader,
                initialValue: this.templateContentToDisplay,
                deferredValidationTime: 500,
                onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                properties: this.properties,
                disabled: false,
                key: 'inlineTemplateContentCodeEditor',
                language: this._propertyFieldCodeEditorLanguages.Handlebars
            }),
        );

        // Only show the template external URL for 'Custom' option
        if (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.FiltersCustom) {
            stylingFields.push(
                PropertyPaneTextField('externalTemplateUrl', {
                    label: webPartStrings.PropertyPane.LayoutPage.TemplateUrlFieldLabel,
                    placeholder: webPartStrings.PropertyPane.LayoutPage.TemplateUrlPlaceholder,
                    deferredValidationTime: 500,
                    onGetErrorMessage: this.onTemplateUrlChange.bind(this)
                }));
        }

        let groups: IPropertyPaneGroup[] = [
            {
                groupName: webPartStrings.PropertyPane.LayoutPage.AvailableLayoutsGroupName,
                groupFields: stylingFields
            }
        ];

        // Add template options if any
        const layoutOptions = this.getLayoutTemplateOptions();
        if (layoutOptions.length > 0) {
            groups.push({
                groupName: webPartStrings.PropertyPane.LayoutPage.LayoutTemplateOptionsGroupName,
                groupFields: layoutOptions
            });
        }

        return groups;
    }

    /**
     * Determines the group fields for filters settings
     */
    private getFilterSettings(): IPropertyPaneField<any>[] {

        let availableFieldOptionsFromResults: IComboBoxOption[] = [];

        let filterNameCollectionField: any[] = [{
            id: 'filterName',
            title: webPartStrings.PropertyPane.DataFilterCollection.FilterNameLabel,
            type: this._customCollectionFieldType.string,
            required: true
        }];

        if (this._dataSourceDynamicProperties) {

            let allAvailableFieldsFromResults: string[] = [];
            this._dataSourceDynamicProperties.forEach(dataSourceDynamicProperty => {

                const dataResultsData = dataSourceDynamicProperty.tryGetValue();
                if (dataResultsData) {
                    allAvailableFieldsFromResults = allAvailableFieldsFromResults.concat(dataResultsData.availableFieldsFromResults);
                }
            });

            availableFieldOptionsFromResults = uniq(allAvailableFieldsFromResults).map(field => { return { key: field, text: field }; });
        }

        if (availableFieldOptionsFromResults.length > 0) {
            filterNameCollectionField = [{
                id: 'filterName',
                title: webPartStrings.PropertyPane.DataFilterCollection.FilterNameLabel,
                type: this._customCollectionFieldType.custom,
                required: true,
                onCustomRender: (field, value, onUpdate, item) => {
                    return (
                        React.createElement("div", null,
                            React.createElement(AsyncCombo, {
                                allowFreeform: true,
                                availableOptions: availableFieldOptionsFromResults, // We remove already selected fields
                                placeholder: webPartStrings.PropertyPane.DataFilterCollection.SelectFilterComboBoxLabel,
                                textDisplayValue: item[field.id] ? item[field.id] : '',
                                defaultSelectedKey: item[field.id] ? item[field.id] : '',
                                loadOptions: () => {
                                    return Promise.resolve(availableFieldOptionsFromResults);
                                },
                                onUpdateOptions: () => { },
                                onUpdate: (filterValue: IComboBoxOption) => {
                                    onUpdate(field.id, filterValue.key);
                                }
                            } as IAsyncComboProps)
                        )
                    );
                }
            }];
        }

        let filterSettings = [
            this._propertyFieldCollectionData('filtersConfiguration', {
                manageBtnLabel: webPartStrings.PropertyPane.DataFilterCollection.CustomizeFiltersBtnLabel,
                key: 'filters',
                enableSorting: true,
                panelHeader: webPartStrings.PropertyPane.DataFilterCollection.CustomizeFiltersHeader,
                panelDescription: webPartStrings.PropertyPane.DataFilterCollection.CustomizeFiltersDescription,
                label: webPartStrings.PropertyPane.DataFilterCollection.CustomizeFiltersFieldLabel,
                value: this.properties.filtersConfiguration,
                fields: [
                    {
                        id: 'displayValue',
                        title: webPartStrings.PropertyPane.DataFilterCollection.FilterDisplayName,
                        type: this._customCollectionFieldType.string
                    },
                    ...filterNameCollectionField,
                    {
                        id: 'maxBuckets',
                        title: webPartStrings.PropertyPane.DataFilterCollection.FilterMaxBuckets,
                        type: this._customCollectionFieldType.number,
                        required: false,
                        defaultValue: ""
                    },
                    {
                        id: 'selectedTemplate',
                        title: webPartStrings.PropertyPane.DataFilterCollection.FilterTemplate,
                        type: this._customCollectionFieldType.dropdown,
                        required: true,
                        options: [
                            {
                                key: BuiltinFilterTemplates.CheckBox,
                                text: webPartStrings.PropertyPane.DataFilterCollection.Templates.CheckBoxTemplate
                            },
                            {
                                key: BuiltinFilterTemplates.DateRange,
                                text: webPartStrings.PropertyPane.DataFilterCollection.Templates.DateRangeTemplate
                            },
                            {
                                key: BuiltinFilterTemplates.DateInterval,
                                text: webPartStrings.PropertyPane.DataFilterCollection.Templates.DateIntervalTemplate
                            },
                            {
                                key: BuiltinFilterTemplates.ComboBox,
                                text: webPartStrings.PropertyPane.DataFilterCollection.Templates.ComboBoxTemplate
                            }
                        ]
                    },
                    {
                        id: 'type',
                        title: webPartStrings.PropertyPane.DataFilterCollection.FilterType,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: FilterType.Refiner,
                        onCustomRender: (field, value, onUpdate, item: IDataFilterConfiguration, itemId) => {

                            if (item.selectedTemplate) {
                                const filterType: FilterType = BuiltinFilterTypes[item.selectedTemplate];

                                return React.createElement("div", { key: `${field.id}-${itemId}` },
                                    React.createElement(Icon, {
                                        iconName: filterType === FilterType.Refiner ? 'HorizontalTabKey' : 'Export',
                                        styles: {
                                            root: {
                                                color: filterType === FilterType.Refiner ? '#498205' : '#a4262c'
                                            }
                                        },
                                        title: filterType === FilterType.Refiner ? webPartStrings.PropertyPane.DataFilterCollection.FilterTypeRefiner : webPartStrings.PropertyPane.DataFilterCollection.FilterTypeStaticFilter
                                    })
                                );
                            } else {
                                return null;
                            }
                        }
                    },
                    {
                        id: 'expandByDefault',
                        title: webPartStrings.PropertyPane.DataFilterCollection.FilterExpandByDefault,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: false,
                        onCustomRender: (field, value, onUpdate, item: IDataFilterConfiguration, itemId) => {
                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(Checkbox, {
                                    defaultChecked: item.selectedTemplate === BuiltinFilterTemplates.ComboBox ? false : item.expandByDefault,
                                    disabled: item.selectedTemplate === BuiltinFilterTemplates.ComboBox,
                                    onChange: (ev, checked: boolean) => {
                                        onUpdate(field.id, checked);
                                    }
                                })
                            );
                        }
                    },
                    {
                        id: 'showCount',
                        title: webPartStrings.PropertyPane.DataFilterCollection.ShowCount,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: false,
                        onCustomRender: (field, value, onUpdate, item: IDataFilterConfiguration, itemId) => {
                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(Checkbox, {
                                    defaultChecked: item.selectedTemplate === BuiltinFilterTemplates.DateRange ? false : item.showCount,
                                    disabled: item.selectedTemplate === BuiltinFilterTemplates.DateRange,
                                    onChange: (ev, checked: boolean) => {
                                        onUpdate(field.id, checked);
                                    }
                                })
                            );
                        }
                    },
                    {
                        id: 'isMulti',
                        title: webPartStrings.PropertyPane.DataFilterCollection.IsMulti,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: false,
                        onCustomRender: (field, value, onUpdate, item: IDataFilterConfiguration, itemId) => {
                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(Checkbox, {
                                    defaultChecked: item.selectedTemplate === BuiltinFilterTemplates.DateRange || item.selectedTemplate === BuiltinFilterTemplates.DateInterval ? false : item.isMulti,
                                    disabled: item.selectedTemplate === BuiltinFilterTemplates.DateRange || item.selectedTemplate === BuiltinFilterTemplates.DateInterval,
                                    onChange: (ev, checked: boolean) => {
                                        onUpdate(field.id, checked);
                                    }
                                })
                            );
                        }
                    },
                    {
                        id: 'operator',
                        title: webPartStrings.PropertyPane.DataFilterCollection.Operator,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: FilterConditionOperator.AND,
                        onCustomRender: (field, value, onUpdate, item: IDataFilterConfiguration, itemId) => {

                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(Dropdown, {
                                    disabled: item.isMulti ? false : true,
                                    onChange: (event: React.FormEvent<HTMLDivElement>, optionItem: IDropdownOption) => {
                                        onUpdate(field.id, optionItem.key);
                                    },
                                    selectedKey: item.selectedTemplate === BuiltinFilterTemplates.DateRange || item.selectedTemplate === BuiltinFilterTemplates.DateInterval ? FilterConditionOperator.AND : item.operator,
                                    options: [
                                        {
                                            key: FilterConditionOperator.AND,
                                            text: webPartStrings.PropertyPane.DataFilterCollection.ANDOperator
                                        },
                                        {
                                            key: FilterConditionOperator.OR,
                                            text: webPartStrings.PropertyPane.DataFilterCollection.OROperator
                                        }
                                    ]
                                } as IDropdownProps));
                        },
                        required: false,
                    },
                    {
                        id: 'sortBy',
                        title: webPartStrings.PropertyPane.DataFilterCollection.SortBy,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: FilterSortType.ByName,
                        onCustomRender: (field, value, onUpdate, item) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Dropdown, {
                                        options: [
                                            {
                                                key: FilterSortType.ByName,
                                                text: webPartStrings.PropertyPane.DataFilterCollection.SortByName
                                            },
                                            {
                                                key: FilterSortType.ByCount,
                                                text: webPartStrings.PropertyPane.DataFilterCollection.SortByCount
                                            },
                                        ],
                                        disabled: item.selectedTemplate === BuiltinFilterTemplates.DateRange || item.selectedTemplate === BuiltinFilterTemplates.DateInterval,
                                        defaultSelectedKey: item.sortBy,
                                        onChange: (ev, option) => onUpdate(field.id, option.key),
                                    } as IDropdownProps)
                                )
                            );
                        }
                    },
                    {
                        id: 'sortDirection',
                        title: webPartStrings.PropertyPane.DataFilterCollection.SortDirection,
                        type: this._customCollectionFieldType.custom,
                        defaultValue: FilterSortDirection.Ascending,
                        onCustomRender: (field, value, onUpdate, item) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Dropdown, {
                                        options: [
                                            {
                                                key: FilterSortDirection.Ascending,
                                                text: webPartStrings.PropertyPane.DataFilterCollection.SortAscending
                                            },
                                            {
                                                key: FilterSortDirection.Descending,
                                                text: webPartStrings.PropertyPane.DataFilterCollection.SortDescending
                                            },
                                        ],
                                        disabled: item.selectedTemplate === BuiltinFilterTemplates.DateRange || item.selectedTemplate === BuiltinFilterTemplates.DateInterval,
                                        defaultSelectedKey: item.sortDirection,
                                        onChange: (ev, option) => onUpdate(field.id, option.key),
                                    } as IDropdownProps)
                                )
                            );
                        }
                    }
                ]
            }),
            PropertyPaneChoiceGroup('filterOperator', {
                label: webPartStrings.PropertyPane.FiltersSettingsPage.FilterOperator,
                options: [
                    {
                        key: FilterConditionOperator.AND,
                        text: webPartStrings.PropertyPane.DataFilterCollection.ANDOperator
                    },
                    {
                        key: FilterConditionOperator.OR,
                        text: webPartStrings.PropertyPane.DataFilterCollection.OROperator
                    }
                ],
            })
        ];

        return filterSettings;
    }

    /**
     * Custom handler when the external template file URL
     * @param value the template file URL value
     */
    private async onTemplateUrlChange(value: string): Promise<string> {

        try {
            // Doesn't raise any error if file is empty (otherwise error message will show on initial load...)
            if (isEmpty(value)) {
                return '';
            }
            // Resolves an error if the file isn't a valid .htm or .html file
            else if (!this.templateService.isValidTemplateFile(value)) {
                return webPartStrings.PropertyPane.LayoutPage.ErrorTemplateExtension;
            }
            // Resolves an error if the file doesn't answer a simple head request
            else {
                await this.templateService.ensureFileResolves(value);
                return '';
            }
        } catch (error) {
            return Text.format(webPartStrings.PropertyPane.LayoutPage.ErrorTemplateResolve, error);
        }
    }

    /**
     * Initializes the template according to the property pane current configuration
     * @returns the template content as a string
     */
    private async initTemplate(): Promise<void> {

        // Gets the template content according to the selected key
        const selectedLayoutTemplateContent = this.availableLayoutDefinitions.filter(layout => { return layout.key === this.properties.selectedLayoutKey; })[0].templateContent;

        if (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.FiltersCustom) {

            if (this.properties.externalTemplateUrl) {
                this.templateContentToDisplay = await this.templateService.getFileContent(this.properties.externalTemplateUrl);
            } else {
                this.templateContentToDisplay = this.properties.inlineTemplateContent ? this.properties.inlineTemplateContent : selectedLayoutTemplateContent;
            }

        } else {
            this.templateContentToDisplay = selectedLayoutTemplateContent;
        }

        return;
    }

    private initializeWebPartServices(): void {
        this.webPartInstanceServiceScope = this.context.serviceScope.startNewChild();
        this.templateService = this.webPartInstanceServiceScope.createAndProvide(TemplateService.ServiceKey, TemplateService);
        this.dynamicDataService = this.webPartInstanceServiceScope.createAndProvide(DynamicDataService.ServiceKey, DynamicDataService);
        this.dynamicDataService.dynamicDataProvider = this.context.dynamicDataProvider;
        this.webPartInstanceServiceScope.finish();
    }

    /**
     * Initializes required Web Part properties
     */
    private initializeProperties() {

        this.properties.selectedLayoutKey = this.properties.selectedLayoutKey ? this.properties.selectedLayoutKey : BuiltinLayoutsKeys.Vertical;
        this.properties.inlineTemplateContent = this.properties.inlineTemplateContent ? this.properties.inlineTemplateContent : '';
        this.properties.filterOperator = this.properties.filterOperator ? this.properties.filterOperator : FilterConditionOperator.OR;
        this.properties.layoutProperties = this.properties.layoutProperties ? this.properties.layoutProperties : {};
        this.properties.dataResultsDataSourceReferences = this.properties.dataResultsDataSourceReferences ? this.properties.dataResultsDataSourceReferences : [];

        if (!this.properties.filtersConfiguration) {
            this.properties.filtersConfiguration = [];
        }
    }

    /**
     * Make sure the dynamic properties are correctly connected to the corresponding sources according to the proeprty pane settings
     */
    private ensureDataSourcesConnection() {

        // First, unregister the properties every time. Simpler than updated existing ones.
        this._dataSourceDynamicProperties.forEach(dynamicProperty => {
            dynamicProperty.unregister(this.render);
        });

        // Then reset the dynamic properties to an empty array to start connections over.
        this._dataSourceDynamicProperties = [];

        // Search Results Web Part data sources
        if (this.properties.dataResultsDataSourceReferences.length > 0) {

            this.properties.dataResultsDataSourceReferences.forEach(reference => {

                const dataSourceDynamicProperty = new DynamicProperty<IDataResultSourceData>(this.context.dynamicDataProvider);

                // Register the data source manually since we don't want user select properties manually via native property pane controls
                dataSourceDynamicProperty.setReference(reference);
                dataSourceDynamicProperty.register(this.render);

                this._dataSourceDynamicProperties.push(dataSourceDynamicProperty);
            });
        }
    }

    private async loadPropertyPaneResources(): Promise<void> {

        const { PropertyFieldCodeEditor, PropertyFieldCodeEditorLanguages } = await import(
            /* webpackChunkName: 'data-filter-property-pane' */
            '@pnp/spfx-property-controls/lib/propertyFields/codeEditor'
        );

        this._propertyFieldCodeEditor = PropertyFieldCodeEditor;
        this._propertyFieldCodeEditorLanguages = PropertyFieldCodeEditorLanguages;

        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
            /* webpackChunkName: 'data-filter-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );
        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;

        this.propertyPaneConnectionsFields = await this.getConnectionOptions();
    }

    /**
     * Returns layout template options if any
     */
    private getLayoutTemplateOptions(): IPropertyPaneField<any>[] {

        if (this.layout) {
            return this.layout.getPropertyPaneFieldsConfiguration([]);
        } else {
            return [];
        }
    }

    /**
     * Initializes filter results according to 'Static' type filters in the configuration
     * @param filtersConfiguration The current filters configurations
     */
    private _initStaticFilters(filterResults: IDataFilterResult[], filtersConfiguration: IDataFilterConfiguration[]): IDataFilterResult[] {

        let updatedFilterResults = cloneDeep(filterResults);

        // Get the corresponding configuration for this filter
        filtersConfiguration.forEach(filterConfiguration => {

            if (filterConfiguration.type === FilterType.StaticFilter) {

                // Check if the filter already exists
                if (filterResults.filter(filterResult => filterResult.filterName === filterConfiguration.filterName).length === 0) {
                    updatedFilterResults.push({
                        filterName: filterConfiguration.filterName,
                        values: [
                        ]
                    });
                }
            }
        });

        return updatedFilterResults;
    }

    /**
     * Merges the filters data coming from multiple connected sources
     * @param dynamicProperties the dynamic properties for connected sources
     */
    private mergeFiltersDataFromSources(dynamicProperties: DynamicProperty<IDataResultSourceData>[]): IDataResultSourceData {

        let dataResultsSourceData: IDataResultSourceData = {
            availableFieldsFromResults: [],
            availablefilters: []
        };

        let allAvailableFieldsFromResults: string[] = [];
        let allAvailableFilters: IDataFilterResult[] = [];

        let allMergedFilters: IDataFilterResult[] = [];

        // Get values for all dynamic properties
        dynamicProperties.forEach(dataSourceDynamicProperty => {

            const dataSourceData = dataSourceDynamicProperty.tryGetValue();
            if (dataSourceData) {

                // 1. Concatenate all values from all connected results Web Parts
                allAvailableFieldsFromResults = allAvailableFieldsFromResults.concat(dataSourceData.availableFieldsFromResults);
                allAvailableFilters = allAvailableFilters.concat(dataSourceData.availablefilters);
            }
        });

        // 2. Concatenate all values from similar filters
        allAvailableFilters.forEach(filterResult => {

            const mergedFilterIdx = allMergedFilters.map(m => m.filterName).indexOf(filterResult.filterName);

            if (mergedFilterIdx === -1) {
                allMergedFilters.push(filterResult);
            } else {

                let allMergedValues: IDataFilterResultValue[] = [];
                const allValues = allMergedFilters[mergedFilterIdx].values.concat(filterResult.values);

                // 3. Sum counts for similar value names
                allValues.forEach(value => {

                    const mergedValueIdx = allMergedValues.map(v => v.name).indexOf(value.name);

                    if (mergedValueIdx === -1) {
                        allMergedValues.push(value);
                    } else {
                        allMergedValues[mergedValueIdx].count = allMergedValues[mergedValueIdx].count + value.count;
                    }
                });

                allMergedFilters[mergedFilterIdx].values = allMergedValues;
            }
        });

        // 4. Sort all values according to filter configuration
        const sortedFilters = allMergedFilters.map(filter => {

            let sortByField = 'name';
            let sortDirection = FilterSortDirection.Ascending;

            const filterConfigurationIdx = this.properties.filtersConfiguration.map(configuration => configuration.filterName).indexOf(filter.filterName);
            if (filterConfigurationIdx !== -1) {

                const filterConfiguration = this.properties.filtersConfiguration[filterConfigurationIdx];
                if (filterConfiguration.sortBy === FilterSortType.ByCount) {
                    sortByField = 'count';
                }

                if (filterConfiguration.sortDirection === FilterSortDirection.Descending) {
                    sortDirection = FilterSortDirection.Descending;
                }
            }

            filter.values = sortDirection === FilterSortDirection.Ascending ? sortBy(filter.values, sortByField) : sortBy(filter.values, sortByField).reverse();

            return filter;
        });

        dataResultsSourceData.availablefilters = sortedFilters;
        dataResultsSourceData.availableFieldsFromResults = uniq(allAvailableFieldsFromResults);

        return dataResultsSourceData;
    }
}
