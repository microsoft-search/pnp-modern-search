define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Edytuj",
                IconText: "Web Part Wyników Wyszukiwania by @PnP",
                Description: "Wyświetla wyniki wyszukiwania z SharePoint lub Microsoft search.",
                ConfigureBtnLabel: "Konfiguruj"
            },
            WebPartDefaultTitle: "Web Part Wyników Wyszukiwania",
            ShowBlankEditInfoMessage: "Brak wyników dla zapytania. Zgodnie z parametrami ten Web Part pozostanie pusty.",
            CurrentVerticalNotSelectedMessage: "Obecnie wybrany wertykał nie odpowiada żadnemu powiązanemu składnikowi Web Part i pozostanie pusty w trybie wyświetlania."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Dostępne źródła danych",
                PagingOptionsGroupName: "Opcje stronnicowania",
                ItemsCountPerPageFieldName: "Liczba elementów na stronę",
                PagingRangeFieldName: "Liczba dostępnych stron",
                ShowPagingFieldName: "Pokaż stronnicowanie",
                HidePageNumbersFieldName: "Ukryj numery stron",
                HideNavigationFieldName: "Ukryj przyciski nawigacyjne (poprzednia strona, następna strona)",
                HideFirstLastPagesFieldName: "Ukruj przyciski początek/koniec",
                HideDisabledFieldName: "Ukryj przyciski nawigacyjne (poprzednia strona, następna strona, początek, koniec) gdy są nieaktywne.",
                TemplateSlots: {
                    GroupName: "Sloty układu",
                    ConfigureSlotsLabel: "Edytuje sloty dla tego źródła danych",
                    ConfigureSlotsBtnLabel: "Modyfikuj",
                    ConfigureSlotsPanelHeader: "Sloty układu",
                    ConfigureSlotsPanelDescription: "Dodaj tutaj sloty używane przez różne układy. Slot jest zmienną której możesz używać w szablonach której wartość jest dynamicznie zastępowana przez wartość ze źródła danych. W ten sposób szablony są bardziej reużywalne i mniej powiązane z konkretnym źródłem danych. Używaj wyrażeń Handlebars `{{slot item @root.slots.<SlotName>}}`.",
                    SlotNameFieldName: "Nazwa slotu",
                    SlotFieldFieldName: "Pole slotu",
                    SlotFieldPlaceholderName: "Wybierz pole"
                }
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Dostępne układy",
                LayoutTemplateOptionsGroupName: "Ustawienia układu",
                CommonOptionsGroupName: "Ogólne",
                TemplateUrlFieldLabel: "Użyj adresu URL zewnętrznego szablonu",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Szablon musi by poprawnym plikiem .txt, .htm lub .html",
                ErrorTemplateResolve: "Nie można rozwiązać wskazanego szablonu. Szczegóły błędu: '{0}'",
                DialogButtonLabel: "Edytuj szablon wyników",
                DialogTitle: "Edytuj szablon wyników",
                ShowSelectedFilters: "Pokaż wybrane filtry",
                ShowBlankIfNoResult: "Ukryj ten składnik Web Part jeśli nie ma wyników",
                ShowResultsCount: "Pokaż liczbę wyników",
                HandlebarsRenderTypeLabel: "Handlebars/HTML",
                HandlebarsRenderTypeDesc: "Wybierz układy oparte na HTML, CSS i Handlebars",
                AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
                AdaptiveCardsRenderTypeDesc: "Wybierz układy na podstawie kart adaptacyjnych JSON",
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Użyj Microsoft Graph Toolkit",
                    ResultTypes: {
                        ResultTypeslabel: "Rodzaje wyników",
                        ResultTypesDescription: "Dodaj tutaj szablony dla znalezionych elementów stosowanych pod jednym lub wieloma warunkami. Warunki są obliczane w zadanej kolejności a zewnętrzne szablony mają pierwszeństwo przez szablonami inline. Upewnij się, że pola źródła wyników są widoczne w odpowiedzi.",
                        InlineTemplateContentLabel: "Szablon inline",
                        EditResultTypesLabel: "Edytuje typy wyników",
                        ConditionPropertyLabel: "Pole źródła danych",
                        ConditionValueLabel: "Wartość warunku",
                        CondtionOperatorValue: "Operator",
                        ExternalUrlLabel: "Adres URL zewnętrznego szablonu",
                        EqualOperator: "Równe",
                        NotEqualOperator: "Różne",
                        ContainsOperator: "Zawiera",
                        StartsWithOperator: "Zaczyna się od",
                        NotNullOperator: "Nie puste",
                        GreaterOrEqualOperator: "Większe lub równe",
                        GreaterThanOperator: "Większe niż",
                        LessOrEqualOperator: "Mniejsze lub równe",
                        LessThanOperator: "Mniejsze niż",
                        CancelButtonText: "Anuluj",
                        DialogButtonText: "Edytuj szablon",
                        DialogTitle: "Edytuj szablon wyników",
                        SaveButtonText: "Zapisz"
                    },
                    AllowItemSelection: "Zezwalaj na wybór przedmiotów",
                    AllowMultipleItemSelection: "Zezwalaj na wielokrotny wybór",
                    SelectionModeLabel: "Tryb wyboru",
                    AsTokensSelectionMode: "Przetwarzaj wybrane wartości jako tokeny (tryb ręczny)",
                    AsDataFiltersSelectionMode: "Przetwarzaj wybrane wartości jako filtry (tryb domyślny)",
                    AsDataFiltersDescription: "W tym trybie wybrane wartości są wysyłane do źródła danych jako zwykłe filtry",
                    AsTokensDescription: "W tym trybie wybrane wartości są używane ręcznie za pomocą tokenów i dostępnych metod. Przykład z szablonem zapytania wyszukiwania SharePoint: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "Operator logiczny do użycia między wybranymi wartościami",
                    FieldToConsumeLabel: "Pole źródłowe do wykorzystania",
                    FieldToConsumeDescription: "Użyj tej wartości pola dla wybranych elementów"
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Konfiguracja hosta"
                }                
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Dostępne połączenia",
                UseFiltersWebPartLabel: "Połącz ze składnikiem Web Part filtrowania",
                UseFiltersFromComponentLabel: "Użyj filtrów z tego komponentu",
                UseDynamicFilteringsWebPartLabel: "Connect to a search results Web Part",
                UseDataResultsFromComponentsLabel: "Use data from this Web Part",
                UseDataResultsFromComponentsDescription: "Use data from selected items in these Web Parts",
                UseSearchVerticalsWebPartLabel: "Połącz ze składnikiem Web Part Wertykały",
                UseSearchVerticalsFromComponentLabel: "Użyj wertykałów z tego komponentu",
                LinkToVerticalLabel: "Pokaż dane tylko jeśli następujący wertykał jest wybrany",
                LinkToVerticalLabelHoverMessage: "Wyniki będą wyświetlany tylko gdy wybrany wertykał będzie pasował do skonfigurowanego dla tego składnika Web Part. W przeciwnym przypadku pozostanie pusty w trybie wyświetlania.",
                UseInputQueryText: "Użyj wejściowego tekstu zapytania",
                UseInputQueryTextHoverMessage: "Użyj tokenu {searchQueryText} w źródle danych aby pozyskać tą wartość",
                SearchQueryTextFieldLabel: "Tekst zapytania",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Wprowadź zapytanie...",
                InputQueryTextStaticValue: "Wartość statyczna",
                InputQueryTextDynamicValue: "Wartość dynamiczna",
                SearchQueryTextUseDefaultQuery: "Użyj wartości domyślnej",
                SearchQueryTextDefaultValue: "Wartość domyślna",
                SourceDestinationFieldLabel: "Nazwa pola docelowego",
                SourceDestinationFieldDescription: "Pole docelowe do użycia w tym składniku Web Part w celu dopasowania wybranych wartości",
                AvailableFieldValuesFromResults: "Pole zawierające wartość filtra"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfiguruj biblioteki rozszerzalności ładowane przy starcie.",
                    PanelDescription: "Dodaj/Usuń identyfikatory niestandardowych bibliotek rozszerzalności. Wybierz nazwę i zdecyduj czy mają być ładowane przy starcie. Tylko niestandardowe źródł danych, układy, komponenty web i Handlebars będą tutaj ładowani.",
                },
                EnableTelemetryLabel: "Telemetria PnP",
                EnableTelemetryOn: "Włącz telemetrię",
                EnableTelemetryOff: "Wyłącz telemetrię"
            },
            CustomQueryModifier: {
                  EditQueryModifiersLabel: "Konfiguracja dostępnych niestandardowych modyfikatorów zapytań",
                  QueryModifiersLabel: "Własne modyfikatory zapytań",
                  QueryModifiersDescription: "Włączanie lub wyłączanie poszczególnych własnych modyfikatorów zapytań",
                  EnabledPropertyLabel: "Włączone",
                  ModifierNamePropertyLabel: "Nazwa",
                  ModifierDescriptionPropertyLabel: "Opis",
                  EndWhenSuccessfullPropertyLabel:"Zakończ po pomyślnym zakończeniu"              
            }
        }
    }
});