import * as React from "react";
import { BaseLayout } from "@pnp/modern-search-extensibility";
import * as strings from 'CommonStrings';
import * as propertyControlStrings from 'PropertyControlStrings';
import { IComboBoxOption } from 'office-ui-fabric-react';
import { IDetailsListColumnConfiguration } from '../../../components/DetailsListComponent';
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneDropdown, PropertyPaneHorizontalRule, PropertyPaneButton, PropertyPaneButtonType } from '@microsoft/sp-property-pane';
import { TemplateValueFieldEditor, ITemplateValueFieldEditorProps } from '../../../controls/TemplateValueFieldEditor/TemplateValueFieldEditor';
import { AsyncCombo } from "../../../controls/PropertyPaneAsyncCombo/components/AsyncCombo";
import { IAsyncComboProps } from "../../../controls/PropertyPaneAsyncCombo/components/IAsyncComboProps";
import { SharePointSearchService } from "../../../services/searchService/SharePointSearchService";
import { ISharePointSearchService } from "../../../services/searchService/ISharePointSearchService";
import { ICustomCollectionField } from "@pnp/spfx-property-controls/lib/propertyFields/collectionData/ICustomCollectionField";

/**
 * Details List Builtin Layout
 */
export interface IDetailsListLayoutProperties {

    /**
     * The details list column configuration
     */
    detailsListColumns: IDetailsListColumnConfiguration[];

    /**
     * Shows or hide the file icon in the first column
     */
    showFileIcon: boolean;

    /**
     * Show the details list as compact
     */
    isCompact: boolean;

    /**
     * The field to use for file extension 
     */
    fieldIconExtension: string;

    /**
     * If we should group items by property
     */
    enableGrouping: boolean;

    /**
     * The field used to group items in the list
     */
    groupByField: string;

    /**
     * If groups should collapsed by default
     */
    groupsCollapsed: boolean;
}

export class DetailsListLayout extends BaseLayout<IDetailsListLayoutProperties> {

    /**
     * Dynamically loaded components for property pane
     */
    private _propertyFieldCollectionData: any = null;
    private _customCollectionFieldType: any = null;
    private _sharePointSearchService: ISharePointSearchService;

    public async onInit(): Promise<void> {

        // Setup default values
        this.properties.detailsListColumns = this.properties.detailsListColumns ? this.properties.detailsListColumns :
            [
                {
                    name: 'Title',
                    value: '<a href="{{slot item @root.slots.PreviewUrl}}" target="_blank" style="color: {{@root.theme.semanticColors.link}}">\n\t{{slot item @root.slots.Title}}\n</a>',
                    valueSorting: 'Title',
                    useHandlebarsExpr: true,
                    minWidth: '80',
                    maxWidth: '300',
                    enableSorting: true,
                    isMultiline: false,
                    isResizable: true
                },
                {
                    name: 'Created',
                    value: "{{getDate (slot item @root.slots.Date) 'LL'}}",
                    valueSorting: 'Created',
                    useHandlebarsExpr: true,
                    minWidth: '80',
                    maxWidth: '120',
                    enableSorting: false,
                    isMultiline: false,
                    isResizable: false
                },
                {
                    name: 'Summary',
                    value: "{{getSummary (slot item @root.slots.Summary)}}",
                    useHandlebarsExpr: true,
                    minWidth: '80',
                    maxWidth: '300',
                    enableSorting: false,
                    isMultiline: true,
                    isResizable: false
                }
            ] as IDetailsListColumnConfiguration[];

        this.properties.isCompact = this.properties.isCompact !== null && this.properties.isCompact !== undefined ? this.properties.isCompact : false;
        this.properties.showFileIcon = this.properties.showFileIcon !== null && this.properties.showFileIcon !== undefined ? this.properties.showFileIcon : true;
        this.properties.fieldIconExtension = this.properties.fieldIconExtension ? this.properties.fieldIconExtension : 'FileType';
        this.properties.enableGrouping = this.properties.enableGrouping !== null && this.properties.enableGrouping !== undefined ? this.properties.enableGrouping : false;
        this.properties.groupByField = this.properties.groupByField ? this.properties.groupByField : '';
        this.properties.groupsCollapsed = this.properties.groupsCollapsed !== null && this.properties.groupsCollapsed !== undefined ? this.properties.groupsCollapsed : true;

        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
            /* webpackChunkName: 'pnp-modern-search-results-detailslist-layout' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );

        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;
        
        this._sharePointSearchService = this.context.serviceScope.consume<ISharePointSearchService>(SharePointSearchService.ServiceKey);
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        let availableOptions: IComboBoxOption[] = availableFields.map((fieldName) => { return { key: fieldName, text: fieldName } as IComboBoxOption; });

        // Sort ascending
        availableOptions = availableOptions.sort((a, b) => {

            const aValue = a.text ? a.text : a.key ? a.key.toString() : null;
            const bValue = b.text ? b.text : b.key ? b.key.toString() : null;

            if (aValue && bValue) {
                if (aValue.toLowerCase() > bValue.toLowerCase()) return 1;
                if (bValue.toLowerCase() > aValue.toLowerCase()) return -1;
            }

            return 0;
        });

        const ignoreSortableValidation = availableOptions.findIndex(o => o.key === 'rank') > -1;

        // Column builder
        let propertyPaneFields: IPropertyPaneField<any>[] = [

            this._propertyFieldCollectionData('layoutProperties.detailsListColumns', {
                manageBtnLabel: strings.Layouts.DetailsList.ManageDetailsListColumnLabel,
                key: 'layoutProperties.detailsListColumns',
                panelHeader: strings.Layouts.DetailsList.ManageDetailsListColumnLabel,
                panelDescription: strings.Layouts.DetailsList.ManageDetailsListColumnDescription,
                enableSorting: true,
                label: strings.Layouts.DetailsList.ManageDetailsListColumnLabel,
                value: this.properties.detailsListColumns,
                fields: [
                    {
                        id: 'name',
                        title: strings.Layouts.DetailsList.DisplayNameColumnLabel,
                        type: this._customCollectionFieldType.string,
                        required: true,
                    },
                    {
                        id: 'value',
                        title: strings.Layouts.DetailsList.ValueColumnLabel,
                        type: this._customCollectionFieldType.custom,
                        required: true,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            return React.createElement("div", { key: `${field.id}-${itemId}` },
                                React.createElement(TemplateValueFieldEditor, {
                                    currentItem: item,
                                    field: field,
                                    useHandlebarsExpr: item.useHandlebarsExpr,
                                    onUpdate: (fieldId, value) => {
                                        if(item.useHandlebarsExpr) { onUpdate(fieldId, value); }
                                        else { this._handleDynamicSorting(value, field, item, ignoreSortableValidation, onCustomFieldValidation, onUpdate); }
                                    },
                                    value: value,
                                    availableProperties: availableOptions,
                                } as ITemplateValueFieldEditorProps)
                            );
                        }
                    },
                    {
                        id: 'valueSorting',
                        title: strings.Layouts.DetailsList.ValueSortingColumnLabel,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, _value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            return item.useHandlebarsExpr && item.enableSorting &&
                                React.createElement("div", { key: `${field.id}-${itemId}` },
                                    React.createElement(AsyncCombo, {
                                        allowFreeform: false,
                                        availableOptions: availableOptions,
                                        placeholder: strings.Layouts.DetailsList.ValueSortingColumnLabel,
                                        textDisplayValue: item[field.id] ? item[field.id] : '',
                                        defaultSelectedKey: item[field.id] ? item[field.id] : '',
                                        onUpdate: (filterValue: IComboBoxOption) => {
                                            this._handleDynamicSorting(filterValue.key as string, field, item, ignoreSortableValidation, onCustomFieldValidation, (fieldId, value) => 
                                            {
                                                onUpdate(field.id, value);
                                            });
                                        }
                                    } as IAsyncComboProps));
                        },
                        isVisible: (field, items) => {
                            return items && items.findIndex(i => i.useHandlebarsExpr && i.enableSorting) >= 0;
                        },
                        onGetErrorMessage: (value, index, currentItem) => {
                            if(currentItem && !value && currentItem.useHandlebarsExpr && currentItem.enableSorting)  {
                                return propertyControlStrings.CollectionDataItemFieldRequiredLabel
                            }
                            return '';
                        }
                    },
                    {
                        id: 'useHandlebarsExpr',
                        type: this._customCollectionFieldType.boolean,
                        defaultValue: false,
                        title: strings.Layouts.DetailsList.UseHandlebarsExpressionLabel,
                        required: false
                    },
                    {
                        id: 'minWidth',
                        title: strings.Layouts.DetailsList.MinimumWidthColumnLabel,
                        type: this._customCollectionFieldType.number,
                        required: false,
                        defaultValue: 50
                    },
                    {
                        id: 'maxWidth',
                        title: strings.Layouts.DetailsList.MaximumWidthColumnLabel,
                        type: this._customCollectionFieldType.number,
                        required: false,
                        defaultValue: 310
                    },
                    {
                        id: 'enableSorting',
                        title: strings.Layouts.DetailsList.SortableColumnLabel,
                        type: this._customCollectionFieldType.dropdown,
                        defaultValue: false,
                        required: false,
                        options: [
                            { key: false, text: strings.DataSources.SearchCommon.Sort.EnableSortingNoLabel },
                            { key: true, text: strings.DataSources.SearchCommon.Sort.EnableSortingYesStaticLabel },
                            { key: 'dynamic', text: strings.DataSources.SearchCommon.Sort.EnableSortingYesDynamicLabel }
                        ]
                    },
                    {
                        id: 'isResizable',
                        title: strings.Layouts.DetailsList.ResizableColumnLabel,
                        type: this._customCollectionFieldType.boolean,
                        defaultValue: false,
                        required: false
                    },
                    {
                        id: 'isMultiline',
                        title: strings.Layouts.DetailsList.MultilineColumnLabel,
                        type: this._customCollectionFieldType.boolean,
                        defaultValue: false,
                        required: false
                    }
                ]
            }),
            PropertyPaneButton('layoutProperties.resetFields', {
                buttonType: PropertyPaneButtonType.Command,
                icon: 'Refresh',
                text: strings.Layouts.DetailsList.ResetFieldsBtnLabel,
                onClick: () => {
                    // Just reset the fields
                    this.properties.detailsListColumns = null;
                    this.onInit();
                }
            }),
            // Compact mode
            PropertyPaneToggle('layoutProperties.isCompact', {
                label: strings.Layouts.DetailsList.CompactModeLabel,
                checked: this.properties.isCompact ? this.properties.isCompact : true
            }),
            PropertyPaneToggle('layoutProperties.showFileIcon', {
                label: strings.Layouts.DetailsList.ShowFileIcon,
                checked: this.properties.showFileIcon
            }),
        ];

        // Show file icon
        if (this.properties.showFileIcon) {

            propertyPaneFields.push(
                PropertyPaneDropdown('layoutProperties.fieldIconExtension', {
                    label: strings.Layouts.DetailsList.FileExtensionFieldLabel,
                    options: availableOptions,
                    selectedKey: this.properties.fieldIconExtension
                }),
                PropertyPaneHorizontalRule()
            );
        }

        propertyPaneFields.push(
            PropertyPaneToggle('layoutProperties.enableGrouping', {
                label: strings.Layouts.DetailsList.EnableGrouping,
                checked: this.properties.enableGrouping
            }));

        // Grouping options
        if (this.properties.enableGrouping) {

            propertyPaneFields.push(
                PropertyPaneDropdown('layoutProperties.groupByField', {
                    label: strings.Layouts.DetailsList.GroupByFieldLabel,
                    options: availableOptions,
                    selectedKey: this.properties.groupByField
                }),
                PropertyPaneToggle('layoutProperties.groupsCollapsed', {
                    label: strings.Layouts.DetailsList.CollapsedGroupsByDefault,
                    checked: this.properties.groupsCollapsed
                })
            );
        }

        return propertyPaneFields;
    }

    public onPropertyUpdate(propertyPath: string, newValue: any, oldValue: any) {

        if (propertyPath.localeCompare('layoutProperties.enableGrouping') === 0) {
            this.properties.groupByField = '';
        }
    }

    private _handleDynamicSorting(value: string, field: ICustomCollectionField, item: IDetailsListColumnConfiguration,  ignoreValidation: boolean, onCustomFieldValidation: (fieldId: string, errorMessage: string) => void, onUpdate: (fieldId: string, value: any) => void) {
        if(ignoreValidation || item.enableSorting !== 'dynamic') {
            onUpdate(field.id, value);
        } else {
            // TODO: How to detect Microsoft Search as source?
            this._sharePointSearchService.validateSortableProperty(value).then((sortable: boolean) => {
                if (!sortable) {
                    onCustomFieldValidation(field.id, strings.DataSources.SearchCommon.Sort.SortInvalidSortableFieldMessage);
                } else {            
                    onUpdate(field.id, value);
                    onCustomFieldValidation(field.id, '');
                }
            });
        }
    }
}
