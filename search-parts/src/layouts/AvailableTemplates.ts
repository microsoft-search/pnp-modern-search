import { FilterType } from "@pnp/modern-search-extensibility";

export enum BuiltinFilterTemplates {
    CheckBox = 'CheckboxFilterTemplate',
    DateRange = 'DateRangeFilterTemplate',
    ComboBox = 'ComboBoxFilterTemplate',
    People = 'PeopleTemplate',
    StaticPeople = 'StaticPeopleTemplate',
    DateInterval = 'DateIntervalFilterTemplate',
    TaxonomyPicker = 'TaxonomyPickerFilterTemplate',
    Hierarchical = 'HierarchicalFilterTemplate'
}

/**
 * Filter types configuration
 */
export const BuiltinFilterTypes = {
    [BuiltinFilterTemplates.CheckBox]: FilterType.Refiner,
    [BuiltinFilterTemplates.DateInterval]: FilterType.Refiner,
    [BuiltinFilterTemplates.ComboBox]: FilterType.Refiner,
    [BuiltinFilterTemplates.People]: FilterType.Refiner,
    [BuiltinFilterTemplates.Hierarchical]: FilterType.Refiner,
    [BuiltinFilterTemplates.StaticPeople]: FilterType.StaticFilter,
    [BuiltinFilterTemplates.DateRange]: FilterType.StaticFilter,
    [BuiltinFilterTemplates.TaxonomyPicker]: FilterType.StaticFilter
};