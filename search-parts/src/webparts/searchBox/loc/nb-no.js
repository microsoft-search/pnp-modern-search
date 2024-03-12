define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Søkestreng"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Søkeboks-innstillinger",
                PlaceholderTextLabel: "Plassholdertekst som skal vises i søkeboksen",
                SearchInNewPageLabel: "Send forespørselen til en ny side",
                ReQueryOnClearLabel: "Tilbakestill spørringen på slett",
                PageUrlLabel: "Sidens URL",
                UrlErrorMessage: "Angi en gyldig URL.",
                QueryPathBehaviorLabel: "Metode",
                QueryInputTransformationLabel: "Mal for transformering av søkestrengen",
                UrlFragmentQueryPathBehavior: "URL-fragment",
                QueryStringQueryPathBehavior: "URL-parameter",
                QueryStringParameterName: "Parameternavn",
                QueryParameterNotEmpty: "Vennligst angi en verdi for dette parameteret."
            },
            AvailableConnectionsGroup: {
                GroupName: "Tilgjengelige tilkoblinger",
                UseDynamicDataSourceLabel: "Bruk dynamisk datakilde som standard innmatning",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Søkeforslag",
                EnableQuerySuggestions: "Aktiver søkeforslag",
                EditSuggestionProvidersLabel: "Konfigurer tilgjengelige leverandører",
                SuggestionProvidersLabel: "Forslag fra leverandører",
                SuggestionProvidersDescription: "Aktiver eller deaktiveer forslag fra enkelte leverandører.",
                EnabledPropertyLabel: "Aktivert",
                ProviderNamePropertyLabel: "Navn",
                ProviderDescriptionPropertyLabel: "Beskrivelse",
                DefaultSuggestionGroupName: "Anbefalte",
                NumberOfSuggestionsToShow: "Antall forslag som skal vises per gruppe"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfigurer utvidelsesbiblioteket som skal lastes ved oppstart for tilpassede søkeforslagsleverandører",
                    PanelDescription: "Legg til / fjern ID for tilpassede utvidelsesbibliotek her. Du kan angi et visningsavn og bestemme om biblioteket skal lastes ved oppstart. Kun leverandører av tilpassede søkeforslag lastes her.",
                }
            },
        },
        SearchBox: {
            DefaultPlaceholder: "Angi søkeord…",
            SearchButtonLabel: "Søk"
        }
    }
});
