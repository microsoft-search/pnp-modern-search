import { SearchManagedProperties } from "../../controls/SearchManagedProperties/SearchManagedProperties";
import { IPropertyPaneField, PropertyPaneFieldType, IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneSearchManagedPropertiesProps, ISearchManagedPropertiesProps, BasePropertyPaneSearchManagedProperties } from 'search-extensibility';

export interface IPropertyPaneSearchManagedPropertiesInternalProps extends IPropertyPaneSearchManagedPropertiesProps, IPropertyPaneCustomFieldProps {
}

export class PropertyPaneSearchManagedProperties extends BasePropertyPaneSearchManagedProperties {

    public properties: IPropertyPaneSearchManagedPropertiesInternalProps;
    private elem: HTMLElement;

    constructor(targetProperty: string, properties: IPropertyPaneSearchManagedPropertiesProps) {
        super(targetProperty, properties);
        this.properties = {
            key: properties.label,
            label: properties.label,
            description: properties.description,
            onPropertyChange: properties.onPropertyChange,
            allowMultiSelect: properties.allowMultiSelect,
            defaultSelectedKey: properties.defaultSelectedKey,
            availableProperties: properties.availableProperties,
            onUpdateAvailableProperties: properties.onUpdateAvailableProperties,
            searchService: properties.searchService,
            defaultSelectedKeys: properties.defaultSelectedKeys,
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

    private onRender(elem: HTMLElement): void {

        if (!this.elem) {
            this.elem = elem;
        }

        const element: React.ReactElement<any> = React.createElement("div", { key: this.properties.key },
            React.createElement(SearchManagedProperties, {
                label: this.properties.label,
                allowMultiSelect: this.properties.allowMultiSelect,
                availableProperties: this.properties.availableProperties,
                defaultSelectedKeys: this.properties.defaultSelectedKeys,
                onUpdate: (newValue: any) => {
                    this.properties.onPropertyChange(this.targetProperty, newValue);
                },
                onUpdateAvailableProperties: this.properties.onUpdateAvailableProperties,
                searchService: this.properties.searchService
            } as ISearchManagedPropertiesProps)
        );

        ReactDom.render(element, elem);
    }
}