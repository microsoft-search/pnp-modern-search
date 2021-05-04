import * as React from "react";
import { BaseLayout } from "@pnp/modern-search-extensibility";
import * as strings from 'CommonStrings';
import { IComboBoxOption } from 'office-ui-fabric-react';
import { IDetailsListColumnConfiguration } from '../../../components/DetailsListComponent';
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneDropdown, PropertyPaneHorizontalRule, PropertyPaneButton, PropertyPaneButtonType } from '@microsoft/sp-property-pane';
import { TemplateValueFieldEditor, ITemplateValueFieldEditorProps } from '../../../controls/TemplateValueFieldEditor/TemplateValueFieldEditor';

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

    public async onInit(): Promise<void> {

        // Setup default values
        this.properties.detailsListColumns = this.properties.detailsListColumns ? this.properties.detailsListColumns :
                                                [
                                                    {
                                                        name: 'Title',
                                                        value: '<a href="{{slot item @root.slots.PreviewUrl}}" target="_blank" style="color: {{@root.theme.semanticColors.link}}">\n\t{{slot item @root.slots.Title}}\n</a>',
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

        this.properties.isCompact = this.properties.isCompact !== null && this.properties.isCompact !== undefined ?  this.properties.isCompact: false;
        this.properties.showFileIcon = this.properties.showFileIcon !== null && this.properties.showFileIcon !== undefined ?  this.properties.showFileIcon : true;
        this.properties.fieldIconExtension = this.properties.fieldIconExtension ?  this.properties.fieldIconExtension: 'FileType';
        this.properties.enableGrouping = this.properties.enableGrouping !== null && this.properties.enableGrouping !== undefined ?  this.properties.enableGrouping: false;
        this.properties.groupByField = this.properties.groupByField ?  this.properties.groupByField: '';     
        this.properties.groupsCollapsed = this.properties.groupsCollapsed !== null && this.properties.groupsCollapsed !== undefined ?  this.properties.groupsCollapsed: true;
    
        const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
            /* webpackChunkName: 'pnp-modern-search-property-pane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
        );

        this._propertyFieldCollectionData = PropertyFieldCollectionData;
        this._customCollectionFieldType = CustomCollectionFieldType;
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        let availableOptions: IComboBoxOption[] = availableFields.map((fieldName) => { return  { key: fieldName, text: fieldName } as IComboBoxOption; });

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
                        title:strings.Layouts.DetailsList.ValueColumnLabel,
                        type: this._customCollectionFieldType.custom,
                        required: true,
                        onCustomRender: (field, value, onUpdate, item, itemId, onCustomFieldValidation) => {
                            return React.createElement("div", { key: `${field.id}-${itemId}` }, 
                                React.createElement(TemplateValueFieldEditor, {
                                    currentItem: item,
                                    field: field,
                                    useHandlebarsExpr: item.useHandlebarsExpr,
                                    onUpdate: onUpdate,
                                    value: value,
                                    availableProperties: availableOptions,
                                } as ITemplateValueFieldEditorProps)
                            );
                        }
                    },
                    {
                        id: 'useHandlebarsExpr',
                        type: this._customCollectionFieldType.boolean,
                        defaultValue: false,
                        title: strings.Layouts.DetailsList.UseHandlebarsExpressionLabel
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
                        type: this._customCollectionFieldType.boolean,
                        defaultValue: false,
                        required: false                                
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
                onClick: ()=> {
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
}