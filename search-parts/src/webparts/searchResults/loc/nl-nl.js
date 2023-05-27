define([], function() {
  return {
    General: {
      PlaceHolder: {
        EditLabel: "Bewerk",
        IconText: "Zoekresultaten webonderdeel door @PnP",
        Description: "Toont zoekresultaten uit SharePoint of Microsoft search.",
        ConfigureBtnLabel: "Configureer"
      },
      WebPartDefaultTitle: "Zoekresultaten webonderdeel",
      ShowBlankEditInfoMessage: "Geen resultaten gevonden voor deze zoekopdracht. Dit webonderdeel blijft leeg in weergave modus conform parameters.",
      CurrentVerticalNotSelectedMessage: "De nu selecteerde zoekverticaal komt niet overeen met degene die geassocieerd is met dit webonderdeel. Dit webonderdeel blijft leeg in weergave modus."
    },
    PropertyPane: {
      DataSourcePage: {
        DataSourceConnectionGroupName: "Beschikbare databronnen",
        PagingOptionsGroupName: "Pagineringsopties",
        ItemsCountPerPageFieldName: "Aantal items per pagina",
        PagingRangeFieldName: "Aantal pagina's in bereik tonen",
        ShowPagingFieldName: "Toon paginering",
        HidePageNumbersFieldName: "Verberg paginanummers",
        HideNavigationFieldName: "Verberg navigatieknoppen (vorige pagina, volgende pagina)",
        HideFirstLastPagesFieldName: "Verberg eerste/laatste navigatieknoppen",
        HideDisabledFieldName: "Verberg navigatieknoppen (vorige, vorige, eerste, laatste) wanneer deze uitgeschakeld zijn.",
        TemplateSlots: {
          GroupName: "Indelingssleuven",
          ConfigureSlotsLabel: "Bewerk indelingssleuven voor deze databron",
          ConfigureSlotsBtnLabel: "Bewerk",
          ConfigureSlotsPanelHeader: "Indelingssleuven",
          ConfigureSlotsPanelDescription: "Voeg hier sleuven toe voor gebruik in verschillende indelingen. Een sleuf is een placeholder variabele die je verwerkt in een sjabloon. De placeholder wordt dynamisch vervangen door een veldwaarde uit de databron. Op deze manier wordt je sjabloon meer generiek en herbruikbaar, ontkoppeld van specifieke velden uit de databron. Om deze te gebruiken, gebruik je de `{{slot item @root.slots.<SleufNaam>}}` Handlebars expressie.",
          SlotNameFieldName: "Sleuf naam",
          SlotFieldFieldName: "Sleuf veld",
          SlotFieldPlaceholderName: "Kies een veld"
        }
      },
      LayoutPage: {
        LayoutSelectionGroupName: "Beschikbare indelingen",
        LayoutTemplateOptionsGroupName: "Indelingsopties",
        CommonOptionsGroupName: "Algemeen",
        TemplateUrlFieldLabel: "Gebruik een externe sjabloon URL",
        TemplateUrlPlaceholder: "https://mijnbestand.html",
        ErrorTemplateExtension: "Het sjabloon moet een geldig .txt, .htm of .html bestand zijn",
        ErrorTemplateResolve: "Kan het opgegeven template niet inladen. Foutmelding: '{0}'",
        DialogButtonLabel: "Bewerk resulaten sjabloon",
        DialogTitle: "Bewerk resultaten sjabloon",
        ShowSelectedFilters: "Toon geselecteerde filters",
        ShowBlankIfNoResult: "Verberg dit webonderdeel wanneer er niets te tonen is.",
        ShowResultsCount: "Toon aantal resultaten",
        HandlebarsRenderTypeLabel: "Handlebars/HTML",
        HandlebarsRenderTypeDesc: "Selecteer lay-outs op basis van HTML, CSS en stuur",
        AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
        AdaptiveCardsRenderTypeDesc: "Selecteer lay-outs op basis van JSON-adaptieve kaarten",        
        Handlebars: {
          UseMicrosoftGraphToolkit: "Gebruik de Microsoft Graph Toolkit",
          ResultTypes: {
            ResultTypeslabel: "Resultaattypen",
            ResultTypesDescription: "Voeg hier de sjablonen toe welke gebruikt worden voor zoekresultaten op basis van één of meer voorwaarden. Voorwaarden worden toegepast in de ingestelde volgorde. Externe templates krijgen voorrang op inline sjablonen. Zorg er ook voor dat de gebruikte velden uit de databron aanwezig zijn in de data van het antwoord.",
            InlineTemplateContentLabel: "Inline sjabloon",
            EditResultTypesLabel: "Bewerk resultaattypen",
            ConditionPropertyLabel: "Databron veld",
            ConditionValueLabel: "Voorwaarde",
            CondtionOperatorValue: "Operator",
            ExternalUrlLabel: "Externe sjabloon URL",
            EqualOperator: "Gelijk aan",
            NotEqualOperator: "Niet gelijk aan",
            ContainsOperator: "Bevat",
            StartsWithOperator: "Begint met",
            NotNullOperator: "Is niet null",
            GreaterOrEqualOperator: "Groter of gelijk",
            GreaterThanOperator: "Groter dan",
            LessOrEqualOperator: "Kleiner of gelijk",
            LessThanOperator: "Kleiner dan",
            CancelButtonText: "Annuleer",
            DialogButtonText: "Bewerk sjabloon",
            DialogTitle: "Bewerk resultaatsjabloon",
            SaveButtonText: "Bewaar",
          },
          AllowItemSelection: "Selectie van items toestaan",
          AllowMultipleItemSelection: "Meerdere selectie toestaan",
          SelectionModeLabel: "Selectiemodus",
          AsTokensSelectionMode: "Verwerk geselecteerde waarden als tokens (handmatige modus)",
          AsDataFiltersSelectionMode: "Verwerk geselecteerde waarden als filters (standaardmodus)",
          AsDataFiltersDescription: "In deze modus worden geselecteerde waarden als gewone filters naar de gegevensbron verzonden",
          AsTokensDescription: "In deze modus worden geselecteerde waarden handmatig gebruikt via tokens en beschikbare methoden. Voorbeeld met SharePoint-zoekopdrachtsjabloon: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
          FilterValuesOperator: "De logische operator die tussen geselecteerde waarden moet worden gebruikt",
          FieldToConsumeLabel: "Bronveld om te consumeren",
          FieldToConsumeDescription: "Gebruik deze veldwaarde voor geselecteerde items"
        },
        AdaptiveCards: {
          HostConfigFieldLabel: "Hostconfiguratie"
        }
      },
      ConnectionsPage: {
        ConnectionsPageGroupName: "Beschikbare verbindingen",
        UseFiltersWebPartLabel: "Verbind met een filter webonderdeel",
        UseFiltersFromComponentLabel: "Gebruik filters van dit onderdeel",
        UseDynamicFilteringsWebPartLabel: "Verbinding maken met een webonderdeel met gegevensresultaten",
        UseDataResultsFromComponentsLabel: "Gegevens uit dit webonderdeel gebruiken",
        UseDataResultsFromComponentsDescription: "Gegevens gebruiken van geselecteerde items in deze webonderdelen",
        UseSearchVerticalsWebPartLabel: "Verbind met een zoekverticalen webonderdeel",
        UseSearchVerticalsFromComponentLabel: "Gebruik zoekverticalen van dit onderdeel",
        LinkToVerticalLabel: "Toon data alleen wanneer de volgende zoekverticaal geselecteerd is",
        LinkToVerticalLabelHoverMessage: "De resultaten worden enkel getoond wanneer de geselecteerde zoekverticaal overeenkomt met degene die geconfigureerd is voor dit webonderdeel. Wanneer dit niet het geval is blijft dit webonderdeel leeg in weergave modus (zonder marge en zonder padding)",
        UseInputQueryText: "Gebruik ingegeven zoekopdracht",
        UseInputQueryTextHoverMessage: "Gebruik het {inputQueryText} token in je databron om de waarde op te halen",
        SearchQueryTextFieldLabel: "Zoekopdracht",
        SearchQueryTextFieldDescription: "",
        SearchQueryPlaceHolderText: "Geef zoekopdracht...",
        InputQueryTextStaticValue: "Statische waarde",
        InputQueryTextDynamicValue: "Dynamische waarde",
        SearchQueryTextUseDefaultQuery: "Gebruik een standaardwaarde",
        SearchQueryTextDefaultValue: "Standaardwaarde",
        SourceDestinationFieldLabel: "Naam van bestemmingsveld",
        SourceDestinationFieldDescription: "Bestemmingsveld dat in dit webonderdeel moet worden gebruikt om overeen te komen met de geselecteerde waarden",
        AvailableFieldValuesFromResults: "Veld met de filterwaarde"
      },
      InformationPage: {
        Extensibility: {
          PanelHeader: "Configureer inladen van uitbreidingsbibliotheken bij opstarten",
          PanelDescription:"Beheer hier je aangepaste uitbreidingsbibliotheek ID's. Je kan hier een weergavenaam specificeren en aangeven of de bibliotheek geladen moet worden. Alleen aangepaste databronnen, indelingen, web componenten en Handlebars helpers worden hier geladen.",
        },
        EnableTelemetryLabel: "PnP-telemetrie",
        EnableTelemetryOn: "Telemetrie inschakelen",
        EnableTelemetryOff: "Telemetrie uitschakelen"
      },
      CustomQueryModifier: {
            EditQueryModifiersLabel: "Beschikbare aangepaste query-aanpassingen configureren",
            QueryModifiersLabel: "Aangepaste query-aanpassingen",
            QueryModifiersDescription: "Individuele aangepaste query-aanpassingen in- of uitschakelen",
            EnabledPropertyLabel: "Ingeschakeld",
            ModifierNamePropertyLabel: "Naam",
            ModifierDescriptionPropertyLabel: "Beschrijving",
            EndWhenSuccessfullPropertyLabel:"Beëindig bij succes"        
      }
    }
  }
});