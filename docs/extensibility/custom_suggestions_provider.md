# Create a custom suggestions providers

Custom suggestions providers can be added to a search box Web Part to get normalized keywords during search.

!["Custom web component"](../assets/webparts/search_box/suggestions_demo.png){: .center}

A suggestions provider supports:

- **Zero term suggestions**: suggestions displayed when the search box get the initial focus and no term is provided.
- **Suggestions based on a keywords**: suggestions matching specific keywords provided in the search box.

## Custom suggestions provider creation process

Suggestions provider creation process comes in two distinct steps:

1. [Create the provider logic](#create-the-component-logic-and-sub-components).
2. [Register the provider information for discovery](#register-component-information).

### Create the provider logic

* In your extensibility library project, create a new `MyProvider.ts` TypeScript file.
* Create an interface for your provider properties, typically the ones you want to persist in the Web Part property bag. Providers properties are isolated from the other general Web Part properties under the property `providerProperties` in the property bag object.
```typescript
    export interface ICustomSuggestionProviderProperties {
        myProperty: string;
    }
```

* Implement the `BaseSuggestionProvider` abstract class using your properties interface:
```typescript
    export class CustomSuggestionProvider extends BaseSuggestionProvider<ICustomSuggestionProviderProperties> {
        ...
    }
```

* Implement your provider logic according to the available methods and properties.

#### BaseSuggestionProvider - Methods

| Method | Description |
| --------- | ---------- |
| `onInit()`| The initialization method of your provider (ex: initialize your properties, etc.). You can perform asynchronous calls here. This method will be called when the provider is instanciated by the main Web Part. This is a good place to fetch any zero term suggestions if any.
| `getSuggestions()` | Method called to retrieve suggestions when a keyword is entered (in paramter).
| `getZeroTermSuggestions()` | Method called to retrieve the zero term suggestions (i.e. when the search box gets initial focus).
| `getPropertyPaneGroupsConfiguration()` | Returns the property pane fields to display when your provider is selected. These are regular SPFx property fields and groups. PRovider properties are isolated from the other general Web Part properties under the property `providerProperties`. It means you must include that path in your property pane controls get the value persisted. Defining fields or groups is not mandatory for a provider. If you don't want to expose any option, just return an empty array.
| `onPropertyUpdate()` | The method will be called when a property pane value is updated. The main Web Part in `Reactive` mode for property pane fields.

#### BaseSuggestionProvider - Properties

| Property | Description |
| --------- | ---------- |
| `properties` | The Web Part properties in the property bag. Corresponds to the isolated `providerProperties` property in the global property bag. You won't be able to access any other general properties of the Web Part.
| `isZeroTermSuggestionsEnabled` | Flag indicating if the provider supports zero term suggestions or not.

### Register provider information

The next step is to fill information about your new suggestions provider. In the library main entry point (i.e. the class implementing the `IExtensibilityLibrary` in interface) return a new `ISuggestionProviderDefinition` object in the `getCustomSuggestionProviders()` method using these properties: 

| Property | Description |
| --------- | ---------- |
| `name` | The friendly name of your provider that will show up in the configuration panel.
| `key` | An unique internal key for your data source.
| `description` | A meaningful description of your provider.
| `serviceKey` | A service key used to instanciate your provider class. Builtin or custom providers are instanciated dynamically using [SPFx service scopes](https://docs.microsoft.com/en-us/javascript/api/sp-core-library/servicescope?view=sp-typescript-latest).

```typescript
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
```
