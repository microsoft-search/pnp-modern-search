define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Hakukysely"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Hakukentän asetukset",
                PlaceholderTextLabel: "Hakukentässä näkyvä teksti",
                SearchInNewPageLabel: "Lähetä haku uudelle sivulle",
                ReQueryOnClearLabel: "Tyhjennä kysely",
                PageUrlLabel: "Sivun URL",
                UrlErrorMessage: "Syötä validi URL.",
                QueryPathBehaviorLabel: "Toimintatapa",
                QueryInputTransformationLabel: "Kyselyn muunnostemplaatti",
                UrlFragmentQueryPathBehavior: "URL osio",
                QueryStringQueryPathBehavior: "Hakukyselyn parametri",
                QueryStringParameterName: "Parametrin nimi",
                QueryParameterNotEmpty: "Syötä arvo parametrille."
            },
            AvailableConnectionsGroup: {
                GroupName: "Tarjolla olevat yhteydet",
                UseDynamicDataSourceLabel: "Käytä dynaamista sisältölähdettä oletussyötteenä",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Kyselyehdotukset",
                EnableQuerySuggestions: "Salli kyselyehdotukset",
                EditSuggestionProvidersLabel: "Konfiguroi kyselyehdotusten tarjoajat",
                SuggestionProvidersLabel: "Kyselyehdotusten tarjoajat",
                SuggestionProvidersDescription: "Salli tai estä kyselyehdotusten tarjoajia.",
                EnabledPropertyLabel: "Sallittu",
                ProviderNamePropertyLabel: "Nimi",
                ProviderDescriptionPropertyLabel: "Kuvaus",
                DefaultSuggestionGroupName: "Suositeltu",
                NumberOfSuggestionsToShow: "Kyselyehdotusten määrä per ryhmä"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfiguroi käynnistyksessä ladattavat laajennuskirjastot mukautetuille kyselyehdotusten tarjoajille",
                    PanelDescription: "Lisää/poista mukautetun laajennuskirjastosi ID:t tässä. Voit määrittää näyttönimen ja päättää, ladataanko kirjasto käynnistyksessä. Vain mukautetut kyselyehdotusten tarjoajat ladataan tässä.",
                }
            },
            
        },
        SearchBox: {
            DefaultPlaceholder: "Syötä hakusanat...",
            SearchButtonLabel: "Suorita haku"
        }
    }
});
