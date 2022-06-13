define([], function() {
  return {
    General: {
      PlaceHolder: {
        EditLabel: "Redigér",
        IconText: "Søgeresultats-webpart af @PnP",
        Description: "Viser søgeresultater fra SharePoint eller Microsoft Search.",
        ConfigureBtnLabel: "Konfigurér"
      },
      WebPartDefaultTitle: "Søgeresultats-webpart",
      ShowBlankEditInfoMessage: "Intet resultat returneret på denne forespørgsel. Denne webpart vil forblive blank i visningstilstand ifølge parametrene.",
      CurrentVerticalNotSelectedMessage: "Den valgte vertikal matcher ikke med den, der er associeret denne webpart. Den vil forblive blank i visningstilstand."
    },
    PropertyPane: {
      DataSourcePage: {
        DataSourceConnectionGroupName: "Tilgængelige datakilder",
        PagingOptionsGroupName: "Sidevisninger",
        ItemsCountPerPageFieldName: "Antal items per side",
        PagingRangeFieldName: "Antal sider der skal vises i rækkefølge",
        ShowPagingFieldName: "Vis sideantal",
        HidePageNumbersFieldName: "Skjul sidenumre",
        HideNavigationFieldName: "Skjul navigationsknapper (foregående side, næste side)",
        HideFirstLastPagesFieldName: "Skjul første/sidste navigationsknapper",
        HideDisabledFieldName: "Skjul navigationsknapper (foregående, næste, første, sidste), hvis de er deaktiveret.",
        TemplateSlots: {
          GroupName: "Layout-slots",
          ConfigureSlotsLabel: "Redigér layout-slots for denne datakilde",
          ConfigureSlotsBtnLabel: "Tilpas",
          ConfigureSlotsPanelHeader: "Layout-slots",
          ConfigureSlotsPanelDescription: "Her kan du tilføje de slots, der skal bruges til de forskellige layouts. Et slot er en pladsholder-variabel, som du indsætter i din skabelon, hvor værdien vil blive erstattet med et feltets værdi fra en datakilde. På denne måde vil dine skabeloner blive mere generiske og nemmere at genbruge. For at bruge dem, skal du bruge `{{slot item @root.slots.<SlotName>}}` Handlebars-udtrykket.",
          SlotNameFieldName: "Slot-navn",
          SlotFieldFieldName: "Slot-felt",
          SlotFieldPlaceholderName: "Vælg et felt"
        }
      },
      LayoutPage: {
        LayoutSelectionGroupName: "Tilgængelige layouts",
        LayoutTemplateOptionsGroupName: "Layout-muligheder",
        CommonOptionsGroupName: "Almindelig",
        TemplateUrlFieldLabel: "Anvend en URL fra en ekstern skabelon",
        TemplateUrlPlaceholder: "https://myfile.html",
        ErrorTemplateExtension: "Skabelonen skal være en valid .htm or .html fil",
        ErrorTemplateResolve: "Kan ikke læse the specificerede skabelon. Fejlbeskrivelse: '{0}'",
        DialogButtonLabel: "Redigér resultatsskabelonen",
        DialogTitle: "Redigér resultatsskabelonen",
        ShowSelectedFilters: "Vis valgte filtre",
        ShowBlankIfNoResult: "Skjul denne webpart, hvis der ikke er noget at vise.",
        ShowResultsCount: "Vis antallet af resultater",
        HandlebarsRenderTypeLabel: "Handlebars/HTML",
        HandlebarsRenderTypeDesc: "Vælg layout baseret på HTML, CSS og styr",
        AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
        AdaptiveCardsRenderTypeDesc: "Vælg layout baseret på JSON adaptive kort",        
        Handlebars: {
          UseMicrosoftGraphToolkit: "brug Microsoft Graph Toolkit",
          ResultTypes: {
            ResultTypeslabel: "Resultattyper",
            ResultTypesDescription: "Her kan du tilføje de templates, du vil bruge til resultaterne, i overensstemmelse med en eller flere tilstande. Tilstande er evalueret i den konfigurerede rækkefølge og eksterne skabeloner har forrang over integrerede skabeloner. Vær sikker på at felterne på datakilden, du bruger, findes i datasvaret.",
            InlineTemplateContentLabel: "Integreret skabelon",
            EditResultTypesLabel: "Redigér resultattyper",
            ConditionPropertyLabel: "Felt på datakilde",
            ConditionValueLabel: "Tilstandsværdi",
            CondtionOperatorValue: "Operatør",
            ExternalUrlLabel: "Ekstern skabelon-URL",
            EqualOperator: "Er lig med",
            NotEqualOperator: "Er ikke lige med",
            ContainsOperator: "Indeholder",
            StartsWithOperator: "Starter med",
            NotNullOperator: "Er ikke nul",
            GreaterOrEqualOperator: "Større eller lig",
            GreaterThanOperator: "Større end",
            LessOrEqualOperator: "Mindre eller lig",
            LessThanOperator: "Mindre end",
            CancelButtonText: "Annuller",
            DialogButtonText: "Redigér skabelon",
            DialogTitle: "Redigér resultatsskabelon",
            SaveButtonText: "Gem"
          },
          AllowItemSelection: "Tillad valg af elementer",
          AllowMultipleItemSelection: "Tillad flere valg",
          SelectionModeLabel: "Valgtilstand",
          AsTokensSelectionMode: "Behandl valgte værdier som tokens (manuel tilstand)",
          AsDataFiltersSelectionMode: "Behandle valgte værdier som filtre (standardtilstand)",
          AsDataFiltersDescription: "I denne tilstand sendes valgte værdier til datakilden som almindelige filtre",
          AsTokensDescription: "I denne tilstand bruges de valgte værdier manuelt gennem tokens og tilgængelige metoder. Eksempel med SharePoint søgeforespørgselsskabelon: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
          FilterValuesOperator: "Den logiske operator, der skal bruges mellem valgte værdier",
          FieldToConsumeLabel: "Kildefelt til at forbruge",
          FieldToConsumeDescription: "Brug denne feltværdi til udvalgte varer",
        },
        AdaptiveCards: {
          HostConfigFieldLabel: "Værtskonfiguration"
        }
      },
      ConnectionsPage: {
        ConnectionsPageGroupName: "Tilgængelige forbindelser",
        UseFiltersWebPartLabel: "Forbind til en filter-webpart",
        UseFiltersFromComponentLabel: "Brug filtre fra dette komponent",
        UseDynamicFilteringsWebPartLabel: "Opret forbindelse til en dataresultatwebdel",
        UseDataResultsFromComponentsLabel: "Brug data fra denne webdel",
        UseDataResultsFromComponentsDescription: "Brug data fra udvalgte elementer i disse webdele",        
        UseSearchVerticalsWebPartLabel: "Forbind til en vertikal-webpart",
        UseSearchVerticalsFromComponentLabel: "Brug vertikaler fra dette komponent",
        LinkToVerticalLabel: "Vis kun data, når følgende vertikaler er valgt",
        LinkToVerticalLabelHoverMessage: "Resultaterne vil kun blive vist, hvis de valgte vertikaler matcher med den, der er konfigureret til denne webpart. Ellers vil denne webpart være blank.",
        UseInputQueryText: "Anvend input til forespørgselstekst",
        UseInputQueryTextHoverMessage: "Anvend {inputQueryText} token i din datakilde for at hente denne værdi",
        SearchQueryTextFieldLabel: "Forespørgselstekst",
        SearchQueryTextFieldDescription: "",
        SearchQueryPlaceHolderText: "Indsæt forespørgselstekst...",
        InputQueryTextStaticValue: "Statisk værdi",
        InputQueryTextDynamicValue: "Dynamisk værdi",
        SearchQueryTextUseDefaultQuery: "Brug en standard værdi",
        SearchQueryTextDefaultValue: "Standard værdi",
        SourceDestinationFieldLabel: "Navn på destinationsfelt",
        SourceDestinationFieldDescription: "Destinationsfelt til brug i denne webdel for at matche de valgte værdier",
        AvailableFieldValuesFromResults: "Felt, der indeholder filterværdien"        
      },
      InformationPage: {
        Extensibility: {
          PanelHeader: "Konfigurér extensibility-biblioteker så de indlæser ved opstart.",
          PanelDescription: "Tilføj/Fjern ID på dit extensibility-bibliotek her. Du kan specificere et visningsnavn og beslutte, om biblioteket skal indlæses eller ej ved opstart. Kun brugerdefinerede datakilder, layouts, web-komponenter og Handlebars-hjælpere vil blive loadet her.",
        },
        EnableTelemetryLabel: "PnP telemetri",
        EnableTelemetryOn: "Slå telemetri til",
        EnableTelemetryOff: "Slå telemetri fra"
      }
    }
  }
});
