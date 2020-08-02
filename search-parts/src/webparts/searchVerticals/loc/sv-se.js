define([], function() {
  return {
    SearchVerticalsGroupName: "Inställningar för vertikaler",
    PlaceHolderEditLabel: "Redigera",
    PlaceHolderConfigureBtnLabel: "Konfigurera",
    PlaceHolderIconText: "Sök vertikal webbdel",
    PlaceHolderDescription: "Den här komponenten låter dig söka inom omfattningar (dvs vertikaler)",
    SameTabOpenBehavior: "Använd den nuvarande fliken",
    NewTabOpenBehavior: "Öppna i en ny flik",
    PageOpenBehaviorLabel: "Öppningsbeteende",
    PropertyPane: {
      Verticals: {
        PropertyLabel: "Sök vertikaler",
        PanelHeader: "Konfigurera sökvertikaler",
        PanelDescription: "Lägg till en ny vertikal så att användare kan söka i ett fördefinierat omfattning.",
        ButtonLabel: "Konfigurera",
        FieldValidationErrorMessage: "Detta fält krävs",
        Fields: {
          TabName: "Fliknamn",
          QueryTemplate: "Frågemall",
          ResultSource: "Resultatkälls-id",
          IconName: "Office UI Fabric ikon namn",
          IsLink: "Är hyperlänk",
          LinkUrl: "Länk URL",
          OpenBehavior: "Öppningsbeteende"
        }
      },
      ShowCounts: {
        PropertyLabel: "Visa antal svar"
      },
      DefaultVerticalQuerystringParam: {
        PropertyLabel: "Standard vertikal querystring-parameter"
      },
      SearchResultsDataSource: {
        PropertyLabel: "Anslut till en sökresultats webbdel"
      }
    }
  }
});