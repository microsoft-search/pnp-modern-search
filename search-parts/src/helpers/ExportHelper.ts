import * as React from 'react';
import { IExportLayoutProperties } from '../models/common/IExportLayoutProperties';
import * as strings from 'CommonStrings';
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneButton, PropertyPaneButtonType } from '@microsoft/sp-property-pane';
import { ITemplateValueFieldEditorProps, TemplateValueFieldEditor } from '../controls/TemplateValueFieldEditor/TemplateValueFieldEditor';
import { IComboBoxOption } from 'office-ui-fabric-react';
import { BaseLayout } from '@pnp/modern-search-extensibility/lib/models/layouts/BaseLayout';
import { IExportColumnConfiguration } from '../models/common/IExportColumnConfiguration';
import { IDataResultsTemplateContext } from '../models/common/ITemplateContext';

export class ExportHelper {

    public static appendPropertyPaneFieldsConfigurationForExport(layout: BaseLayout<IExportLayoutProperties>, availableOptions: IComboBoxOption[], propertyPaneFields: IPropertyPaneField<any>[], propertyFieldCollectionData: any, customCollectionFieldType): IPropertyPaneField<any>[] {
        propertyPaneFields.push(
            PropertyPaneToggle('layoutProperties.enableExport', {
                label: strings.Layouts.Shared.EnableExport,
                checked: layout.properties.enableExport
            }));

        // Export options
        if (layout.properties.enableExport) {
            layout.properties.exportColumns = layout.properties.exportColumns ?? this.getDefaultExportColumns();
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

    public static getDefaultExportColumns() : IExportColumnConfiguration[] { 
        return [
            {
                name: 'Title',
                value: '{{slot item @root.slots.Title}}}',
                useHandlebarsExpr: true,
            },
            {
                name: 'Created',
                value: "{{getDate (slot item @root.slots.Date) 'LL'}}",
                useHandlebarsExpr: true,
            }
        ];
    }

    public static getReferencedProperties(columnsConfiguration: IExportColumnConfiguration[], context: IDataResultsTemplateContext) : string[] {
        const regexpItem = new RegExp(/item\.(\w+)/gm);
        const regexpSlots = new RegExp(/slots\.(\w+)/gm);
        return columnsConfiguration.map(column => {
            const result = []
            if (!column.useHandlebarsExpr && column.value) result.push(column.value);
            else if (column.value) {
                let match: RegExpExecArray;
                while ((match = regexpItem.exec(column.value)) !== null) {
                    result.push(match[1]);
                }
                while ((match = regexpSlots.exec(column.value)) !== null) {
                    result.push(context.slots[match[1]]);
                }
            }
            return result;
        })
        .reduce((pv, cv) => pv.concat(cv))
        .filter((value, index, self) => value && self.indexOf(value) === index);
    }

    public static exportToCsv(filename: string, rows: object[], headers?: string[]): void {
        if (!rows || !rows.length) {
            return;
        }
        const separator: string = ";";

        const keys: string[] = Object.keys(rows[0]);

        let columHearders: string[];

        if (headers) {
            columHearders = headers;
        } else {
            columHearders = keys;
        }

        const content =
            columHearders.join(separator) +
            '\n' +
            rows.map(row => {
                return keys.map(k => {
                    let cell = row[k] === null || row[k] === undefined ? '' : row[k];

                    cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');

                    if (cell.search(/("|;|\n)/g) >= 0) {
                        cell = `"${cell}"`;
                    }

                    return cell;
                }).join(separator);
            }).join('\n');

        const BOM = "\uFEFF";
        const csvContent = BOM + content;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

        const link = document.createElement('a');
        if (link.download !== undefined) {
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.setAttribute('data-interception', 'off');
            link.setAttribute('target', '_blank');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}