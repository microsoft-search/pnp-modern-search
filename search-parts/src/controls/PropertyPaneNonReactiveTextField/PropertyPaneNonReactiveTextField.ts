import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneCustomFieldProps, IPropertyPaneField, PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import { IPropertyPaneNonReactiveTextFieldProps } from './IPropertyPaneNonReactiveTextFieldProps';
import { NonReactiveTextField } from "./components/NonReactiveTextField";
import { INonReactiveTextFieldProps } from "./components/INonReactiveTextFieldProps";

export interface IPropertyPaneNonReactiveTextFieldInternalProps extends IPropertyPaneNonReactiveTextFieldProps, IPropertyPaneCustomFieldProps {
}

export class PropertyPaneNonReactiveTextField implements IPropertyPaneField<IPropertyPaneNonReactiveTextFieldInternalProps> {

    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IPropertyPaneNonReactiveTextFieldInternalProps;
    private elem: HTMLElement;

    constructor(targetProperty: string, properties: IPropertyPaneNonReactiveTextFieldProps) {
        this.targetProperty = targetProperty;

        this.properties = {
            key: properties.label,
            description: properties.description,
            label: properties.label,
            placeholderText: properties.placeholderText,
            multiline: properties.multiline,
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this),
            applyBtnText: properties.applyBtnText,
            defaultValue: properties.defaultValue,
            rows: properties.rows,
            allowEmptyValue: properties.allowEmptyValue
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
            React.createElement(NonReactiveTextField, {
             onUpdate: ((value) => {
                changeCallback(this.targetProperty, value);
             }).bind(this),
             description: this.properties.description,
             label: this.properties.label,
             multiline: this.properties.multiline,
             placeholderText: this.properties.placeholderText,
             applyBtnText: this.properties.applyBtnText,
             defaultValue: this.properties.defaultValue,
             rows: this.properties.rows,
             allowEmptyValue: this.properties.allowEmptyValue
            } as INonReactiveTextFieldProps)
        );

        ReactDom.render(element, elem);
    }
    
}