define([], function () {
    return {
        General: {
            DynamicPropertyDefinition: "Query di ricerca"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Impostazioni della casella di ricerca",
                PlaceholderTextLabel: "Testo del placeholder da visualizzare nella casella di ricerca",
                SearchInNewPageLabel: "Invia la query a una nuova pagina",
                ReQueryOnClearLabel: "Reimposta la query al momento della pulizia",
                PageUrlLabel: "URL della pagina",
                UrlErrorMessage: "Per favore, fornisci un URL valido.",
                QueryPathBehaviorLabel: "Metodo",
                QueryInputTransformationLabel: "Modello di trasformazione input query",
                UrlFragmentQueryPathBehavior: "Frammento URL",
                QueryStringQueryPathBehavior: "Parametro della stringa di query",
                QueryStringParameterName: "Nome del parametro",
                QueryParameterNotEmpty: "Per favore, fornisci un valore per il parametro."
            },
            AvailableConnectionsGroup: {
                GroupName: "Connessioni disponibili",
                UseDynamicDataSourceLabel: "Usa fonte dati dinamica come input predefinito",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Suggerimenti di query",
                EnableQuerySuggestions: "Abilita suggerimenti di query",
                EditSuggestionProvidersLabel: "Configura i provider disponibili",
                SuggestionProvidersLabel: "Provider di suggerimenti",
                SuggestionProvidersDescription: "Abilita o disabilita singoli provider di suggerimenti.",
                EnabledPropertyLabel: "Abilitato",
                ProviderNamePropertyLabel: "Nome",
                ProviderDescriptionPropertyLabel: "Descrizione",
                DefaultSuggestionGroupName: "Consigliato",
                NumberOfSuggestionsToShow: "Numero di suggerimenti da mostrare per gruppo"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configura le librerie di estensibilità da caricare all'avvio per i provider di suggerimenti personalizzati",
                    PanelDescription: "Aggiungi/Rimuovi qui gli ID della tua libreria di estensibilità personalizzata. Puoi specificare un nome visualizzato e decidere se la libreria deve essere caricata o meno all'avvio. Solo i provider di suggerimenti personalizzati verranno caricati qui.",
                }
            },

        },
        SearchBox: {
            DefaultPlaceholder: "Inserisci i tuoi termini di ricerca...",
            SearchButtonLabel: "Cerca"
        }
    }
});