import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneButton, PropertyPaneButtonType, PropertyPaneToggle, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import * as strings from 'CommonStrings';
import { validateExportColumnsJson } from '../../../helpers/CsvExportHelper';

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
    enableCsvExport: boolean;
    exportColumns: string;

    /**
    * If the details action should be visible
     */
    enableDetails?: boolean;
}

export class SimpleListLayout extends BaseLayout<ISimpleListLayoutProperties> {

    protected supportsCsvExport = true;

    public async onInit(): Promise<void> {

        this.properties.enableCsvExport = this.properties.enableCsvExport ?? false;
        this.properties.exportColumns = this.properties.exportColumns ?? '';

        this.properties.showFileIcon = this.properties.showFileIcon !== null && this.properties.showFileIcon !== undefined ?  this.properties.showFileIcon: true;
        this.properties.showItemThumbnail = this.properties.showItemThumbnail !== null && this.properties.showItemThumbnail !== undefined ?  this.properties.showItemThumbnail: true;
        const legacyEnableDetails = (this.properties as { enableLiveUpdate?: boolean }).enableLiveUpdate;
        this.properties.enableDetails = this.properties.enableDetails ?? legacyEnableDetails ?? false;
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        const propertyPaneFields: IPropertyPaneField<any>[] = [
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

        if (!this.supportsCsvExport) {
            return propertyPaneFields;
        }

        propertyPaneFields.push(
            PropertyPaneToggle('layoutProperties.enableCsvExport', {
                label: strings.Layouts.DetailsList.EnableCurrentDataCsvExport,
                checked: this.properties.enableCsvExport
            })
        );

        if (this.properties.enableCsvExport) {
            propertyPaneFields.push(
                PropertyPaneTextField('layoutProperties.exportColumns', {
                    label: strings.Layouts.DetailsList.ExportColumnsJsonLabel,
                    description: strings.Layouts.DetailsList.ExportColumnsJsonDescription,
                    multiline: true,
                    rows: 8,
                    validateOnFocusOut: true,
                    onGetErrorMessage: value => validateExportColumnsJson(value, availableFields)
                }),
                PropertyPaneButton('layoutProperties.validateExportColumns', {
                    buttonType: PropertyPaneButtonType.Normal,
                    text: strings.Layouts.DetailsList.ValidateJsonButtonLabel,
                    onClick: () => {
                        const error = validateExportColumnsJson(this.properties.exportColumns || '', availableFields);
                        window.alert(error || strings.Layouts.DetailsList.ExportColumnsJsonValid);
                    }
                })
            );
        }

        return propertyPaneFields;
    }
}

export class AdaptiveCardsSimpleListLayout extends SimpleListLayout {
    protected supportsCsvExport = false;
}