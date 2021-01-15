import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField } from "@microsoft/sp-property-pane";

export interface IDebugFilterLayoutProperties {
}

export class DebugFilterLayout extends BaseLayout<IDebugFilterLayoutProperties> {

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {
        return [];
    }
}