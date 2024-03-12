# Create a custom data source

Custom data sources can be added to a search results Web Part to get results from your custom source.

## Custom data source creation process

Custom data source creation process comes in two distinct steps:

1. [Create the data source logic](#create-the-component-logic-and-sub-components).
2. [Register the data source information for discovery](#register-component-information).

### Create the data source logic

* In your extensibility library project, create a new `CustomDataSource.ts` TypeScript file.
* Create an interface for your data source properties, typically the ones you want to persist in the Web Part property bag. Data source properties are isolated from the other general Web Part properties under the property `dataSourceProperties` in the property bag object.
```typescript
    export interface ICustomDataSourceProperties {
        possibleResults: string;
    }
```

* Implement the `BaseDataSource` abstract class using your properties interface:
```typescript
    export class CustomDataSource extends BaseDataSource<ICustomDataSourceProperties> {
        ...
    }
```

* Implement your data source logic according to the available methods and properties.

### BaseDataSource - Methods

| Method | Description |
| --------- | ---------- |
| `onInit()`| The initialization method of your data source (ex: initialize your properties, etc.). You can perform asynchronous calls here. This method will be called when the data source is instantiated by the main Web Part.
| `getPropertyPaneGroupsConfiguration()` | Returns the property pane fields to display when your data source is selected. These are regular SPFx property fields and groups. Data source properties are isolated from the other general Web Part properties under the property `dataSourceProperties`. It means you must include that path in your property pane controls to get the value persisted. Defining fields or groups is not mandatory for a provider. If you don't want to expose any option, just return an empty array.
| `onPropertyUpdate()` | The method will be called when a property pane value is updated. The main Web Part in `Reactive` mode for property pane fields.
| `getPagingBehavior()` | The method should return the desired paging behavior for the data source. Will be 'None' if not specified.
| `getFilterBehavior()` | The method should return the desired filter behavior for the data source. Will be 'Static' if not specified.
| `getAppliedFilters()` | If any, this method should return the list of filters (i.e data source fields) applied by the data source to filter results.
| `getItemCount()` | The method should return the total number of items. This information will be used to generate page numbers.
| `getTemplateSlots()` | The method should return the available template slots for this data source.
| `getSortableFields()` | The method should return the list of sortable fields for the data source if applicable


### BaseDataSource - Properties

| Property | Description |
| --------- | ---------- |
| `properties` | The Web Part properties in the property bag. Corresponds to the isolated `dataSourceProperties` property in the global property bag. You won't be able to access any other general properties of the Web Part.

### Register provider information

The next step is to provide information about your new data source. In the library main entry point (i.e. the class implementing the `IExtensibilityLibrary` in interface) return a new `IDataSourceDefinition` array in the `getCustomDataSources()` method using these properties: 

| Property | Description |
| --------- | ---------- |
| `name` | The friendly name of your data source that will show up in the configuration panel.
| `iconName` | The name of an icon from Office UI Fabric/Fluent UI that will be shown in the data source options.
| `key` | An unique internal key for your data source.
| `serviceKey` | A service key used to instantiate your data source class. Builtin or custom data sources are instantiated dynamically using [SPFx service scopes](https://docs.microsoft.com/en-us/javascript/api/sp-core-library/servicescope?view=sp-typescript-latest).

```typescript
  public getCustomDataSources(): IDataSourceDefinition[] {
    return [
      {
          name: 'Custom Data Source',
          iconName: 'Database',
          key: 'CustomDataSource',
          serviceKey: ServiceKey.create<IDataSource>('CustomDataSource', CustomDataSource)
      }
    ];
  }
```
