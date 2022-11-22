# Extensibility possibilities

This solution supports different levels of customizations depending your requirements:

- **'Basic' customizations**: these include custom settings for data sources, search box, verticals and filters Web Parts + minor updates to existing layouts by adding custom HTML markup (ex: add a custom field in the UI from a data source), updates to builtin layouts fields ('Cards','Details List' and 'People'), etc. **They only require HTML, CSS and Handlebars skills to be done**. Typically a super user or a webmaster could do that.
- **'Advanced' customizations**: these include major updates like adding a new data source, layout, component or suggestions provider. **These are build from scratch and require SharePoint Framework development skills to be done**. Typically, a front-end/SharePoint developer could do that.

!!! note
    Extensibility samples are centralized in a dedicated repository: [https://github.com/microsoft-search/pnp-modern-search-extensibility-samples/tree/main](https://github.com/microsoft-search/pnp-modern-search-extensibility-samples/tree/main)

## Basic customizations

'Basic' customizations cover the layout templates updates with HTML, CSS and Handlebars. Refer to the templating [documentation](./templating.md) to know more.

## Advanced customizations

The solution uses the concept of **'extensibility libraries'**. Basically, these are [SharePoint Framework library components](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/library-component-tutorial) you put in the global or site collection app catalog that will be loaded automatically by Web Parts to enhance the experience and options (ex: new data source with new options, custom layout, etc.). Simple as that!

> As a demonstration of capabilities, all builtin data sources, layouts, web components or suggestions providers are built using **the same exact interfaces and methods** that are publicly available in the `@pnp/modern-search-extensibility` SPFx library project.

> All documentation procedures for extensions are based on the demo extensibility library available in the same repository that you can use as reference.

### Prerequistes

For your project to be a valid extensibility library, you must have the following prerequisites:

- Your project must be an [SPFx library component](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/library-component-overview).
- The main entry point of your library must implement the `IExtensibilityLibrary` interface from the `@pnp/modern-search-extensibility` library.
- You library **manifest ID** must be registered in the Web Part where you want to use the extension.

!!! important "SPFx version"
    The SPFx library project must use the same SPFx version as the main solution (currently `1.12.1`). Owherwise you may face issues at build time. See [GitHub issue #1893](https://github.com/microsoft-search/pnp-modern-search/issues/1893)

### Supported extensions

Each Web Part type in the solution supports several extensions or no extension at all. It means even your extensibility library contains all possible extensions, they won't be loaded if the Web Part does not support them.

| Web Part type | Supported extensions |
| ------------- | -------------------- |
| **Search Results** | <ul><li>Custom web components.</li><li>Custom Handlebars [customizations](https://handlebarsjs.com/api-reference/runtime.html) (ex: helpers, partials ,etc.).</li><li>Custom event handlers for adaptive cards actions</li><li>Custom Data Sources</li></ul>
| **Search Filters** |  <ul><li>Custom web components (_not directly but via the 'Search Results' Web Part extensibility library registration_).</li></ul>
| **Search box** | <ul><li>Custom suggestions providers.</li></ul>
| **Search Verticals** | None.

### Register your extensibility library with a Web Part

When a Web Part type supports one or multiple extensions, you can register them going to the last property pane confguration page in the _'Extensibility configuration'_ section:

[!["Extensibility configuration"](../assets/extensibility/extensibility_configuration.png){: .center}](../assets/extensibility/extensibility_configuration.png)

From here, you can add the manifest IDs of your libraries and decide to enable or disabled certain libraries. The manifest ID can be found in the `<your_library_name>.manifest.json` file:

[!["Library manifest ID"](../assets/extensibility/library_manifest_id.png){: .center}](../assets/extensibility/library_manifest_id.png)

[!["Extensibility manifests registration"](../assets/extensibility/extensibility_configuration_manifest.png){: .center}](../assets/extensibility/extensibility_configuration_manifest.png)

> Multiple librairies can be registred for a single Web Part instance allowing you to split your extensions into multiple projects (in the end, they will be all concatenated). For instance, this could be convenient when extensions come from different IT providers.

### Create an extensibility library

To create an extensibility library, you have the choice to reuse the one provided in the GitHub repository or start from scratch. In this case:

1. Create a new SharePoint Framework project of type 'Library' with `yo @microsoft/sharepoint`.
2. Add an npm reference to `@pnp/modern-search-extensibility` library using `npm i @pnp/modern-search-extensibility --save` cmd.
3. In the main entry point, implement the `IExtensibilityLibrary` interface. Provide all method implementations (return empty arrays if you don't implement specific extensions).
    !["Extensibility interface implementation"](../assets/extensibility/implement_interface.png){: .center}
5. Implement your extension(s) depending of the type:
    - [Layout](./custom_layout.md)
    - [Web component](./custom_web_component.md)
    - [Suggestions providers](./custom_suggestions_provider.md)
    - [Handlebars customizations](./handlebars_customizations.md)    
    - [Adaptive Cards Actions handlers](./adaptivecards_customizations.md)
    - [Query modifier](./custom_query_modifications.md)
    - [Data Sources](./custom_data_sources.md)

    Creation process always follows more or less the same pattern:

    1. Create the extension data logic or render logic.
    2. Register the information about the extension to be discovered and instanciated by the target Web Part by implementing the corresponding method according to the `IExtensibilityLibrary` interface.

6. Bundle `gulp bundle --ship` and package `gulp package-solution --ship` and add the solution to the global or site collection catalog (for this one, it must be the same site collection where the Web Part loading that extension(s) is present).
7. [Register your manifest ID in the target Web Part instance](#register-your-extensibility-library-with-a-web-part).
8. Enjoy!

#### Debug a library component

Debugging a library component is exactly the same as debugging an SPFx Web Part. Run `gulp serve` in the hosted workbench and put a _'Search Results'_,_'Search Filters'_ or _'Search Box'_ Web Part depending the extension you want to test. If registered correctly, your breakpoints will be triggerred by the main Web Part loading your extension.

#### Accessing the SharePoint Framework context and services in a library component

In case you need to access the SharePoint Framework context and services, within your custom library component, you can easily do that by relying on the Service Locator pattern available in SPFx.
You simply need to declare a public static property with name `serviceKey` in your library component and provide a constructor that accepts a [`ServiceScope`](https://docs.microsoft.com/en-us/javascript/api/sp-core-library/servicescope?view=sp-typescript-latest) instance as input argument.
For example, here you can see a code excerpt of such a library component that handles custom actions for Adaptive Cards rendering:

```typescript
import { IAdaptiveCardAction, IComponentDefinition, IExtensibilityLibrary, ILayoutDefinition, ISuggestionProviderDefinition, IQueryModifierDefinition } from '@pnp/modern-search-extensibility';
import { ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { PageContext } from '@microsoft/sp-page-context';

export class MyCustomLibraryComponent implements IExtensibilityLibrary {

  public static readonly serviceKey: ServiceKey<MyCustomLibraryComponent> =
    ServiceKey.create<MyCustomLibraryComponent>('SPFx:MyCustomLibraryComponent', MyCustomLibraryComponent);

  private _spHttpClient: SPHttpClient;
  private _pageContext: PageContext;
  private _currentWebUrl: string;

  constructor(serviceScope: ServiceScope) {
    serviceScope.whenFinished(() => {
      this._spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);

      this._pageContext = serviceScope.consume(PageContext.serviceKey);
      this._currentWebUrl = this._pageContext.web.absoluteUrl;
    });
  }

  public getCustomLayouts(): ILayoutDefinition[] {
    return [];
  }

  public getCustomWebComponents(): IComponentDefinition<any>[] {
    return [];
  }

  public getCustomSuggestionProviders(): ISuggestionProviderDefinition[] {
    return [];
  }

  public registerHandlebarsCustomizations?(handlebarsNamespace: typeof Handlebars): void {
  }

  public getCustomQueryModifiers?(): IQueryModifierDefinition[]{

  }

  public invokeCardAction(action: IAdaptiveCardAction): void {
    
    // Process the action based on type
    if (action.type == "Action.OpenUrl") {
      window.open(action.url, "_blank");
    } else if (action.type == "Action.Submit") {
      // Process the Submit action based on title
      switch (action.title.toLowerCase()) {
        case "user":

          // Invoke the currentUser endpoint
          this._spHttpClient.get(
            `${this._currentWebUrl}/_api/web/currentUser`,
            SPHttpClient.configurations.v1, 
            null).then((response: SPHttpClientResponse) => {
              return response.json();
            });

          break;
        default:
          console.log('Action not supported!');
          break;
      }
    }
  }

  public getCustomDataSources(): IDataSourceDefinition[]
  {
    return [
      {
          name: 'Custom Data Source',
          iconName: 'Database',
          key: 'CustomDataSource',
          serviceKey: ServiceKey.create<IDataSource>('CustomDataSource', CustomDataSource)
      }
    ];
  }

  public name(): string {
    return 'MyCustomLibraryComponent';
  }
}
```

In order to run the above sample code, you will need to import in your library the following npm packages: `@microsoft/sp-component-base`, `@microsoft/sp-core-library`, and `@microsoft/sp-webpart-base`.  