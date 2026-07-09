define([], function () {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Bewerk",
                IconText: "Zoekfilters door @PnP",
                Description: "Toont zoekfilters voor een verbonden Zoekresultaten webonderdeel",
                ConfigureBtnLabel: "Configureer"
            },
            NoAvailableFilterMessage: "Er zijn geen beschikbare filters.",
            WebPartDefaultTitle: "Zoekfilters webonderdeel",
            StaticPeoplePicker: {
                RemoveSelectedUserTitle: "{0} verwijderen",
                SearchUsersPlaceholder: "Zoek gebruikers",
                LoadingTenantUsersLabel: "Tenantgebruikers laden...",
                NoUsersFoundMessage: "Geen gebruikers gevonden."
            }
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Vebind met data van een resultaat webonderdeel",
                UseDataResultsFromComponentsLabel: "Gebruik data van deze webonderdelen",
                UseDataResultsFromComponentsDescription: "Wanneer je verbindt met meer dan één webonderdeel worden aantallen en waarden voor gelijknamige filters samengevoegd.",
                LinkToVerticalLabel: "Filters alleen weergeven als de volgende verticalen zijn geselecteerd",
                LinkToVerticalLabelHoverMessage: "De filters worden alleen weergegeven als de geselecteerde verticale lijn overeenkomt met de filters die voor dit webonderdeel zijn geconfigureerd. Anders is het webonderdeel leeg (geen marge en geen opvulling) in de weergavemodus.",
                BidirectionalConnectionWarning: "Een of meer verbonden zoekresultaten webonderdelen zijn niet geconfigureerd om terug te verbinden met dit filters webonderdeel. Beide webonderdelen moeten met elkaar verbonden zijn om filters correct te laten werken."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filter instellingen",
                FilterOperator: "Bewerking om tussen filters te gebruiken"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Selecteer veld",
                FilterNameLabel: "Filterveld",
                FilterMaxBuckets: "# waarden",
                FilterMaxBucketsWarning: "Het maximale aantal waarden is 1000",
                FilterLimitReachedWarningToggle: "Waarschuwing tonen wanneer de limiet is bereikt",
                FilterLimitReachedWarningMessage: "Resultaatlimiet bereikt — niet alle overeenkomende items worden weergegeven. Verfijn uw zoekopdracht om de lijst te beperken.",
                EditModeRefinerLimitReachedWarningMessage: "In de bewerkingsmodus zijn verfijningen beperkt tot maximaal 100 items.",
                PeopleTemplateQUserMappingWarning: "Waarschuwing voor personen-sjabloon: waarden lijken geen gebruikersidentiteiten te zijn. Deze eigenschap is waarschijnlijk niet toegewezen aan een Q_USER-crawled property.",
                FilterDisplayName: "Weergavenaam",
                FilterTemplate: "Sjabloon",
                FilterExpandByDefault: "Standaard uitklappen",
                ExpandAllNodesByDefault: "Alle knooppunten standaard uitklappen",
                HideNodesNotInDataSet: "Knooppunten verbergen die niet in de huidige gegevensset voorkomen",
                FilterType: "Soort filter",
                FilterTypeRefiner: "Dit filtersjabloon gedraagt zich als verfijning en ontvangt/zendt beschikbare/geselecteerde waarden van/naar de verbonden databron.",
                FilterTypeStaticFilter: "Dit filtersjabloon gedraagt zich als een statisch filter en stuurt enkel geselecteerde waarden welke vooraf gedefinieerd zijn naar de verbonden databron.  Filterwaarden afkomstig uit de verbonden databron worden buiten beschouwing gelaten.",
                CustomizeFiltersBtnLabel: "Bewerk",
                CustomizeFiltersHeader: "Bewerk filters",
                CustomizeFiltersDescription: "Configureer de zoekfilters door rijen toe te voegen of te verwijderen. Je kunt velden uit de resultaten van de databron selecteren (wanneer al geselecteerd) of statische waarden gebruiken voor filters. For more details see https://microsoft-search.github.io/pnp-modern-search/usage/search-filters/#filter-settings",
                CustomizeFiltersFieldLabel: "Pas filters aan",
                ShowCount: "Toon aantallen",
                Operator: "Bewerking tussen waarden",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Meerdere waarden toestaan",
                Templates: {
                    CheckBoxTemplate: "Selectievakje",
                    DateRangeTemplate: "Datumreeks",
                    ComboBoxTemplate: "Keuzelijst",
                    DateIntervalTemplate: "Datum interval",
                    PeopleTemplate: "Persoon sjabloon",
                    StaticPeopleTemplate: "Statisch persoonssjabloon",
                    TaxonomyPickerTemplate: "Taxonomie picker",
                    HierarchicalFilterTemplate: "Hiërarchisch filter"
                },
                SortBy: "Sorteer waarden op",
                SortDirection: "Sorteervolgorde",
                SortByName: "Op naam",
                SortByCount: "Op aantal",
                SortAscending: "Oplopend",
                SortDescending: "Aflopend"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Beschikbare indelingen",
                LayoutTemplateOptionsGroupName: "Indelingsopties",
                TemplateUrlFieldLabel: "Gebruik een externe sjabloon URL",
                TemplateUrlPlaceholder: "https://mijnbestand.html",
                ErrorTemplateExtension: "Het sjabloon moet een geldig .txt, .htm of .html bestand zijn",
                ErrorTemplateResolve: "Kan het opgegeven template niet inladen. Foutmelding: '{0}'",
                FiltersTemplateFieldLabel: "Bewerk filters sjabloon",
                FiltersTemplatePanelHeader: "Bewerk filters sjabloon"
            }
        },
        Styling: {
            StylingOptionsGroupName: "Stijlopties",
            FilterBackgroundColorLabel: "Filter achtergrondkleur",
            FilterBorderColorLabel: "Filter randkleur",
            FilterBorderThicknessLabel: "Filter randdikte",
            ResetToDefaultLabel: "Herstel naar standaard styling",
            ResetToDefaultDescription: "Herstel alle styling opties naar hun standaardwaarden"
        }
    }
});