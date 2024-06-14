define([], function() {
    return {
        General: {
            WebPartDefaultTitle: "Sökvertikal webbdel",
            PlaceHolder: {
                EditLabel: "Redigera",
                IconText: "Search Verticals Web Part av @pnp",
                Description: "Tillåter att bläddra i data som vertikaler (dvs silor). Den här webbdelen är avsedd att kopplas till webbdelarna 'Sökresultat' på sidan.",
                ConfigureBtnLabel: "Konfigurera"
            }            
        },
        PropertyPane: {
            SearchVerticalsGroupName: "Konfigurera sökvertikaler",
            Verticals: {
                PropertyLabel: "Datavertikaler",
                PanelHeader: "Konfigurera vertikala data",
                PanelDescription: "Lägg till en ny vertikal så att användare kan söka i en fördefinierad datakälla eller omfattning.",
                ButtonLabel: "Konfigurera",
                DefaultVerticalQueryStringParamLabel: "Frågesträngsparameter att använda för att välja en vertikal flik som standard",
                DefaultVerticalQueryStringParamDescription: "Matchningen kommer att göras mot fliknamnet eller den aktuella sidans URL (om fliken är en hyperlänk)",
                Fields: {
                    TabName: "Fliknamn",
                    IconName: "Fluent UI Fabric ikonnamn",
                    IsLink: "Är hyperlänk",
                    LinkUrl: "Länk URL",
                    OpenBehavior: "Öppningsbeteende",
                    TabValue: "Tab-värde",
                    ShowLinkIcon: "Visa länkikon",
                    Audience: "Målgrupp"
                },
                AudienceInputPlaceholderText: "Sök efter en grupp",
                AudienceNoResultsFound: "Vi hittade inga matchande grupper.",
                AudienceLoading: "Laddar grupper..."
            }
        }
    }
});