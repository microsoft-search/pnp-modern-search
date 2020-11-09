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
}

export class SimpleListLayout extends BaseLayout<ISimpleListLayoutProperties> {

    public async onInit(): Promise<void> {

        this.properties.showFileIcon = this.properties.showFileIcon !== null && this.properties.showFileIcon !== undefined ?  this.properties.showFileIcon: true;
        this.properties.showItemThumbnail = this.properties.showItemThumbnail !== null && this.properties.showItemThumbnail !== undefined ?  this.properties.showItemThumbnail: true;
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        return [
            PropertyPaneToggle('layoutProperties.showFileIcon', {
                label: strings.Layouts.SimpleList.ShowFileIconLabel
            }),
            PropertyPaneToggle('layoutProperties.showItemThumbnail', {
                label: strings.Layouts.SimpleList.ShowItemThumbnailLabel
            })
        ];
    }
}