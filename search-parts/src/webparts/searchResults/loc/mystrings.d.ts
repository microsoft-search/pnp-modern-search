declare interface ISearchResultsWebPartStrings {
    General: {
        PlaceHolder: {
            EditLabel: string;
            IconText: string;
            Description: string;
            ConfigureBtnLabel: string;
        },
        WebPartDefaultTitle: string;
        ShowBlankEditInfoMessage: string;
        CurrentVerticalNotSelectedMessage: string;
    },
    PropertyPane: {
        DataSourcePage: {
            DataSourceConnectionGroupName: string;
            PagingOptionsGroupName: string;
            ItemsCountPerPageFieldName: string;
            PagingRangeFieldName: string;
            ShowPagingFieldName: string;
            HidePageNumbersFieldName: string;
            HideNavigationFieldName: string;
            HideFirstLastPagesFieldName: string;
            HideDisabledFieldName: string;
            TemplateSlots: {
                GroupName: string;
                ConfigureSlotsLabel: string;
                ConfigureSlotsBtnLabel: string;
                ConfigureSlotsPanelHeader: string;
                ConfigureSlotsPanelDescription: string;
                SlotNameFieldName: string;
                SlotFieldFieldName: string;
                SlotFieldPlaceholderName: string;
            }
        },
        LayoutPage: {
            LayoutSelectionGroupName: string;
            CommonOptionsGroupName: string;
            LayoutTemplateOptionsGroupName: string;
            TemplateUrlFieldLabel: string;
            TemplateUrlPlaceholder: string;
            ErrorTemplateExtension: string;
            ErrorTemplateResolve: string;
            DialogButtonLabel: string;
            DialogTitle: string;
            ShowSelectedFilters: string;
            ShowBlankIfNoResult: string;
            ShowResultsCount: string;
            HandlebarsRenderTypeLabel: string;
            HandlebarsRenderTypeDesc: string;
            AdaptiveCardsRenderTypeLabel: string;
            AdaptiveCardsRenderTypeDesc: string;
            Handlebars: {
                UseMicrosoftGraphToolkit: string;
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
                    CancelButtonText: string;
                    DialogButtonText: string;
                    DialogTitle: string;
                    SaveButtonText: string;
                },
                AllowItemSelection: string;
                AllowMultipleItemSelection: string;
                SelectionModeLabel: string;
                AsTokensSelectionMode: string;
                AsDataFiltersSelectionMode: string;
                AsDataFiltersDescription: string;
                AsTokensDescription: string;
                FilterValuesOperator: string;
                FieldToConsumeLabel: string;
                FieldToConsumeDescription: string;
            },
            AdaptiveCards: {
                HostConfigFieldLabel: string;
            }
        },
        ConnectionsPage: {
            ConnectionsPageGroupName: string;
            UseFiltersWebPartLabel: string;
            UseFiltersFromComponentLabel: string;
            UseDynamicFilteringsWebPartLabel: string;
            UseDataResultsFromComponentsLabel: string;
            UseDataResultsFromComponentsDescription: string;
            UseSearchVerticalsWebPartLabel: string;
            UseSearchVerticalsFromComponentLabel: string;
            LinkToVerticalLabel: string;
            LinkToVerticalLabelHoverMessage: string;
            UseInputQueryText: string;
            UseInputQueryTextHoverMessage: string;
            SearchQueryTextFieldLabel: string;
            SearchQueryTextFieldDescription: string;
            SearchQueryPlaceHolderText: string;
            InputQueryTextStaticValue: string;
            InputQueryTextDynamicValue: string;
            SearchQueryTextUseDefaultQuery: string;
            SearchQueryTextDefaultValue: string;
            SourceDestinationFieldLabel: string;
            SourceDestinationFieldDescription: string;
            AvailableFieldValuesFromResults: string;
        },
        InformationPage: {
            Extensibility: {
                PanelHeader: string;
                PanelDescription: string;
            },
            EnableTelemetryLabel: string;
            EnableTelemetryOn: string;
            EnableTelemetryOff: string;
        }
    }
}

declare module 'SearchResultsWebPartStrings' {
    const strings: ISearchResultsWebPartStrings;
    export = strings;
}
