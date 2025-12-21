import { IPropertyPaneGroup, IPropertyPaneField, PropertyPaneToggle, PropertyPaneTextField, PropertyPaneSlider, PropertyPaneHorizontalRule, PropertyPaneChoiceGroup } from "@microsoft/sp-property-pane";
import { Text } from '@microsoft/sp-core-library';
import { LayoutRenderType } from '@pnp/modern-search-extensibility';
import { BuiltinLayoutsKeys } from '../../../layouts/AvailableLayouts';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import { PropertyFieldMessage } from '@pnp/spfx-property-controls/lib/PropertyFieldMessage';
import { PropertyFieldColorPicker, PropertyFieldColorPickerStyle } from '@pnp/spfx-property-controls/lib/PropertyFieldColorPicker';
import { PropertyPaneButton, PropertyPaneButtonType } from "@microsoft/sp-property-pane";
import ISearchResultsWebPartProps from '../ISearchResultsWebPartProps';
import { ResultTypeOperator } from '../../../models/common/IDataResultType';
import * as React from 'react';
import { LayoutHelper } from '../../../helpers/LayoutHelper';
import { PropertyPaneTabsField } from '../../../controls/PropertyPaneTabsField/PropertyPaneTabsField';

export class StylingPageGroupsBuilder {

    constructor(
        private properties: ISearchResultsWebPartProps,
        private availableLayoutDefinitions: any[],
        private templateContentToDisplay: string,
        private layoutSlotNames: string[],
        private resultTypesSlotNames: string[],
        private webPartStrings: any,
        private propertyFieldCodeEditor: any,
        private propertyFieldCodeEditorLanguages: any,
        private propertyFieldCollectionData: any,
        private customCollectionFieldType: any,
        private textDialogComponent: any,
        private onPropertyPaneFieldChanged: any,
        private onTemplateUrlChange: any,
        private getSelectedProperties: () => string[],
        private getLayoutTemplateOptions: () => IPropertyPaneField<any>[],
        private getTitleStylingPropertyPaneGroup: () => IPropertyPaneGroup,
        private resetContentStylingToDefault: () => void,
        private filtersDataSourceReference: any,
        private defaultTemplates: {
            simpleList: string;
            cards: string;
            custom: string;
            people: string;
        }
    ) {}

    public getStylingPageGroups(): IPropertyPaneGroup[] {
        const canEditTemplate = this.properties.externalTemplateUrl && 
            (this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomHandlebars || 
             this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomAdaptiveCards) ? false : true;

        let stylingFields: IPropertyPaneField<any>[] = this.buildLayoutSelectionFields(canEditTemplate);
        
        let groups: IPropertyPaneGroup[] = [
            {
                groupName: this.webPartStrings.PropertyPane.LayoutPage.LayoutSelectionGroupName,
                groupFields: stylingFields
            }
        ];

        groups.push(...this.buildCommonOptionsGroup());
        groups.push(this.buildStylingOptionsGroup());
        groups.push(this.getTitleStylingPropertyPaneGroup());

        const layoutOptions = this.getLayoutTemplateOptions();
        if (layoutOptions.length > 0) {
            groups.push({
                groupName: this.webPartStrings.PropertyPane.LayoutPage.LayoutTemplateOptionsGroupName,
                groupFields: layoutOptions
            });
        }

        return groups;
    }

    private buildLayoutSelectionFields(canEditTemplate: boolean): IPropertyPaneField<any>[] {
        const fields: IPropertyPaneField<any>[] = [];

        // Add render type tabs and layout selection
        const filteredLayouts = this.availableLayoutDefinitions.filter(layout => layout.renderType === this.properties.layoutRenderType);
        
        fields.push(
            new PropertyPaneTabsField('layoutRenderType', {
                options: [
                    {
                        key: LayoutRenderType[LayoutRenderType.Handlebars],
                        text: this.webPartStrings.PropertyPane.LayoutPage.HandlebarsRenderTypeLabel,
                        title: this.webPartStrings.PropertyPane.LayoutPage.HandlebarsRenderTypeDesc,
                    },
                    {
                        key: LayoutRenderType[LayoutRenderType.AdaptiveCards],
                        text: this.webPartStrings.PropertyPane.LayoutPage.AdaptiveCardsRenderTypeLabel,
                        title: this.webPartStrings.PropertyPane.LayoutPage.AdaptiveCardsRenderTypeDesc,
                    }
                ],
                defaultSelectedKey: LayoutRenderType[this.properties.layoutRenderType],
                onPropertyChange: this.onPropertyPaneFieldChanged
            }),
            PropertyPaneChoiceGroup('selectedLayoutKey', {
                options: LayoutHelper.getLayoutOptions(filteredLayouts)
            })
        );

        // Add template editor and URL fields
        fields.push(...this.buildTemplateEditorFields(canEditTemplate));

        // Add slot validation messages
        fields.push(...this.buildSlotValidationFields());

        // Add layout-specific fields (result types for Handlebars, host config for Adaptive Cards)
        if (this.properties.layoutRenderType === LayoutRenderType.Handlebars) {
            fields.push(...this.buildHandlebarsSpecificFields());
        } else if (this.properties.layoutRenderType === LayoutRenderType.AdaptiveCards) {
            fields.push(...this.buildAdaptiveCardsSpecificFields());
        }

        // Add Microsoft Graph Toolkit toggle
        fields.push(
            PropertyPaneToggle('useMicrosoftGraphToolkit', {
                label: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.UseMicrosoftGraphToolkit,
            })
        );

        return fields;
    }

    private buildTemplateEditorFields(canEditTemplate: boolean): IPropertyPaneField<any>[] {
        const fields: IPropertyPaneField<any>[] = [];

        fields.push(
            this.propertyFieldCodeEditor('inlineTemplateContent', {
                label: this.webPartStrings.PropertyPane.LayoutPage.DialogButtonLabel,
                panelTitle: this.webPartStrings.PropertyPane.LayoutPage.DialogTitle,
                initialValue: this.templateContentToDisplay,
                deferredValidationTime: 500,
                onPropertyChange: this.onPropertyPaneFieldChanged,
                properties: this.properties,
                disabled: !canEditTemplate,
                key: 'inlineTemplateContentCodeEditor',
                language: this.properties.layoutRenderType !== LayoutRenderType.Handlebars ? 
                    this.propertyFieldCodeEditorLanguages.JSON : 
                    this.propertyFieldCodeEditorLanguages.Handlebars
            })
        );

        // Only show the template external URL for 'Custom' option and Handlebars render type
        // Note: External URLs for Adaptive Cards are not currently supported but may be enabled in the future
        if ((this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomAdaptiveCards || 
            this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsCustomHandlebars) &&
            this.properties.layoutRenderType === LayoutRenderType.Handlebars) {
            fields.push(
                PropertyPaneTextField('externalTemplateUrl', {
                    label: this.webPartStrings.PropertyPane.LayoutPage.TemplateUrlFieldLabel,
                    placeholder: this.webPartStrings.PropertyPane.LayoutPage.TemplateUrlPlaceholder,
                    deferredValidationTime: 500,
                    validateOnFocusIn: true,
                    validateOnFocusOut: true,
                    onGetErrorMessage: this.onTemplateUrlChange
                })
            );
        }

        return fields;
    }

    private buildSlotValidationFields(): IPropertyPaneField<any>[] {
        const fields: IPropertyPaneField<any>[] = [];

        if (this.properties.templateSlots) {
            const templateSlotNames = this.properties.templateSlots.map(slot => slot.slotName);
            const layoutSlots = this.layoutSlotNames || [];
            const undefinedTemplateSlots = layoutSlots.filter(slot => !templateSlotNames.includes(slot));

            fields.push(
                PropertyFieldMessage('messageMissingLayoutSlots', {
                    key: 'messageMissingLayoutSlotsKey',
                    multiline: true,
                    text: Text.format(this.webPartStrings.PropertyPane.LayoutPage.MissingSlotsMessage, 
                        undefinedTemplateSlots.join(", ")),
                    messageType: MessageBarType.warning,
                    isVisible: undefinedTemplateSlots.length > 0
                })
            );
        }

        return fields;
    }

    private buildHandlebarsSpecificFields(): IPropertyPaneField<any>[] {
        const fields: IPropertyPaneField<any>[] = [];

        const resultTypeInlineTemplate = this.getResultTypeInlineTemplate();

        fields.push(
            this.propertyFieldCollectionData('resultTypes', {
                manageBtnLabel: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.EditResultTypesLabel,
                key: 'resultTypes',
                panelHeader: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.EditResultTypesLabel,
                panelDescription: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ResultTypesDescription,
                enableSorting: true,
                label: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ResultTypeslabel,
                value: this.properties.resultTypes,
                disabled: this.properties.selectedLayoutKey === BuiltinLayoutsKeys.DetailsList
                    || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.ResultsDebug
                    || this.properties.selectedLayoutKey === BuiltinLayoutsKeys.Slider,
                fields: this.getResultTypeFields(resultTypeInlineTemplate)
            })
        );

        // Add result types slot validation
        if (this.properties.templateSlots) {
            const templateSlotNames = this.properties.templateSlots.map(slot => slot.slotName);
            const resultTypesSlots = this.resultTypesSlotNames || [];
            const undefinedTemplateSlots = resultTypesSlots.filter(slot => !templateSlotNames.includes(slot));

            fields.push(
                PropertyFieldMessage('messageMissingResultTypesSlots', {
                    key: 'messageMissingResultTypesSlotsKey',
                    multiline: true,
                    text: Text.format(this.webPartStrings.PropertyPane.LayoutPage.MissingSlotsMessage, 
                        undefinedTemplateSlots.join(", ")),
                    messageType: MessageBarType.warning,
                    isVisible: undefinedTemplateSlots.length > 0
                })
            );
        }

        // Item selection fields
        fields.push(
            PropertyPaneToggle('itemSelectionProps.allowItemSelection', {
                label: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.AllowItemSelection
            })
        );

        if (this.properties.itemSelectionProps.allowItemSelection) {
            fields.push(
                PropertyPaneToggle('itemSelectionProps.allowMulti', {
                    label: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.AllowMultipleItemSelection,
                }),
                PropertyPaneToggle('itemSelectionProps.selectionPreservedOnEmptyClick', {
                    label: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.SelectionPreservedOnEmptyClick,
                }),
                PropertyPaneHorizontalRule()
            );
        }

        return fields;
    }

    private buildAdaptiveCardsSpecificFields(): IPropertyPaneField<any>[] {
        return [
            this.propertyFieldCodeEditor('adaptiveCardsHostConfig', {
                label: this.webPartStrings.PropertyPane.LayoutPage.AdaptiveCards.HostConfigFieldLabel,
                panelTitle: this.webPartStrings.PropertyPane.LayoutPage.DialogTitle,
                initialValue: this.properties.adaptiveCardsHostConfig,
                deferredValidationTime: 500,
                onPropertyChange: this.onPropertyPaneFieldChanged,
                properties: this.properties,
                key: 'adaptiveCardsHostConfig',
                language: this.propertyFieldCodeEditorLanguages.JSON
            })
        ];
    }

    private buildCommonOptionsGroup(): IPropertyPaneGroup[] {
        let layoutOptionsFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('showBlankIfNoResult', {
                label: this.webPartStrings.PropertyPane.LayoutPage.ShowBlankIfNoResult,
            }),
            PropertyPaneToggle('showResultsCount', {
                label: this.webPartStrings.PropertyPane.LayoutPage.ShowResultsCount,
            }),
        ];

        if (this.filtersDataSourceReference) {
            layoutOptionsFields.push(
                PropertyPaneToggle('showSelectedFilters', {
                    label: this.webPartStrings.PropertyPane.LayoutPage.ShowSelectedFilters,
                })
            );
        }

        return [{
            groupName: this.webPartStrings.PropertyPane.LayoutPage.CommonOptionsGroupName,
            groupFields: layoutOptionsFields
        }];
    }

    private buildStylingOptionsGroup(): IPropertyPaneGroup {
        return {
            groupName: this.webPartStrings.Styling.StylingOptionsGroupName,
            isCollapsed: true,
            groupFields: [
                PropertyFieldColorPicker('resultsBackgroundColor', {
                    label: this.webPartStrings.Styling.ResultsBackgroundColorLabel,
                    selectedColor: this.properties.resultsBackgroundColor,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: false,
                    debounce: 1000,
                    isHidden: false,
                    alphaSliderHidden: false,
                    style: PropertyFieldColorPickerStyle.Inline,
                    key: 'resultsBackgroundColorFieldId'
                }),
                PropertyFieldColorPicker('resultsBorderColor', {
                    label: this.webPartStrings.Styling.ResultsBorderColorLabel,
                    selectedColor: this.properties.resultsBorderColor,
                    onPropertyChange: this.onPropertyPaneFieldChanged,
                    properties: this.properties,
                    disabled: false,
                    debounce: 1000,
                    isHidden: false,
                    alphaSliderHidden: false,
                    style: PropertyFieldColorPickerStyle.Inline,
                    key: 'resultsBorderColorFieldId'
                }),
                PropertyPaneSlider('resultsBorderThickness', {
                    label: this.webPartStrings.Styling.ResultsBorderThicknessLabel,
                    min: 0,
                    max: 10,
                    step: 1,
                    showValue: true,
                    value: this.properties.resultsBorderThickness || 0
                }),
                PropertyPaneButton('resetContentStylingButton', {
                    text: this.webPartStrings.Styling.ResetToDefaultLabel,
                    buttonType: PropertyPaneButtonType.Command,
                    icon: 'Refresh',
                    onClick: this.resetContentStylingToDefault
                })
            ]
        };
    }

    private getResultTypeInlineTemplate(): string {
        switch (this.properties.selectedLayoutKey) {
            case BuiltinLayoutsKeys.SimpleList:
                return this.defaultTemplates.simpleList;
            case BuiltinLayoutsKeys.Cards:
                return this.defaultTemplates.cards;
            case BuiltinLayoutsKeys.ResultsCustomHandlebars:
                return this.defaultTemplates.custom;
            case BuiltinLayoutsKeys.People:
                return this.defaultTemplates.people;
            default:
                return undefined;
        }
    }

    private getResultTypeFields(resultTypeInlineTemplate: string): any[] {
        return [
            {
                id: 'property',
                title: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ConditionPropertyLabel,
                type: this.customCollectionFieldType.dropdown,
                required: true,
                options: this.getSelectedProperties().map((field: string) => {
                    return {
                        key: field,
                        text: field
                    };
                })
            },
            {
                id: 'operator',
                title: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.CondtionOperatorValue,
                type: this.customCollectionFieldType.dropdown,
                defaultValue: ResultTypeOperator.Equal,
                required: true,
                options: [
                    {
                        key: ResultTypeOperator.Equal,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.EqualOperator
                    },
                    {
                        key: ResultTypeOperator.NotEqual,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.NotEqualOperator
                    },
                    {
                        key: ResultTypeOperator.Contains,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ContainsOperator
                    },
                    {
                        key: ResultTypeOperator.StartsWith,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.StartsWithOperator
                    },
                    {
                        key: ResultTypeOperator.NotNull,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.NotNullOperator
                    },
                    {
                        key: ResultTypeOperator.GreaterOrEqual,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.GreaterOrEqualOperator
                    },
                    {
                        key: ResultTypeOperator.GreaterThan,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.GreaterThanOperator
                    },
                    {
                        key: ResultTypeOperator.LessOrEqual,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.LessOrEqualOperator
                    },
                    {
                        key: ResultTypeOperator.LessThan,
                        text: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.LessThanOperator
                    }
                ]
            },
            {
                id: 'value',
                title: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ConditionValueLabel,
                type: this.customCollectionFieldType.string,
                required: false,
            },
            {
                id: "inlineTemplateContent",
                title: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.InlineTemplateContentLabel,
                type: this.customCollectionFieldType.custom,
                onCustomRender: ((field, value, onUpdate) => {
                    return (
                        React.createElement("div", null,
                            React.createElement(this.textDialogComponent.TextDialog, {
                                language: this.propertyFieldCodeEditorLanguages.Handlebars,
                                dialogTextFieldValue: value ? value : resultTypeInlineTemplate,
                                onChanged: (fieldValue) => onUpdate(field.id, fieldValue),
                                strings: {
                                    cancelButtonText: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.CancelButtonText,
                                    dialogButtonText: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.DialogButtonText,
                                    dialogTitle: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.DialogTitle,
                                    saveButtonText: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.SaveButtonText
                                }
                            })
                        )
                    );
                }).bind(this)
            },
            {
                id: 'externalTemplateUrl',
                title: this.webPartStrings.PropertyPane.LayoutPage.Handlebars.ResultTypes.ExternalUrlLabel,
                type: this.customCollectionFieldType.url,
                onGetErrorMessage: this.onTemplateUrlChange,
                placeholder: 'https://mysite/Documents/external.html'
            }
        ];
    }
}
