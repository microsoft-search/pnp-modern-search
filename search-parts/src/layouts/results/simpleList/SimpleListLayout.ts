import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneToggle } from "@microsoft/sp-property-pane";
import * as strings from 'CommonStrings';

export interface ISimpleListLayoutProperties {

    /**
     * Show or hide the file icon
     */
    showFileIcon: boolean;

    /**
     * Show or hide the item thumbnail
     */
    showItemThumbnail: boolean;

    /**
     * If the download button should be visible
     */
    enableDownload: boolean;

    /**
    * If the details action should be visible
     */
    enableDetails?: boolean;
}

export class SimpleListLayout extends BaseLayout<ISimpleListLayoutProperties> {

    public async onInit(): Promise<void> {

        this.properties.showFileIcon = this.properties.showFileIcon !== null && this.properties.showFileIcon !== undefined ?  this.properties.showFileIcon: true;
        this.properties.showItemThumbnail = this.properties.showItemThumbnail !== null && this.properties.showItemThumbnail !== undefined ?  this.properties.showItemThumbnail: true;
        const legacyEnableDetails = (this.properties as { enableLiveUpdate?: boolean }).enableLiveUpdate;
        this.properties.enableDetails = this.properties.enableDetails ?? legacyEnableDetails ?? false;
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        return [
            PropertyPaneToggle('layoutProperties.showFileIcon', {
                label: strings.Layouts.SimpleList.ShowFileIconLabel
            }),
            PropertyPaneToggle('layoutProperties.showItemThumbnail', {
                label: strings.Layouts.SimpleList.ShowItemThumbnailLabel
            }),
                        PropertyPaneToggle('layoutProperties.enableDetails', {
                            label: strings.Layouts.DetailsList.EnableDetails,
                            checked: this.properties.enableDetails
                        }),
            PropertyPaneToggle('layoutProperties.enableDownload', {
              label: strings.Layouts.DetailsList.EnableDownload,
              checked: this.properties.enableDownload
            })
        ];
    }
}