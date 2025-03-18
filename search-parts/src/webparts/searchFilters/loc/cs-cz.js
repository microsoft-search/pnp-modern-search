define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Upravit",
                IconText: "Filtry vyhledávání od @PnP",
                Description: "Zobrazuje filtry z připojeného webového dílu výsledků vyhledávání",
                ConfigureBtnLabel: "Konfigurovat"
            },
            NoAvailableFilterMessage: "Žádné dostupné filtry k zobrazení.",
            WebPartDefaultTitle: "Webový díl filtrů vyhledávání"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Připojit k webovému dílu výsledků vyhledávání",
                UseDataResultsFromComponentsLabel: "Použít data z těchto webových dílů",
                UseDataResultsFromComponentsDescription: "Pokud připojíte více než jeden webový díl, hodnoty a počty filtrů se sloučí pro podobné názvy filtrů.",
                LinkToVerticalLabel: "Zobrazit filtry pouze při výběru těchto vertikál",
                LinkToVerticalLabelHoverMessage: "Filtry se zobrazí pouze tehdy, pokud vybraná vertikála odpovídá těm, které jsou nakonfigurovány pro tento webový díl. V opačném případě bude webový díl v režimu zobrazení prázdný (bez okrajů a výplní)."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Nastavení filtrů",
                FilterOperator: "Operátor mezi filtry"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Vybrat pole",
                FilterNameLabel: "Filtrační pole",
                FilterMaxBuckets: "Počet hodnot",
                FilterDisplayName: "Zobrazovaný název",
                FilterTemplate: "Šablona",
                FilterExpandByDefault: "Rozbalit ve výchozím nastavení",
                // FilterType: "Typ filtru",
                FilterTypeRefiner: "Tato šablona filtru funguje jako upřesňující filtr a přijímá/odesílá dostupné/vybrané hodnoty do/z připojeného zdroje dat.",
                FilterTypeStaticFilter: "Tato šablona filtru funguje jako statický filtr a odesílá pouze libovolně vybrané hodnoty do připojeného zdroje dat. Přicházející hodnoty filtrů nejsou brány v úvahu.",
                CustomizeFiltersBtnLabel: "Upravit",
                CustomizeFiltersHeader: "Upravit filtry",
                CustomizeFiltersDescription: "Konfigurujte filtry vyhledávání přidáním nebo odebráním řádků. Můžete vybrat pole z výsledků zdroje dat (pokud již byly vybrány) nebo použít statické hodnoty filtrů. Pro více informací navštivte https://microsoft-search.github.io/pnp-modern-search/usage/search-filters/#filter-settings",
                CustomizeFiltersFieldLabel: "Přizpůsobit filtry",
                ShowCount: "Zobrazit počet",
                Operator: "Operátor mezi hodnotami",
                ANDOperator: "A (AND)",
                OROperator: "NEBO (OR)",
                IsMulti: "Více hodnot",
                Templates: {
                    CheckBoxTemplate: "Zaškrtávací pole",
                    DateRangeTemplate: "Časové rozmezí",
                    ComboBoxTemplate: "Rozbalovací nabídka",
                    DateIntervalTemplate: "Časový interval",
                    PeopleTemplate: "Šablona pro osoby",
                    TaxonomyPickerTemplate: "Výběr taxonomie"
                },
                SortBy: "Řadit hodnoty podle",
                SortDirection: "Směr řazení",
                SortByName: "Podle názvu",
                SortByCount: "Podle počtu",
                SortAscending: "Vzestupně",
                SortDescending: "Sestupně"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Dostupná rozvržení",
                LayoutTemplateOptionsGroupName: "Možnosti rozvržení",
                TemplateUrlFieldLabel: "Použít externí šablonu URL",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Šablona musí být platný soubor .txt, .htm nebo .html",
                ErrorTemplateResolve: "Nelze načíst zadanou šablonu. Podrobnosti chyby: '{0}'",
                FiltersTemplateFieldLabel: "Upravit šablonu filtrů",
                FiltersTemplatePanelHeader: "Upravit šablonu filtrů"
            }
        }
    }
});
