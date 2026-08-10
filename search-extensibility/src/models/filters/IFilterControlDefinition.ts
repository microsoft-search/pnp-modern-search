import { FilterType } from "./IDataFilterConfiguration";

/**
 * Describes a custom filter control (i.e. the UI control used to render the values of a single filter,
 * like the builtin checkbox, combo box or date range controls) provided by an extensibility library.
 *
 * Custom filter controls show up in the filters configuration of the 'Search Filters' Web Part and are
 * rendered by the builtin filter layouts (vertical, horizontal, panel) as any other builtin control.
 */
export interface IFilterControlDefinition {

    /**
     * The unique key of the control. This value is persisted as the 'selectedTemplate' property
     * of the filters configuration in the 'Search Filters' Web Part.
     */
    key: string;

    /**
     * The friendly name of the control, displayed in the filters configuration of the property pane.
     */
    name: string;

    /**
     * The name of the custom HTML element (i.e. web component) to render for this control.
     * The corresponding component must also be returned by 'getCustomWebComponents()' so it gets registered on the page.
     */
    componentName: string;

    /**
     * The type of filter this control implements. Default is 'FilterType.Refiner'.
     * A 'FilterType.StaticFilter' control provides its own values and is therefore not requested as a refiner/aggregation from the data source.
     */
    filterType?: FilterType;

    /**
     * Renders the builtin AND/OR operator control above the control when the filter allows multiple values. Default is 'false'.
     */
    showOperator?: boolean;

    /**
     * Renders the builtin 'Apply'/'Clear' buttons below the control when the filter allows multiple values. Default is 'false'.
     */
    showApplyButtons?: boolean;

    /**
     * Determines if the 'Multi values' option can be configured for filters using this control. Default is 'true'.
     */
    supportsMultiValues?: boolean;

    /**
     * Determines if the 'Show count' option can be configured for filters using this control. Default is 'true'.
     */
    supportsValuesCount?: boolean;

    /**
     * Determines if the 'Number of values' (i.e. max buckets) option can be configured for filters using this control. Default is 'true'.
     */
    supportsMaxBuckets?: boolean;
}
