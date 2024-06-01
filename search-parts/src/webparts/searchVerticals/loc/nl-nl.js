define([], function() {
    return {
        General: {
            WebPartDefaultTitle: "Zoekverticalen webonderdeel",
            PlaceHolder: {
                EditLabel: "Bewerking",
                IconText: "Search Verticals Web Part door @pnp",
                Description: "Maakt het mogelijk om door gegevens te bladeren als verticale lijnen (d.w.z. silo's). Dit webonderdeel is bedoeld om te worden verbonden met de webonderdelen 'Zoekresultaten' op de pagina.",
                ConfigureBtnLabel: "Configureren"
            }
        },
        PropertyPane: {
            SearchVerticalsGroupName: "Zoekverticalen configuratie",
            Verticals: {
                PropertyLabel: "Zoekverticalen",
                PanelHeader: "Configureer zoekverticalen",
                PanelDescription: "Voeg nieuwe zoekverticalen toe zodat gebruikers kunnen zoeken in een voorgedefinieerde scope of databron.",
                ButtonLabel: "Configureer zoekverticalen",
                DefaultVerticalQueryStringParamLabel: "Querystring-parameter om te gebruiken om standaard een verticale tab te selecteren",
                DefaultVerticalQueryStringParamDescription: "De overeenkomst wordt gemaakt met de tabnaam of de huidige paginakoppeling (als de tab een hyperlink is)",
                Fields: {
                    TabName: "Tab naam",
                    IconName: "Fluent UI icoon naam",
                    IsLink: "Is hyperlink",
                    LinkUrl: "Link URL",
                    OpenBehavior: "Gedrag bij openen",
                    TabValue: "Tabwaarde",
                    ShowLinkIcon: "Toon linkpictogram",
                    Audience: "Doelgroep"
                },
                AudienceInputPlaceholderText: "Zoek naar een groep",
                AudienceNoResultsFound: "We hebben geen overeenkomende groepen gevonden.",
                AudienceLoading: "Groepen laden..."
            }
        }
    }
});