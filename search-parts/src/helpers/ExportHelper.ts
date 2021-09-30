import * as React from 'react';
import { IExportLayoutProperties } from '../models/common/IExportLayoutProperties';
import * as strings from 'CommonStrings';
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneButton, PropertyPaneButtonType } from '@microsoft/sp-property-pane';
import { ITemplateValueFieldEditorProps, TemplateValueFieldEditor } from '../controls/TemplateValueFieldEditor/TemplateValueFieldEditor';
import { IComboBoxOption } from 'office-ui-fabric-react';
import { BaseLayout } from '@pnp/modern-search-extensibility/lib/models/layouts/BaseLayout';

export class ExportHelper {

    public static appendPropertyPaneFieldsConfigurationForExport(layout: BaseLayout<IExportLayoutProperties>, availableOptions: IComboBoxOption[], propertyPaneFields: IPropertyPaneField<any>[], propertyFieldCollectionData: any, customCollectionFieldType): IPropertyPaneField<any>[] {
        propertyPaneFields.push(
            PropertyPaneToggle('layoutProperties.enableExport', {
                label: strings.Layouts.Shared.EnableExport,
                checked: layout.properties.enableExport
            }));

        // Export options
        if (layout.properties.enableExport) {
            propertyPaneFields.push(
                propertyFieldCollectionData('layoutProperties.exportColumns', {
                    manageBtnLabel: strings.Layouts.Shared.ManageExportColumnsLabel,
                    key: 'layoutProperties.exportColumns',
                    panelHeader: strings.Layouts.Shared.ManageExportColumnsLabel,
                    panelDescription: strings.Layouts.Shared.ManageExportColumnsDescription,
                    enableSorting: true,
                    label: strings.Layouts.Shared.ManageExportColumnsLabel,
                    value: layout.properties.exportColumns,
                    fields: [
                        {
                            id: 'name',
                            title: strings.Layouts.Shared.DisplayNameColumnLabel,
                            type: customCollectionFieldType.string,
                            required: true,
                        },
                        {
                            id: 'value',
                            title: strings.Layouts.Shared.ValueColumnLabel,
                            type: customCollectionFieldType.custom,
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
                            type: customCollectionFieldType.boolean,
                            defaultValue: false,
                            title: strings.Layouts.Shared.UseHandlebarsExpressionLabel
                        }
                    ]
                }),
                PropertyPaneButton('layoutProperties.resetExportFields', {
                    buttonType: PropertyPaneButtonType.Command,
                    icon: 'Refresh',
                    text: strings.Layouts.Shared.ResetFieldsBtnLabel,
                    onClick: () => {
                        // Just reset the fields
                        layout.properties.exportColumns = null;
                        layout.onInit();
                    }
                })
            );
        }
        return propertyPaneFields;
    }
}