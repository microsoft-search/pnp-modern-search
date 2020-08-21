import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    IPropertyPaneField,
    PropertyPaneFieldType,
    IPropertyPaneCustomFieldProps
} from '@microsoft/sp-property-pane';
import { IRefinerEditorProps, RefinerEditor } from './RefinerEditor';
import { IRefinerConfiguration } from 'search-extensibility';

export interface IRefinerEditorPropertyPaneProps extends IRefinerEditorProps {
    disabled?: boolean;    
}

export interface IRefinerEditorPropertyPaneInternalProps extends IRefinerEditorPropertyPaneProps, IPropertyPaneCustomFieldProps {}

export class PropertyPaneExtensibilityEditor implements IPropertyPaneField<IRefinerEditorPropertyPaneProps> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IRefinerEditorPropertyPaneInternalProps;
    private element: HTMLElement;

    constructor(targetProperty:string, properties: IRefinerEditorPropertyPaneProps) {
        this.targetProperty = targetProperty;
        this.properties = {
            key:properties.label,
            label:properties.label,
            refiners: properties.refiners,
            onRender: this.onRender.bind(this),
            onChange: this.onChange.bind(this),
            onAvailablePropertiesUpdated: properties.onAvailablePropertiesUpdated.bind(this),
            searchService: properties.searchService,
            availableProperties: properties.availableProperties
        };
    }

    private onDispose(element: HTMLElement) {
        ReactDOM.unmountComponentAtNode(element);
    }
    private render():void {
        if(!this.element) return;
        this.onRender(this.element);
    }

    private onRender(e:HTMLElement):void {

        if(!this.element) this.element = e;
        
        const element: React.ReactElement<IRefinerEditorProps> = React.createElement(RefinerEditor, {
            label: this.properties.label,
            refiners: this.properties.refiners,
            onChange: this.onChange.bind(this),
            onAvailablePropertiesUpdated: this.properties.onAvailablePropertiesUpdated.bind(this),
            searchService: this.properties.searchService,
            availableProperties: this.properties.availableProperties
        });

        ReactDOM.render(element, e);

    }

    private async onChange(refiners: IRefinerConfiguration[]):Promise<boolean> {
        return (await this.properties.onChange(refiners));
    }

}