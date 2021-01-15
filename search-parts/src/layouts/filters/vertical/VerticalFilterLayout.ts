import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField } from "@microsoft/sp-property-pane";

export interface IVerticalFilterLayoutProperties {
}

export class VerticalFilterLayout extends BaseLayout<IVerticalFilterLayoutProperties> {

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {
        return [];
    }
}