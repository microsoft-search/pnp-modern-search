define([], function() {
  return {
    SearchVerticalsGroupName: "Search verticals Einstellungen",
    PlaceHolderEditLabel: "Bearbeiten",
    PlaceHolderConfigureBtnLabel: "Konfigurieren",
    PlaceHolderIconText: "Webpart Search verticals",
    PlaceHolderDescription: "Diese Komponente ermöglicht Ihnen die Suche innerhalb von Geltungsbereichen (d.h. Verticals)",
    SameTabOpenBehavior: "Verwenden Sie die aktuelle Registerkarte",
    NewTabOpenBehavior: "In einer neuen Registerkarte öffnen",
    PageOpenBehaviorLabel: "Öffnungsverhalten",
    PropertyPane: {
      Verticals: {
        PropertyLabel: "Search verticals",
        PanelHeader: "Search verticals konfigurieren",
        PanelDescription: "Fügen Sie neue Search Verticals hinzu, um Benutzern die Suche in einem vordefinierten Bereich zu ermöglichen.",
        ButtonLabel: "Konfigurieren",
        FieldValidationErrorMessage: "Dieses Feld muss ausgefüllt werden",
        Fields: {
          TabName: "Name der Registerkarte",
          QueryTemplate: "Abfrage-Vorlage",
          ResultSource: "ID Suchergebnisquelle",
          IconName: "Office UI Fabric Icon Name",
          IsLink: "Ist ein Link",
          LinkUrl: "Link URL",
          OpenBehavior: "Öffnungsverhalten"
        }
      },
      ShowCounts: {
        PropertyLabel: "Ergebnisanzahl anzeigen"
      },
      DefaultVerticalQuerystringParam: {
        PropertyLabel: "Standard vertical Abfrageparameter"
      },
      SearchResultsDataSource: {
        PropertyLabel: "Mit einem Suchergebnis Webpart verbinden"
      }
    }
  }
});