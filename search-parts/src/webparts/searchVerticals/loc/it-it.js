define([], function () {
    return {
        General: {
            WebPartDefaultTitle: "Web Part dei Verticali di Ricerca",
            PlaceHolder: {
                EditLabel: "Modifica",
                IconText: "Web Part dei Verticali di Ricerca di @pnp",
                Description: "Permette di navigare nei dati come verticali (ad esempio silos). Questa Web Part è destinata ad essere collegata alle Web Parts 'Risultati di Ricerca' sulla pagina.",
                ConfigureBtnLabel: "Configura"
            }
        },
        PropertyPane: {
            SearchVerticalsGroupName: "Configurazione dei Verticali di Ricerca",
            Verticals: {
                PropertyLabel: "Verticali di Ricerca",
                PanelHeader: "Configura verticali di ricerca",
                PanelDescription: "Aggiungi un nuovo verticale per consentire agli utenti di cercare in un ambito o una fonte di dati predefiniti. Per utilizzarlo, devi collegare questa Web Part ad una o più Web Parts 'Risultati di Ricerca' poiché i verticali controllano la visibilità sui componenti collegati.",
                ButtonLabel: "Configura verticali",
                DefaultVerticalQueryStringParamLabel: "Parametro della stringa di query da utilizzare per selezionare una scheda verticale per impostazione predefinita",
                DefaultVerticalQueryStringParamDescription: "La corrispondenza verrà fatta con il nome della scheda o l'URL della pagina corrente (se la scheda è un hyperlink)",
                Fields: {
                    TabName: "Nome scheda",
                    TabValue: "Valore scheda",
                    IconName: "Nome icona Fluent UI",
                    IsLink: "È un hyperlink",
                    LinkUrl: "URL del link",
                    ShowLinkIcon: "Mostra icona del link",
                    OpenBehavior: "Comportamento di apertura",
                    Audience: "Pubblico"
                },
                AudienceInputPlaceholderText: "Cerca un gruppo",
                AudienceNoResultsFound: "Non abbiamo trovato gruppi corrispondenti.",
                AudienceLoading: "Caricamento gruppi..."
            }
        }
    }
});