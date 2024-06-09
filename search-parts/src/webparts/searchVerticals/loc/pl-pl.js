define([], function() {
    return {
            General: {
                WebPartDefaultTitle: "Web Part Wertykały",
                PlaceHolder: {
                    EditLabel: "Edytować",
                    IconText: "Składnik Web Part branż danych autorstwa @pnp",
                    Description: "Pozwala na przeglądanie danych jako wertykalnych (tj. silosów). Ten składnik Web Part jest przeznaczony do łączenia ze składnikami Web Part „Wyniki wyszukiwania” na stronie.",
                    ConfigureBtnLabel: "Konfiguruj"
                }            
            },
            PropertyPane: {
                SearchVerticalsGroupName: "Konfiguracja Wertykałów",
                Verticals: {
                    PropertyLabel: "Wertykały",
                    PanelHeader: "Konfiguruj wertykały",
                    PanelDescription: "Dodaj nowy wertykał aby umożliwić wyszukiwanie w zadanym zakresie lub źródle.",
                    ButtonLabel: "Konfiguruj wertykały",
                    DefaultVerticalQueryStringParamLabel: "Parametr ciągu zapytań do użycia do wybrania zakładki wertykalnej domyślnie",
                    DefaultVerticalQueryStringParamDescription: "Dopasowanie zostanie wykonane do nazwy karty lub bieżącego adresu URL strony (jeśli karta jest hiperłączem)",
                    Fields: {
                        TabName: "Nazwa karty",
                        IconName: "Nazwa ikony Fluent UI",
                        IsLink: "Jest hiperłączem",
                        LinkUrl: "Łącze URL",
                        OpenBehavior: "Sposób otwierania",
                        TabValue: "Wartość tabulatora",
                        ShowLinkIcon: "Pokaż ikonę linku",
                        Audience: "Odbiorcy"
                },
                AudienceInputPlaceholderText: "Wyszukaj grupę",
                AudienceNoResultsFound: "Nie znaleźliśmy pasujących grup.",
                AudienceLoading: "Ładowanie grup..."
            }
        }
    }
});