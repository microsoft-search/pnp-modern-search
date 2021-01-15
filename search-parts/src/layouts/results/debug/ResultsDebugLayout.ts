import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField } from "@microsoft/sp-property-pane";

export interface IResultsDebugLayoutProperties {
}

export class ResultsDebugLayout extends BaseLayout<IResultsDebugLayoutProperties> {

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {
        return [];
    }
}