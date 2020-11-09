import { FilterType } from "@pnp/modern-search-extensibility";

export enum BuiltinFilterTemplates {
    CheckBox = 'CheckboxFilterTemplate',
    DateRange = 'DateRangeFilterTemplate',
    ComboBox = 'ComboBoxFilterTemplate',
    DateInterval = 'DateIntervalFilterTemplate',
    TaxonomyPicker = 'TaxonomyPickerFilterTemplate'
}

/**
 * Filter types configuration
 */
export const BuiltinFilterTypes = {
    [BuiltinFilterTemplates.CheckBox]: FilterType.Refiner,
    [BuiltinFilterTemplates.DateInterval]: FilterType.Refiner,
    [BuiltinFilterTemplates.ComboBox]: FilterType.Refiner,
    [BuiltinFilterTemplates.DateRange]: FilterType.StaticFilter,
    [BuiltinFilterTemplates.TaxonomyPicker]: FilterType.StaticFilter
};