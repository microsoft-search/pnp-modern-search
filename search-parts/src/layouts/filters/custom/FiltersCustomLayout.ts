import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField } from "@microsoft/sp-property-pane";

export interface IFiltersCustomLayoutProperties {
}

export class FiltersCustomLayout extends BaseLayout<IFiltersCustomLayoutProperties> {

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {
        return [];
    }
}