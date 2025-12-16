import { IPropertyPaneGroup } from "@microsoft/sp-property-pane";

export class StylingPropertyPaneBuilder {
    
    constructor(
        private getStylingPageGroups: () => IPropertyPaneGroup[]
    ) {}

    public buildStylingPage(): IPropertyPaneGroup[] {
        return this.getStylingPageGroups();
    }
}
