import { IPropertyPaneCustomFieldProps, IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { IPropertyPaneTabsFieldProps } from "./IPropertyPaneTabsFieldProps";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ChoiceGroupTabs } from "./components/ChoiceGroupTabs";
import { IChoiceGroupTabsProps } from "./components/IChoiceGroupTabsProps";

export interface IPropertyPaneAsyncComboInternalProps extends IPropertyPaneTabsFieldProps, IPropertyPaneCustomFieldProps {
}

export class PropertyPaneTabsField implements IPropertyPaneField<IPropertyPaneTabsFieldProps> {

    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IPropertyPaneAsyncComboInternalProps;
    private elem: HTMLElement;

    constructor(targetProperty: string, properties: IPropertyPaneTabsFieldProps) {
        this.targetProperty = targetProperty;

        this.properties = {
            key: "key",
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this),
            onPropertyChange: properties.onPropertyChange,
            options: properties.options,
            defaultSelectedKey: properties.defaultSelectedKey
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
            React.createElement(ChoiceGroupTabs, {        
                defaultSelectedKey: this.properties.defaultSelectedKey,
                onChange: (selectedKey: string) => {
                    this.properties.onPropertyChange(this.targetProperty, selectedKey, changeCallback);
                },
                options: this.properties.options
            } as IChoiceGroupTabsProps)
        );

        ReactDom.render(element, elem);
    }

}