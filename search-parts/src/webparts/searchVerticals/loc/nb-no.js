define([], function() {
    return {
        General: {
            WebPartDefaultTitle: "Søkevertikaler",
            PlaceHolder: {
                EditLabel: "Redigere",
                IconText: "Datavertikaler webdel av",
                Description: "Gjør det mulig å bla gjennom data som vertikaler (dvs. siloer). Denne webdelen er ment å være koblet til 'Søkeresultater' webdeler på siden.",
                ConfigureBtnLabel: "Konfigurer"
            }
        },
        PropertyPane: {
            SearchVerticalsGroupName: "Konfigurer søkevertikaler",
            Verticals: {
                PropertyLabel: "Datavertikaler",
                PanelHeader: "Konfigurer vertikaler",
                PanelDescription: "Legg til ny vertikal som lar brukerne søke i en predefinert avgrensning eller datakilde.",
                ButtonLabel: "Konfigurer vertikaler",
                DefaultVerticalQueryStringParamLabel: "Spørringsstrengparameter for å velge en vertikal fane som standard",
                DefaultVerticalQueryStringParamDescription: "Sammenligningen vil bli utført mot fane-navnet eller gjeldende side-URL (hvis fanen er en hyperkobling)",
                Fields: {
                    TabName: "Fane",
                    IconName: "Fluent UI ikonnavn",
                    IsLink: "Er hyperlenke",
                    LinkUrl: "Lenke-URL",
                    OpenBehavior: "Åpningsbodus",
                    TabValue: "Tab-verdi",
                    ShowLinkIcon: "Vis lenkeikon",
                    Audience: "Målgruppe"
                },
                AudienceInputPlaceholderText: "Søk etter en gruppe",
                AudienceNoResultsFound: "Vi fant ingen matchende grupper.",
                AudienceLoading: "Laster grupper..."
            }
        }
    }
});
