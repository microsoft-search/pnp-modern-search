import * as React from 'react';
import { Text } from '@microsoft/sp-core-library';
import { DynamicProperty } from '@microsoft/sp-component-base';
import {
    IPropertyPaneGroup,
    IPropertyPaneField,
    PropertyPaneToggle,
    PropertyPaneTextField,
    PropertyPaneCheckbox,
    PropertyPaneDropdown,
    PropertyPaneChoiceGroup,
    PropertyPaneDynamicField,
    PropertyPaneDynamicFieldSet,
    DynamicDataSharedDepth,
    PropertyPaneHorizontalRule
} from "@microsoft/sp-property-pane";
import { FilterConditionOperator } from "@pnp/modern-search-extensibility";
import { IComboBoxOption } from "@fluentui/react/lib/ComboBox";
import { Toggle } from "@fluentui/react/lib/Toggle";

import { ComponentType, DynamicDataProperties } from "../../../common/ComponentType";
import IDynamicDataService from "../../../services/dynamicDataService/IDynamicDataService";
import { DynamicPropertyHelper } from "../../../helpers/DynamicPropertyHelper";
import { IDataFilterSourceData } from "../../../models/dynamicData/IDataFilterSourceData";
import { IDataVerticalSourceData } from "../../../models/dynamicData/IDataVerticalSourceData";
import { PropertyPaneAsyncCombo } from "../../../controls/PropertyPaneAsyncCombo/PropertyPaneAsyncCombo";
import { ItemSelectionMode } from "../../../models/common/IItemSelectionProps";
import ISearchResultsWebPartProps, { QueryTextSource } from "../ISearchResultsWebPartProps";
import commonStyles from "../../../styles/Common.module.scss";

export interface IConnectionsPropertyPaneBuilderOptions {

    properties: ISearchResultsWebPartProps;
    instanceId: string;
    webPartStrings: any;
    commonStrings: any;
    dynamicDataService: IDynamicDataService;
    filtersConnectionSourceData: DynamicProperty<IDataFilterSourceData> | undefined;
    verticalsConnectionSourceData: DynamicProperty<IDataVerticalSourceData> | undefined;
    hasCustomQueryModifiers: boolean;

    // Lazily-loaded property field components (loaded by `loadPropertyPaneResources()` on the web part)
    propertyFieldToogleWithCallout: any;
    propertyFieldCalloutTriggers: any;
    propertyFieldCollectionData: any;
    customCollectionFieldType: any;
    propertyPaneWebPartInformation: any;

    // Bound callbacks back into the web part
    getSelectedProperties: () => string[];
    onCustomPropertyUpdate: (
        propertyPath: string,
        newValue: any,
        changeCallback?: (targetProperty?: string, newValue?: any) => void
    ) => void;
}

/**
 * Builds the property pane fields shown in the Search Results Web Part 'Connections' page.
 *
 * Extracted from `SearchResultsWebPart` to keep the web part class focused on lifecycle and
 * shared rendering. Constructed fresh each time the property pane group is rebuilt; all state
 * is captured at construction time from the calling web part.
 */
export class ConnectionsPropertyPaneBuilder {

    constructor(private readonly options: IConnectionsPropertyPaneBuilderOptions) { }

    /**
     * Returns the single 'Available connections' group displayed on the Connections property
     * pane page. Hidden entirely when `allowWebPartConnections` is false (i.e. the Rollup
     * variant), preserving the original behavior.
     */
    public async buildConnectionsGroup(): Promise<IPropertyPaneGroup[]> {

        const { properties, webPartStrings } = this.options;

        const filterConnectionFields = await this.buildFiltersConnectionFields();
        const verticalConnectionFields = await this.buildVerticalsConnectionFields();
        const dataResultsConnectionFields = await this.buildDataResultsConnectionFields();

        let dynamicDataToggles: IPropertyPaneField<any>[] = [];
        if (properties.allowWebPartConnections) {
            dynamicDataToggles = [
                ...this.buildSearchQueryTextFields(),
                PropertyPaneHorizontalRule(),
                ...filterConnectionFields,
                PropertyPaneHorizontalRule(),
                ...verticalConnectionFields,
                PropertyPaneHorizontalRule(),
                ...dataResultsConnectionFields
            ];
        }

        return [
            {
                groupName: webPartStrings.PropertyPane.ConnectionsPage.ConnectionsPageGroupName,
                groupFields: [...dynamicDataToggles]
            }
        ];
    }

    private buildSearchQueryTextFields(): IPropertyPaneField<any>[] {

        const {
            properties,
            webPartStrings,
            commonStrings,
            propertyFieldToogleWithCallout,
            propertyFieldCalloutTriggers,
            hasCustomQueryModifiers
        } = this.options;

        let searchQueryTextFields: IPropertyPaneField<any>[] = [
            propertyFieldToogleWithCallout('useInputQueryText', {
                label: webPartStrings.PropertyPane.ConnectionsPage.UseInputQueryText,
                calloutTrigger: propertyFieldCalloutTriggers.Hover,
                key: 'useInputQueryText',
                calloutContent: React.createElement(
                    'p',
                    { style: { maxWidth: 250, wordBreak: 'break-word' } },
                    webPartStrings.PropertyPane.ConnectionsPage.UseInputQueryTextHoverMessage
                ),
                onText: commonStrings.General.OnTextLabel,
                offText: commonStrings.General.OffTextLabel,
                checked: properties.useInputQueryText
            })
        ];

        if (properties.useInputQueryText) {

            searchQueryTextFields.push(
                PropertyPaneChoiceGroup('queryTextSource', {
                    options: [
                        {
                            key: QueryTextSource.StaticValue,
                            text: webPartStrings.PropertyPane.ConnectionsPage.InputQueryTextStaticValue
                        },
                        {
                            key: QueryTextSource.DynamicValue,
                            text: webPartStrings.PropertyPane.ConnectionsPage.InputQueryTextDynamicValue
                        }
                    ]
                })
            );

            switch (properties.queryTextSource) {

                case QueryTextSource.StaticValue:
                    searchQueryTextFields.push(
                        PropertyPaneTextField('queryText', {
                            label: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextFieldLabel,
                            description: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextFieldDescription,
                            multiline: true,
                            resizable: true,
                            placeholder: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryPlaceHolderText,
                            onGetErrorMessage: this.validateEmptyField,
                            deferredValidationTime: 500
                        })
                    );
                    break;

                case QueryTextSource.DynamicValue:
                    searchQueryTextFields.push(
                        PropertyPaneDynamicField('queryText', {
                            label: ''
                        }),
                        PropertyPaneCheckbox('useDefaultQueryText', {
                            text: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextUseDefaultQuery,
                            disabled: properties.queryText.reference === undefined
                        })
                    );

                    if (properties.useDefaultQueryText && properties.queryText.reference !== undefined) {
                        searchQueryTextFields.push(
                            PropertyPaneTextField('defaultQueryText', {
                                label: webPartStrings.PropertyPane.ConnectionsPage.SearchQueryTextDefaultValue,
                                multiline: true
                            })
                        );
                    }
                    break;

                default:
                    break;
            }

            if (hasCustomQueryModifiers) {
                searchQueryTextFields = searchQueryTextFields.concat(this.buildQueryModifierFields());
            }
        }

        return searchQueryTextFields;
    }

    private async buildDataResultsConnectionFields(): Promise<IPropertyPaneField<any>[]> {

        const {
            properties,
            webPartStrings,
            propertyPaneWebPartInformation,
            getSelectedProperties,
            onCustomPropertyUpdate
        } = this.options;

        let dataResultsConnectionFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('useDynamicFiltering', {
                label: webPartStrings.PropertyPane.ConnectionsPage.UseDynamicFilteringsWebPartLabel,
                checked: properties.useDynamicFiltering
            })
        ];

        if (properties.useDynamicFiltering) {

            let isSourceFieldConfigured: boolean = false;

            // Make sure a property is selected in the source according to the reference format.
            // Ex: PageContext:UrlData:queryParameters.q = Page environment
            // Ex: WebPart.544c1372-42df-47c3-94d6-017428cd2baf.1272b161-3435-4815-99a1-996590334cff:AvailableFieldValuesFromResults:FileType = Search Results
            if (properties.selectedItemFieldValue.reference) {
                isSourceFieldConfigured = /^.+:.+:(.+)$/.test(properties.selectedItemFieldValue.reference);
            }

            dataResultsConnectionFields.push(

                // Allow both 'Search Results' Web Parts and OOTB SharePoint List Web Parts
                PropertyPaneDynamicFieldSet({
                    label: webPartStrings.PropertyPane.ConnectionsPage.UseDataResultsFromComponentsLabel,
                    fields: [
                        PropertyPaneDynamicField('selectedItemFieldValue', {
                            label: webPartStrings.PropertyPane.ConnectionsPage.UseDataResultsFromComponentsLabel,
                        })
                    ],
                    sharedConfiguration: {
                        depth: DynamicDataSharedDepth.Property,
                        property: {
                            filters: {
                                propertyId: DynamicDataProperties.AvailableFieldValuesFromResults
                            }
                        }
                    }
                })
            );

            if (isSourceFieldConfigured) {

                const availableOptions: IComboBoxOption[] = getSelectedProperties().map((field: string) => {
                    return {
                        key: field,
                        text: field
                    };
                });

                dataResultsConnectionFields.splice(4, 0,
                    new PropertyPaneAsyncCombo('itemSelectionProps.destinationFieldName', {
                        label: webPartStrings.PropertyPane.ConnectionsPage.SourceDestinationFieldLabel,
                        availableOptions: availableOptions,
                        description: webPartStrings.PropertyPane.ConnectionsPage.SourceDestinationFieldDescription,
                        allowMultiSelect: false,
                        allowFreeform: true,
                        searchAsYouType: false,
                        defaultSelectedKeys: properties.selectedVerticalKeys,
                        textDisplayValue: properties.itemSelectionProps.destinationFieldName,
                        onPropertyChange: onCustomPropertyUpdate,
                    })
                );
            }

            if (isSourceFieldConfigured && properties.itemSelectionProps.destinationFieldName) {

                dataResultsConnectionFields.splice(4, 0,
                    PropertyPaneChoiceGroup('itemSelectionProps.selectionMode', {
                        options: [
                            {
                                key: ItemSelectionMode.AsDataFilter,
                                text: webPartStrings.PropertyPane.LayoutPage.Handlebars.AsDataFiltersSelectionMode
                            },
                            {
                                key: ItemSelectionMode.AsTokenValue,
                                text: webPartStrings.PropertyPane.LayoutPage.Handlebars.AsTokensSelectionMode
                            }
                        ],
                        label: webPartStrings.PropertyPane.LayoutPage.Handlebars.SelectionModeLabel,
                    })
                );

                if (properties.itemSelectionProps.selectionMode === ItemSelectionMode.AsDataFilter) {
                    dataResultsConnectionFields.splice(5, 0,
                        propertyPaneWebPartInformation({
                            description: `<em>${webPartStrings.PropertyPane.LayoutPage.Handlebars.AsDataFiltersDescription}</em>`,
                            key: 'selectionModeText'
                        }),
                        PropertyPaneChoiceGroup('itemSelectionProps.valuesOperator', {
                            options: [
                                {
                                    key: FilterConditionOperator.OR,
                                    text: 'OR'
                                },
                                {
                                    key: FilterConditionOperator.AND,
                                    text: 'AND'
                                },
                            ],
                            label: webPartStrings.PropertyPane.LayoutPage.Handlebars.FilterValuesOperator
                        })
                    );
                } else {
                    dataResultsConnectionFields.splice(4, 0,
                        propertyPaneWebPartInformation({
                            description: `<em>${webPartStrings.PropertyPane.LayoutPage.Handlebars.AsTokensDescription}</em>`,
                            key: 'selectionModeText'
                        })
                    );
                }
            }
        }

        return dataResultsConnectionFields;
    }

    private async buildFiltersConnectionFields(): Promise<IPropertyPaneField<any>[]> {

        const {
            properties,
            instanceId,
            webPartStrings,
            dynamicDataService,
            filtersConnectionSourceData,
            propertyPaneWebPartInformation
        } = this.options;

        let filtersConnectionFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('useFilters', {
                label: webPartStrings.PropertyPane.ConnectionsPage.UseFiltersWebPartLabel,
                checked: properties.useFilters
            })
        ];

        if (properties.useFilters) {
            filtersConnectionFields.splice(1, 0,
                PropertyPaneDropdown('filtersDataSourceReference', {
                    options: await dynamicDataService.getAvailableDataSourcesByType(ComponentType.SearchFilters),
                    label: webPartStrings.PropertyPane.ConnectionsPage.UseFiltersFromComponentLabel
                })
            );

            // Check bidirectional connection: does the filter web part also connect back to this results web part?
            if (properties.filtersDataSourceReference && filtersConnectionSourceData) {
                const filterData: IDataFilterSourceData = DynamicPropertyHelper.tryGetValueSafe(filtersConnectionSourceData);
                if (filterData && filterData.connectedResultsSourceReferences) {
                    // Extract sourceId from each reference (format: "sourceId:propertyId") and check if it ends with this web part's instanceId
                    const isConnectedBack = filterData.connectedResultsSourceReferences.some(
                        ref => {
                            const sourceId = ref.split(':')[0];
                            return sourceId.endsWith(instanceId);
                        }
                    );
                    if (!isConnectedBack) {
                        filtersConnectionFields.push(
                            propertyPaneWebPartInformation({
                                description: `<span style="color: #d83b01;">⚠ ${webPartStrings.PropertyPane.ConnectionsPage.BidirectionalConnectionWarning}</span>`,
                                key: 'bidirectionalFilterWarning'
                            })
                        );
                    }
                }
            }
        }

        return filtersConnectionFields;
    }

    private async buildVerticalsConnectionFields(): Promise<IPropertyPaneField<any>[]> {

        const {
            properties,
            webPartStrings,
            dynamicDataService,
            verticalsConnectionSourceData,
            onCustomPropertyUpdate
        } = this.options;

        let verticalsConnectionFields: IPropertyPaneField<any>[] = [
            PropertyPaneToggle('useVerticals', {
                label: webPartStrings.PropertyPane.ConnectionsPage.UseSearchVerticalsWebPartLabel,
                checked: properties.useVerticals
            })
        ];

        if (properties.useVerticals) {
            verticalsConnectionFields.splice(1, 0,
                PropertyPaneDropdown('verticalsDataSourceReference', {
                    options: await dynamicDataService.getAvailableDataSourcesByType(ComponentType.SearchVerticals),
                    label: webPartStrings.PropertyPane.ConnectionsPage.UseSearchVerticalsFromComponentLabel
                })
            );

            if (properties.verticalsDataSourceReference && verticalsConnectionSourceData) {

                const availableVerticals = DynamicPropertyHelper.tryGetValueSafe(verticalsConnectionSourceData);

                if (availableVerticals) {

                    // Get the corresponding text for selected keys
                    const selectedKeysAsText: string[] = [];

                    availableVerticals.verticalsConfiguration.forEach(verticalConfiguration => {
                        if (properties.selectedVerticalKeys.indexOf(verticalConfiguration.key) !== -1) {
                            selectedKeysAsText.push(verticalConfiguration.tabName);
                        }
                    });

                    verticalsConnectionFields.push(
                        new PropertyPaneAsyncCombo('selectedVerticalKeys', {
                            availableOptions: availableVerticals.verticalsConfiguration.filter(v => !v.isLink).map(verticalConfiguration => {
                                return {
                                    key: verticalConfiguration.key,
                                    text: verticalConfiguration.tabName
                                };
                            }),
                            allowMultiSelect: true,
                            allowFreeform: false,
                            description: webPartStrings.PropertyPane.ConnectionsPage.LinkToVerticalLabelHoverMessage,
                            label: webPartStrings.PropertyPane.ConnectionsPage.LinkToVerticalLabel,
                            searchAsYouType: false,
                            defaultSelectedKeys: properties.selectedVerticalKeys,
                            textDisplayValue: selectedKeysAsText.join(','),
                            onPropertyChange: onCustomPropertyUpdate,
                        }),
                    );
                }
            }
        }

        return verticalsConnectionFields;
    }

    private buildQueryModifierFields(): IPropertyPaneField<any>[] {

        const {
            properties,
            webPartStrings,
            commonStrings,
            propertyFieldCollectionData,
            customCollectionFieldType
        } = this.options;

        const queryTransformationFields: IPropertyPaneField<any>[] = [];

        queryTransformationFields.push(
            propertyFieldCollectionData('queryModifierConfiguration', {
                manageBtnLabel: webPartStrings.PropertyPane.CustomQueryModifier.EditQueryModifiersLabel,
                key: 'queryModifierConfiguration',
                panelHeader: webPartStrings.PropertyPane.CustomQueryModifier.EditQueryModifiersLabel,
                panelDescription: webPartStrings.PropertyPane.CustomQueryModifier.QueryModifiersDescription,
                disableItemCreation: true,
                disableItemDeletion: true,
                enableSorting: true,
                label: webPartStrings.PropertyPane.CustomQueryModifier.QueryModifiersLabel,
                value: properties.queryModifierConfiguration,
                tableClassName: commonStyles.slotTable,
                fields: [
                    {
                        id: 'enabled',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.EnabledPropertyLabel,
                        type: customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Toggle, {
                                        key: itemId, checked: value, onChange: (evt, checked) => {
                                            onUpdate(field.id, checked);
                                        },
                                        offText: commonStrings.General.OffTextLabel,
                                        onText: commonStrings.General.OnTextLabel
                                    })
                                )
                            );
                        }
                    },
                    {
                        id: 'endWhenSuccessfull',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.EndWhenSuccessfullPropertyLabel,
                        type: customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, itemId) => {
                            return (
                                React.createElement("div", null,
                                    React.createElement(Toggle, {
                                        key: itemId, checked: value, onChange: (evt, checked) => {
                                            onUpdate(field.id, checked);
                                        },
                                        offText: commonStrings.General.OffTextLabel,
                                        onText: commonStrings.General.OnTextLabel
                                    })
                                )
                            );
                        }
                    },
                    {
                        id: 'name',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.ModifierNamePropertyLabel,
                        type: customCollectionFieldType.custom,
                        onCustomRender: (field, value) => {
                            return (
                                React.createElement("div", { style: { 'fontWeight': 600 } }, value)
                            );
                        }
                    },
                    {
                        id: 'description',
                        title: webPartStrings.PropertyPane.CustomQueryModifier.ModifierDescriptionPropertyLabel,
                        type: customCollectionFieldType.custom,
                        onCustomRender: (field, value) => {
                            return (
                                React.createElement("div", null, value)
                            );
                        }
                    }
                ]
            })
        );

        return queryTransformationFields;
    }

    private validateEmptyField = (value: string): string => {
        if (!value) {
            return this.options.commonStrings.General.EmptyFieldErrorMessage;
        }
        return '';
    }
}
