# Create a custom query modifier

Custom query modifier can be added to a search result Web Part to modify search requests before they are sent to the server.

A query modifier supports:

- **Modification of query text and query template**: a query modifier can alter the query text and/or the query template.
- **Sorted modifications**: modifier can be sorted and are executed in order - but you can set a modifier to stop further modifications.

## Custom modifier creation process

Custom modifier creation process comes in two distinct steps:

1. [Create the modifier logic](#create-the-component-logic-and-sub-components).
2. [Register the modifier information for discovery](#register-component-information).

### Create the provider logic

* In your extensibility library project, create a new `CustomQueryModifier.ts` TypeScript file.
* Create an interface for your modifier properties, typically the ones you want to persist in the Web Part property bag. Modifier properties are isolated from the other general Web Part properties under the property `queryModifierProperties` in the property bag object.
```typescript
    export interface ICustomQueryModifierProperties {
        myProperty: string;
    }
```

* Implement the `BaseQueryModifier` abstract class using your properties interface:
```typescript
    export class CustomQueryModifier extends BaseQueryModifier<ICustomQueryModifierProperties> {
        ...
    }
```

* Implement your query modifier logic according to the available methods and properties.

#### BaseQueryModifier - Methods

| Method | Description |
| --------- | ---------- |
| `onInit()`| The initialization method of your query modifier (ex: initialize your properties, etc.). You can perform asynchronous calls here. This method will be called when the provider is instanciated by the main Web Part. This is a good place to initialize any consumed services if any.
| `modifyQuery()` | Method called to get a query modification when a search is requested(in paramter).
| `getPropertyPaneGroupsConfiguration()` | Returns the property pane fields to display when your query modifier is selected. These are regular SPFx property fields and groups. Query modifier properties are isolated from the other general Web Part properties under the property `queryModifierProperties`. It means you must include that path in your property pane controls get the value persisted. Defining fields or groups is not mandatory for a provider. If you don't want to expose any option, just return an empty array.
| `onPropertyUpdate()` | The method will be called when a property pane value is updated. The main Web Part in `Reactive` mode for property pane fields.

#### BaseQueryModifier - Properties

| Property | Description |
| --------- | ---------- |
| `properties` | The Web Part properties in the property bag. Corresponds to the isolated `queryModifierProperties` property in the global property bag. You won't be able to access any other general properties of the Web Part.
| `endWhenSuccessfull` | Flag indicating if this should be the last query modification when the query was modified - can be switched in the query modifier list overview.  

### Register provider information

The next step is to fill information about your new query modifier. In the library main entry point (i.e. the class implementing the `IExtensibilityLibrary` in interface) return a new `IQueryModifierDefinition` object in the `getCustomQueryModifiers()` method using these properties: 

| Property | Description |
| --------- | ---------- |
| `name` | The friendly name of your query modifier that will show up in the configuration panel.
| `key` | An unique internal key for your data source.
| `description` | A meaningful description of your query modifier.
| `serviceKey` | A service key used to instanciate your query modifier class. Builtin or custom query modifiers are instanciated dynamically using [SPFx service scopes](https://docs.microsoft.com/en-us/javascript/api/sp-core-library/servicescope?view=sp-typescript-latest).

```typescript
  public getCustomQueryModifiers(): IQueryModifierDefinition[] {
    return [
        {
          name: 'Custom Query Modifier',
          key: 'CustomQueryModifier',
          description: 'A demo custom query modifier from the extensibility library',
          serviceKey: ServiceKey.create<ISuggestionProvider>('MyCompany:CustomQueryModifier', CustomQueryModifier)
      }
    ];
  }
```
