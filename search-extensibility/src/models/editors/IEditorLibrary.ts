import * as React from 'react';
import { IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { IExtensibilityEditorPropertyPaneProps } from "./IExtensibilityEditorProps";
import { IRefinerEditorPropertyPaneProps } from "./IRefinerEditorProps";
import { ISearchManagedPropertiesProps } from "./ISearchManagedPropertiesProps";
import { IPropertyPaneSearchManagedPropertiesProps } from "./IPropertyPaneSearchManagedPropertiesProps";
import { ITemplateValueFieldEditorProps } from "./ITemplateValueFieldEditorProps";

export abstract class BasePropertyPaneExtensibilityEditor implements IPropertyPaneField<IExtensibilityEditorPropertyPaneProps>{
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IExtensibilityEditorPropertyPaneProps;
    constructor(targetProperty:string, properties: IExtensibilityEditorPropertyPaneProps) {
        this.targetProperty = targetProperty;
    }
}

export abstract class BasePropertyPaneRefinerEditor implements IPropertyPaneField<IRefinerEditorPropertyPaneProps> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IRefinerEditorPropertyPaneProps;
    constructor(targetProperty:string, properties: IRefinerEditorPropertyPaneProps) {
        this.targetProperty = targetProperty;
    }
}

export abstract class BaseSearchManagedProperties extends React.Component<ISearchManagedPropertiesProps, any> {}

export abstract class BasePropertyPaneSearchManagedProperties implements IPropertyPaneField<IPropertyPaneSearchManagedPropertiesProps> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public shouldFocus?: boolean;
    public properties: IPropertyPaneSearchManagedPropertiesProps;
    constructor(targetProperty: string, properties: IPropertyPaneSearchManagedPropertiesProps) {
        this.targetProperty = targetProperty;
    }
}

export abstract class BaseTemplateValueFieldEditor extends React.Component<ITemplateValueFieldEditorProps, any> {}

export interface IEditorLibrary {
    getExtensibilityEditor() : typeof BasePropertyPaneExtensibilityEditor;
    
    getRefinersEditor() : typeof BasePropertyPaneRefinerEditor;
    
    getSearchManagedPropertiesEditor() : typeof BaseSearchManagedProperties;
    
    getPropertyPaneSearchManagedProperties() : typeof BasePropertyPaneSearchManagedProperties;
    
    getTemplateValueFieldEditor() : typeof BaseTemplateValueFieldEditor;
}