define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Bearbeiten",
                IconText: "Such Filter von @PnP",
                Description: "Zeigt Filter eines verbundenen Suchergebnis Webparts an.",
                ConfigureBtnLabel: "Konfigurieren"
            },
            NoAvailableFilterMessage: "Keine Filter zum Anzeigen verfügbar.",
            WebPartDefaultTitle: "Suchfilter Web Part"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Verbinde einen Suchergebnis Webpart.",
                UseDataResultsFromComponentsLabel: "Benutze Daten von diesen Webparts",
                UseDataResultsFromComponentsDescription: "Wenn mehr als ein Webpart verbunden ist, dann werden die Filter Werte und die Anzahl für ähnliche Filter Namen zusammengeführt.",
                LinkToVerticalLabel: "Zeige Filter nur an wenn folgende Vertikale ausgewählt sind",
                LinkToVerticalLabelHoverMessage: "Diese Filter werden nur angezeigt wenn das ausgewählte Vertikal mit einem der für diesen Webpart konfigurierten übereinstimmt. Ansonsten bleibt das Webpart im Anzeigemodus blank (kein Rand)."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filter Einstellungen",
                FilterOperator: "Operator zum Nutzen zwischen den Filtern"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Wähle ein Feld",
                FilterNameLabel: "Filter Feld",
                FilterMaxBuckets: "# der Werte",
                FilterDisplayName: "Anzeige name",
                FilterTemplate: "Vorlage",
                FilterExpandByDefault: "Standardmäßig erweitert",
                FilterType: "Filter Typ",
                FilterTypeRefiner: "Diese Filter Vorlage agiert als ein Verfeinerer und erhält/sendet verfügbare/ausgewählte Werte von/zu einer verbundenen Datenquelle.",
                FilterTypeStaticFilter: "Diese Filter Vorlage agiert als ein statischer Filter udn sendet nur willkürlich ausgewählte Werte zu der verbundenen Datenquelle. Einkommende Filter Werte werden nicht beachtet.",
                CustomizeFiltersBtnLabel: "Bearbeiten",
                CustomizeFiltersHeader: "Filter bearbeiten",
                CustomizeFiltersDescription: "Such Filter durch hinzufügen / entfernen von Zeilen konfigurieren. Für die Filter können Felder von den Datenquellen Ergebnissen oder statische Werte selektiert werden.",
                CustomizeFiltersFieldLabel: "Filter anpassen",
                ShowCount: "Zeige Anzahl",
                Operator: "Operator zwichen Werten",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Mehrere Werte",
                Templates: {
                    CheckBoxTemplate: "Checkbox",
                    DateRangeTemplate: "Datumsbereich",
                    ComboBoxTemplate: "Combobox",
                    DateIntervalTemplate: "Datums Interval",
                    TaxonomyPickerTemplate: "Taxonomy Picker"
                },
                SortBy: "Sortiere Werte nach",
                SortDirection: "Sortier Richtung",
                SortByName: "Nach Name",
                SortByCount: "Nach Anzahl",
                SortAscending: "Aufsteigend",
                SortDescending: "Absteigend"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Verfügbare Layouts",
                LayoutTemplateOptionsGroupName: "Layout Optionen",
                TemplateUrlFieldLabel: "Benutze ein externe Vorlagen URL.",
                TemplateUrlPlaceholder: "https://meinedatei.html",
                ErrorTemplateExtension: "Die Vorlage muss eine valide .txt, .htm oder .html Datei sein",
                ErrorTemplateResolve: "Kann die angegebene Vorlage nicht auflösen. Fehler Details: '{0}'",
                FiltersTemplateFieldLabel: "Filter Vorlage bearbeiten",
                FiltersTemplatePanelHeader: "Filter Vorlage bearbeiten"
            }
        }
    }
});