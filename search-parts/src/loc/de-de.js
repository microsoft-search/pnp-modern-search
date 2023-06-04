define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Wähle ein Token...",
            Context: {
                ContextTokensGroupName: "Kontext Token",
                SiteAbsoluteUrl: "Absolute Seiten URL",
                SiteRelativeUrl: "Relative Serverseiten URL",
                WebAbsoluteUrl: "Absolute Web URL",
                WebRelativeUrl: "Relative Web Server URL",
                WebTitle: "Web Titel",
                InputQueryText: "Eingabe Query Text"
            },
            Custom: {
                CustomTokensGroupName: "Benutzerdefinerter Wert",
                CustomValuePlaceholder: "Wert eingeben...",
                InvalidtokenFormatErrorMessage: "Bitte gebe den Token im unterstützten Format ein: {' und '}'. (z.B.: {Today})"
            },
            Date: {
                DateTokensGroupName: "Datums Token",
                Today: "Heute",
                Yesterday: "Gestern",
                Tomorrow: "Morgen",
                OneWeekAgo: "Vor einer Woche",
                OneMonthAgo: "Vor einem Monat",
                OneYearAgo: "Vor einem Jahr"
            },
            Page: {
                PageTokensGroupName: "Seiten Token",
                PageId: "Seiten ID",
                PageTitle: "Seiten Title",
                PageCustom: "Andere Seiten Spalte",
            },
            User: {
                UserTokensGroupName: "Benutzer Token",
                UserName: "Benutzer Name",
                Me: "Ich",
                UserDepartment: "Benutzer Abteilung",
                UserCustom: "Benutzerdefinerte Eigenschaft"
            }
        },
        General: {
            OnTextLabel: "An",
            OffTextLabel: "Aus",
            StaticArrayFieldName: "Array ähnliches Feld",
            About: "Über",
            Authors: "Autor(en)",
            Version: "Version",
            InstanceId: "Web Part Instanz-ID",
            Resources: {
                GroupName: "Ressourcen",
                Documentation: "Dokumentation",
                PleaseReferToDocumentationMessage: "Bitte beachten Sie die offizielle Dokumentation."
            },
            Extensibility: {
                InvalidDataSourceInstance: "Die ausgewählte Datenquelle '{0}' implementiert die abstrakte Klasse 'BaseDataSource' nicht korrekt. Es fehlen einige Methoden.",
                DataSourceDefinitionNotFound: "Die benutzerdefinierte Datenquelle mit dem Schlüssel '{0}' wurde nicht gefunden. Stellen Sie sicher, dass die Lösung korrekt für den App-Katalog bereitgestellt und die Manifest-ID für dieses Web Part registriert ist.",
                LayoutDefinitionNotFound: "Das benutzerdefinierte Layout mit dem Schlüssel '{0}' wurde nicht gefunden. Stellen Sie sicher, dass die Lösung korrekt für das App-Katalog bereitgestellt und die Manifest-ID für dieses Webpart registriert ist.",
                InvalidLayoutInstance: "Das ausgewählte Layout '{0}' implementiert die abstrakte Klasse 'BaseLayout' nicht korrekt. Es fehlen einige Methoden.",
                DefaultExtensibilityLibraryName: "Standard-Erweiterungsbibliothek",
                InvalidProviderInstance: "Der ausgewählte Vorschlagsprovider '{0}' implementiert die abstrakte Klasse 'BaseSuggestionProvider' nicht korrekt. Es fehlen einige Methoden.",
                ProviderDefinitionNotFound: "Der benutzerdefinierte Vorschlagsprovider mit dem Schlüssel '{0}' wurde nicht gefunden. Stellen Sie sicher, dass die Lösung korrekt für den App-Katalog bereitgestellt und die Manifest-ID für dieses Webpart registriert ist.",
                QueryModifierDefinitionNotFound: "Der benutzerdefinierte Benutzer-Anfragen-Modifizierer mit dem Schlüssel '{0}' wurde nicht gefunden. Stellen Sie sicher, dass die Lösung korrekt für den App-Katalog bereitgestellt und die Manifest-ID für dieses Webpart registriert ist.",
                InvalidQueryModifierInstance: "Der ausgewählte Benutzer-Anfragen-Modifizierer '{0}'  implementiert  die abstrakte Klasse 'BaseQueryModifier' nicht korrekt. Es fehlen einige Methoden.",
            },
            DateFromLabel: "Von",
            DateTolabel: "Bis",
            DatePickerStrings: {
                months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
                shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                goToToday: 'Weiter zu heute',
                prevMonthAriaLabel: 'Zum vorherigeren Monat',
                nextMonthAriaLabel: 'Zum nächsten Monat',
                prevYearAriaLabel: 'Zum vorherigen Jahr',
                nextYearAriaLabel: 'Zum nächsten Jahr',
                closeButtonAriaLabel: 'Datumspicker schließen',
                isRequiredErrorMessage: 'Start Datum ist erforderlich.',
                invalidInputErrorMessage: 'Ungültiges Datumsformat.'
            },
            DateIntervalStrings: {
                AnyTime: "Jederzeit",
                PastDay: "Letzte 24 Stunden",
                PastWeek: "Von den letzten 24 Stunden bis zur vergangenen Woche",
                PastMonth: "Von der vergangenen Woche zum vergangenen Monat",
                Past3Months: "Vom letzten Monat bis zu den letzten 3 Monaten",
                PastYear: "Von den letzten 3 Monaten bis zum vergangenen Jahr",
                Older: "Älter als ein Jahr"
            },
            SameTabOpenBehavior: "Die aktuelle Registerkarte verwenden",
            NewTabOpenBehavior: "In einer neuen Registerkarte öffnen",
            PageOpenBehaviorLabel: "Öffnungsverhalten",
            EmptyFieldErrorMessage: "Dieses Feld darf nicht leer bleiben.",
            TagPickerStrings: {
                NoResultsSearchMessage: "Keine Ergebnisse gefunden",
                SearchPlaceholder: "Suche einen Wert..."
            },
            CurrentVerticalNotSelectedMessage: "Das derzeit ausgewählte Vertikal passt nicht zu den zu diesem Web Part ({0}) zugeordneten Vertikalen. Es wird im Anzeige Modus als leer angezeigt."            
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint Suche",
                SourceConfigurationGroupName: "Quell Konfiguration",
                QueryTextFieldLabel: "Query Text",
                QueryTextFieldInfoMessage: "Verwenden Sie die Registerkarte <strong>Verfügbare Verbindungen</strong> für die Konfiguration des Webparts, um entweder einen statischen Wert oder einen Wert aus einer dynamischen Komponente auf der Seite wie einem Suchfeld anzugeben",
                QueryTemplateFieldLabel: "Query Vorlage",
                QueryTemplatePlaceHolderText: "z.B.: Path:{Site}",
                QueryTemplateFieldDescription: "Die Vorlage für die Suchanfrage. Sie können auch {<Tokens>} verwenden, um eine dynamische Abfrage zu erstellen.",
                ResultSourceIdLabel: "ID der Ergebnisquelle / Scope|Name",
                ResultSourceIdDescription: "Verwenden Sie eine standardmäßige SharePoint-Ergebnisquellen-ID, geben Sie Ihren eigenen GUID-Wert ein oder den SCOPE und NAMEN der Quelle getrennt durch '|' (z.B.: SPSite|News). Erlaubte Scopes sind [SPSiteSubscription, SPSite, SPWeb]. Drücken Sie zum Speichern die [Eingabetaste].",
                InvalidResultSourceIdMessage: "Der angegebene Wert ist keine gültige GUID oder nicht als SCOPE|NAME formattiert.",
                EnableQueryRulesLabel: "Abfrageregeln aktivieren",                
                RefinementFilters: "Verfeinerungsfilter",
                RefinementFiltersDescription: "Initiale Verfeinerungsfilter, die auf die Abfrage angewendet werden sollen. Diese werden nicht in den ausgewählten Filtern angezeigt. Verwenden Sie für String-Ausdrücke doppelte Anführungszeichen (\") anstelle von einfachen Anführungszeichen (').",
                EnableLocalizationLabel: "Lokalisierung einschalten",
                EnableLocalizationOnLabel: "An",
                EnableLocalizationOffLabel: "Aus",
                QueryCultureLabel: "Sprache der Suchanfrage",
                QueryCultureUseUiLanguageLabel: "Sprache der Benutzeroberfläche verwenden",
                SelectedPropertiesFieldLabel: "Ausgewählte Eigenschaften",
                SelectedPropertiesFieldDescription: "Gibt die Eigenschaften an, die aus den Suchergebnissen abgerufen werden sollen.",
                SelectedPropertiesPlaceholderLabel: "Eigenschaften auswählen",
                HitHighlightedPropertiesFieldLabel: "Hervorgehobene Eigenschaften",
                HitHighlightedPropertiesFieldDescription: "Liste der verwalteten Eigenschaften zum hervorheben (i.e. Department,UserName).",
                TermNotFound: "(Begriff mit ID '{0}' nicht gefunden)",
                ApplyQueryTemplateBtnText: "Übernehmen",
                EnableAudienceTargetingTglLabel: "Zielgruppen Adressierung aktivieren",
                TrimDuplicates: "Duplikate kürzen",
                CollapseSpecificationLabel: "Spezifikation einklappen"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Abfragetext",
                QueryTextFieldInfoMessage: "Verwenden Sie die Registerkarte <strong>Verfügbare Verbindungen</strong> für die Konfiguration des Webparts, um entweder einen statischen Wert oder einen Wert aus einer dynamischen Komponente auf der Seite wie einem Suchfeld anzugeben",
                SourceName: "Microsoft Suche",
                SourceConfigurationGroupName: "Microsoft Suche",
                EntityTypesField: "Zu durchsuchende Entitätstypen",
                SelectedFieldsPropertiesFieldLabel: "Ausgewählte Felder",
                SelectedFieldsPropertiesFieldDescription: "Gibt die Felder an, die aus den Suchergebnissen abgerufen werden sollen.",
                SelectedFieldsPlaceholderLabel: "Felder auswählen",
                EnableTopResultsLabel: "Top-Ergebnisse aktivieren",
                ContentSourcesFieldLabel: "Inhaltsquellen",
                ContentSourcesFieldDescriptionLabel: "IDs von Verbindungen, die im Verwaltungsportal von Microsoft Search Connectors definiert sind.",
                ContentSourcesFieldPlaceholderLabel: "Bspw.: 'MeineAngepassteVerbindungsId'",
                EnableSuggestionLabel: "Rechtschreibevorschläge aktivieren",
                EnableModificationLabel: "Rechtschreibemodifikationen aktivieren",
                QueryTemplateFieldLabel: "Query Vorlage",
                QueryTemplatePlaceHolderText: "z.B.: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "Die Suchvorlage. Es können auch {<tokens>} und KQL für die Erstellung einer dynamischen Query benutzt werden.",
                ApplyQueryTemplateBtnText: "Anwenden",
                UseBetaEndpoint: "Benutze den Beta-Endpunkt",
                TrimDuplicates: "Duplikate kürzen",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Bearbeiten Sie die Minimierungseinstellungen",
                    CollapsePropertiesDescription: "Angiv indstillingerne for sammenbrud for søgeresultaterne. Du kan enten vælge et felt fra rullelisten (kun hvis datakildedataene allerede er hentet) eller indtaste din egen tilpassede værdi (tryk på 'Enter' for at gemme din indtastning)",
                    CollapsePropertiesPropertyPaneFieldLabel: "Minimierungseinstellungen",
                    CollapseLimitFieldLabel: "Grenze",
                    CollapsePropertiesFieldColumnPlaceholder: "Nach Feld reduzieren"
                }
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Sortierreihenfolge",
                    SortListDescription: "Geben Sie die initiale Sortierreihenfolge für die Suchergebnisse an. Sie können entweder ein Feld aus der Dropdown-Liste auswählen (nur wenn die Daten der Datenquelle bereits abgerufen wurden) oder einen eigenen Wert eingeben (drücken Sie 'Enter', um Ihre Eingabe zu speichern).",
                    SortDirectionAscendingLabel: "Aufsteigend",
                    SortDirectionDescendingLabel: "Absteigend",
                    SortErrorMessage: "Ungültige Sucheigenschaft (Prüfen Sie, ob die verwaltete Eigenschaft sortierbar ist).",
                    SortPanelSortFieldLabel: "Nach Feld sortieren",
                    SortPanelSortFieldAria: "Sortiere nach",
                    SortPanelSortFieldPlaceHolder: "Sortiere nach",
                    SortPanelSortDirectionLabel: "Sortierrichtung",
                    SortDirectionColumnLabel: "Richtung",
                    SortFieldColumnLabel: "Feld Name",
                    EditSortLabel: "Sortierreihenfolge bearbeiten",
                    SortInvalidSortableFieldMessage: "Diese Eigenschaft ist nicht sortierbar",
                    SortFieldColumnPlaceholder: "Wähle Feld..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Handlebar Ausdruck hinzufügen",
            TextDialogTitle: "Handlebar Ausdruck bearbeiten",
            TextDialogCancelButtonText: "Abbrechen",
            TextDialogSaveButtonText: "Speichern",
            SelectItemComboPlaceHolder: "Eigenschaft auswählen",
            AddStaticDataLabel: "Statische Daten hinzufügen",
            TextFieldApplyButtonText: "Übernehmen",
            SortByPlaceholderText: "Standardsortierung",
            SortByDefaultOptionText: "Standard"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            CustomHandlebars: {
                Name: "Benutzerdefiniert"
            },
            CustomAdaptiveCards: {
                Name: "Benutzerdefiniert"
            },
            SimpleList: {
                Name: "Liste",
                ShowFileIconLabel: "Dateisymbol anzeigen",
                ShowItemThumbnailLabel: "Vorschaubild anzeigen"
            },
            DetailsList: {
                Name: "Detailliste",
                UseHandlebarsExpressionLabel: "Benutze Handlebar Ausdruck",
                MinimumWidthColumnLabel: "Minimum Breite (px)",
                MaximumWidthColumnLabel: "Maximum Breite (px)",
                SortableColumnLabel: "Sortierbar",
                ResizableColumnLabel: "Größenveränderbar",
                MultilineColumnLabel: "Mehrzeilig",
                LinkToItemColumnLabel: "Link zum Item",
                CompactModeLabel: "Kompaktmodus",
                ShowFileIcon: "Dateisymbol anzeigen",
                ManageDetailsListColumnDescription: "Hinzufügen, Aktualisieren oder Entfernen von Spalten für das Layout der Detailliste. Sie können entweder Eigenschaftswerte in der Liste direkt und ohne Transformation verwenden oder einen Handlebar-Ausdruck im Wertefeld einsetzen. HTML wird ebenfalls für alle Felder unterstützt.",
                ManageDetailsListColumnLabel: "Spalten verwalten",
                ValueColumnLabel: "Spalten Wert",
                ValueSortingColumnLabel: "Sortierung von Spaltenwerten",
                DisplayNameColumnLabel: "Spaltenanzeigename",
                FileExtensionFieldLabel: "Zu verwendendes Feld für die Dateierweiterung",
                GroupByFieldLabel: "Gruppierung nach Feld",
                EnableGrouping: "Gruppierung aktivieren",
                GroupingDescription: "Stellen Sie sicher, dass im Ergebnis-Webpart Daten angezeigt werden, damit eine Liste der anzuzeigenden Eigenschaften angezeigt wird.",
                CollapsedGroupsByDefault: "Eingeklappt anzeigen",
                ResetFieldsBtnLabel: "Felder auf Standardwerte zurücksetzen"
            },
            Cards: {
                Name: "Karten",
                ManageTilesFieldsLabel: "Verwaltete Kartenfelder",
                ManageTilesFieldsPanelDescriptionLabel: "Hier können Sie jeden Feldwert mit den entsprechenden Kartenplatzhaltern abbilden. Sie können entweder eine Ergebniseigenschaft direkt ohne Transformation verwenden oder einen Handlebars-Ausdruck als Feldwert verwenden. Wenn angegeben, können Sie auch Ihren eigenen HTML-Code in kommentierte Felder einfügen.",
                PlaceholderNameFieldLabel: "Name",
                SupportHTMLColumnLabel: "Erlaube HTML",
                PlaceholderValueFieldLabel: "Wert",
                UseHandlebarsExpressionLabel: "Benutze Handlebar Ausdruck",
                EnableItemPreview: "Ergebnisvorschau einschalten",
                EnableItemPreviewHoverMessage: "Die Aktivierung dieser Option kann sich auf die Leistung auswirken, wenn zu viele Elemente auf einmal angezeigt werden und Sie das Slot-Feld 'AutoPreviewUrl' verwenden. Wir empfehlen Ihnen, diese Option bei einer geringen Anzahl von Elementen zu verwenden oder vordefinierte Vorschau-URLs aus Ihren Datenquellenfeldern in Slots zu verwenden.",
                ShowFileIcon: "Dateisymbol anzeigen",
                CompactModeLabel: "Kompaktmodus",
                PreferedCardNumberPerRow: "Bevorzugte Anzahl von Karten pro Reihe",
                Fields: {
                    Title: "Titel",
                    Location: "Ort",
                    Tags: "Tags",
                    PreviewImage: "Vorschaubild",
                    PreviewUrl: "Vorschau Url",
                    Url: "Url",
                    Date: "Datum",
                    Author: "Autor",
                    ProfileImage: "Profil Bild Url",
                    FileExtension: "Dateiendung",
                    IsContainer: "Ist-Ordner"
                },
                ResetFieldsBtnLabel: "Felder auf Standardwerte zurücksetzen"
            },
            Slider: {
                Name: "Slideshow",
                SliderAutoPlay: "Automatische Wiedergabe",
                SliderAutoPlayDuration: "Automatische Wiedergabe Dauer (in Sekunden)",
                SliderPauseAutoPlayOnHover: "Pause beim Hovern",
                SliderGroupCells: "Anzahl der Elemente, die in Dias zusammengefasst werden sollen",
                SliderShowPageDots: "Seitenpunkte anzeigen",
                SliderWrapAround: "Unendlicher Bildlauf",
                SlideHeight: "Slide Höhe (in px)",
                SlideWidth: "Slide Breite (in px)"
            },
            People: {
                Name: "People",
                ManagePeopleFieldsLabel: "Personenfelder verwalten",
                ManagePeopleFieldsPanelDescriptionLabel: "Hier können Sie jeden Feldwert mit den entsprechenden Persona-Platzhaltern abbilden. Sie können entweder den Wert des Feldes der Datenquelle direkt ohne Transformation verwenden oder einen Handlebar-Ausdruck im Wertfeld verwenden.",
                PlaceholderNameFieldLabel: "Name",
                PlaceholderValueFieldLabel: "Wert",
                UseHandlebarsExpressionLabel: "Benutze Handlebar-Ausdruck",
                PersonaSizeOptionsLabel: "Komponentengrösse",
                PersonaSizeExtraSmall: "Extra klein",
                PersonaSizeSmall: "Klein",
                PersonaSizeRegular: "Regulär",
                PersonaSizeLarge: "Gross",
                PersonaSizeExtraLarge: "Extra gross",
                ShowInitialsToggleLabel: "Initialen anzeigen, wenn kein Bild vorhanden",
                SupportHTMLColumnLabel: "HTML erlauben",
                ResetFieldsBtnLabel: "Felder auf Standardwerte zurücksetzen",
                ShowPersonaCardOnHover: "Persona-Karte bei Hover anzeigen",
                ShowPersonaCardOnHoverCalloutMsg: "Diese Funktion verwendet Microsoft Graph, um Informationen über den Benutzer anzuzeigen, und benötigt die folgenden API-Berechtigungen in Ihrem Mandanten, um zu funktionieren: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                Fields: {
                    ImageUrl: "Bild URL",
                    PrimaryText: "Primärer Text",
                    SecondaryText: "Sekundärer Text",
                    TertiaryText: "Tertiärer Text",
                    OptionalText: "Optionaler Text"
                }
            },
            Vertical: {
                Name: "Vertikal"
            },
            Horizontal: {
                Name: "Horizontal",
                PreferedFilterNumberPerRow: "Bevorzugte Anzahl von Filtern pro Zeile",
            },
            Panel: {
                Name: "Panel",
                IsModal: "Modal",
                IsLightDismiss: "Leicht entfernt",
                Size: "Panel Grösse",
                ButtonLabel: "Zeige Filter",
                ButtonLabelFieldName: "Beschriftung der angezeigten Schaltfläche",
                HeaderText: "Filter",
                HeaderTextFieldName: "Text in der Kopfzeile des Panels",
                SizeOptions: {
                    SmallFixedFar: 'Klein (default)',
                    SmallFixedNear: 'Klein, nahe Seite',
                    Medium: 'Medium',
                    Large: 'Gross',
                    LargeFixed: 'Gross mit fester Breite',
                    ExtraLarge: 'Extra Gross',
                    SmallFluid: 'Volle Breite (flüssig)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> Ergebnisse für '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> Ergebnisse",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Verfügbare Verbindungen",
                UseDataVerticalsWebPartLabel: "Verbinde ein Vertikal Web Part.",
                UseDataVerticalsFromComponentLabel: "Benutze Vertikale von dieser Komponente."
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Konfiguration der Erweiterbarkeit",
                    FieldLabel: "Zu ladende Erweiterungsbibliotheken",
                    ManageBtnLabel: "Konfigurieren",
                    Columns: {
                        Name: "Name/Zweck",
                        Id: "Manifest GUID",
                        Enabled: "Eingeschalten/Ausgeschalten"
                    }
                },
                ImportExport: "Einstellungen importieren/exportieren"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Anwenden",
            ClearAllFiltersButtonLabel: "Zurücksetzen",
            FilterNoValuesMessage: "Keine Werte für diesen Filter",
            OrOperator: "OR",
            AndOperator: "AND",
            ComboBoxPlaceHolder: "Wert auswählen",
            UseAndOperatorValues: "Benutze ein AND Operator zwischen den Werten.",
            UseOrOperatorValues: "Benutze ein OR Operator zwischen den Werten.",
            UseValuesOperators: "Wähle einen Operator der zwischen den Filter Werten angewandt werden soll."
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "SharePoint Statische Suchvorschläge",
                ProviderDescription: "Abrufen von statischen benutzerdefinierten SharePoint-Suchvorschlägen"
            }
        }
    }
})
