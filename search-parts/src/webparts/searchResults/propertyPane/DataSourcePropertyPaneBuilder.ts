import { IPropertyPaneGroup, IPropertyPaneField, PropertyPaneChoiceGroup, IPropertyPaneChoiceGroupOption } from "@microsoft/sp-property-pane";
import { IDataSource } from '@pnp/modern-search-extensibility';
import ISearchResultsWebPartProps from '../ISearchResultsWebPartProps';

export class DataSourcePropertyPaneBuilder {
    
    constructor(
        private properties: ISearchResultsWebPartProps,
        private dataSource: IDataSource,
        private availableDataSourceDefinitions: any[],
        private getTemplateSlotOptions: () => IPropertyPaneField<any>[],
        private getPagingGroupFields: () => IPropertyPaneField<any>[],
        private getDataSourceOptions: () => IPropertyPaneChoiceGroupOption[],
        private webPartStrings: any
    ) {}

    public buildDataSourcePage(): IPropertyPaneGroup[] {
        const groups: IPropertyPaneGroup[] = [
            {
                groupName: this.webPartStrings.PropertyPane.DataSourcePage.DataSourceConnectionGroupName,
                groupFields: [
                    PropertyPaneChoiceGroup('dataSourceKey', {
                        options: this.getDataSourceOptions()
                    })
                ]
            }
        ];

        return groups;
    }

    public buildAdditionalDataSourceGroups(
        layoutSlotsGroup: IPropertyPaneGroup[],
        dataSourceProperties: IPropertyPaneGroup[],
        commonDataSourceProperties: IPropertyPaneGroup[]
    ): IPropertyPaneGroup[] {
        return [
            ...layoutSlotsGroup,
            ...dataSourceProperties,
            ...commonDataSourceProperties,
            {
                groupName: this.webPartStrings.PropertyPane.DataSourcePage.PagingOptionsGroupName,
                groupFields: this.getPagingGroupFields()
            }
        ];
    }
}
