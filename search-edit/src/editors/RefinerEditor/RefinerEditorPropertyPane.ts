import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    IPropertyPaneCustomFieldProps
} from '@microsoft/sp-property-pane';
import { RefinerEditor } from './RefinerEditor';
import { IRefinerConfiguration, IRefinerEditorProps, IRefinerEditorPropertyPaneProps,BasePropertyPaneRefinerEditor } from 'search-extensibility';
import { setVirtualParent } from 'office-ui-fabric-react';

export interface IRefinerEditorPropertyPaneInternalProps extends IRefinerEditorPropertyPaneProps, IPropertyPaneCustomFieldProps {}

export class PropertyPaneRefinerEditor extends BasePropertyPaneRefinerEditor {
    public properties: IRefinerEditorPropertyPaneInternalProps;
    private element: HTMLElement;

    constructor(targetProperty:string, properties: IRefinerEditorPropertyPaneProps) {
        super(targetProperty,properties);
        this.properties = {
            key:properties.label,
            label:properties.label,
            refiners: properties.refiners,
            onChange: properties.onChange,
            onAvailablePropertiesUpdated: properties.onAvailablePropertiesUpdated,
            searchService: properties.searchService,
            templateService: properties.templateService,
            availableProperties: properties.availableProperties,
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this)
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
            templateService:this.properties.templateService,
            availableProperties: this.properties.availableProperties
        });

        ReactDOM.render(element, e);

    }

    private async onChange(refiners: IRefinerConfiguration[]):Promise<boolean> {
        return await this.properties.onChange(refiners);
    }

}