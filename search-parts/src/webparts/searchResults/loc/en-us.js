define([], function() {
  return {
    General: {
      PlaceHolder: {
        EditLabel: "Edit",
        IconText: "Search Results Web Part by @PnP",
        Description: "Displays search results from SharePoint or Microsoft search.",
        ConfigureBtnLabel: "Configure"
      },
      WebPartDefaultTitle: "Search Results Web Part",
      ShowBlankEditInfoMessage: "No result returned for this query. This Web Part will remain blank in display mode according to parameters.",
      CurrentVerticalNotSelectedMessage: "The current selected vertical does not match with the one associated for this Web Part. It will remains blank in display mode."
    },
    PropertyPane: {
      DataSourcePage: {
        DataSourceConnectionGroupName: "Available data sources",
        PagingOptionsGroupName: "Paging options",
        ItemsCountPerPageFieldName: "Number of items per page",
        PagingRangeFieldName: "Number of pages to display in range",
        ShowPagingFieldName: "Show paging",
        HidePageNumbersFieldName: "Hide page numbers",
        HideNavigationFieldName: "Hide navigation buttons (prev page, next page)",
        HideFirstLastPagesFieldName: "Hide first/last navigation buttons",
        HideDisabledFieldName: "Hide navigation buttons (prev, next, first, last) if they are disabled.",
        TemplateSlots: {
          GroupName: "Layout slots",
          ConfigureSlotsLabel: "Edit layout slots for this data source",
          ConfigureSlotsBtnLabel: "Customize",
          ConfigureSlotsPanelHeader: "Layout slots",
          ConfigureSlotsPanelDescription: "Add here the slots to be used for the different layouts. A slot is a placeholder variable that you put in your templates where the value will be dynamically subsituted by a data source field value. This way, your templates become more generic and reusable regardless the data source specific fields. To use them, use the `{{slot item @root.slots.<SlotName>}}` Handlebars expression.",
          SlotNameFieldName: "Slot name",
          SlotFieldFieldName: "Slot field",
          SlotFieldPlaceholderName: "Choose a field"
        }
      },
      LayoutPage: {
        LayoutSelectionGroupName: "Available layouts",
        LayoutTemplateOptionsGroupName: "Layout options",
        CommonOptionsGroupName: "Common",
        TemplateUrlFieldLabel: "Use an external template URL",
        TemplateUrlPlaceholder: "https://myfile.html",
        ErrorTemplateExtension: "The template must be a valid .htm or .html file",
        ErrorTemplateResolve: "Unable to resolve the specified template. Error details: '{0}'",
        DialogButtonLabel: "Edit results template",
        DialogTitle: "Edit results template",
        ShowSelectedFilters: "Show selected filters",
        ShowBlankIfNoResult: "Hide this web part if there's nothing to show",
        ShowResultsCount: "Show results count",
        UseMicrosoftGraphToolkit: "Use Microsoft Graph Toolkit",
        ResultTypes: {
          ResultTypeslabel: "Result Types",
          ResultTypesDescription: "Add here the templates to use for result items according to one ore more conditions. Conditions are evaluated in the configured order and external templates take precedence over inline templates. Also make sure the data source fields you use are present in data response.",
          InlineTemplateContentLabel: "Inline template",
          EditResultTypesLabel: "Edit result types",
          ConditionPropertyLabel: "Data source field",
          ConditionValueLabel: "Condition Value",
          CondtionOperatorValue: "Operator",
          ExternalUrlLabel: "External template URL",
          EqualOperator: "Equals",
          NotEqualOperator: "Not equals",
          ContainsOperator: "Contains",
          StartsWithOperator: "Starts with",
          NotNullOperator: "Is not null",
          GreaterOrEqualOperator: "Greater or equal",
          GreaterThanOperator: "Greater than",
          LessOrEqualOperator: "Less or equal",
          LessThanOperator: "Less than",
          CancelButtonText: "Cancel",
          DialogButtonLabel: "Edit template",
          DialogButtonText: "Edit template",
          DialogTitle: "Edit results template",
          SaveButtonText: "Save"
        }
      },
      ConnectionsPage: {
        ConnectionsPageGroupName: "Available connections",
        UseFiltersWebPartLabel: "Connect to a filters Web Part",
        UseFiltersFromComponentLabel: "Use filters from this component",
        UseSearchVerticalsWebPartLabel: "Connect to a verticals Web Part",
        UseSearchVerticalsFromComponentLabel: "Use verticals from this component",
        LinkToVerticalLabel: "Display data only when the following vertical is selected",
        LinkToVerticalLabelHoverMessage: "The results will be displayed only if the selected vertical matches with the one configured for this Web Part. Otherwise, the Web part will be blank (no margin and no padding) in display mode.",
        UseInputQueryText: "Use input query text",
        UseInputQueryTextHoverMessage: "Use the {searchQueryText} token in your data source to retrieve this value",
        SearchQueryTextFieldLabel: "Query text",
        SearchQueryTextFieldDescription: "",
        SearchQueryPlaceHolderText: "Enter query text...",
        InputQueryTextStaticValue: "Static value",
        InputQueryTextDynamicValue: "Dynamic value",
        SearchQueryTextUseDefaultQuery: "Use a default value",
        SearchQueryTextDefaultValue: "Default value"
      },
      InformationPage: {
        Extensibility: {
          PanelHeader: "Configure extensibility libraries to load at startup.",
          PanelDescription: "Add/Remove your custom extensibility library IDs here. You can specify a display name and decide if the library should be loaded or not at startup. Only custom data sources, layouts, web components and Handlebars helpers will be loaded here.",
        }
      }
    }
  }
});