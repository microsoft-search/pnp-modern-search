declare interface ISearchBoxWebPartStrings {
  General: {
    DynamicPropertyDefinition: string;
  },
  PropertyPane:{
    SearchBoxSettingsGroup: {
      GroupName: string;
      PlaceholderTextLabel: string;
      SearchInNewPageLabel: string;
      PageUrlLabel: string;
      UrlErrorMessage: string;
      QueryPathBehaviorLabel: string;
      QueryInputTransformationLabel: string;
      UrlFragmentQueryPathBehavior: string;
      QueryStringQueryPathBehavior: string;
      QueryStringParameterName: string;
      QueryParameterNotEmpty: string;
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
    }
  },
  SearchBox:{
    DefaultPlaceholder: string;
  }
}

declare module 'SearchBoxWebPartStrings' {
  const strings: ISearchBoxWebPartStrings;
  export = strings;
}
