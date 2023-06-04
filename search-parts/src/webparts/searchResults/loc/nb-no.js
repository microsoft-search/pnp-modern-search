define([], function() {
    return {
      General: {
        PlaceHolder: {
          EditLabel: "Rediger",
          IconText: "Søkeresultat-nettdel, av @PnP",
          Description: "Viser søkeresultater fra SharePoint- eller Microsoft-søk.",
          ConfigureBtnLabel: "Konfigurer"
        },
        WebPartDefaultTitle: "Søkeresultat",
        ShowBlankEditInfoMessage: "Fant ikke noe med denne spørringen. Nettdelen vil være tom i visningsmodus, i tråd med innstillingene.",
        CurrentVerticalNotSelectedMessage: "Den valgte vertikalen matcher ikke den som er assosiert med denne nettdelen. Den vil være tom i visningsmodus."
      },
      PropertyPane: {
        DataSourcePage: {
          DataSourceConnectionGroupName: "Tilgjengelige datakilder",
          PagingOptionsGroupName: "Innstillinger for sideinndeling",
          ItemsCountPerPageFieldName: "Antall objekter per side",
          PagingRangeFieldName: "Antall sider som skal vises i sidenavigasjonen",
          ShowPagingFieldName: "Vis sidenavigasjon",
          HidePageNumbersFieldName: "Skjul sidenummer",
          HideNavigationFieldName: "Skjul navigeringslenker forrige side / neste side",
          HideFirstLastPagesFieldName: "Skjul navigeringslenkene første/siste",
          HideDisabledFieldName: "Skjul navigeringslenker (forrige, neste, første, siste) hvis de er deaktivert.",
          TemplateSlots: {
            GroupName: "Mal",
            ConfigureSlotsLabel: "Rediger mal-slots for denne datakilden",
            ConfigureSlotsBtnLabel: "Tilpass",
            ConfigureSlotsPanelHeader: "Mal-slots",
            ConfigureSlotsPanelDescription: "Her kan du legge til slots som skal brukes i ulike maler. En slot er en plassholdervariabel som du setter inn i din mal, der verdien kommer til å bli erstattet med en feltverdi fra en datakilde. På denne måten blir dine maler mer generiske og lettere å gjenbruke. Hvis du vil bruke dem, bruker du Handlebars-uttrykket `{{slot item @root.slots.<SlotName>}}`.",
            SlotNameFieldName: "Navn",
            SlotFieldFieldName: "Felt",
            SlotFieldPlaceholderName: "Velg et felt"
          }
        },
        LayoutPage: {
          LayoutSelectionGroupName: "Tilgjengelige maler",
          LayoutTemplateOptionsGroupName: "Malvalg",
          CommonOptionsGroupName: "Vanlig",
          TemplateUrlFieldLabel: "Bruk en URL for mal",
          TemplateUrlPlaceholder: "https://myfile.html",
          ErrorTemplateExtension: "Malen må være en gyldig .txt, .htm eller .html-fil",
          ErrorTemplateResolve: "Det går ikke å lese denne malen. Feil: '{0}'",
          DialogButtonLabel: "Rediger resultatmalen",
          DialogTitle: "Rediger resultatmalen",
          ShowSelectedFilters: "Vis valgte gilter",
          ShowBlankIfNoResult: "Skjul denne nettdelen om det ikke er noe å vise.",
          ShowResultsCount: "Vis antall resultat",
          HandlebarsRenderTypeLabel: "Handlebars/HTML",
          HandlebarsRenderTypeDesc: "Velg oppsett basert på HTML, CSS og håndtak",
          AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
          AdaptiveCardsRenderTypeDesc: "Velg oppsett basert på adaptive JSON-kort",          
          Handlebars: {
            UseMicrosoftGraphToolkit: "Bruk Microsoft Graph Toolkit",
            ResultTypes: {
              ResultTypeslabel: "Resultattyper",
              ResultTypesDescription: "Her kan du legge til de maler som du vil bruke for de ulike resultatobjektene basert på én eller flere betingelser. Betingelsene vurderes i den gitte rekkefølgen, og eksterne maler har forrang over integrerte maler. Pass på at feltene i den datakilden du bruker finnes i dataresponsen.",
              InlineTemplateContentLabel: "Integrert mal",
              EditResultTypesLabel: "Rediger resultattyper",
              ConditionPropertyLabel: "Felt i datakilde",
              ConditionValueLabel: "Betingelse",
              CondtionOperatorValue: "Operator",
              ExternalUrlLabel: "Ekstern mal-URL",
              EqualOperator: "Er lik",
              NotEqualOperator: "Er ikke lik",
              ContainsOperator: "Inneholder",
              StartsWithOperator: "Starter med",
              NotNullOperator: "Er ikke null",
              GreaterOrEqualOperator: "Større enn eller lik",
              GreaterThanOperator: "Større enn",
              LessOrEqualOperator: "Mindre enn eller lik",
              LessThanOperator: "Mindre enn",
              CancelButtonText: "Avbryt",
              DialogButtonText: "Rediger mal",
              DialogTitle: "Rediger resultatmal",
              SaveButtonText: "Lagre"
            },
            AllowItemSelection: "Tillat valg av elementer",
            AllowMultipleItemSelection: "Tillat flere valg",
            SelectionModeLabel: "Valgmodus",
            AsTokensSelectionMode: "Behandle valgte verdier som tokens (manuell modus)",
            AsDataFiltersSelectionMode: "Behandle valgte verdier som filtre (standardmodus)",
            AsDataFiltersDescription: "I denne modusen sendes valgte verdier til datakilden som vanlige filtre",
            AsTokensDescription: "I denne modusen brukes valgte verdier manuelt gjennom tokens og tilgjengelige metoder. Eksempel med SharePoint-søkemal: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
            FilterValuesOperator: "Den logiske operatoren som skal brukes mellom valgte verdier",
            FieldToConsumeLabel: "Kildefelt å konsumere",
            FieldToConsumeDescription: "Bruk denne feltverdien for valgte elementer"
          },
          AdaptiveCards: {
            HostConfigFieldLabel: "Vertskonfigurasjon"
          } 
        },
        ConnectionsPage: {
          ConnectionsPageGroupName: "Tilgjengelige tilkoblinger",
          UseFiltersWebPartLabel: "Koble til en filter-nettdel",
          UseFiltersFromComponentLabel: "Bruk filter fra denne komponenten",
          UseDynamicFilteringsWebPartLabel: "Koble til en dataresultatwebdel",
          UseDataResultsFromComponentsLabel: "Bruk data fra denne webdelen",
          UseDataResultsFromComponentsDescription: "Bruk data fra utvalgte elementer i disse webdelene",
          UseSearchVerticalsWebPartLabel: "Koble til en vertikal-nettdel",
          UseSearchVerticalsFromComponentLabel: "Bruk vertikaler fra denne komponenten",
          LinkToVerticalLabel: "Vis kun data når følgende vertikaler er valgt",
          LinkToVerticalLabelHoverMessage: "Resultatee vises kun om de valgte vertikalene passer med den som har blitt konfigurert for denne nettdelen. Ellers er denne nettdelen tom.",
          UseInputQueryText: "Bruk søkespørringstekst",
          UseInputQueryTextHoverMessage: "Bruk {inputQueryText} i din datakilde for å hente denne verdien",
          SearchQueryTextFieldLabel: "Spørretekst",
          SearchQueryTextFieldDescription: "",
          SearchQueryPlaceHolderText: "Skriv inn spørring...",
          InputQueryTextStaticValue: "Statisk verdi",
          InputQueryTextDynamicValue: "Dynamisk verdi",
          SearchQueryTextUseDefaultQuery: "Bruk standardverdi",
          SearchQueryTextDefaultValue: "Standardverdi",
          SourceDestinationFieldLabel: "Navn på destinasjonsfelt",
          SourceDestinationFieldDescription: "Destinasjonsfelt som skal brukes i denne webdelen for å matche de valgte verdiene",
          AvailableFieldValuesFromResults: "Felt som inneholder filterverdien"
        },
        InformationPage: {
          Extensibility: {
            PanelHeader: "Konfigurer utvidelsesbibliotek som skal lastes ved oppstart.",
            PanelDescription: "Legg til / fjern ID-en til ditt tilpassede utvidelsesbibliotek her. Du kan angi et visningsnavn og bestemme om biblioteket skal lastes ved oppstart eller ikke. Har lastes kun tilpassede datakilder, maler, web-komponenter og Handlebars-hjelpere.",
          },
          EnableTelemetryLabel: "PnP-telemetri",
          EnableTelemetryOn: "Slå på telemetri",
          EnableTelemetryOff: "Slå av telemetri"
        },
        CustomQueryModifier: {
              EditQueryModifiersLabel: "Konfigurer tilgjengelige tilpassede spørringsmodifikatorer",
              QueryModifiersLabel: "Tilpassede spørringsmodifikatorer",
              QueryModifiersDescription: "Aktiver eller deaktiver individuelle tilpassede søkemodifikatorer",
              EnabledPropertyLabel: "Aktivert",
              ModifierNamePropertyLabel: "Navn",
              ModifierDescriptionPropertyLabel: "Beskrivelse",
              EndWhenSuccessfullPropertyLabel:"Avslutt når det er vellykket"          
        }
      }
    }
  });
