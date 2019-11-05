
## Summary

This solution allows you to create and register your own React component (wrapped as HTML web components) to be used in the search results Web Part Handlebars templates.

## Used SharePoint Framework Version ##

![SPFx](https://img.shields.io/badge/drop-1.9.1-green.svg)

## Prerequisites

The custom web components are defined in a SharePoint Framework project of type ['Library Component'](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/library-component-overview). You have the choice to update the demo one or start from scratch with a new project. In this case, in the `<your_library_name>.manifest.json` file, make sure the `id` property id is `2501f2fd-d601-4da4-a04d-9f0bd85b1f54`. This identifier is used to load dynamically the library from the Search Results Web Part. Therefore, this value is **mandatory** to make the link. That is the only hook we need on our side.

            {
                // The value should be this id to make the link with the Web Part
                "id": "2501f2fd-d601-4da4-a04d-9f0bd85b1f54" /
                "alias": "MyCompanyLibraryLibrary",
                "componentType": "Library",

                ...
            }

## Create a custom web component

A web component is a custom HTML element that can be used in your templates to implement complex behaviors. We used them here as *"wrappers"* for React components to be able to use them with Handlebars. In this solution, web components are considered **stateless**, meaning they will be entirely recreated when an attribute is changed (coming from the property pane). It means you can still use an inner state in your React components but not rely on the parent context (props) since it will be recreated every time by the Handlebars template.

To create a custom component, follow this procedure:

1. Create a new JSX file that will be used for your layout. (ex: `CustomComponent.tsx`). You can create it anywhere in your project.

2. Implement your component like a regular React component.

        import * as React from 'react';
        import * as ReactDOM from 'react-dom';
        import { BaseWebComponent } from '../models/BaseWebComponent';

        export interface IObjectParam {
            myProperty: string;
        }

        export interface ICustomComponentProps {

            /**
            * A dummy string param
            */
            myStringParam?: string;

            /***
            * 
            */
            myObjectParam?: string;
        }

        export interface ICustomComponenState {
        }

        export class CustomComponent extends React.Component<ICustomComponentProps, ICustomComponenState> {
            
            public render() {

                let myObject: IObjectParam = {
                    myProperty: undefined
                };
                
                // Parse custom object
                try {
                    myObject = JSON.parse(this.props.myObjectParam);
                } catch (error) {
                    myObject.myProperty = null;
                }

                return <div>{this.props.myStringParam} {myObject.myProperty}</div>;
            }
        }

    Because `props` will be passed from an HTML template, they must to use always a `string` type. For complex objects, you will need to pass them as 'stringified' then use the `JSON.parse()` method to use them in your component logic.

3. In the same file, create an other class, this time to define your web component by inheriting the `BaseWebComponent` abstact class`:

        export class MyCustomComponentWebComponent extends BaseWebComponent {
        
            public constructor() {
                super(); 
            }
        
            public async connectedCallback() {
        
                let props = this.resolveAttributes();
                const debugView = <CustomComponent {...props}/>;
                ReactDOM.render(debugView, this);
            }    
        }

    The `resolveAttributes` method will transform custom element HTML attributes to React component props. By convention, web component attributes have to be passed using **camel case** to be tranformed into React component props.

For instance: a `preview-image` HTML attribute becomes `previewImage` prop.

4. In the main entry point class (ex: `MyCompanyLibraryLibrary.ts`), extends the `IExtensibilityLibrary` interface and register your custom components this way:

        
        import { MyCustomComponentWebComponent } from "../CustomComponent";
        import { IComponentDefinition } from "../../models/IComponentDefinition";
        import { IExtensibilityLibrary } from "../../models/IExtensibilityLibrary";

        export class MyCompanyLibraryLibrary implements IExtensibilityLibrary {

            public getCustomWebComponents(): IComponentDefinition<any>[] {
                return [
                {
                    componentName: 'my-custom-component',
                    componentClass: MyCustomComponentWebComponent
                }
                ];
            }
        }

5. In a custom Handlebars layout, reference your component like this, leveraging the Handlebars context values:

        <my-custom-component my-string-param="{{MyStringProperty}}" my-object-param="{{JSONstringify MyObjectProperty 2}}"></my-custom-component>


6. Bundle `gulp bundle --ship` and package your library `gulp package-solution --ship` and upload it either in the global or a site app catalog.