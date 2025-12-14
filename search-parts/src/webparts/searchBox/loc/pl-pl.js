define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Zapytanie wyszukiwania"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Ustawienia pola wyszukiwania",
                PlaceholderTextLabel: "Tekst zastępny wyświetlany w polu wyszukiwania",
                SearchInNewPageLabel: "Wyślij zapytanie do nowego okna",
                ReQueryOnClearLabel: "Zresetuj zapytanie po wyczyszczeniu",
                PageUrlLabel: "Adres URL strony",
                UrlErrorMessage: "Proszę podać poprawny URL.",
                QueryPathBehaviorLabel: "Metoda",
                QueryInputTransformationLabel: "Szablon przekształcenia zapytania",
                UrlFragmentQueryPathBehavior: "Fragment URL",
                QueryStringQueryPathBehavior: "Parametr Query-String",
                QueryStringParameterName: "Nazwa parametru",
                QueryParameterNotEmpty: "Proszę podać wartość parametru."
            },
            SearchBoxStylingGroup: {
                GroupName: "Styl pola wyszukiwania",
                BorderColorLabel: "Kolor obramowania",
                BorderRadiusLabel: "Promień obramowania (px)",
                HeightLabel: "Wysokość (px)",
                ButtonColorLabel: "Kolor przycisku wyszukiwania",
                ButtonHoverColorLabel: "Kolor najechania przycisku wyszukiwania",
                PlaceholderTextColorLabel: "Kolor tekstu zastępczego",
                BackgroundColorLabel: "Kolor tła",
                TextColorLabel: "Kolor tekstu",
                ResetToDefaultLabel: "Przywróć domyślny styl",
                ResetToDefaultDescription: "Przywróć wszystkie opcje stylu do wartości domyślnych",
                ResetTitleStylingLabel: "Przywróć domyślny styl tytułu",
                ResetTitleStylingDescription: "Przywróć wszystkie opcje stylu tytułu do wartości domyślnych"
            },
            AvailableConnectionsGroup: {
                GroupName: "Dostępne połączenia",
                UseDynamicDataSourceLabel: "Użyj dynamicznego źródła jako domyślnej wartości",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Sugestie zapytań",
                EnableQuerySuggestions: "Włącz sugestie zapytań",
                EditSuggestionProvidersLabel: "Konfiguruj dostępnych dostawców",
                SuggestionProvidersLabel: "Dostawcy sugestii",
                SuggestionProvidersDescription: "Włącz lub wyłącz indywidualnych dostawców.",
                EnabledPropertyLabel: "Włączone",
                ProviderNamePropertyLabel: "Nazwa",
                ProviderDescriptionPropertyLabel: "Opis",
                DefaultSuggestionGroupName: "Zalecane",
                NumberOfSuggestionsToShow: "Liczba prezentowanych sugestii w grupie"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfiguruj biblioteki rozszerzalności do załadowania podczas startu niestandardowych dostawców sugestii",
                    PanelDescription: "Dodaj/Usuń identyfikatory niestandardowych bibliotek rozszerzalności. Wybierz nazwę i zdecyduj czy mają być ładowane przy starcie. Tylko niestandardowi dostawcy sugestii będą tutaj ładowani.",
                }
            },
        },
        SearchBox: {
            DefaultPlaceholder: "Wprowadź zapytanie..."
        }
    }
});
