define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Bewerk",
                IconText: "Zoekfilters door @PnP",
                Description: "Toont zoekfilters voor een verbonden Zoekresultaten webonderdeel",
                ConfigureBtnLabel: "Configureer"
            },
            NoAvailableFilterMessage: "Er zijn geen beschikbare filters.",
            WebPartDefaultTitle: "Zoekfilters webonderdeel"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Vebind met data van een resultaat webonderdeel",
                UseDataResultsFromComponentsLabel: "Gebruik data van deze webonderdelen",
                UseDataResultsFromComponentsDescription: "Wanneer je verbindt met meer dan één webonderdeel worden aantallen en waarden voor gelijknamige filters samengevoegd.",
                LinkToVerticalLabel: "Filters alleen weergeven als de volgende verticalen zijn geselecteerd",
                LinkToVerticalLabelHoverMessage: "De filters worden alleen weergegeven als de geselecteerde verticale lijn overeenkomt met de filters die voor dit webonderdeel zijn geconfigureerd. Anders is het webonderdeel leeg (geen marge en geen opvulling) in de weergavemodus."
            },
            FiltersSettingsPage: { 
                SettingsGroupName: "Filter instellingen",
                FilterOperator: "Bewerking om tussen filters te gebruiken"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Selecteer veld",
                FilterNameLabel: "Filter veld",
                FilterMaxBuckets: "# waarden",
                FilterDisplayName: "Weergave naam",
                FilterTemplate: "Sjabloon",
                FilterExpandByDefault: "Standaard uitklappen",
                FilterType: "Soort filter",
                FilterTypeRefiner: "Dit filtersjabloon gedraagt zich als verfijning en ontvangt/zendt beschikbare/geselecteerde waarden van/naar de verbonden databron.",
                FilterTypeStaticFilter: "Dit filtersjabloon gedraagt zich als een statisch filter en stuurt enkel geselecteerde waarden welke vooraf gedefinieerd zijn naar de verbonden databron.  Filterwaarden afkomstig uit de verbonden databron worden buiten beschouwing gelaten.",
                CustomizeFiltersBtnLabel: "Bewerk",
                CustomizeFiltersHeader: "Bewerk filters",
                CustomizeFiltersDescription: "Configureer de zoekfilters door rijen toe te voegen of te verwijderen. Je kunt velden uit de resultaten van de databron selecteren (wanneer al geselecteerd) of statische waarden gebruiken voor filters.",
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
                    TaxonomyPickerTemplate: "Taxonomie picker"
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
        }
    }
});