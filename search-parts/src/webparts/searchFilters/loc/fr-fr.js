define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Edit",
                IconText: "Search Filters by @PnP",
                Description: "Displays filters from a connected search results Web Part",
                ConfigureBtnLabel: "Configure"
            },
            NoAvailableFilterMessage: "No available filter to display.",
            WebPartDefaultTitle: "Search Filters Web Part"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Connect to a data results Web Part",
                UseDataResultsFromComponentsLabel: "Use data from these Web Parts",
                UseDataResultsFromComponentsDescription: "If you connect more than one Web Part, the filter values and counts will be merged for similar filter names.",
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filters settings",
                FilterOperator: "Operator to use between filters"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Select field",
                FilterNameLabel: "Filter field",
                FilterMaxBuckets: "# of values",
                FilterDisplayName: "Display name",
                FilterTemplate: "Template",
                FilterExpandByDefault: "Expand by default",
                FilterType: "Filter type",
                FilterTypeRefiner: "This filter template acts as a refiner and receives/sends available/selected values from/to the connected data source.",
                FilterTypeStaticFilter: "This filter template acts as a static filter and only sends arbitrary selected values to the connected data source. Incoming filter values are not taken into account.",
                CustomizeFiltersBtnLabel: "Edit",
                CustomizeFiltersHeader: "Edit filters",
                CustomizeFiltersDescription: "Configure search filters by adding or removing rows. You can select fields from the data source results (if already selected) or use static values for filters.",
                CustomizeFiltersFieldLabel: "Customize filters",
                ShowCount: "Show count",
                Operator: "Operator between values",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Multi values",
                Templates: {
                    CheckBoxTemplate: "Check box",
                    DateRangeTemplate: "Date range",
                    ComboBoxTemplate: "Combo box",
                    DateIntervalTemplate: "Date interval",
                    TaxonomyPickerTemplate: "Taxonomy picker"
                },
                SortBy: "Sort values by",
                SortDirection: "Sort direction",
                SortByName: "By name",
                SortByCount: "By count",
                SortAscending: "Ascending",
                SortDescending: "Descending"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Available layouts",
                LayoutTemplateOptionsGroupName: "Layout options",
                TemplateUrlFieldLabel: "Use an external template URL",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "The template must be a valid .htm or .html file",
                ErrorTemplateResolve: "Unable to resolve the specified template. Error details: '{0}'",
                FiltersTemplateFieldLabel: "Edit filters template",
                FiltersTemplatePanelHeader: "Edit filters template"
            }
        }
    }
});