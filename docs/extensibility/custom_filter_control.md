# Create a custom filter control

A **filter control** is the UI control used to render the values of a single filter in the 'Search Filters' Web Part. Out of the box the solution ships with a checkbox, combo box, date range, date interval, people, static people, taxonomy picker and hierarchical control.

Starting with `@pnp/modern-search-extensibility` v2.1.0, an extensibility library can add its own filter controls. They show up in the **'Filter template'** column of the filters configuration and are rendered by the builtin filter layouts (vertical, horizontal, panel) like any builtin control.

!!! note "Filter layouts vs filter controls"
    A **filter layout** ([custom layout](./custom_layout.md) with `type: LayoutType.Filter`) controls how the *whole set* of filters is laid out on the page. A **filter control** only renders the values of *one* filter, and is reusable across every layout.

## Filter control creation process

1. [Create the web component rendering the control](#create-the-web-component).
2. [Register the filter control for discovery](#register-the-filter-control-information).
3. [Register the library with the 'Search Filters' Web Part](./index.md#register-your-extensibility-library-with-a-web-part).

### Create the web component

A filter control is rendered as a custom HTML element, so it is a regular [custom web component](./custom_web_component.md). Create it as usual by extending `BaseWebComponent` and returning it from `getCustomWebComponents()`.

The builtin layouts render your component with the following attributes:

| Attribute | Description |
| --------- | ----------- |
| `data-instance-id` | The 'Search Filters' Web Part instance ID. Pass it back in the events you dispatch so the Web Part can resolve the right context.
| `data-filter-name` | The internal name of the filter (i.e. the data source field / managed property).
| `data-filter` | The whole filter as a JSON string (`IDataFilterInternal`): display name, values with their `selected`/`count`/`disabled` state, `isMulti`, `operator`, `canApply`, `canClear`, etc.
| `data-selected-filters` | The currently submitted filters as a JSON string (`IDataFilter[]`).
| `data-is-multi` | `true` when the filter is configured to allow multiple values.
| `data-show-count` | `true` when the filter is configured to show the values count.
| `data-operator` | The operator (`and`/`or`) configured between the filter values.
| `data-theme-variant` | The current theme as a JSON string.

To apply a selection, dispatch the same events as the builtin controls, using the constants from `ExtensibilityConstants`:

```typescript
import { ExtensibilityConstants, IDataFilterInfo, FilterComparisonOperator } from '@pnp/modern-search-extensibility';

this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
    detail: {
        filterName: this.filterName,
        filterValues: [{
            name: 'My value',
            value: 'MyValue',
            selected: true,
            operator: FilterComparisonOperator.Eq
        }],
        instanceId: this.instanceId
    } as IDataFilterInfo,
    bubbles: true,
    cancelable: true
}));
```

| Event | Purpose |
| ----- | ------- |
| `ExtensibilityConstants.EVENT_FILTER_UPDATED` | A value has been selected or unselected.
| `ExtensibilityConstants.EVENT_FILTER_APPLY_ALL` | Apply all pending values at once (multi values scenario).
| `ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL` | Clear all values at once.
| `ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED` | The AND/OR operator between values changed.

### Register the filter control information

In the library main entry point (i.e. the class implementing `IExtensibilityLibrary`), return an `IFilterControlDefinition` object from the `getCustomFilterControls()` method:

| Property | Description |
| --------- | ---------- |
| `key` | An unique internal key for your control. This value is persisted as the `selectedTemplate` property of the filters configuration.
| `name` | The friendly name of your control, displayed in the 'Filter template' dropdown of the filters configuration.
| `componentName` | The name of the custom HTML element to render. The component must **also** be returned by `getCustomWebComponents()` so it gets registered on the page.
| `filterType` | `FilterType.Refiner` (default) when the values come from the data source, `FilterType.StaticFilter` when your control provides its own values. Static filters are not requested as refiners/aggregations from the connected data source.
| `showOperator` | Renders the builtin AND/OR operator control above your control when the filter allows multiple values. Default is `false`.
| `showApplyButtons` | Renders the builtin 'Apply'/'Clear' buttons below your control when the filter allows multiple values. Default is `false`.
| `supportsMultiValues` | Set to `false` to disable the 'Multi values' option in the filters configuration for this control. Default is `true`.
| `supportsValuesCount` | Set to `false` to disable the 'Show count' option in the filters configuration for this control. Default is `true`.
| `supportsMaxBuckets` | Set to `false` to disable the 'Number of values' option in the filters configuration for this control. Default is `true`.

```typescript
public getCustomFilterControls(): IFilterControlDefinition[] {

    return [
        {
            key: 'MyCompanyRatingFilter',
            name: 'Rating',
            componentName: 'my-rating-filter',
            filterType: FilterType.Refiner,
            showApplyButtons: true,
            supportsValuesCount: false
        }
    ];
}

public getCustomWebComponents(): IComponentDefinition<any>[] {

    return [
        {
            componentName: 'my-rating-filter',
            componentClass: MyRatingFilterWebComponent
        }
    ];
}
```

### Use the control in a custom filter layout

The builtin layouts render custom filter controls automatically. If you write your own [filter layout](./custom_layout.md) or customize a builtin template, use the `customFilterControl` Handlebars helper to render whichever custom control is configured for a filter:

```handlebars
{{#each @root.filters as |filter|}}
    {{{customFilterControl filter @root.instanceId @root.theme @root.selectedFilters}}}
{{/each}}
```

Two companion helpers are available:

| Helper | Description |
| ------ | ----------- |
| `{{#isCustomFilterControl filter}}...{{else}}...{{/isCustomFilterControl}}` | Block helper telling whether the filter uses a custom control, so you can branch between your custom markup and the builtin one.
| `{{{customFilterControlFooter filter @root.instanceId @root.theme}}}` | Renders the builtin 'Apply'/'Clear' buttons for controls declaring `showApplyButtons: true`.

!!! important
    The custom controls of a filter are only resolved when the extensibility library providing them is registered **on the 'Search Filters' Web Part itself** (last property pane page, _'Extensibility configuration'_ section).
