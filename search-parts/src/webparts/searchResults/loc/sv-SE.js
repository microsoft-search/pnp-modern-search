define([], function() {
  return {
    General: {
      PlaceHolder: {
        EditLabel: "Redigera",
        IconText: "Sökresultat webbdel av @PnP",
        Description: "Visa sökresultat från SharePoint- eller Microsoft-sökning.",
        ConfigureBtnLabel: "Konfigurera"
      },
      WebPartDefaultTitle: "Sökresultat webbdel",
      ShowBlankEditInfoMessage: "Inget resultat returneras för denna fråga. Denna webbdel förblir tom i visningsläge enligt parametrarna.",
      CurrentVerticalNotSelectedMessage: "Den valda vertikalen matchar inte den som är associerad med den här webbdelen. Den förblir tom i visningsläge."
    },
    PropertyPane: {
      DataSourcePage: {
        DataSourceConnectionGroupName: "Tillgängliga datakällor",
        PagingOptionsGroupName: "Inställningar för sidindelning",
        ItemsCountPerPageFieldName: "Antal objekt per sida",
        PagingRangeFieldName: "Antal sidor att visa i sidnavigation",
        ShowPagingFieldName: "Visa sidnavigation",
        HidePageNumbersFieldName: "Dölj sidnummer",
        HideNavigationFieldName: "Dölj navigeringsval (föregående sida, nästa sida)",
        HideFirstLastPagesFieldName: "Dölj första/sista navigeringsknapparna",
        HideDisabledFieldName: "Dölj navigeringsval (föregående, nästa, första, sista) om de är inaktiverade",
        TemplateSlots: {
          GroupName: "Layout",
          ConfigureSlotsLabel: "Redigera layout för den här datakällan",
          ConfigureSlotsBtnLabel: "Anpassa",
          ConfigureSlotsPanelHeader: "Layout",
          ConfigureSlotsPanelDescription: "Här kan du lägga till namn och fält som ska användas för de olika layouterna. Ett fält är en platshållarvariabel som du infogar i din mall, där värdet kommer att ersättas med ett fältvärde från en datakälla. På så sätt blir dina mallar mer generiska och lättare att återanvända. Om du vill använda dem använder du `{{slot item @root.slots.<SlotName>}}` Handlebars-uttrycket.",
          SlotNameFieldName: "Namn",
          SlotFieldFieldName: "Fält",
          SlotFieldPlaceholderName: "Välj ett fält"
        }
      },
      LayoutPage: {
        LayoutSelectionGroupName: "Tillgängliga layouter",
        LayoutTemplateOptionsGroupName: "Layoutalternativ",
        CommonOptionsGroupName: "Vanlig",
        TemplateUrlFieldLabel: "Använd en extern URL för mall",
        TemplateUrlPlaceholder: "https://myfile.html",
        ErrorTemplateExtension: "Mallen måste vara en giltig .txt-, .htm- eller .html-fil",
        ErrorTemplateResolve: "Det går inte att läsa den angivna mallen. Felbeskrivning: '{0}'",
        DialogButtonLabel: "Redigera resultatmallen",
        DialogTitle: "Redigera resultatmallen",
        ShowSelectedFilters: "Visa valda filter",
        ShowBlankIfNoResult: "Dölj den här webbdelen om det inte finns något att visa",
        ShowResultsCount: "Visa antalet resultat",
        HandlebarsRenderTypeLabel: "Handlebars/HTML",
        HandlebarsRenderTypeDesc: "Välj layouter baserade på HTML, CSS och Handlebars",
        AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
        AdaptiveCardsRenderTypeDesc: "Välj layouter baserade på adaptiva JSON-kort",        
        Handlebars: {
          UseMicrosoftGraphToolkit: "Använd Microsoft Graph Toolkit",
          ResultTypes: {
            ResultTypeslabel: "Resultattyper",
            ResultTypesDescription: "Här kan du lägga till de mallar som du vill använda i resultaten enligt ett eller flera villkor. Villkoren utvärderas i den konfigurerade ordningen och externa mallar har företräde framför integrerade mallar. Se till att fälten på den datakälla du använder finns i datasvaret.",
            InlineTemplateContentLabel: "Integrerad mall",
            EditResultTypesLabel: "Redigera resultattyper",
            ConditionPropertyLabel: "Fält på datakälla",
            ConditionValueLabel: "Villkorsvärde",
            CondtionOperatorValue: "Operator",
            ExternalUrlLabel: "Extern mall-URL",
            EqualOperator: "Är lika med",
            NotEqualOperator: "Inte lika med",
            ContainsOperator: "Innehåller",
            StartsWithOperator: "Startar med",
            NotNullOperator: "Är inte null",
            GreaterOrEqualOperator: "Större eller lika med",
            GreaterThanOperator: "Större än",
            LessOrEqualOperator: "Mindre eller lika med",
            LessThanOperator: "Mindre än",
            CancelButtonText: "Avbryt",
            DialogButtonText: "Redigera mall",
            DialogTitle: "Redigera resultatmall",
            SaveButtonText: "Spara"
          },
          AllowItemSelection: "Tillåt val av objekt",
          AllowMultipleItemSelection: "Tillåt flera val",
          SelectionModeLabel: "Urvalsläge",
          AsTokensSelectionMode: "Bearbeta valda värden som tokens (manuellt läge)",
          AsDataFiltersSelectionMode: "Bearbeta valda värden som filter (standardläge)",
          AsDataFiltersDescription: "I det här läget skickas valda värden till datakällan som vanliga filter",
          AsTokensDescription: "I det här läget används valda värden manuellt genom tokens och tillgängliga metoder. Exempel med SharePoint-sökfrågemall: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
          FilterValuesOperator: "Den logiska operatorn att använda mellan valda värden",
          FieldToConsumeLabel: "Källfält att konsumera",
          FieldToConsumeDescription: "Använd detta fältvärde för valda objekt"
        },
        AdaptiveCards: {
          HostConfigFieldLabel: "Värdkonfiguration"
        }        
      },
      ConnectionsPage: {
        ConnectionsPageGroupName: "Tillgängliga anslutningar",
        UseFiltersWebPartLabel: "Anslut till en filter-webbdel",
        UseFiltersFromComponentLabel: "Använd filter från den här komponenten",
        UseDynamicFilteringsWebPartLabel: "Anslut till en webbdel för dataresultat",
        UseDataResultsFromComponentsLabel: "Använd data från denna webbdel",
        UseDataResultsFromComponentsDescription: "Use data from selected items in these Web Parts",
        UseSearchVerticalsWebPartLabel: "Använd data från valda objekt i dessa webbdelar",
        UseSearchVerticalsFromComponentLabel: "Använd vertikaler från denna komponent",
        LinkToVerticalLabel: "Visa endast data när följande vertikaler är valda",
        LinkToVerticalLabelHoverMessage: "Resultaten visas endast om de valda vertikalerna matchar den som har konfigurerats för denna webbdel. Annars är den här webbdelen tom.",
        UseInputQueryText: "Använd inmatning för sökfrågetext",
        UseInputQueryTextHoverMessage: "Använd {inputQueryText} i din datakälla för att hämta detta värde",
        SearchQueryTextFieldLabel: "Sökfrågetext",
        SearchQueryTextFieldDescription: "",
        SearchQueryPlaceHolderText: "Ange frågetext ...",
        InputQueryTextStaticValue: "Statiskt värde",
        InputQueryTextDynamicValue: "Dynamiskt värde",
        SearchQueryTextUseDefaultQuery: "Använd ett standardvärde",
        SearchQueryTextDefaultValue: "Standardvärde",
        SourceDestinationFieldLabel: "Destinationsfältets namn",
        SourceDestinationFieldDescription: "Destinationsfält som ska användas i den här webbdelen för att matcha de valda värdena",
        AvailableFieldValuesFromResults: "Fält som innehåller filtervärdet"
      },
      InformationPage: {
        Extensibility: {
          PanelHeader: "Konfigurera utbyggnadsbibliotek som ska laddas vid start.",
          PanelDescription: "Lägg till/ta bort anpassade utbyggnadsbiblioteket-ID:n här. Du kan ange ett visningsnamn och bestämma om biblioteket ska laddas eller ej vid start. Här laddas bara anpassade datakällor, layouter, webbkomponenter och styrhjälpmedel.",
        },
        EnableTelemetryLabel: "PnP-telemetri",
        EnableTelemetryOn: "Slå på telemetri",
        EnableTelemetryOff: "Stäng av telemetri"
      },
      CustomQueryModifier: {
            EditQueryModifiersLabel: "Konfigurera tillgängliga modifieringar för anpassade frågor",
            QueryModifiersLabel: "Modifiering av anpassade frågor",
            QueryModifiersDescription: "Aktivera eller inaktivera enskilda anpassade frågeändringar.",
            EnabledPropertyLabel: "Aktiverad",
            ModifierNamePropertyLabel: "Namn",
            ModifierDescriptionPropertyLabel: "Beskrivning",
            EndWhenSuccessfullPropertyLabel:"Avsluta när det är lyckat"        
      }
    }
  }
});