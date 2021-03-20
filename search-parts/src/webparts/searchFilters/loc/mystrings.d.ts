declare interface ISearchFiltersWebPartStrings {
  General: {
    PlaceHolder: {
      EditLabel: string;
      IconText: string;
      Description: string;
      ConfigureBtnLabel: string;
    },
    NoAvailableFilterMessage: string;
    WebPartDefaultTitle: string;
  },
  PropertyPane: {      
    ConnectionsPage: {
      UseDataResultsWebPartLabel: string;
      UseDataResultsFromComponentsLabel: string;
      UseDataResultsFromComponentsDescription: string;
    },
    FiltersSettingsPage: {
      SettingsGroupName: string;
      FilterOperator: string;
    },
    DataFilterCollection: {
      SelectFilterComboBoxLabel: string;
      FilterNameLabel: string;
      FilterMaxBuckets: string;
      FilterDisplayName: string;
      FilterTemplate: string;
      FilterExpandByDefault: string;
      FilterType: string;
      FilterTypeRefiner: string;
      FilterTypeStaticFilter: string;
      CustomizeFiltersBtnLabel: string;
      CustomizeFiltersHeader: string;
      CustomizeFiltersDescription: string;
      CustomizeFiltersFieldLabel: string;
      ShowCount: string;
      Operator: string;
      ANDOperator: string;
      OROperator: string;
      IsMulti: string;
      Templates: {
        CheckBoxTemplate: string;
        DateRangeTemplate: string;
        ComboBoxTemplate: string;
        DateIntervalTemplate: string;
        TaxonomyPickerTemplate: string;
      },
      SortBy: string;
      SortDirection: string;
      SortByName: string;
      SortByCount: string;
      SortAscending: string;
      SortDescending: string;
    },
    LayoutPage: {
      AvailableLayoutsGroupName: string;
      LayoutTemplateOptionsGroupName: string;
      TemplateUrlFieldLabel: string;
      TemplateUrlPlaceholder: string;
      ErrorTemplateExtension: string;
      ErrorTemplateResolve: string;
      FiltersTemplateFieldLabel: string;
      FiltersTemplatePanelHeader: string;
    }
  }
}

declare module 'SearchFiltersWebPartStrings' {
  const strings: ISearchFiltersWebPartStrings;
  export = strings;
}
