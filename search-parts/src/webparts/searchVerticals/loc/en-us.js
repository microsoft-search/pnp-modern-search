define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Search Verticals Web Part",
        PlaceHolder: {
          EditLabel: "Edit",
          IconText: "Search Verticals Web Part by @pnp",
          Description: "Allows to browse data as verticals (i.e silos). This Web Part is intended to be connected to 'Search Results' Web Parts on the page.",
          ConfigureBtnLabel: "Configure"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Search Verticals configuration",
        Verticals: {
          PropertyLabel: "Search Verticals",
          PanelHeader: "Configure search verticals",
          PanelDescription: "Add a new vertical to allow users to search in a predefined scope or data source. To use it, you must connect this Web Part to one or more 'Search Results' Web Parts as verticals control visibility over connected components.",
          ButtonLabel: "Configure verticals",
          DefaultVerticalQueryStringParamLabel: "Query string parameter to use to select a vertical tab by default",
          DefaultVerticalQueryStringParamDescription: "The match will be done against the tab name or the current page URL (if the tab is an hyperlink)",
          Fields: {
            TabName: "Tab name",
            TabValue: "Tab value",
            IconName: "Fluent UI icon name",
            IsLink: "Is hyperlink",
            LinkUrl: "Link URL",
            ShowLinkIcon: "Show link icon",
            OpenBehavior: "Open behavior"
          }
        }
      }
    }
  });