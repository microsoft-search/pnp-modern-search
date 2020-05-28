## Summary

This solution allows you to create and register your own extensions for the Modern Search Webparts. View the sample project [here](https://github.com/microsoft-search/pnp-modern-search/tree/master/search-extensibility-library).


## Used SharePoint Framework Version ##

![SPFx](https://img.shields.io/badge/drop-1.9.1-green.svg)


## Types of Extensions

### Web Components
React components that extend HTML with custom user interfaces. Are implemented in custom Handlebars templates.

### Handlebars Helpers
React classes that expose custom logic to Handlebars templates. Are implemented in custom Handlebars templates.

### Query Modifiers
React classes that allow you to manipulate the user's search query before it is sent to SharePoint.

### Suggestion Providers
React classes that allow you to fetch and display custom content or person suggestions.


## Prerequisites

BREAKING CHANGE NOTES: 
- Modern Search version v3.12.1 and before is capable of loading a single extensibility library with the ID of: `2501f2fd-d601-4da4-a04d-9f0bd85b1f54`.  More recent versions can load an unlimited number of extensibility libraries via configuration on the web part property pane.  To avoid conflicts with the sample provided it is recommended to update the id in your library manifest to be unique. 
- In Modern Search versions >3.12.1 extension developers should delete shared models and reference from the search-extensibility library. This ensures fewer code changes as the base abstractions are upgraded and new extension types are added.

Modern Search extensions are defined in a SharePoint Framework project of type ['Library Component'](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/library-component-overview). Extensions leverage the search-extensibility library [here](https://github.com/microsoft-search/pnp-modern-search/tree/master/search-extensibility) for shared models, service definitions and must follow the patterns below for successful import. 

To develop a custom extensibility library, clone the Modern Search code, navigate to the search-extensibility folder and execute the following commands at the prompt:

1) gulp bundle --ship
2) gulp package-solution --ship
3) npm link

This packages the shared library and creates a package on your local machine that is imported when developing custom extensions.

Navigate to your custom extensibility library and reference the shared search-extensibility package by executing the following command:

1) npm link search-extensibility

NOTE: The `id` property in the `<your_library_name>.manifest.json` file is used to load dynamically the library from the Search Results and Search Box Web Parts. You will need to enter this into the Web Part property pane so keep it handy.


## Create the library interface

The library interface is required for the Modern Search Webparts to import your custom extensions, it exposes all your extensions and provides user friendly functionality. Follow this procedure to create a third party library:

1) Navigate to the library.ts file located at /src/libraries/libraryName/library.ts

2) Import the shared library, strings and reference your extension classes:

import { ModernSearchExtensibilityLibrary, IExtension } from 'search-extensibility';        // the shared search-extensibility package
import * as strings from 'SearchExtensibilityReferenceExtensionLibraryStrings';             // your librarys strings
// your libraries components
import { MyCustomComponentWebComponent } from "../../extensions/webComponents/CustomComponent/CustomComponent"; 
import SharePointSuggestionProvider from '../../extensions/suggestionProviders/SharePointSuggestionProvider/SharePointSuggestionProvider';
import CustomQueryModifier from '../../extensions/queryModifiers/CustomQueryProvider/CustomQueryProvider';
import { CustomHelper } from '../../extensions/handlebarsHelpers/Custom/CustomHelper';

3) Extend the ModernSearchExtensibilityLibrary and implement all abstract interfaces. The main entry point of your library is the getExtensions() method which returns all extensions.

export class MyCompanyLibraryLibrary extends ModernSearchExtensibilityLibrary {

  public name         : string = strings.Library.Name;              // The display name of your library, should be unique.
  public description  : string = strings.Library.Description;       // The description of your library, should explain to users what your library does.
  public icon         : string = "Settings";                        // An office ui fabric icon to be displayed to end users in the user interface.

  // All extension types are returned via the getExtensions method. 
  public getExtensions(): IExtension<any>[] {
    return [
        // Custom Web Component
        {
            name: 'pnp-custom',                                                     // the tag name of the imported web component.
            description: strings.Extensions.WebComponent.Custom.Description,        // the description of the web component.
            displayName: strings.Extensions.WebComponent.Custom.DisplayName,        // the display name for the web component.
            icon: "StatusCircleQuestionMark",                                       // an icon to identify the web component in the UI.
            extensionClass: MyCustomComponentWebComponent                           // the extensions class name
        },
        // Custom Suggestion Provider
        {
            name: "sharepoint-suggestion-provider",                                 // the textual id for the suggestion provider
            description: strings.Extensions.Suggestion.SharePoint.Description,
            displayName: strings.Extensions.Suggestion.SharePoint.DisplayName,
            icon: "SharePointAppIcon16",
            extensionClass: SharePointSuggestionProvider
        },
        // Custom Query Modifier
        {
            name: "custom-query-modifer",                                           // the textual id for the query modifier
            description: strings.Extensions.QueryModifier.Custom.Description,
            displayName: strings.Extensions.QueryModifier.Custom.DisplayName,
            icon: "BranchSearch",
            extensionClass: CustomQueryModifier
        },
        // Custom Handlebars helper
        {
            name: "logprop",                                                        // the handlebars helper name ... EX// {{logprop Title}}
            description: strings.Extensions.HandlebarsHelper.Custom.Description,
            displayName: strings.Extensions.HandlebarsHelper.Custom.DisplayName,
            icon: "Handwriting",
            extensionClass: CustomHelper
        }
    ];
  }
  
}


## Create a custom web component

A web component is a custom HTML element that can be used in your templates to implement complex behaviors. We used them here as *"wrappers"* for React components to be able to use them with Handlebars. In this solution, web components are considered **stateless**, meaning they will be entirely recreated when an attribute is changed (coming from the property pane). It means you can still use an inner state in your React components but not rely on the parent context (props) since it will be recreated every time by the Handlebars template.

To create a custom component, follow this procedure:

1. Create a new JSX file that will be used for your layout. (ex: `CustomComponent.tsx`). You can create it anywhere in your project.

2. Implement your component like a regular React component.

        import * as React from 'react';
        import * as ReactDOM from 'react-dom';
        import { BaseWebComponent } from 'search-extensibility';

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

                // You can use this.context here to access current context
                // this.context.search      - limited search service
                // this.context.template    - limited template service
                // this.context.webPart     - the webpart context

                // You can access component innerHTML, styles and themeVariant using the allAttributes property
                // this.allAttributes.innerHTML
                // this.allAttributes.styles
                // this.allAttributes.themeVariant

                const customComponent = <CustomComponent {...props}/>;
                ReactDOM.render(customComponent, this);

            }    
        }

    The `resolveAttributes` method will transform custom element HTML attributes to React component props. By convention, web component attributes have to be passed using **camel case** to be tranformed into React component props.

    > **All custom web components must use the prefix `data-` for attributes (ex: `data-my-parameter`) in the html comsumer. However, the `data-` part won't be included after the resolution by the `resolveAttributes` method.**

For instance: a `preview-image` HTML attribute becomes `previewImage` prop.

4. In a custom Handlebars layout, reference your component like this, leveraging the Handlebars context values:

        <my-custom-component my-string-param="{{MyStringProperty}}" my-object-param="{{JSONstringify MyObjectProperty 2}}"></my-custom-component>


6. Bundle `gulp bundle --ship` and package your library `gulp package-solution --ship` and upload it either in the global or a site app catalog.


## Create a custom query suggestion provider
A query suggestion provider allows you to fetch and display custom content or person suggestions. There is a default provider built-in which retrieves suggestions from SharePoint, however you may add additional providers using the approach outlined. In additional to dynamic suggestions as the user is typing, your provider may also surface "zero query" suggestions. These are displayed  when the search box has focus without any search text or if the search text is less than 2 characters.

To create a custom suggestion provider, follow this procedure:

1. Create a new TypeScript class that implements the `BaseSuggestionProvider` abstract class. You can create it anywhere in your project.
2. Implement the required methods and properties like the example below.
    
        import { BaseSuggestionProvider, ISuggestion } from 'search-extensibility';

        export class CustomSuggestionProvider extends BaseSuggestionProvider  {
            
            public async onInit(): Promise<void> {
                // initialization logic
                // You can use this.context here to access current context
                // this.context.search      - limited search service
                // this.context.template    - limited template service
                // this.context.webPart     - the webpart context
            }

            public get isSuggestionsEnabled(): boolean {
                return true;
            }

            public get isZeroTermSuggestionsEnabled(): boolean {
                return true;
            }

            public async getSuggestions(queryText: string): Promise<ISuggestion[]> {
                // fetch suggestions
            }

            public async getZeroTermSuggestions(): Promise<ISuggestion[]> {
                // fetch zero term suggestions
            }
        }


### Configure Suggestion Providers
When one or more custom query suggestion providers are made available via the extensibility library, an additional configuration pane becomes availabe in the Search Box web part settings. From the panel you can enable or disable individual suggestion providers.

![Search Box](../images/sb_configure_suggestions.png)
![Search Box](../images/sb_custom_suggestion_providers.png)


## Create a custom query modifier

A query modifier allows you to manipulate the user's search query before it is sent to SharePoint. You can define multiple query modifiers in the extensibility library. However, **only one at a time can be selected in the search results WP** depending your requirements. The modifier receives the query text (from search box or the static value specified in the search results WP), query template and result source ID (from search results or search verticals if configured) as parameters. The modifier returns an object with the updated query text and query template. This capability allows you to inject additional terms or criteria to the user's search query such as spelling corrections or translations. You can use the sample [Search Query Enhancer function](../search-query-enhancer/getting-started.md) as a starter to use Microsoft Cognitive services to do so.

To create a custom query modifier, follow this procedure:

1. Create a new TypeScript class that implements the `BaseQueryModifier` abstract class. You can create it anywhere in your project.
2. Implement the required methods and properties like the example below.
    
        import { BaseQueryModifier } from '../models/BaseQueryModifier';
        import { IQueryModifierInput, IQueryModification } from '../models/IQueryModification';

        export class CustomQueryModifier extends BaseQueryModifier  {

            public static readonly DisplayName: string = 'Sample Query Modifier';
            public static readonly Description: string = 'Adds a filter to the query so that only word documents are returned.';

            public async onInit(): Promise<void> {
                // this._ctx // SPFx Webpart Context
            }

            public async modifyQuery(query: IQueryModifierInput): Promise<IQueryModification> {
                // e.g. Always return docx files
                const newQueryText = `${query.queryText} fileextension:docx`;

                // Leave query template unchanged
                const newQueryTemplate = query.queryTemplate;

                return {
                    queryText: newQueryText,
                    queryTemplate: newQueryTemplate
                } as IQueryModification);
            }
        }

3. In the main entry point class (ex: MyCompanyLibraryLibrary.ts), register your custom query modifier like the example below.

        import { IExtensibilityLibrary } from "../../models/IExtensibilityLibrary";
        import { IQueryModifierDefinition } from "../../models/IQueryModifierDefinition";
        import { CustomQueryModifier } from "../CustomQueryModifier";

        ...
        
        export class MyCompanyLibraryLibrary implements IExtensibilityLibrary {

            public getQueryModifier(): IQueryModifierDefinition<any> {
                return {
                    displayName: CustomQueryModifier.DisplayName,
                    description: CustomQueryModifier.Description,
                    class: CustomQueryModifier
                };
            }
        }

### Configure Query Modifier

When a query modifier is made available via the extensibility library, an additional configuration sections becomes visible in the Search Results web part settings. Here you can select the query modifier to apply to this search box. **Only one provider a time can be selected in the search results WP**.

![Search Results - Query Modifier](../images/query_modifiers.png)

![Search Results - Query Modifier](../images/query_modifiers_select.png)


## Handlebars Helpers

Handlebars helper extensions allows you to register custom helpers that are registerred and available for use in your custom templates. You may make your own helpers or incorporate third party tools.  Functionality is exposed via the helper method of any signature. The helper is registered within web parts that support templating and may be called from your template. Create a new file in your library and paste the following code:

import { BaseHandlebarsHelper } from "search-extensibility";

export class CustomHelper extends BaseHandlebarsHelper {
    
    public helper(input: string) : string {
        // log the input to the console.
        console.log(input);
        return input;
    }

}

