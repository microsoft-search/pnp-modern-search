define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Zoekopdracht"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Zoekvak instellingen",
                PlaceholderTextLabel: "Tekst om als placeholder te tonen in het zoekvak",
                SearchInNewPageLabel: "Zend de zoekopdracht naar nieuwe pagina",
                ReQueryOnClearLabel: "Vraag resetten op wissen",
                PageUrlLabel: "Pagina URL",
                UrlErrorMessage: "Geef een valide URL op.",
                QueryPathBehaviorLabel: "Methode",
                QueryInputTransformationLabel: "Template voor transformatie van zoekopdracht ",
                UrlFragmentQueryPathBehavior: "URL fragment",
                QueryStringQueryPathBehavior: "Query string parameter",
                QueryStringParameterName: "Parameter naam",
                QueryParameterNotEmpty: "Geef een waarde op voor de parameter."
            },
            SearchBoxStylingGroup: {
                GroupName: "Zoekvak styling",
                BorderColorLabel: "Randkleur",
                BorderRadiusLabel: "Randradius (px)",
                HeightLabel: "Hoogte (px)",
                FontSizeLabel: "Lettergrootte (px)",
                ButtonColorLabel: "Zoekknop kleur",
                PlaceholderTextColorLabel: "Placeholder tekst kleur",
                BackgroundColorLabel: "Achtergrondkleur",
                TextColorLabel: "Tekstkleur",
                ShowSearchButtonWhenEmptyLabel: "Toon zoekknop wanneer het veld leeg is",
                ShowSearchButtonWhenEmptyDescription: "Toon de zoekknop wanneer het zoekinvoerveld leeg is",
                SearchButtonDisplayModeLabel: "Weergave van zoekknop",
                SearchIconNameLabel: "Naam van zoekpictogram",
                SearchIconNameDescription: "Fluent UI pictogram naam (bijv: Search, Forward, ChevronRight)",
                SearchButtonTextLabel: "Tekst van zoekknop",
                ResetToDefaultLabel: "Herstel naar standaard styling",
                ResetToDefaultDescription: "Herstel alle styling opties naar hun standaardwaarden"
            },
            AvailableConnectionsGroup: {
                GroupName: "Beschikbare verbindingen",
                UseDynamicDataSourceLabel: "Gebruik een dynamische databron als standaard invoer",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Zoeksuggesties",
                EnableQuerySuggestions: "Zet zoeksuggesties aan",
                EditSuggestionProvidersLabel: "Configureer beschikbare bronnen",
                SuggestionProvidersLabel: "Zoeksuggestie bronnen",
                SuggestionProvidersDescription: "Zet individuele zoeksuggestie bronnen aan of uit.",
                EnabledPropertyLabel: "Aan",
                ProviderNamePropertyLabel: "Naam",
                ProviderDescriptionPropertyLabel: "Omschrijving",
                DefaultSuggestionGroupName: "Aanbevolen",
                NumberOfSuggestionsToShow: "Aantal te tonen zoeksuggesties per groep"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configureer inladen van uitbreidingsbibliotheken voor aangepaste zoeksuggestie bronnen bij opstarten",
                    PanelDescription: "Beheer hier je aangepaste uitbreidingsbibliotheek ID's. Je kan hier een weergavenaam specificeren en aangeven of de bibliotheek geladen moet worden. Alleen aangepaste zoeksuggestie bronnen worden hier geladen.",
                }
            },  
        },
        SearchBox: {
            DefaultPlaceholder: "Geef hier je zoektermen op...",
            SearchButtonLabel: "Zoeken"
        }
    }
});
