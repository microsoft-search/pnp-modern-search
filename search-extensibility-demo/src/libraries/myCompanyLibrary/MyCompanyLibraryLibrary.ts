import { Guid, ServiceKey } from "@microsoft/sp-core-library";
import { IConfigurationDefinition, IExtensibilityLibrary, IComponentDefinition, ISuggestionProviderDefinition, ISuggestionProvider } from "@pnp/modern-search-extensibility";
import { MyCustomComponentWebComponent } from "../CustomComponent";
import { CustomSuggestionProvider } from "../CustomSuggestionProvider";
import { ExampleConfiguration } from "../ExampleConfiguration";

export class MyCompanyLibraryLibrary implements IExtensibilityLibrary {

  public getCustomWebComponents(): IComponentDefinition<any>[] {
    return [
      {
        componentName: 'my-custom-component',
        componentClass: MyCustomComponentWebComponent
      }
    ];
  }

  public getCustomSuggestionProviders(): ISuggestionProviderDefinition[] {
    return [
        {
          name: 'Custom Suggestions Provider',
          key: 'CustomSuggestionsProvider',
          description: 'A demo custom suggestions provider from the extensibility library',
          serviceKey: ServiceKey.create<ISuggestionProvider>('MyCompany:CustomSuggestionsProvider', CustomSuggestionProvider)
      }
    ];
  }

  public registerHandlebarsCustomizations(namespace: typeof Handlebars) {

    // Register custom Handlebars helpers
    // Usage {{myHelper 'value'}}
    namespace.registerHelper('myHelper', (value: string) => {
      return new namespace.SafeString(value.toUpperCase());
    });
  }

  public getConfigurations() : IConfigurationDefinition<any>[] { 
    return [
      {
        id: "b0a8b7dc-798b-4b35-8c50-568d9662faca",
        displayName: "Example Configuration",
        configurationClass: ExampleConfiguration
      }
    ];
  }

}
