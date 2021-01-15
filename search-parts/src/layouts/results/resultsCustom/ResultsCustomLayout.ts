import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField } from "@microsoft/sp-property-pane";

export interface IResultsCustomLayoutProperties {
}

export class ResultsCustomLayout extends BaseLayout<IResultsCustomLayoutProperties> {

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {
        return [];
    }
}