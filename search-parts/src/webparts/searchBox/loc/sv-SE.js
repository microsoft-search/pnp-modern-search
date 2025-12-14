define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Sökfråga"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Inställningar för sökruta",
                PlaceholderTextLabel: "Platshållartext som ska visas i sökrutan",
                SearchInNewPageLabel: "Skicka frågan till en ny sida",
                ReQueryOnClearLabel: "Återställ frågan på rensa",
                PageUrlLabel: "Sidans URL",
                UrlErrorMessage: "Ange en giltig URL.",
                QueryPathBehaviorLabel: "Metod",
                QueryInputTransformationLabel: "Mallen för omvandling av frågeinmatning",
                UrlFragmentQueryPathBehavior: "URL-fragment",
                QueryStringQueryPathBehavior: "URL-parameter",
                QueryStringParameterName: "Parameternamn",
                QueryParameterNotEmpty: "Vänligen ange ett parametervärde."
            },
            SearchBoxStylingGroup: {
                GroupName: "Stil för sökruta",
                BorderColorLabel: "Kantfärg",
                BorderRadiusLabel: "Kantradius (px)",
                HeightLabel: "Höjd (px)",
                ButtonColorLabel: "Sökknappens färg",
                ButtonHoverColorLabel: "Sökknappens hover-färg",
                PlaceholderTextColorLabel: "Platshållartextens färg",
                BackgroundColorLabel: "Bakgrundsfärg",
                TextColorLabel: "Textfärg",
                ResetToDefaultLabel: "Återställ till standardstil",
                ResetToDefaultDescription: "Återställ alla stilalternativ till sina standardvärden",
                ResetTitleStylingLabel: "Återställ titelstil till standard",
                ResetTitleStylingDescription: "Återställ alla titelstilingalternativ till sina standardvärden"
            },
            AvailableConnectionsGroup: {
                GroupName: "Tillgängliga anslutningar",
                UseDynamicDataSourceLabel: "Använd dynamisk datakälla som standardinmatning",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Sökfrågeförslag",
                EnableQuerySuggestions: "Aktivera sökfrågeförslag",
                EditSuggestionProvidersLabel: "Konfigurera tillgängliga leverantörer",
                SuggestionProvidersLabel: "Förslag från leverantörer",
                SuggestionProvidersDescription: "Aktivera eller inaktivera förslag från enskilda leverantörer.",
                EnabledPropertyLabel: "Aktiverad",
                ProviderNamePropertyLabel: "Namn",
                ProviderDescriptionPropertyLabel: "Beskrivning",
                DefaultSuggestionGroupName: "Rekommenderade",
                NumberOfSuggestionsToShow: "Antal förslag som visas per grupp"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfigurera utbyggnadsbiblioteket som ska laddas när du startar anpassade förslag från leverantörer",
                    PanelDescription: "Lägg till/ta bort ID för anpassade utbyggnadsbibliotek här. Du kan ange ett visningsnamn och bestämma om biblioteket ska laddas vid start. Endast leverantörer av anpassade förslag laddas här.",
                }
            }
        },
        SearchBox: {
            DefaultPlaceholder: "Ange sökord...",
            SearchButtonLabel: "Sök"
        }
    }
});
