import { IPropertyPaneField, PropertyPaneFieldType, IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneAsyncComboProps } from "./IPropertyPaneAsyncComboProps";
import { AsyncCombo } from "./components/AsyncCombo";
import { IAsyncComboProps } from "./components/IAsyncComboProps";

export interface IPropertyPaneAsyncComboInternalProps extends IPropertyPaneAsyncComboProps, IPropertyPaneCustomFieldProps {
}

// Create custom property pane controls
// https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/build-custom-property-pane-controls
export class PropertyPaneAsyncCombo implements IPropertyPaneField<IPropertyPaneAsyncComboProps> {

    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IPropertyPaneAsyncComboInternalProps;
    private elem: HTMLElement;

    constructor(targetProperty: string, properties: IPropertyPaneAsyncComboProps) {
        this.targetProperty = targetProperty;

        this.properties = {
            key: properties.label,
            label: properties.label,
            description: properties.description,
            onPropertyChange: properties.onPropertyChange,
            onGetErrorMessage: properties.onGetErrorMessage,
            allowMultiSelect: properties.allowMultiSelect,
            allowFreeform: properties.allowFreeform,
            defaultSelectedKey: properties.defaultSelectedKey,
            availableOptions: properties.availableOptions,
            onUpdateOptions: properties.onUpdateOptions,
            searchAsYouType: properties.searchAsYouType,
            onLoadOptions: properties.onLoadOptions,
            defaultSelectedKeys: properties.defaultSelectedKeys,
            textDisplayValue: properties.textDisplayValue,
            disabled: properties.disabled,
            stateKey: properties.stateKey,
            placeholder: properties.placeholder,
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this)
          };
    }
    
    public render(): void {
        if (!this.elem) {
            return;
        }

        this.onRender(this.elem);
    }
    
    private onDispose(element: HTMLElement): void {
        ReactDom.unmountComponentAtNode(element);
    }

    private onRender(elem: HTMLElement, ctx?: any, changeCallback?: (targetProperty?: string, newValue?: any) => void) {

        if (!this.elem) {
            this.elem = elem;
        }

        const element: React.ReactElement<any> = React.createElement("div", { key: this.properties.key },
            React.createElement(AsyncCombo, {
                label: this.properties.label,
                allowMultiSelect: this.properties.allowMultiSelect,
                allowFreeform: this.properties.allowFreeform,
                defaultSelectedKey: this.properties.defaultSelectedKey,
                availableOptions: this.properties.availableOptions,
                defaultSelectedKeys: this.properties.defaultSelectedKeys,
                textDisplayValue: this.properties.textDisplayValue,
                stateKey: this.properties.stateKey,
                description: this.properties.description,
                disabled: this.properties.disabled,
                placeholder: this.properties.placeholder,
                searchAsYouType: this.properties.searchAsYouType,
                onUpdate: ((value: any) => {
                    this.properties.onPropertyChange(this.targetProperty, value);
                }).bind(this),
                onGetErrorMessage: this.properties.onGetErrorMessage,
                onLoadOptions: this.properties.onLoadOptions,
                onUpdateOptions: this.properties.onUpdateOptions,
            } as IAsyncComboProps)
        );

        ReactDom.render(element, elem);
    }
}