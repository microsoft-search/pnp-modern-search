define([], function () {
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
                LinkToVerticalLabel: "Zeige Filter nur an, wenn folgende Vertikale ausgewählt sind",
                LinkToVerticalLabelHoverMessage: "Diese Filter werden nur angezeigt, wenn das ausgewählte Vertikal mit einem der für dieses Webpart konfigurierten übereinstimmt. Ansonsten bleibt das Webpart im Anzeigemodus leer (kein Rand).",
                BidirectionalConnectionWarning: "Ein oder mehrere verbundene Suchergebnis-Webparts wurden nicht so konfiguriert, dass sie eine Rückverbindung zu diesem Filter-Webpart herstellen. Beide Webparts müssen miteinander verbunden sein, damit die Filter korrekt funktionieren."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filter Einstellungen",
                FilterOperator: "Operator zwischen den Filtern"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Wähle ein Feld",
                FilterNameLabel: "Filter Feld",
                FilterMaxBuckets: "# der Werte",
                FilterMaxBucketsWarning: "Die maximale Anzahl von Werten ist 1000",
                FilterLimitReachedWarningToggle: "Warnung anzeigen, wenn das Limit erreicht ist",
                FilterLimitReachedWarningMessage: "Ergebnislimit erreicht — nicht alle passenden Elemente werden angezeigt. Verfeinern Sie Ihre Suche, um die Liste einzugrenzen.",
                PeopleTemplateQUserMappingWarning: "Warnung für Personenvorlage: Die Werte sehen nicht wie Benutzeridentitäten aus. Diese Eigenschaft ist wahrscheinlich nicht einer Q_USER-Crawleigenschaft zugeordnet.",
                FilterDisplayName: "Anzeige name",
                FilterTemplate: "Vorlage",
                FilterExpandByDefault: "Standardmäßig erweitert",
                ExpandAllNodesByDefault: "Alle Knoten standardmäßig erweitern",
                HideNodesNotInDataSet: "Knoten ausblenden, die nicht im aktuellen Datensatz enthalten sind",
                FilterType: "Filter Typ",
                FilterTypeRefiner: "Diese Filter Vorlage agiert als ein Verfeinerer und erhält/sendet verfügbare/ausgewählte Werte von/zu einer verbundenen Datenquelle.",
                FilterTypeStaticFilter: "Diese Filter Vorlage agiert als ein statischer Filter und sendet nur willkürlich ausgewählte Werte zu der verbundenen Datenquelle. Einkommende Filter Werte werden nicht beachtet.",
                CustomizeFiltersBtnLabel: "Bearbeiten",
                CustomizeFiltersHeader: "Filter bearbeiten",
                CustomizeFiltersDescription: "Filter durch Hinzufügen/Entfernen von Zeilen konfigurieren. Für die Filter können Felder von den Datenquellen-Ergebnissen oder statische Werte selektiert werden. Für weitere Informationen sehen Sie https://microsoft-search.github.io/pnp-modern-search/usage/search-filters/#filter-settings",
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
                    PeopleTemplate: "Personenvorlage",
                    StaticPeopleTemplate: "Statische Personenvorlage",
                    TaxonomyPickerTemplate: "Taxonomy Picker",
                    HierarchicalFilterTemplate: "Hierarchischer Filter"
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
        },
            WebPartDefaultTitle: "Suchfilter Web Part",
            StaticPeoplePicker: {
                RemoveSelectedUserTitle: "{0} entfernen",
                SearchUsersPlaceholder: "Benutzer suchen",
                LoadingTenantUsersLabel: "Mandantenbenutzer werden geladen...",
                NoUsersFoundMessage: "Keine Benutzer gefunden."
            }
            StylingOptionsGroupName: "Stiloptionen",
            FilterBackgroundColorLabel: "Filter-Hintergrundfarbe",
            FilterBorderColorLabel: "Filter-Rahmenfarbe",
            FilterBorderThicknessLabel: "Filter-Rahmenstärke",
            ResetToDefaultLabel: "Styling auf Standard zurücksetzen",
            ResetToDefaultDescription: "Alle Styling-Optionen auf ihre Standardwerte zurücksetzen"
        }
    }
});