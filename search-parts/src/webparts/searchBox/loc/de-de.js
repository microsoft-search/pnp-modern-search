define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Such query"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Suchbox Einstellungen",
                PlaceholderTextLabel: "Platzhalter zum Anzeigen in der Suchbox",
                SearchInNewPageLabel: "Query an eine neue Seite senden",
                ReQueryOnClearLabel: "Abfrage bei Löschen zurücksetzen",
                PageUrlLabel: "Seiten URL",
                UrlErrorMessage: "Bitte eine valide URL angeben.",
                QueryPathBehaviorLabel: "Methode",
                QueryInputTransformationLabel: "Query Eingabe Transformations-Vorlage",
                UrlFragmentQueryPathBehavior: "URL Fragment",
                QueryStringQueryPathBehavior: "Query string Parameter",
                QueryStringParameterName: "Parameter Name",
                QueryParameterNotEmpty: "Bitte einen Wert für den Parameter angeben."
            },
            AvailableConnectionsGroup: {
                GroupName: "Verfügbare Verbindungen",
                UseDynamicDataSourceLabel: "Benutze eine dynamsche Daten Quelle als Standard Eingabe.",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Query Vorschläge",
                EnableQuerySuggestions: "Aktiviere Query Vorschläge",
                EditSuggestionProvidersLabel: "Configuriere mögliche Provider",
                SuggestionProvidersLabel: "Vorschlags Provider",
                SuggestionProvidersDescription: "Aktiviere oder deaktivierte individuelle Vorschlag Provider.",
                EnabledPropertyLabel: "Aktiviert",
                ProviderNamePropertyLabel: "Name",
                ProviderDescriptionPropertyLabel: "Beschreibung",
                DefaultSuggestionGroupName: "Empfohlen",
                NumberOfSuggestionsToShow: "Anzahl der Vorschläge pro Gruppe die angezeigt werden sollen."
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfiguriere die benutzerdefinierten Erweiterungsbibliotheken zum Laden beim Start für Benutzerdefinierte Vorschlags Provider.",
                    PanelDescription: "Füge hinzu / entferne die IDs der benutzerdefinierten Erweiterungsbibliotheken. Ein Anzeigename kann hinzugefügt werden und ob die Bibliothek beim Start geladen werden soll. Nur benutzerdefinierte Vorschlags Provider werden hier geladen.",
                }
            },
            
        },
        SearchBox: {
            DefaultPlaceholder: "Suchbegriffe eingeben...",
            SearchButtonLabel: "Suchen"
        }
    }
});
