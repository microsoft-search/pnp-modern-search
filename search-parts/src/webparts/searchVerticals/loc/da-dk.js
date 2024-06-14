define([], function() {
  return {
    General: {
      WebPartDefaultTitle: "Søgevertikal-webpart",
      PlaceHolder: {
        EditLabel: "Redigere",
        IconText: "Search Verticals Web Part af @pnp",
        Description: "Giver mulighed for at gennemse data som vertikaler/faner (dvs. siloer). Denne webdel er beregnet til at blive forbundet med 'Søgeresultater' webdele på siden.",
        ConfigureBtnLabel: "Konfigurer"
      }
    },
    PropertyPane: {
      SearchVerticalsGroupName: "Konfiguration af søgevertikaler",
      Verticals: {
        PropertyLabel: "Datavertikaler",
        PanelHeader: "Konfigurér datavertikaler",
        PanelDescription: "Tilføj en ny vertikal for at give brugere mulighed for søge i en predefineret datakilde eller scope.",
        ButtonLabel: "Konfigurér vertikaler",
        DefaultVerticalQueryStringParamLabel: "Query-strengparameter til brug for at vælge en vertikal fane som standard",
        DefaultVerticalQueryStringParamDescription: "Matchningen vil blive udført mod fane-navnet eller den aktuelle side-URL (hvis fanen er et hyperlink)",
        Fields: {
          TabName: "Navn på fane",
          IconName: "Fluent UI ikonnavn",
          IsLink: "Er hyperlink",
          LinkUrl: "Link til URL",
          OpenBehavior: "Åben adfærd",
          TabValue: "Tab-værdi",
          ShowLinkIcon: "Vis linkikon",
          Audience: "Målgruppe"
        },
        AudienceInputPlaceholderText: "Søg efter en gruppe",
        AudienceNoResultsFound: "Vi fandt ingen matchende grupper.",
        AudienceLoading: "Indlæser grupper..."
      }
    }
  }
});