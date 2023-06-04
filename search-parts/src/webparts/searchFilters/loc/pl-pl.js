define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Edytuj",
                IconText: "Filtry Wyszukiwania by @PnP",
                Description: "Pokazuj filtry z powiązanego składnika wyników wyszukiwania",
                ConfigureBtnLabel: "Konfiguruj"
            },
            NoAvailableFilterMessage: "Brak dostępnych filtrów do wyświetlenia.",
            WebPartDefaultTitle: "Web Part Filtry Wyszukiwania"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Połącz z wynikami Web Parta",
                UseDataResultsFromComponentsLabel: "Użyj danych z następujących Web Partów",
                UseDataResultsFromComponentsDescription: "Jeśli połączysz więcej niż jeden Web Part, wartości filtrów i liczność będzie połączona po nazwach filtrów.",
                LinkToVerticalLabel: "Wyświetlaj filtry tylko wtedy, gdy wybrane są następujące branże",
                LinkToVerticalLabelHoverMessage: "Filtry będą wyświetlane tylko wtedy, gdy wybrana branża pasuje do tych skonfigurowanych dla tego składnika Web Part. W przeciwnym razie składnik Web Part będzie pusty (bez marginesów i dopełnienia) w trybie wyświetlania."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Ustawienia filtrów",
                FilterOperator: "Operator używany pomiędzy filtrami"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Wybierz pole",
                FilterNameLabel: "Filter field",
                FilterMaxBuckets: "# wartości",
                FilterDisplayName: "Tytuł",
                FilterTemplate: "Szablon",
                FilterExpandByDefault: "Domyślnie rozwinięte",
                FilterType: "Rodzaj filtru",
                FilterTypeRefiner: "Ten szablon filtru działa jak zawężacz i odbiera/wysyła dostępne/wybrane wartości z/do połączonego źródła danych.",
                FilterTypeStaticFilter: "Ten szablon filtru działa jak statyczny filtr i jedynie wysyła z góry wybraną wartość do połączonego źródła danych. Przychodzące wartości filtrów nie są brane pod uwagę.",
                CustomizeFiltersBtnLabel: "Edytuj",
                CustomizeFiltersHeader: "Edytuj filtry",
                CustomizeFiltersDescription: "Konfiguruj filtry wyszukiwania dodając i usuwając wiersze. Możesz wybrać pola z wyników źródła wyszukiwania lub użyć stałych wartości filtrów.",
                CustomizeFiltersFieldLabel: "Zmodyfikuj filtry",
                ShowCount: "Pokaż liczność",
                Operator: "Operator pomiędzy wartościami",
                ANDOperator: "ORAZ",
                OROperator: "LUB",
                IsMulti: "Wiele wartości",
                Templates: {
                    CheckBoxTemplate: "Pole tak/nie",
                    DateRangeTemplate: "Daty od/do",
                    ComboBoxTemplate: "Pole rozwijalne",
                    DateIntervalTemplate: "Okres czasu",
                    TaxonomyPickerTemplate: "Wybór terminu"
                },
                SortBy: "Sortuj po",
                SortDirection: "Kierunek sortowania",
                SortByName: "Po nazwie",
                SortByCount: "Po liczności",
                SortAscending: "Rosnąco",
                SortDescending: "Malejąco"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Dostępne układy",
                LayoutTemplateOptionsGroupName: "Ustawienia układu",
                TemplateUrlFieldLabel: "Użyj adresu URL zewnętrznego szablonu",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Szablon musi by poprawnym plikiem .txt, .htm lub .html",
                ErrorTemplateResolve: "Nie można rozwiązać wskazanego szablonu. Szczegóły błędu: '{0}'",
                FiltersTemplateFieldLabel: "Edytuj filtry szablonu",
                FiltersTemplatePanelHeader: "Edytuj filtry szablonu"
            }
        }
    }
});