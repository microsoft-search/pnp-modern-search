declare interface ISearchResultsWebPartStrings {
    SearchQuerySettingsGroupName: string;
    SearchSettingsGroupName: string;
    SearchQueryKeywordsFieldLabel: string;
    SearchQueryKeywordsFieldDescription: string;
    QueryTemplateFieldLabel: string;
    SelectedPropertiesFieldLabel: string;
    SelectedPropertiesFieldDescription: string;
    LoadingMessage: string;
    EnableLocalizationLabel: string;
    EnableLocalizationOnLabel: string;
    EnableLocalizationOffLabel: string;
    NoResultMessage: string;
    SortableFieldsLabel: string;
    SortableFieldsDescription: string;
    FilterPanelTitle: string;
    FilterResultsButtonLabel: string;
    SelectedFiltersLabel: string;
    SearchResultsLabel: string;
    RemoveAllFiltersLabel: string;
    UsePaginationWebPartLabel: string;
    ShowResultsCountLabel: string;
    ShowBlankLabel: string;
    ShowBlankEditInfoMessage: string;
    NoFilterConfiguredLabel: string;
    SearchQueryPlaceHolderText: string;
    EmptyFieldErrorMessage: string;
    PlaceHolderEditLabel: string;
    PlaceHolderConfigureBtnLabel: string;
    PlaceHolderIconText: string;
    PlaceHolderDescription: string;
    ResultSourceIdLabel: string;
    ResultSourceIdDescription: string;
    InvalidResultSourceIdMessage: string;
    InvalidNumberIntervalMessage: string;
    EnableQueryRulesLabel: string;
    IncludeOneDriveResultsLabel: string;
    StylingSettingsGroupName: string;
    CountMessageShort: string;
    CountMessageLong: string;
    CancelButtonText: string;
    DialogButtonLabel: string;
    DialogButtonText: string;
    DialogTitle: string;
    SaveButtonText: string;
    ResultsLayoutLabel: string;
    SimpleListLayoutOption: string;
    DetailsListLayoutOption: string;
    TilesLayoutOption: string;
    SliderLayoutOption: string;
    PeopleLayoutOption: string;
    DebugLayoutOption: string;
    CustomLayoutOption: string;
    TemplateUrlFieldLabel: string;
    TemplateUrlPlaceholder: string;
    ErrorTemplateExtension: string;
    ErrorTemplateResolve: string;
    WebPartTitle: string;
    HandlebarsHelpersDescription: string;
    PromotedResultsLabel: string;
    PanelCloseButtonAria:string;
    UseRefinersWebPartLabel: string;
    UseRefinersFromComponentLabel: string;
    UsePaginationFromComponentLabel: string;
    RefinementFilters: string;
    customTemplateFieldsLabel: string;
    customTemplateFieldsPanelHeader: string;
    customTemplateFieldsConfigureButtonLabel: string;
    customTemplateFieldTitleLabel: string;
    customTemplateFieldPropertyLabel: string;
    Sort: {
        SortPropertyPaneFieldLabel
        SortListDescription: string;
        SortDirectionAscendingLabel:string;
        SortDirectionDescendingLabel:string;
        SortErrorMessage:string;
        SortPanelSortFieldLabel:string;
        SortPanelSortFieldAria:string;
        SortPanelSortFieldPlaceHolder:string;
        SortPanelSortDirectionLabel:string;
        SortableFieldsPropertyPaneField: string;
        SortableFieldsDescription: string;
        SortableFieldManagedPropertyField: string;
        SortableFieldDisplayValueField: string;
        EditSortableFieldsLabel: string;
        EditSortLabel: string;
        SortInvalidSortableFieldMessage: string;
    },
    Synonyms: {
        EditSynonymLabel: string;
        SynonymListDescription: string;
        SynonymPropertyPanelFieldLabel: string;
        SynonymListTerm: string;
        SynonymListSynonyms: string;
        SynonymIsTwoWays: string;
        SynonymListSynonymsExemple: string;
        SynonymListTermExemple: string;
    },
    ResultTypes: {
        ResultTypeslabel: string;
        ResultTypesDescription: string;
        InlineTemplateContentLabel: string;
        EditResultTypesLabel: string;
        ConditionPropertyLabel: string;
        ConditionValueLabel: string;
        CondtionOperatorValue: string;
        ExternalUrlLabel: string;
        EqualOperator: string;
        NotEqualOperator: string;
        ContainsOperator: string;
        StartsWithOperator: string;
        NotNullOperator: string;
        GreaterOrEqualOperator: string;
        GreaterThanOperator: string;
        LessOrEqualOperator: string;
        LessThanOperator: string;
    },
    TermNotFound: string;
    UseDefaultSearchQueryKeywordsFieldLabel: string;
    DefaultSearchQueryKeywordsFieldLabel: string;
    DefaultSearchQueryKeywordsFieldDescription: string;
    QueryCultureLabel: string;
    QueryCultureUseUiLanguageLabel: string;
    TemplateParameters: {
        TemplateParametersGroupName: string;
        EnableItemPreview: string;
        ShowFileIcon: string;
        ManageDetailsListColumnDescription: string;
        ManageTilesFieldsLabel: string;
        ManageTilesFieldsPanelDescriptionLabel: string;
        ManageDetailsListColumnLabel: string;
        ManagePeopleFieldsLabel: string;
        ManagePeopleFieldsPanelDescriptionLabel: string;
        PlaceholderNameFieldLabel: string;
        PlaceholderValueFieldLabel: string;
        ValueColumnLabel: string;
        DisplayNameColumnLabel: string;
        UseHandlebarsExpressionLabel: string;
        MinimumWidthColumnLabel: string;
        MaximumWidthColumnLabel: string;
        SortableColumnLabel: string;
        ResizableColumnLabel: string;
        MultilineColumnLabel: string;
        LinkToItemColumnLabel: string;
        SupportHTMLColumnLabel: string;
        CompactModeLabel: string;
        SliderAutoPlayDuration: string;
        SliderAutoPlay: string;
        SliderPauseAutoPlayOnHover: string;
        SliderGroupCells: string;
        SliderShowPageDots: string;
        SliderWrapAround: string;
        PersonaSizeOptionsLabel: string,
        PersonaSizeExtraSmall: string;
        PersonaSizeSmall: string;
        PersonaSizeRegular: string;
        PersonaSizeLarge: string;
        PersonaSizeExtraLarge: string;
    }
    ManagedPropertiesListPlaceHolder: string;
    QueryModifier: {
        FieldLbl: string;
        ConfigureBtn: string;
        PanelHeader: string;
        PanelDescription: string;
        EnableColumnLbl: string;
        DisplayNameColumnLbl: string;
        DescriptionColumnLbl: string;
        SelectedQueryModifierLbl: string;
    },
    Paging: {
        PagingOptionsGroupName: string;
        ItemsCountPerPageFieldName: string;
        PagingRangeFieldName: string;
        ShowPagingFieldName: string;
        HidePageNumbersFieldName: string;
        HideNavigationFieldName: string;
        HideFirstLastPagesFieldName: string;
        HideDisabledFieldName: string;
    }
}

declare module 'SearchResultsWebPartStrings' {
    const strings: ISearchResultsWebPartStrings;
    export = strings;
}
