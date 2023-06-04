define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Bearbeiten",
                IconText: "Suchergebnis Webpart von @PnP",
                Description: "Zeigt Suchergebnisse von SharePoint oder Microsoft Search.",
                ConfigureBtnLabel: "Konfigurieren"
            },
            WebPartDefaultTitle: "Suchergebnis Webpart",
            ShowBlankEditInfoMessage: "Keine Ergebnisse für diese Abfrage. Dieser Webpart bleibt im Anzeigemodus entsprechend den Parametern leer.",
            CurrentVerticalNotSelectedMessage: "Die aktuell ausgewählte Vertikale stimmt nicht mit der für diesen Webpart zugeordneten überein. Sie bleibt im Anzeigemodus leer."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Verfügbare Datenquellen",
                PagingOptionsGroupName: "Paging-Optionen",
                ItemsCountPerPageFieldName: "Anzahl der items pro Seite",
                PagingRangeFieldName: "Anzahl der anzuzeigenden Seiten im Bereich",
                ShowPagingFieldName: "Paging anzeigen",
                HidePageNumbersFieldName: "Verstecke Seitenzahlen",
                HideNavigationFieldName: "Navigationsknopf verstecken (Seite vor/zurück)",
                HideFirstLastPagesFieldName: "Anfang/Ende Navigationsknöpfe verstecken",
                HideDisabledFieldName: "Navigationsknöpfe verstecken (vor, zurück, Anfang, Ende) wenn sie deaktiviert sind.",
                TemplateSlots: {
                    GroupName: "Layout Slots",
                    ConfigureSlotsLabel: "Layout Slots für diese Datenquelle bearbeiten",
                    ConfigureSlotsBtnLabel: "Anpassen",
                    ConfigureSlotsPanelHeader: "Layout Slots",
                    ConfigureSlotsPanelDescription: "Fügen Sie hier die Slots hinzu, die für die verschiedenen Layouts verwendet werden sollen. Ein Slot ist eine Platzhaltervariable, die Sie in Ihre Vorlagen einfügen, wobei der Wert dynamisch durch den Wert eines Datenquellenfeldes ersetzt wird. Auf diese Weise werden Ihre Vorlagen allgemeiner und wiederverwendbar, unabhängig von den spezifischen Feldern der Datenquelle. Um sie zu verwenden, verwenden Sie den Handlebars-Ausdruck `{{slot item @root.slots.<SlotName>}}`.",
                    SlotNameFieldName: "Slot Name",
                    SlotFieldFieldName: "Slot Feld",
                    SlotFieldPlaceholderName: "Wähle ein Feld"
                }
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Verfügbare Layouts",
                LayoutTemplateOptionsGroupName: "Layout Optionen",
                CommonOptionsGroupName: "Allgemein",
                TemplateUrlFieldLabel: "Benutze eine externe Vorlagen URL",
                TemplateUrlPlaceholder: "https://meineDatei.html",
                ErrorTemplateExtension: "Die Vorlage muss eine gültige .txt, .html oder .html Datei sein",
                ErrorTemplateResolve: "Kann die angegebene Vorlage nicht auflösen. Fehler Details: '{0}'",
                DialogButtonLabel: "Ergebnisvorlage bearbeiten",
                DialogTitle: "Ergebnisvorlage bearbeiten",
                ShowSelectedFilters: "Ausgewählte Filter anzeigen",
                ShowBlankIfNoResult: "Webpart verstecken wenn es nichts zum Anzeigen gibt.",
                ShowResultsCount: "Anzahl der Ergebniss anzeigen",
                HandlebarsRenderTypeLabel: "Handlebars/HTML",
                HandlebarsRenderTypeDesc: "Wählen Sie Layouts basierend auf HTML, CSS und Handlebars aus",
                AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
                AdaptiveCardsRenderTypeDesc: "Wählen Sie Layouts basierend auf adaptiven JSON-Karten aus",
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Microsoft Graph Toolkit benutzen",
                    ResultTypes: {
                        ResultTypeslabel: "Ergebnistypen",
                        ResultTypesDescription: "Fügen Sie hier die Vorlagen hinzu, die für die Ergebniselemente gemäß einer oder mehrerer Bedingungen verwendet werden sollen. Die Bedingungen werden in der konfigurierten Reihenfolge ausgewertet und externe Vorlagen haben Vorrang vor Inline-Vorlagen. Stellen Sie außerdem sicher, dass die von Ihnen verwendeten Datenquellenfelder in der Datenrückgabe vorhanden sind.",
                        InlineTemplateContentLabel: "Inline-Vorlage",
                        EditResultTypesLabel: "Ergebnistypen bearbeiten",
                        ConditionPropertyLabel: "Datenquellen-Feld",
                        ConditionValueLabel: "Bedingungswert",
                        CondtionOperatorValue: "Operator",
                        ExternalUrlLabel: "Externe Vorlagen-URL",
                        EqualOperator: "Gleich",
                        NotEqualOperator: "Ungleich",
                        ContainsOperator: "Enthält",
                        StartsWithOperator: "Beginnt mit",
                        NotNullOperator: "Ungleich Null",
                        GreaterOrEqualOperator: "Größer oder gleich",
                        GreaterThanOperator: "Größer als",
                        LessOrEqualOperator: "Kleiner oder gleich",
                        LessThanOperator: "Kleiner als",
                        CancelButtonText: "Abbrechen",
                        DialogButtonText: "Vorlage bearbeiten",
                        DialogTitle: "Ergebnisvorlage bearbeiten",
                        SaveButtonText: "Speichern"
                    },
                    AllowItemSelection: "Item Auswahl erlauben",
                    AllowMultipleItemSelection: "Mehrfachauswahl erlauben",
                    SelectionModeLabel: "Auswahlmodus",
                    AsTokensSelectionMode: "Ausgewählte Werte als Token verarbeiten (manueller Modus)",
                    AsDataFiltersSelectionMode: "Ausgewählte Werte als Filter (Standard Modus)",
                    AsDataFiltersDescription: "In diesem Modus werden die ausgewählten Werte als reguläre Suchverfeinerungen an die Datenquelle gesendet. In diesem Fall muss die gewählte Zieleigenschaft im Suchschema verfeinerbar sein.",
                    AsTokensDescription: "In diesem Modus werden die ausgewählten Werte manuell über Token und den verfügbare Methoden verwendet. Beispiel anhand einer SharePoint-Suchabfragevorlage: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "Der logische Operator, der zwischen den ausgewählten Werten verwendet werden soll",
                    FieldToConsumeLabel: "Zu konsumierendes Quellenfeld",
                    FieldToConsumeDescription: "Diesen Feldwert für ausgewählte Items verwenden"
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Hostkonfiguration"
                }
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Verfügbare Verbindungen",
                UseFiltersWebPartLabel: "Mit einem Filter Webpart verbinden",
                UseFiltersFromComponentLabel: "Filter dieser Komponente verwenden",
                UseDynamicFilteringsWebPartLabel: "Mit einem Suchergebnis Webpart verbinden",
                UseDataResultsFromComponentsLabel: "Daten von diesem Webpart verwenden",
                UseDataResultsFromComponentsDescription: "Daten von ausgewählten Items in diesen Webparts verwenden",                
                UseSearchVerticalsWebPartLabel: "Mit einem Vertikal Webpart verbinden",
                UseSearchVerticalsFromComponentLabel: "Benutze Vertikale von dieser Komponente",
                LinkToVerticalLabel: "Daten nur anzeigen, wenn das folgene Vertikal ausgewählt ist",
                LinkToVerticalLabelHoverMessage: "Die Ergebnisse werden nur angezeigt, wenn die ausgewählte Vertikale mit der für dieses Webpart konfigurierten übereinstimmt. Andernfalls wird das Webpart im Anzeigemodus leer sein (kein Rand und keine Auffüllung).",
                UseInputQueryText: "Eingabeabfragetext benutzen",
                UseInputQueryTextHoverMessage: "Verwenden Sie das Token {inputQueryText} in Ihrer Datenquelle, um diesen Wert abzurufen",
                SearchQueryTextFieldLabel: "Abfragetext",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Suchtext eingeben...",
                InputQueryTextStaticValue: "Statischer Wert",
                InputQueryTextDynamicValue: "Dynamischer Wert",
                SearchQueryTextUseDefaultQuery: "Standardwert benutzen",
                SearchQueryTextDefaultValue: "Standardwert",
                SourceDestinationFieldLabel: "Ergebnis Feldname",
                SourceDestinationFieldDescription: "Zielfeld, das in diesem Webpart verwendet werden soll, um die ausgewählten Werte abzugleichen",
                AvailableFieldValuesFromResults: "Feld, das den Filterwert enthält"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Erweiterungsbibliotheken die beim Start geladen werden konfigurieren ",
                    PanelDescription: "Hier können Sie die IDs Ihrer benutzerdefinierten Erweiterungsbibliotheken hinzufügen/entfernen. Sie können einen Anzeigenamen angeben und entscheiden, ob die Bibliothek beim Starten geladen werden soll oder nicht. Nur benutzerdefinierte Datenquellen, Layouts, Webkomponenten und Handlebars-Helfer werden hier geladen.",
                },
                EnableTelemetryLabel: "PnP Telemetrie",
                EnableTelemetryOn: "Telemetrie einschalten",
                EnableTelemetryOff: "Telemetrie ausschalten"
            },
            CustomQueryModifier: {
                EditQueryModifiersLabel: "Verfügbare benutzerdefinierte Abfragemodifikatoren konfigurieren",
                QueryModifiersLabel: "Benutzerdefinierte Abfragemodifikatoren",
                QueryModifiersDescription: "Aktivieren oder deaktivieren Sie einzelne benutzerdefinierte Abfragemodifikatoren",
                EnabledPropertyLabel: "Aktiviert",
                ModifierNamePropertyLabel: "Name",
                ModifierDescriptionPropertyLabel: "Beschreibung",
                EndWhenSuccessfullPropertyLabel:"Bei Erfolg beenden"                
            }
        }
    }
});

