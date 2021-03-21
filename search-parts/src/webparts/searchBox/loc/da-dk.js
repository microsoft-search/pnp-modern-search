define([], function() {
  return {
    General: {
      DynamicPropertyDefinition: "Søgeforespørgsel"
    },
    PropertyPane: {
      SearchBoxSettingsGroup: {
        GroupName: "Indstillinger til søgeboks",
        PlaceholderTextLabel: "Pladsholdertekst der skal vises i søgeboksen",
        SearchInNewPageLabel: "Send forespørgslen til en ny side",
        PageUrlLabel: "Sidens URL",
        UrlErrorMessage: "Indsæt venligst en gyldig URL.",
        QueryPathBehaviorLabel: "Metode",
        UrlFragmentQueryPathBehavior: "URL-fragment",
        QueryStringQueryPathBehavior: "URL-parametre",
        QueryStringParameterName: "Parameternnavn",
        QueryParameterNotEmpty: "Indsæt venligst en parameterværdi."
      },
      AvailableConnectionsGroup: {
        GroupName: "Tilgængelige forbindelser",
        UseDynamicDataSourceLabel: "Anvend dynamisk datakilde som standard-input",
        QueryKeywordsPropertyLabel: ""
      },
      QuerySuggestionsGroup: {
        GroupName: "Forespørgselsforslag",
        EnableQuerySuggestions: "Aktivér forespørgselsforslag",
        EditSuggestionProvidersLabel: "Konfigurér tilgængelige udbydere",
        SuggestionProvidersLabel: "Forslag fra udbydere",
        SuggestionProvidersDescription: "Aktivér eller deaktivér forslag fra individuelle udbydere.",
        EnabledPropertyLabel: "Aktiveret",
        ProviderNamePropertyLabel: "Navn",
        ProviderDescriptionPropertyLabel: "Beskrivelse",
        DefaultSuggestionGroupName: "Anbefalet",
        NumberOfSuggestionsToShow: "Antal forslag der vises per gruppe"
      },
      InformationPage: {
        Extensibility: {
          PanelHeader: "Konfigurér extensibility-biblioteker til at loade ved opstart af brugerdefinerede forslag fra udbydere",
          PanelDescription: "Tilføj/Fjern ID tilhørende brugerdefinerede extensibility-bibliotekter her. Du kan specificere et visningsnavn og beslutte, om biblioteket skal være loadet eller ej ved opstart. Kun brugerdefinerede udbydere af forslag vil blive loadet her.",
        }
      }
    },
    SearchBox: {
      DefaultPlaceholder: "Indsæt søgeord..."
    }
  }
});