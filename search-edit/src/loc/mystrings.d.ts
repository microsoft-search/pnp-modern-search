declare interface ISearchEditComponentsLibraryStrings {
  ExtensibilityEditor : {
    PropertyPaneDescription: string;
    BasicGroupName: string;
    DescriptionFieldLabel: string;
    Delete: string;
    NoExtensions: string;
    DisplayNameLabel: string;
    IconLabel: string;
    NameLabel: string;
    DescLabel: string;
    LoadButtonLabel: string;
    AddPlaceholder: string;
    PanelTitle: string;
    NoLibrariesAdded: string;
    AddLibraryLabel:string;
    EnterValidGuid:string;
    LibraryCouldNotBeLoaded:string;
    LibraryHasNoExtensions:string;
    WebComponentLabel:string;
    QueryModifierLabel:string;
    SuggestionProviderLabel:string;
    HandlebarsHelperLabel:string;
    LibraryDescription:string;
    LibraryGuid:string;
    LibraryAlreadyLoaded:string;
  },
  RefinementEditor: {
    AddRefiner: string;
    NewFilter:string;
    CodeHeaderText: string;
    HeaderText: string;
    ApplyButtonLabel: string;
    CancelButtonLabel: string;
    ImportButtonLabel: string;
    ExportButtonLabel: string;
    JsonFileRequiredMessage: string;
    ManagedPropertiesListPlaceHolder: string;
    EditHandlebarsExpressionLabel:string;
    AddHandlebarsExpressionDialogLabel:string;
    SaveButtonLabel:string;
    AvailableRefinersLabel: string;
    RefinerDisplayValueField: string;
    RefinerTemplateField: string;           
    SaveNewRefiner: string;
    IsCollapsed:string;
    ShowValueFilter:string;
    EnterDefaultTemplate:string;
    CustomItemTemplateFileLabel:string;
    Templates: {
      RefinerSortTypeSortDirectionAscending: string;
      RefinerSortTypeSortDirectionDescending: string;            
      RefinerSortTypeLabel: string;
      RefinerSortTypeAlphabetical: string;
      RefinerSortTypeByNumberOfResults: string;
      RefinerSortTypeSortOrderLabel: string;
      RefinementItemTemplateLabel: string;
      MutliValueRefinementItemTemplateLabel: string;
      DateRangeRefinementItemLabel: string;
      FixedDateRangeRefinementItemLabel: string;
      PersonaRefinementItemLabel: string;
      FileTypeRefinementItemTemplateLabel: string;
      FileTypeMutliValueRefinementItemTemplateLabel: string;
      ContainerTreeRefinementItemTemplateLabel: string;
      CustomItemTemplateLabel:string;
      CustomEditLabel:string;
      CustomEditRefinerTemplate:string;
    }
  },
  Sort: {
    SortInvalidSortableFieldMessage: string;
  }
}

declare module 'SearchEditComponentsLibraryStrings' {
  const strings: ISearchEditComponentsLibraryStrings;
  export = strings;
}
