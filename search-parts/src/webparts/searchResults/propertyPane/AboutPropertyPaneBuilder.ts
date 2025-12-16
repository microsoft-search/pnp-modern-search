import { IPropertyPaneGroup, IPropertyPaneField } from "@microsoft/sp-property-pane";

export class AboutPropertyPaneBuilder {
    
    constructor(
        private getPropertyPaneWebPartInfoGroups: () => IPropertyPaneGroup[],
        private getExtensibilityFields: () => IPropertyPaneField<any>[],
        private getAudienceTargetingPropertyPaneGroup: () => IPropertyPaneGroup,
        private propertyPanePropertyEditor: any,
        private webpart: any,
        private commonStrings: any
    ) {}

    public buildAboutPage(): IPropertyPaneGroup[] {
        const extensibilityConfigurationGroups: IPropertyPaneGroup[] = [{
            groupName: this.commonStrings.PropertyPane.InformationPage.Extensibility.GroupName,
            groupFields: this.getExtensibilityFields()
        }];

        return [
            ...this.getPropertyPaneWebPartInfoGroups(),
            ...extensibilityConfigurationGroups,
            this.getAudienceTargetingPropertyPaneGroup(),
            {
                groupName: this.commonStrings.PropertyPane.InformationPage.ImportExport,
                groupFields: [
                    this.propertyPanePropertyEditor({
                        webpart: this.webpart,
                        key: 'propertyEditor'
                    })
                ]
            }
        ];
    }
}
