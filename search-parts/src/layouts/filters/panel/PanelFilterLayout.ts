import { BaseLayout } from "@pnp/modern-search-extensibility";
import { IPropertyPaneField, PropertyPaneToggle, PropertyPaneDropdown, IPropertyPaneDropdownOption, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import * as strings from 'CommonStrings';
import { PanelType } from 'office-ui-fabric-react';

export interface IPanelFilterLayoutProperties {

    /**
     * This panel is non-modal: even when it's open, it allows interacting with content outside the panel.
     */
    isBlocking: boolean;

    /**
     * This panel uses "light dismiss" behavior: it can be closed by clicking or tapping the area outside the panel (or using the close button as usual).
     */
    isLightDismiss: boolean;

    /**
     * The panel size
     */
    size: PanelType;

    /**
     * The label ofthe button to display
     */
    btnLabel: string;

    /**
     * The label to display in the panel header
     */
    headerText: string;
}

export class PanelFilterLayout extends BaseLayout<IPanelFilterLayoutProperties> {

    public async onInit(): Promise<void> {

        // Setup default values
        this.properties.isBlocking = this.properties.isBlocking !== null && this.properties.isBlocking !== undefined ? this.properties.isBlocking : true;
        this.properties.isLightDismiss = this.properties.isLightDismiss !== null && this.properties.isLightDismiss !== undefined ? this.properties.isLightDismiss : true;
        this.properties.size = this.properties.size ? this.properties.size : PanelType.medium;
        this.properties.btnLabel = this.properties.btnLabel ? this.properties.btnLabel : strings.Layouts.Panel.ButtonLabel;
        this.properties.headerText = this.properties.headerText ? this.properties.headerText: strings.Layouts.Panel.HeaderText;
    }

    public getPropertyPaneFieldsConfiguration(availableFields: string[]): IPropertyPaneField<any>[] {

        const options: IPropertyPaneDropdownOption[] = [
            { text: strings.Layouts.Panel.SizeOptions.SmallFixedFar, key: String(PanelType.smallFixedFar) },
            { text: strings.Layouts.Panel.SizeOptions.SmallFixedNear, key: String(PanelType.smallFixedNear) },
            { text: strings.Layouts.Panel.SizeOptions.Medium, key: String(PanelType.medium) },
            { text: strings.Layouts.Panel.SizeOptions.Large, key: String(PanelType.large) },
            { text: strings.Layouts.Panel.SizeOptions.LargeFixed, key: String(PanelType.largeFixed) },
            { text: strings.Layouts.Panel.SizeOptions.ExtraLarge, key: String(PanelType.extraLarge) },
            { text: strings.Layouts.Panel.SizeOptions.SmallFluid, key: String(PanelType.smallFluid) },
        ];

        return [
            PropertyPaneTextField('layoutProperties.btnLabel', {
                label: strings.Layouts.Panel.ButtonLabelFieldName,     
                multiline: false                   
            }),
            PropertyPaneTextField('layoutProperties.headerText', {
                label: strings.Layouts.Panel.HeaderTextFieldName,
                multiline: false
            }),
            PropertyPaneToggle('layoutProperties.isBlocking', {
                label: strings.Layouts.Panel.IsModal,                        
                checked: this.properties.isBlocking
            }),
            PropertyPaneToggle('layoutProperties.isLightDismiss', {
                label: strings.Layouts.Panel.IsLightDismiss,                        
                checked: this.properties.isLightDismiss,
                disabled: !this.properties.isBlocking
            }),
            PropertyPaneDropdown('layoutProperties.size', {
                label: strings.Layouts.Panel.Size,
                options: options,
                selectedKey: String(this.properties.size)
            })
        ];
    }
}