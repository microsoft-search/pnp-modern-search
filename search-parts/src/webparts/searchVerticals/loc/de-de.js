define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Such Vertikal Webpart",
        PlaceHolder: {
          EditLabel: "Bearbeiten",
          IconText: "Such Vertikal Webpart von @pnp",
          Description: "Erlaubt die Anzeige von Daten als Vertikale (Silos). Dieses Webpart soll zu bestehenden 'Suchergebnis' Webparts auf der Seite verbunden werden.",
          ConfigureBtnLabel: "Konfigurieren"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Such Vertikal Konfiguration",
        Verticals: {
          PropertyLabel: "Such Vertikal",
          PanelHeader: "Konfiguriere Such Vertikale",
          PanelDescription: "Füge ein neues Vertikal hinzu, welches den Benutzern ermöglicht in einem vorgegebenen Bereich oder Datenquelle zu suchen. Um es zu nutzen muss dieses Webpart mit einem oder mehreren 'Suchergebnis' Webparts über dessen Eigenschaften verbunden werden. ",
          ButtonLabel: "Konfiguriere Vertikale",
          DefaultVerticalQueryStringParamLabel: "Query string Parameter zur automatischen Auswahl eines Vertikals.",
          DefaultVerticalQueryStringParamDescription: "Der Tab Name oder die derzeitige URL (wenn das Tab ein Hyperlink ist) werden dabei verglichen.",
          Fields: {
            TabName: "Tab Name",
            TabValue: "Tab Wert",
            IconName: "Fluent UI Icon Name",
            IsLink: "Ist-Hyperlink",
            LinkUrl: "Link URL",
            ShowLinkIcon: "Zeige Link Icon",
            OpenBehavior: "Öffnungsverhalten"
          }
        }
      }
    }
  });