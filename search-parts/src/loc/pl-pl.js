define([], function() {
  return {
      Tokens: {
          SelectTokenLabel: "Wybierz token...",
          Context: {
              ContextTokensGroupName: "Tokeny kontekstowe",
              SiteAbsoluteUrl: "Absolutny adres URL kolekcji witryn",
              SiteRelativeUrl: "Relatywny adres URL kolekcji witryn",
              WebAbsoluteUrl: "Absolutny adres URL witryny",
              WebRelativeUrl: "Relatywny adres URL witryny",
              WebTitle: "Tytuł witryny",
              InputQueryText: "Wprowadź tekst zapytania"
          },
          Custom: {
              CustomTokensGroupName: "Wartość niestandardowa",
              CustomValuePlaceholder: "Wprowadź wartość...",
              InvalidtokenFormatErrorMessage: "Proszę wprowadzić poprawny format tokenu używając '{' oraz '}'. (na przykład: {Today})"
          },
          Date: {
              DateTokensGroupName: "Tokeny dat",
              Today: "Dziś",
              Yesterday: "Wczoraj",
              Tomorrow: "Jutro",
              OneWeekAgo: "Tydzień temu",
              OneMonthAgo: "Miesiąc temu",
              OneYearAgo: "Rok temu"
          },
          Page: {
              PageTokensGroupName: "Tokeny strony",
              PageId: "Identyfikator strony",
              PageTitle: "Tytuł strony",
              PageCustom: "Inna kolumna strony",
          },
          User: {
              UserTokensGroupName: "Tokeny użytkownika",
              UserName: "Nazwa użytkownika",
              Me: "Ja",
              UserDepartment: "Departament użytkownika",
              UserCustom: "Właściwość niestandardowa"
          }
      },
      General: {
          OnTextLabel: "Włączone",
          OffTextLabel: "Wyłączone",
          StaticArrayFieldName: "Tablica jako pole",
          About: "O produkcie",
          Authors: "Autorzy",
          Version: "Wersja",
          InstanceId: "Identyfikator instancji składnika Web Part",
          Resources: {
              GroupName: "Zasoby",
              Documentation: "Dokumentacja",
              PleaseReferToDocumentationMessage: "Proszę zapoznać się z oficjalną dokumentacją."
          },
          Extensibility: {
              InvalidDataSourceInstance: "Wybrane źródło danych '{0}' nie implementuje poprawnie klasy abstrakcyjnej 'BaseDataSource'. Brakuje niektórych metod.",
              DataSourceDefinitionNotFound: "Nie znaleziono niestandardowego źródła danych o kluczu '{0}'. Upewnij się, że rozwiązanie jest poprawnie wdrożone do katalogu aplikacji oraz ID manifetu jest zarejetrowany dla tego składnika Web Part.",
              LayoutDefinitionNotFound: "Nie znaleziono niestandardowego układu o kluczu '{0}'. Upewnij się, że rozwiązanie jest poprawnie wdrożone do katalogu aplikacji oraz ID manifetu jest zarejetrowany dla tego składnika Web Part.",
              InvalidLayoutInstance: "Wybrane układ '{0}' nie implementuje poprawnie klasy abstrakcyjnej 'BaseLayout'. Brakuje niektórych metod.",
              DefaultExtensibilityLibraryName: "Domyślna biblioteka rozszerzalności",
              InvalidProviderInstance: "Wybrany dostawca sugestii '{0}' nie implementuje poprawnie abstrakcyjnej klasy 'BaseSuggestionProvider'. Brakuje niektórych metod.",
              ProviderDefinitionNotFound: "Nie znaleziono niestandardowego dostawcy sugestii o kluczu '{0}'. Upewnij się, że rozwiązanie jest poprawnie wdrożone do katalogu aplikacji oraz ID manifetu jest zarejetrowany dla tego składnika Web Part.",
              QueryModifierDefinitionNotFound: "Nie znaleziono niestandardowego modyfikatora zapytania z kluczem '{0}'. Upewnij się, że rozwiązanie jest poprawnie wdrożone do katalogu aplikacji i identyfikatora manifestu zarejestrowanego dla tej części Web Part.",
              InvalidQueryModifierInstance: "Wybrany niestandardowy queryModifier '{0}' nie implementuje poprawnie klasy abstrakcyjnej 'BaseQueryModifier'. Brakuje niektórych metod."
          },
          DateFromLabel: "Od",
          DateTolabel: "Do",
          DatePickerStrings: {
              months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
              shortMonths: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
              days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
              shortDays: ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'],
              goToToday: 'Dziś',
              prevMonthAriaLabel: 'Poprzedni miesiąc',
              nextMonthAriaLabel: 'Następny miesiąć',
              prevYearAriaLabel: 'Poprzedni rok',
              nextYearAriaLabel: 'Następny rok',
              closeButtonAriaLabel: 'Zamknij wybór daty',
              isRequiredErrorMessage: 'Data początkowa jest wymagana.',
              invalidInputErrorMessage: 'Nieprawidłowy format daty.'
          },
          DateIntervalStrings: {
            AnyTime: "Kiedykolwiek",
            PastDay: "Ostatnie 24 godziny",
            PastWeek: "Od ostatnich 24 godzin do zeszłego tygodnia",
            PastMonth: "Od ostatniego tygodnia do ostatniego miesiąca",
            Past3Months: "Od ostatniego miesiąca do ostatnich 3 miesięcy",
            PastYear: "Od ostatnich 3 miesięcy do zeszłego roku",
            Older: "Starsze niż rok"
          },
          SameTabOpenBehavior: "Użyj bieżącej karty",
          NewTabOpenBehavior: "Otwórz w nowej karcie",
          PageOpenBehaviorLabel: "Sposób otwierania",
          EmptyFieldErrorMessage: "To pole nie może być puste",
          TagPickerStrings: {
            NoResultsSearchMessage: "Nie znaleziono wyników",
            SearchPlaceholder: "Wyszukaj wartość..."
          },
          CurrentVerticalNotSelectedMessage: "Aktualnie wybrana branża nie odpowiada branżom powiązanym z tym składnikiem Web Part ({0}). W trybie wyświetlania pozostanie puste."
      },
      DataSources: {
          SharePointSearch: {
              SourceName: "SharePoint Search",
              SourceConfigurationGroupName: "Konfiguracja źródła",
              QueryTextFieldLabel: "Tekst zapytania",
              QueryTextFieldInfoMessage: "Użyj karty <strong>Dostępne połączenia</strong> konfiguracji składnika Web Part aby wskazać wartość statyczną lub wartość dynamiczną z komponentu na stronie, jak na przykład searchbox",
              QueryTemplateFieldLabel: "Szablon zapytania",
              QueryTemplatePlaceHolderText: "przykładowo: Path:{Site}",
              QueryTemplateFieldDescription: "Szablon zapytania. Możesz używać {<tokeny>} aby zbudować dynamiczne zapytanie.",
              ResultSourceIdLabel: "Źródła wyników  Id / Poziom|Nazwa",
              ResultSourceIdDescription: "Wybierz wbudowane źródło, wpisz niestandardowy GUID źródła lub POZIOM i NAZWA źródła oddzielone znakiem | (np. SPSite|News). Prawidłowe zakresy to [SPSiteSubscription, SPSite, SPWeb]. Naciśnij [Enter], aby zapisać.",
              InvalidResultSourceIdMessage: "Wprowadzona wartość nie jest poprawnym GUID lub jest sformatowana jako Poziom|Nazwa",
              EnableQueryRulesLabel: "Włącz reguły zapytania",
              RefinementFilters: "Filtry zawężające",
              RefinementFiltersDescription: "Początkowe filtry zawężające stosowane do zapytania. Nie pojawią się one w wybranych filtrach. Dla wyrażeń tekstowych, używaj cudzysłowów (\") zamiast apostrofów (').",
              EnableLocalizationLabel: "Włącz lokalizację",
              EnableLocalizationOnLabel: "Włączone",
              EnableLocalizationOffLabel: "Wyłączone",
              QueryCultureLabel: "Język dla zapytań wyszukiwania",
              QueryCultureUseUiLanguageLabel: "Użyj języka interfejsu",
              SelectedPropertiesFieldLabel: "Wybrane właściwości",
              SelectedPropertiesFieldDescription: "Wskaż właściwości do pobrania.",
              SelectedPropertiesPlaceholderLabel: "Wybierz właściwości",
              HitHighlightedPropertiesFieldLabel: "Właściwości wyróżnionych trafień",
              HitHighlightedPropertiesFieldDescription: "Podaj listę właściwości zarządzanych w celu wyróżniania trafień.",
              TermNotFound: "(Nie znaleziono terminu o identyfikatorze '{0}')",
              ApplyQueryTemplateBtnText: "Zastosuj",
              EnableAudienceTargetingTglLabel: "Włącz audiencje",
              TrimDuplicates: "Przytnij duplikaty",
              CollapseSpecificationLabel: "Zwiń specyfikację"
          },
          MicrosoftSearch: {
              QueryTextFieldLabel: "Tekst zapytania",
              QueryTextFieldInfoMessage: "Użyj karty <strong>Dostępne połączenia</strong> konfiguracji składnika Web Part aby wskazać wartość statyczną lub wartość dynamiczną z komponentu na stronie, jak na przykład searchbox",
              SourceName: "Microsoft Search",
              SourceConfigurationGroupName: "Microsoft Search",
              EntityTypesField: "Typy encji do wyszukania",
              SelectedFieldsPropertiesFieldLabel: "Wybrane pola",
              SelectedFieldsPropertiesFieldDescription: "Wskaż właściwości do pobrania.",
              SelectedFieldsPlaceholderLabel: "Wybierz pola",
              EnableTopResultsLabel: "Włącz najlepsze wyniki",
              ContentSourcesFieldLabel: "Źródła zawartości",
              ContentSourcesFieldDescriptionLabel: "Identyfikatory połączeń zdefiniowanych w portalu administracyjnym Microsoft Search.",
              ContentSourcesFieldPlaceholderLabel: "przykładowo: 'MyCustomConnectorId'",
              EnableSuggestionLabel: "Włącz sugestie pisowni",
              EnableModificationLabel: "Włącz modyfikacje pisowni",
              QueryTemplateFieldLabel: "Modyfikator zapytania",
              QueryTemplatePlaceHolderText: "ex: {searchTerms} IsDocument:true",
              QueryTemplateFieldDescription: "Szablon modyfikatora wyszukiwania. Możesz również użyć {<tokenów>} i KQL do zbudowania dynamicznego zapytania. Wszystko jest połączone z inputQueryText",
              ApplyQueryTemplateBtnText: "Zastosuj",
              UseBetaEndpoint: "Użyj punktu końcowego wersji beta",
              TrimDuplicates: "Przytnij duplikaty",
              CollapseProperties: {
                  EditCollapsePropertiesLabel: "Edytuj ustawienia zwijania",
                  CollapsePropertiesDescription: "Określ ustawienia zwijania wyników wyszukiwania. Możesz wybrać pole z listy rozwijanej (tylko jeśli dane ze źródła danych zostały już pobrane) lub wpisać własną wartość niestandardową (naciśnij „Enter”, aby zapisać wpis)",
                  CollapsePropertiesPropertyPaneFieldLabel: "Ustawienia zwinięcia",
                  CollapseLimitFieldLabel: "Limit",
                  CollapsePropertiesFieldColumnPlaceholder: "Zwiń według pola"
              }
          },
          SearchCommon: {
              Sort: {
                  SortPropertyPaneFieldLabel: "Kolejność sortowania",
                  SortListDescription: "Wybierz początkowy porzdek sortowania. Możesz wskazać pole z listy rozwijalnej (tylko jeśli dane zostały już pobrane) lub wprowadzić własną wartość niestandardową (naciśnij 'Enter' aby zapisać)",
                  SortDirectionAscendingLabel: "Rosnąco",
                  SortDirectionDescendingLabel: "Malejąco",
                  SortErrorMessage: "Nieprawidłowa właściwość wyszukiwania (sprawdź czy właściwość jest sortowalna).",
                  SortPanelSortFieldLabel: "Sortowanie po polu",
                  SortPanelSortFieldAria: "Sortowanie po",
                  SortPanelSortFieldPlaceHolder: "Sortowanie po",
                  SortPanelSortDirectionLabel: "Kierunek sortowania",
                  SortDirectionColumnLabel: "Kierunek",
                  SortFieldColumnLabel: "Nazwa pola",
                  SortFieldDefaultSortLabel: "Sortowanie domyślne",
                  SortFieldFriendlyNameLabel: "Wyświetlana nazwa pola sortowania",
                  SortFieldUserSortLabel: "Sortowanie użytkowników",
                  EditSortLabel: "Edytuj porządek sortowania",
                  SortInvalidSortableFieldMessage: "Ta właściwość nie jest sortowalna",
                  SortFieldColumnPlaceholder: "Wybierz pole..."
              }
          }
      },
      Controls: {
          TextDialogButtonText: "Dodaj wyrażenie Handlebars",
          TextDialogTitle: "Edytuj wyrażenie Handlebars",
          TextDialogCancelButtonText: "Anuluj",
          TextDialogSaveButtonText: "Zapisz",
          SelectItemComboPlaceHolder: "Wybierz właściwość",
          AddStaticDataLabel: "Dodaj dane statyczne",
          TextFieldApplyButtonText: "Zastosuj",
          SortByPlaceholderText: "Sortuj według...",
          SortByDefaultOptionText: "Domyślna"
      },
      Layouts: {
          Debug: {
              Name: "Diagnostyczny"
          },
          CustomHandlebars: {
            Name: "Niestandardowy"
          },
          CustomAdaptiveCards: {
            Name: "Niestandardowy"
          },
          SimpleList: {
              Name: "Lista",
              ShowFileIconLabel: "Pokaż ikonę pliku",
              ShowItemThumbnailLabel: "Pokaż miniaturę"
          },
          DetailsList: {
              Name: "Lista ze szczegółami",
              UseHandlebarsExpressionLabel: "Użyj wyrażenia Handlebars",
              MinimumWidthColumnLabel: "Minimalna szerokość (px)",
              MaximumWidthColumnLabel: "Maksymalna szerokość (px)",
              SortableColumnLabel: "Sortowalne",
              ResizableColumnLabel: "Skalowalne",
              MultilineColumnLabel: "Wieloliniowe",
              LinkToItemColumnLabel: "Łącze do elementu",
              CompactModeLabel: "Tryb kompaktowy",
              ShowFileIcon: "Pokaż ikonę pliku",
              ManageDetailsListColumnDescription: "Dodawaj, usuwaj i aktualizuj kolumny układu listy ze szczegółami. Możesz używać wartości pól bezpośrednio bez żadnych przekształceń lub użyć wyrażeń Handlebars. HTML jest wspierany przez wszystkie pola.",
              ManageDetailsListColumnLabel: "Zarządzaj kolumnami",
              ValueColumnLabel: "Wartość kolumny",
              ValueSortingColumnLabel: "Wybierz pole sortowania...",
              ValueSortingColumnNoFieldsLabel: "Brak dostępnych pól",
              DisplayNameColumnLabel: "Nazwa wyświetlana kolumny",
              FileExtensionFieldLabel: "Pole używane dla rozszerzenia pliku",
              GroupByFieldLabel: "Grupuj po polu",
              EnableGrouping: "Grupowanie włączone",
              GroupingDescription: "Upewnij się, że dane są wyświetlane w wynikowym składniku Web Part, aby wyświetlić listę właściwości.",
              CollapsedGroupsByDefault: "Pokaż zapadnięte",
              ResetFieldsBtnLabel: "Resetuj pola do wartości domyślnych"
          },
          Cards: {
              Name: "Karty",
              ManageTilesFieldsLabel: "Pola kart",
              ManageTilesFieldsPanelDescriptionLabel: "Tutaj możesz przyporządkować wartości pól do symboli zastępczych (placeholders). Możesz używać wartości pól bezpośrednio bez żadnych przekształceń lub użyć wyrażeń Handlebars. Również możesz umieścić własny kod HTML w polach z adnotacjami.",
              PlaceholderNameFieldLabel: "Nazwa",
              SupportHTMLColumnLabel: "Zezwalaj na HTML",
              PlaceholderValueFieldLabel: "Wartość",
              UseHandlebarsExpressionLabel: "Użyj wyrażenia Handlebars",
              EnableItemPreview: "Włącz podgląd wyniku",
              EnableItemPreviewHoverMessage: "Włączenie tej opcji może mieć skutki wydajnościowe jeśli będzie widocznych zbyt wiele elementów używających slotu 'AutoPreviewUrl'. Rekomenduje się użyte tej opcji tylko dl małych ilości elementów lub użycie predefiniowanych URL podglądu ze źródła danych w slotach.",
              ShowFileIcon: "Pokaż ikonę pliku",
              CompactModeLabel: "Tryb kompaktowy",
              PreferedCardNumberPerRow: "Preferowana liczba kart na wiersz",
              Fields: {
                  Title: "Tytuł",
                  Location: "Lokalizacja",
                  Tags: "Tagi",
                  PreviewImage: "Obraz podglądu",
                  PreviewUrl: "URL podglądu",
                  Url: "URL",
                  Date: "Data",
                  Author: "Autor",
                  ProfileImage: "URL obrazu profilu",
                  FileExtension: "Rozszerzenie pliku",
                  IsContainer: "Jest folderem"
              },
              ResetFieldsBtnLabel: "Resetuj pola do wartości domyślnych"
          },
          Slider: {
              Name: "Slajder",
              SliderAutoPlay: "Autoodtwarzanie",
              SliderAutoPlayDuration: "Czas autoodtwarzania (w sekundach)",
              SliderPauseAutoPlayOnHover: "Pauza podczas wskazania",
              SliderGroupCells: "Liczba elementów grupowanych na slajdach",
              SliderShowPageDots: "Pokaż kropki",
              SliderWrapAround: "Nieskończone przewijanie",
              SlideHeight: "Wysokość slajdu (w pikselach)",
              SlideWidth: "Szerokość slajdu (w pikselach)"
          },
          People: {
              Name: "Osoba",
              ManagePeopleFieldsLabel: "Zarządzaj polami",
              ManagePeopleFieldsPanelDescriptionLabel: "Tutaj możesz przyporządkować wartości pól do symboli zastępczych (placeholders). Możesz używać wartości pól bezpośrednio bez żadnych przekształceń lub użyć wyrażeń Handlebars.",
              PlaceholderNameFieldLabel: "Nazwa",
              PlaceholderValueFieldLabel: "Wartość",
              UseHandlebarsExpressionLabel: "Użyj wyrażenia Handlebars",
              PersonaSizeOptionsLabel: "Rozmiar komponentu",
              PersonaSizeExtraSmall: "Bardzo mały",
              PersonaSizeSmall: "Mały",
              PersonaSizeRegular: "Standardowy",
              PersonaSizeLarge: "Duży",
              PersonaSizeExtraLarge: "Bardzo duży",
              ShowInitialsToggleLabel: "Pokaż inicjały jeśli zdjęcie nie jest dostępne",
              SupportHTMLColumnLabel: "Zezwalaj na HTML",
              ResetFieldsBtnLabel: "Resetuj pola do wartości domyślnych",
              ShowPersonaCardOnHover: "Pokaż kartę po wskazaniu",
              ShowPersonaCardOnHoverCalloutMsg: "Ta funkcja używa Microsoft Graph aby wyświetlić informacje o użytkowniku i wymaga następujcych uprawnień API: ['User.Read','People.Read','Contacts.Read','User.ReadBasic.All'].",
              Fields: {
                  ImageUrl: "URL obrazu",
                  PrimaryText: "Tekst podstawowy",
                  SecondaryText: "Tekst drugorzędny",
                  TertiaryText: "Tekst trzeciorzędny",
                  OptionalText: "Tekst opcjonalny"
              }
          },
          Vertical: {
              Name: "Pionowo"
          },
          Horizontal: {
              Name: "Poziomo",
              PreferedFilterNumberPerRow: "Preferowana liczba filtrów na wiersz",
          },
          Panel: {
              Name: "Panel",
              IsModal: "Modalny",
              IsLightDismiss: "Lekkie odrzucenie",
              Size: "Rozmiar panelu",
              ButtonLabel: "Pokaż filtry",
              ButtonLabelFieldName: "Etykieta przycisku",
              HeaderText: "Filtry",
              HeaderTextFieldName: "Tekst nagłówka panelu",
              SizeOptions: {
                  SmallFixedFar: 'Małe (domyślnie)',
                  SmallFixedNear: 'Małe, blisko strony',
                  Medium: 'Średnie',
                  Large: 'Duże',
                  LargeFixed: 'Duże (stały rozmiar)',
                  ExtraLarge: 'Bardzo duże',
                  SmallFluid: 'Pełna szerokość (płynnie)'
              }
          }
      },
      HandlebarsHelpers: {
          CountMessageLong: "<b>{0}</b> wyników dla '<em>{1}</em>'",
          CountMessageShort: "<b>{0}</b> wyników",
      },
      PropertyPane: {
          ConnectionsPage: {
              DataConnectionsGroupName: "Dostępne połączenia",
              UseDataVerticalsWebPartLabel: "Użyj pionów z tego komponentu",
              UseDataVerticalsFromComponentLabel: "Użyj pionów z tego komponentu"
          },
          InformationPage: {
              Extensibility: {
                  GroupName: "Konfiguracja rozszerzalności",
                  FieldLabel: "Używane biblioteki rozszerzalności",
                  ManageBtnLabel: "Konfiguruj",
                  Columns: {
                      Name: "Nazwa/Cel",
                      Id: "GUID manifestu",
                      Enabled: "Włączone/Wyłączone"
                  }
              },
              ImportExport: "Importuj / Eksportuj ustawienia"
          }
      },
      Filters: {
          ApplyAllFiltersButtonLabel: "Zastosuj",
          ClearAllFiltersButtonLabel: "Wyczyść",
          FilterNoValuesMessage: "Brak wartości dla tego filtra",
          OrOperator: "LUB",
          AndOperator: "ORAZ",
          ComboBoxPlaceHolder: "Wybierz wartość",
          UseAndOperatorValues: "Använd en AND-operator mellan värden",
          UseOrOperatorValues: "Använd en ELLER-operator mellan värden",
          UseValuesOperators: "Välj operator att använda mellan dessa filtervärden"
      },
      SuggestionProviders: {
          SharePointStatic: {
              ProviderName: "SharePoint Static search suggestions",
              ProviderDescription: "Pobieranie sugestii wyszukiwania SharePoint zdefiniowanych przez użytkownika"
          }
      }
  }
})
