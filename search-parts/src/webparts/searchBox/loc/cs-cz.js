define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Vyhledávací dotaz"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Nastavení vyhledávacího pole",
                PlaceholderTextLabel: "Zástupný text zobrazený ve vyhledávacím poli",
                SearchInNewPageLabel: "Odeslat dotaz na novou stránku",
                ReQueryOnClearLabel: "Resetovat dotaz při vymazání",
                PageUrlLabel: "URL stránky",
                UrlErrorMessage: "Zadejte platnou URL adresu.",
                QueryPathBehaviorLabel: "Metoda",
                QueryInputTransformationLabel: "Šablona transformace vstupu dotazu",
                UrlFragmentQueryPathBehavior: "Fragment URL",
                QueryStringQueryPathBehavior: "Parametr řetězce dotazu",
                QueryStringParameterName: "Název parametru",
                QueryParameterNotEmpty: "Zadejte hodnotu pro parametr."
            },
            AvailableConnectionsGroup: {
                GroupName: "Dostupná připojení",
                UseDynamicDataSourceLabel: "Použít dynamický datový zdroj jako výchozí vstup",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Návrhy dotazů",
                EnableQuerySuggestions: "Povolit návrhy dotazů",
                EditSuggestionProvidersLabel: "Konfigurovat dostupné poskytovatele",
                SuggestionProvidersLabel: "Poskytovatelé návrhů",
                SuggestionProvidersDescription: "Povolit nebo zakázat jednotlivé poskytovatele návrhů.",
                EnabledPropertyLabel: "Povoleno",
                ProviderNamePropertyLabel: "Název",
                ProviderDescriptionPropertyLabel: "Popis",
                DefaultSuggestionGroupName: "Doporučené",
                NumberOfSuggestionsToShow: "Počet návrhů k zobrazení na skupinu"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfigurace rozšiřitelných knihoven pro vlastní poskytovatele návrhů",
                    PanelDescription: "Přidejte nebo odeberte ID vlastních rozšiřitelných knihoven. Můžete zadat zobrazovaný název a rozhodnout, zda se knihovna načte při spuštění. Zde budou načteni pouze vlastní poskytovatelé návrhů.",
                }
            },
        },
        SearchBox: {
            DefaultPlaceholder: "Zadejte hledaný výraz...",
            SearchButtonLabel: "Hledat"
        }
    }
});
