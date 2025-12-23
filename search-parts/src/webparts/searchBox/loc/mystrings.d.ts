declare interface ISearchBoxWebPartStrings {
    General: {
        DynamicPropertyDefinition: string;
    },
    PropertyPane: {
        SearchBoxSettingsGroup: {
            GroupName: string;
            PlaceholderTextLabel: string;
            SearchInNewPageLabel: string;
            ReQueryOnClearLabel: string;
            PageUrlLabel: string;
            UrlErrorMessage: string;
            QueryPathBehaviorLabel: string;
            QueryInputTransformationLabel: string;
            UrlFragmentQueryPathBehavior: string;
            QueryStringQueryPathBehavior: string;
            QueryStringParameterName: string;
            QueryParameterNotEmpty: string;
        },
        SearchBoxStylingGroup: {
            GroupName: string;
            BorderColorLabel: string;
            BorderRadiusLabel: string;
            HeightLabel: string;
            FontSizeLabel: string;
            ButtonColorLabel: string;
            PlaceholderTextColorLabel: string;
            BackgroundColorLabel: string;
            TextColorLabel: string;
            ShowSearchButtonWhenEmptyLabel: string;
            ShowSearchButtonWhenEmptyDescription: string;
            SearchButtonDisplayModeLabel: string;
            SearchIconNameLabel: string;
            SearchIconNameDescription: string;
            SearchButtonTextLabel: string;
            ResetToDefaultLabel: string;
            ResetToDefaultDescription: string;
            ResetTitleStylingLabel: string;
            ResetTitleStylingDescription: string;
        },
        AvailableConnectionsGroup: {
            GroupName: string;
            UseDynamicDataSourceLabel: string;
            QueryKeywordsPropertyLabel: string;
        }
        QuerySuggestionsGroup: {
            GroupName: string;
            EnableQuerySuggestions: string;
            EditSuggestionProvidersLabel: string;
            SuggestionProvidersLabel: string;
            SuggestionProvidersDescription: string;
            EnabledPropertyLabel: string;
            ProviderNamePropertyLabel: string;
            ProviderDescriptionPropertyLabel: string;
            DefaultSuggestionGroupName: string;
            NumberOfSuggestionsToShow: string;
        },
        InformationPage: {
            Extensibility: {
                PanelHeader: string;
                PanelDescription: string;
            }
        },
    },
    SearchBox: {
        DefaultPlaceholder: string;
        SearchButtonLabel: string;
    }
}

declare module 'SearchBoxWebPartStrings' {
    const strings: ISearchBoxWebPartStrings;
    export = strings;
}
