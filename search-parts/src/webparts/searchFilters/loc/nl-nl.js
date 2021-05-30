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
                UseDataResultsFromComponentsDescription: "Wanneer je verbindt met meer dan één webonderdeel worden aantallen en waardes voor gelijknamige filters samengevoegd.",
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filter instellingen",
                FilterOperator: "Bewerking om tussen filters te gebruiken"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Selecteer veld",
                FilterNameLabel: "Filter veld",
                FilterMaxBuckets: "# waardes",
                FilterDisplayName: "Weergave naam",
                FilterTemplate: "Sjabloon",
                FilterExpandByDefault: "Standaard uitklappen",
                FilterType: "Soort filter",
                FilterTypeRefiner: "Dit filtersjabloon gedraagt zich als verfijning en ontvangt/zendt beschikbare/geselecteerde waardes van/naar de verbonden databron.",
                FilterTypeStaticFilter: "Dit filtersjabloon gedraagt zich als een statisch filter en stuurt enkel geselecteerde waardes welke vooraf gedefinieerd zijn naar de verbonden databron.  Filterwaardes afkomstig uit de verbonden databron worden buiten beschouwing gelaten.",
                CustomizeFiltersBtnLabel: "Bewerk",
                CustomizeFiltersHeader: "bewerk filters",
                CustomizeFiltersDescription: "Configure search filters by adding or removing rows. You can select fields from the data source results (if already selected) or use static values for filters.",
                CustomizeFiltersFieldLabel: "Pas filters aan",
                ShowCount: "Toon aantallen",
                Operator: "Bewerking tussen waardes",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Meerdere waardes toestaan",
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
                ErrorTemplateExtension: "Het sjabloon moet een geldig .htm of .html bestand zijn",
                ErrorTemplateResolve: "Kan het opgegeven template niet inladen. Foutmelding: '{0}'",
                FiltersTemplateFieldLabel: "Bewerk filters sjabloon",
                FiltersTemplatePanelHeader: "Bewerk filters sjabloon"
            }
        }
    }
});