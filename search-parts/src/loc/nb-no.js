define([], function () {
    return {
      Tokens: {
        SelectTokenLabel: "Velg token…",
        Context: {
          ContextTokensGroupName: "Kontekst-token",
          SiteAbsoluteUrl: "Sidens absolutte URL",
          SiteRelativeUrl: "Sidens serverrelative URL",
          WebAbsoluteUrl: "Områdets absolutte URL",
          WebRelativeUrl: "Områdetes serverrelative URL",
          WebTitle: "Tittel",
          InputQueryText: "Sett inn variabler"
        },
        Custom: {
          CustomTokensGroupName: "Tilpassede verdier",
          CustomValuePlaceholder: "Angi verdi…",
          InvalidtokenFormatErrorMessage: "Vennligst angi et token-format som bruker '{' og '}'. (f.eks.: {Today})"
        },
        Date: {
          DateTokensGroupName: "Dato-tokens",
          Today: "I dag",
          Yesterday: "I går",
          Tomorrow: "I morgen",
          OneWeekAgo: "En uke siden",
          OneMonthAgo: "En måned siden",
          OneYearAgo: "Et år siden"
        },
        Page: {
          PageTokensGroupName: "Side-tokens",
          PageId: "Sidens ID",
          PageTitle: "Sidens tittel",
          PageCustom: "Annen sidekolonne",
        },
        User: {
          UserTokensGroupName: "Bruker-tokens",
          UserName: "Brukernavn",
          Me: "Jeg",
          UserDepartment: "Brukers avdeling",
          UserCustom: "Brukers tilpassede egenskap"
        }
      },
      General: {
        OnTextLabel: "På",
        OffTextLabel: "Av",
        StaticArrayFieldName: "Array-liknende felt",
        About: "Om",
        Authors: "Forfattere",
        Version: "Versjon",
        InstanceId: "Nettelens instans-ID",
        Resources: {
          GroupName: "Ressurser",
          Documentation: "Dokumentasjon",
          PleaseReferToDocumentationMessage: "Se den offisielle dokumentasjonen."
        },
        Extensibility: {
          InvalidDataSourceInstance: "Den valgte datakilden '{0}' implementerer ikke den abstakte klassen 'BaseDataSource' korrekt. Noen metoder mangler.",
          DataSourceDefinitionNotFound: "Den tilpasssede datakilden med nøkkelen '{0}' ble ikke funnet. Se til at løsningen er korrekt deployert i appkatalogen og at manifest-ID er registrert for denne nettdelen.",
          LayoutDefinitionNotFound: "Den tilpasssede malen med nøkkelen '{0}' ble ikke funnet. Se til at løsningen er korrekt deployert i appkatalogen og at manifest-ID er registrert for denne nettdelen.",
          InvalidLayoutInstance: "Den valgte malen '{0}' implementerer ikke den abstrakte klassen 'BaseLayout' korrekt. Noen metoder mangler.",
          DefaultExtensibilityLibraryName: "Standardutbyggnadsbiblioteke",
          InvalidProviderInstance: "Den valgte forslagsleverandøren '{0}' implementerer ikke den abstakte klassen 'BaseSuggestionProvider' korrekt. Noen metoder mangler.",
          ProviderDefinitionNotFound: "Den tilpassede forslagsleverandøren med nøkkelen '{0}' ble ikke funnet. Se til att løsningen är korrekt deployert i appkatalogen og at manifest-ID er registrert for denne nettdelen.",
          QueryModifierDefinitionNotFound: "Den tilpassede queryModifier med nøkkelen '{0}' ble ikke funnet. Sørg for at løsningen er riktig distribuert til appkatalogen og manifest-ID-en som er registrert for denne webdelen.",
          InvalidQueryModifierInstance: "Den valgte egendefinerte queryModifier '{0}' implementerer ikke abstraktklassen 'BaseQueryModifier' på riktig måte. Noen metoder mangler.",
        },
        DateFromLabel: "Fra",
        DateTolabel: "Til",
        DatePickerStrings: {
          months: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
          shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
          days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
          shortDays: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
          goToToday: 'Gå til i dag',
          prevMonthAriaLabel: 'Gå til forrige måned',
          nextMonthAriaLabel: 'Gå til neste måned',
          prevYearAriaLabel: 'Gå til forrige år',
          nextYearAriaLabel: 'Gå til neste år',
          closeButtonAriaLabel: 'Lukk datovelgeren',
          isRequiredErrorMessage: 'Startdato kreves',
          invalidInputErrorMessage: 'Ugyldig datoformat.'
        },
        DateIntervalStrings: {
          AnyTime: "Når som helst",
          PastDay: "Siste 24 timer",
          PastWeek: "Fra siste 24 timer til forrige uke",
          PastMonth: "Fra forrige uke til forrige måned",
          Past3Months: "Fra siste måned til siste 3 måneder",
          PastYear: "Fra siste 3 måneder til siste år",
          Older: "Eldre enn ett år"
        },
        SameTabOpenBehavior: "Bruk den aktuelle fanen",
        NewTabOpenBehavior: "Åpne i ny fane",
        PageOpenBehaviorLabel: "Sideåpningsmodus",
        EmptyFieldErrorMessage: "Dette feltet kan ikke være tomt",
        TagPickerStrings: {
          NoResultsSearchMessage: "Ingen resultater",
          SearchPlaceholder: "Søk etter en verdi..."
        },
        CurrentVerticalNotSelectedMessage: "Den gjeldende valgte vertikalen samsvarer ikke med de som er knyttet til denne nettdelen ({0}). Det vil forbli tomt i visningsmodus."
      },
      DataSources: {
        SharePointSearch: {
          SourceName: "SharePoint-søk",
          SourceConfigurationGroupName: "Kildekonfigurasjon",
          QueryTextFieldLabel: "Søketekst",
          QueryTextFieldInfoMessage: "Bruk <strong>Tilgjengelige tilkoblinger</strong> for å angi enten en statisk verdi eller en verdi fra en dynamisk komponent på siden, for eksempel en søkeboks.",
          QueryTemplateFieldLabel: "Søkemal",
          QueryTemplatePlaceHolderText: "f.eks.: Path:{Site}",
          QueryTemplateFieldDescription: "Søkemalen. Du kan også bruke {<tokens>} for å lage et dynamisk søk.",
          ResultSourceIdLabel: "Søkekildens Id / Scope|Navn",
          ResultSourceIdDescription: "Velg en standard kilde, skriv en brukerdefiner kilde-GUID eller SCOPE og NAVN på kilden adskilt av | (dvs.: SPSite|Nyheder). Gyldige scopes er [SPSiteSubscription, SPSite, SPWeb]. Trykk [Enter] for å lagre.",
          InvalidResultSourceIdMessage: "Verdien er ikke en gyldig GUID eller formatert som SCOPE|NAVN",
          EnableQueryRulesLabel: "Aktiver søkeregler",
          RefinementFilters: "Søkefilter",
          RefinementFiltersDescription: "Filter som legges på spørringen. Disse dukker ikke opp i de valgte filterene. For tekst-strenger: bruk bruk (\") istedenfor (').",
          EnableLocalizationLabel: "Aktiver lokalisering",
          EnableLocalizationOnLabel: "På",
          EnableLocalizationOffLabel: "Av",
          QueryCultureLabel: "Språk for spørringen",
          QueryCultureUseUiLanguageLabel: "Bruk valgt grensesnittspråk",
          SelectedPropertiesFieldLabel: "Valgte egenskaper",
          SelectedPropertiesFieldDescription: "Angi egenskapene som skal hentes søkeresultatene.",
          SelectedPropertiesPlaceholderLabel: "Velg egenskaper",
          HitHighlightedPropertiesFieldLabel: "Treffuthevede egenskaper",
          HitHighlightedPropertiesFieldDescription: "Angi listen over forvaltede egenskaper som skal utheves etter treff.",
          TermNotFound: "(Term med ID '{0}' ble ikke funnet)",
          ApplyQueryTemplateBtnText: "Lagre",
          EnableAudienceTargetingTglLabel: "Aktiver målgruppetilpasning",
          TrimDuplicates: "Trim duplikater",
          CollapseSpecificationLabel: "Skjul spesifikasjonen"
        },
        MicrosoftSearch: {
          QueryTextFieldLabel: "Søketekst",
          QueryTextFieldInfoMessage: "Bruk <strong>Tilgjengelige tilkoblinger</strong> for å angi enten en statisk verdi eller en verdi fra en dynamisk komponent på siden, for eksempel en søkeboks.",
          SourceName: "Microsoft-søk",
          SourceConfigurationGroupName: "Microsoft-søk",
          EntityTypesField: "Søkbare entiteter",
          SelectedFieldsPropertiesFieldLabel: "valgte egenskaper",
          SelectedFieldsPropertiesFieldDescription: "Angi egenskapene som skal hentes søkeresultatene.",
          SelectedFieldsPlaceholderLabel: "Velg egenskaper",
          EnableTopResultsLabel: "Aktiver toppresultater",
          ContentSourcesFieldLabel: "Innholdskilder",
          ContentSourcesFieldDescriptionLabel: "Viser ID for de tilkoblinger som er definert i admin-portalen for Microsoft Search Connectors",
          ContentSourcesFieldPlaceholderLabel: "f.eks.: 'MyCustomConnectorId'",
          EnableSuggestionLabel: "Aktiver staveforslag",
          EnableModificationLabel: "Aktiver stavemåtendringer",
          QueryTemplateFieldLabel: "Forespørselsmal",
          QueryTemplatePlaceHolderText: "ex: {searchTerms} IsDocument:true",
          QueryTemplateFieldDescription: "Søkemalen. Du kan også bruke {<tokens>} og KQL for å bygge en dynamisk spørring.",
          ApplyQueryTemplateBtnText: "Søke om",
          UseBetaEndpoint: "Bruk betaendepunkt",
          TrimDuplicates: "Trim duplikater",
          CollapseProperties: {
              EditCollapsePropertiesLabel: "Rediger innstillinger for sammenbrudd",
              CollapsePropertiesDescription: "Spesifiser sammenbruddsinnstillingene for søkeresultatene. Du kan enten velge et felt fra rullegardinlisten (bare hvis datakildedataene allerede er hentet) eller skrive inn din egen tilpassede verdi (trykk 'Enter' for å lagre oppføringen din)",
              CollapsePropertiesPropertyPaneFieldLabel: "Kollapsinnstillingene",
              CollapseLimitFieldLabel: "Grense",
              CollapsePropertiesFieldColumnPlaceholder: "Skjul etter felt"
          }
        },
        SearchCommon: {
          Sort: {
            SortPropertyPaneFieldLabel: "Sorter resultater",
            SortListDescription: "Angi den første sorteringsegenskapen for søkeresultatene. Du kan enten velge en egenskap i listen (kun om datakilden allerede er hentet) eller skriv din egen tilpassede verdi (trykk 'Enter' for å lagre)",
            SortDirectionAscendingLabel: "Stigende",
            SortDirectionDescendingLabel: "Synkende",
            SortErrorMessage: "Ugyldig søkeegenskap (kontroller om egenskapen er mulig å sortere etter).",
            SortPanelSortFieldLabel: "Sorter etter egenskap",
            SortPanelSortFieldAria: "Sorter etter",
            SortPanelSortFieldPlaceHolder: "Sorter etter",
            SortPanelSortDirectionLabel: "Sorteringsretning",
            SortDirectionColumnLabel: "Retning",
            SortFieldColumnLabel: "Egenskapsnavn",
            SortFieldDefaultSortLabel: "Standard sortering",
            SortFieldFriendlyNameLabel: "Visningsnavn for sortering",
            SortFieldUserSortLabel: "Bruker sortering",
            EditSortLabel: "Rediger sorteringsrekkefølge",
            SortInvalidSortableFieldMessage: "Denne egenskapen kan inte sorteres",
            SortFieldColumnPlaceholder: "Velg egenskap…"
          }
        }
      },
      Controls: {
        TextDialogButtonText: "Lägg til Handlebars-uttrykk",
        TextDialogTitle: "Rediger Handlebars",
        TextDialogCancelButtonText: "Avbryt",
        TextDialogSaveButtonText: "Lagre",
        SelectItemComboPlaceHolder: "Velg egenskap",
        AddStaticDataLabel: "Legg til statisk data",
        TextFieldApplyButtonText: "Lagre",
        SortByPlaceholderText: "Sorter etter",
        SortByDefaultOptionText: "Misligholde"
      },
      Layouts: {
        Debug: {
          Name: "Feilsøk"
        },
        CustomHandlebars: {
          Name: "Tilpasset"
        },
        CustomAdaptiveCards: {
          Name: "Tilpasset"
        },
        SimpleList: {
          Name: "Liste",
          ShowFileIconLabel: "Vis fil-ikon",
          ShowItemThumbnailLabel: "Vis miniatyrbilde"
        },
        DetailsList: {
          Name: "Detaljert liste",
          UseHandlebarsExpressionLabel: "Bruk Handlebars",
          MinimumWidthColumnLabel: "Minimal bredde (px)",
          MaximumWidthColumnLabel: "Maksimal bredde (px)",
          SortableColumnLabel: "Sorterbar",
          ResizableColumnLabel: "Størrelsen kan redigeres",
          MultilineColumnLabel: "Flere linjer",
          LinkToItemColumnLabel: "Lenke til artikel",
          CompactModeLabel: "Kompakt visning",
          ShowFileIcon: "Vis fil-ikon",
          ManageDetailsListColumnDescription: "Legg til, oppdater eller fjern kolonner fra detaljert liste-malen. Du kan enten bruke egenskapsverdien i listen direkte uten omforming, eller du kan bruke et Handlebars-uttrykk som verdi. HTML støttes også i alle felt.",
          ManageDetailsListColumnLabel: "Rediger kolonner",
          ValueColumnLabel: "Kolonneverdi",
          ValueSortingColumnLabel: "Velg sorteringsfelt...",
          ValueSortingColumnNoFieldsLabel: "Ingen felt tilgjengelig",
          FileExtensionFieldLabel: "Felt för filendelse",
          GroupByFieldLabel: "Grupper etter felt",
          EnableGrouping: "Aktiver gruppering",
          GroupingDescription: "Sørg for at du har data som vises i resultatwebdelen for å vise en liste over egenskaper.",
          CollapsedGroupsByDefault: "Vis kollapsede",
          ResetFieldsBtnLabel: "Bruk standardverdiene"
        },
        Cards: {
          Name: "Kort",
          ManageTilesFieldsLabel: "Rediger kortegenskaper",
          ManageTilesFieldsPanelDescriptionLabel: "Her kan du bestemme hvilke egenskaper som skal oppta hvilke plassholdere i kortet. Du kan enten bruke egenskapsverdien i listen direkte uten omforming, eller du kan bruke et Handlebars-uttrykk som verdi. HTML støttes også i alle felt.",
          PlaceholderNameFieldLabel: "Navn",
          SupportHTMLColumnLabel: "Tillat HTML",
          PlaceholderValueFieldLabel: "Verdi",
          UseHandlebarsExpressionLabel: "Bruk Handlebars",
          EnableItemPreview: "Tillat forhåndsvisning",
          EnableItemPreviewHoverMessage: "Å bruke denne funksjonen kan påvirke ytelsen hvis mange objekter vises samtidig og du bruker feltet 'AutoPreviewUrl'. Vi anbefaler at du bruker dette alternativet med få objekter, eller ved å bruke forhåndsdefinerte forhåndsvisnings-URL-er fra datakildens egenskaper i «slots».",
          ShowFileIcon: "Vis fil-ikon",
          CompactModeLabel: "Kompakt visning",
          PreferedCardNumberPerRow: "Ønsket antall kort per rad",
          Fields: {
            Title: "Tittel",
            Location: "Plass",
            Tags: "Stikkord",
            PreviewImage: "Forhåndsvisningsbilde",
            PreviewUrl: "Forhåndsvisnings-URL",
            Url: "URL",
            Date: "Dato",
            Author: "Forfatter",
            ProfileImage: "URL for profilbilde",
            FileExtension: "Filendelse",
            IsContainer: "Er mappe"
          },
          ResetFieldsBtnLabel: "Bruk standardverdiene"
        },
        Slider: {
          Name: "Lysbildefremvisning",
          SliderAutoPlay: "Automatisk avspilling",
          SliderAutoPlayDuration: "Varighet for automatisk avspilling (i sekunder)",
          SliderPauseAutoPlayOnHover: "Pause ved å føre musen over",
          SliderGroupCells: "Antallet elementer som skal grupperes i en visning",
          SliderShowPageDots: "Visa sidepunkter",
          SliderWrapAround: "Uendelig rulling",
          SlideHeight: "Lysbildehøyde (px)",
          SlideWidth: "Lysbildebredde (px)"
        },
        People: {
          Name: "Person",
          ManagePeopleFieldsLabel: "Rediger egenskaper for personer",
          ManagePeopleFieldsPanelDescriptionLabel: "Her kan du bestemme hvilke felter som skal oppta hvilke plassholdere. Du kan enten bruke egenskapsverdien i listen direkte uten omforming, eller du kan bruke et Handlebars-uttrykk som verdi. HTML støttes også i alle felt.",
          PlaceholderNameFieldLabel: "Navn",
          PlaceholderValueFieldLabel: "Verdi",
          UseHandlebarsExpressionLabel: "Bruk Handlebars",
          PersonaSizeOptionsLabel: "Komponentstørrelse",
          PersonaSizeExtraSmall: "Ekstra liten",
          PersonaSizeSmall: "Liten",
          PersonaSizeRegular: "Vanlig",
          PersonaSizeLarge: "Stor",
          PersonaSizeExtraLarge: "Ekstra stor",
          ShowInitialsToggleLabel: "Vis initialer hvis bilde ikke er tilgjengelig",
          SupportHTMLColumnLabel: "Tillat HTML",
          ResetFieldsBtnLabel: "Bruk standardverdier",
          ShowPersonaCardOnHover: "Vis personkort når du fører musen over",
          ShowPersonaCardOnHoverCalloutMsg: "Denne funksjonen bruker Microsoft Graph for å vise informasjon om brukere og må ha følgende API-tilganger i din klient for at det skal virke: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
          Fields: {
            ImageUrl: "Bilde-URL",
            PrimaryText: "Primærtekst",
            SecondaryText: "Sekundærtekst",
            TertiaryText: "Tertiærtekst",
            OptionalText: "Valgfri tekst"
          }
        },
        Vertical: {
          Name: "Vertikal"
        },
        Horizontal: {
          Name: "Horisontal",
          PreferedFilterNumberPerRow: "Ønsket antall filter per rad",
        },
        Panel: {
          Name: "Panel",
          IsModal: "Modal",
          IsLightDismiss: "Lett å lukke",
          Size: "Panelstørrelse",
          ButtonLabel: "Vis filter",
          ButtonLabelFieldName: "Vis knappeetiketter",
          HeaderText: "Filter",
          HeaderTextFieldName: "Tittel på panelet",
          SizeOptions: {
            SmallFixedFar: 'Liten (standard)',
            SmallFixedNear: 'Liten, nær sidan',
            Medium: 'Medium',
            Large: 'Stor',
            LargeFixed: 'Stor, fast bredde',
            ExtraLarge: 'Ekstra stor',
            SmallFluid: 'Full bredde (flytende)'
          }
        }
      },
      HandlebarsHelpers: {
        CountMessageLong: "<b>{0}</b> resultater for <em>{1}</em>",
        CountMessageShort: "<b>{0}</b> resultater",
      },
      PropertyPane: {
        ConnectionsPage: {
          DataConnectionsGroupName: "Tilgjengelige tilkoblinger",
          UseDataVerticalsWebPartLabel: "Koble til en vertikal webdel",
          UseDataVerticalsFromComponentLabel: "Bruk vertikaler fra denne komponenten"
        },
        InformationPage: {
          Extensibility: {
            GroupName: "Utvidelseskonfigurasjon",
            FieldLabel: "Utvidelsesbibliotek som skal aktiveres",
            ManageBtnLabel: "Konfigurer",
            Columns: {
              Name: "Navn/Hensikt",
              Id: "Manifest-GUID",
              Enabled: "Aktivert/Deaktivert"
            }
          },
          ImportExport: "Importer/eksporter innstillinger"
        }
      },
      Filters: {
        ApplyAllFiltersButtonLabel: "Bruk",
        ClearAllFiltersButtonLabel: "Fjern",
        FilterNoValuesMessage: "Ingen verdier for dette filteret",
        OrOperator: "ELLER",
        AndOperator: "OG",
        ComboBoxPlaceHolder: "Velg verdi",
        UseAndOperatorValues: "Use an AND operator between values",
        UseOrOperatorValues: "Use an OR operator between values",
        UseValuesOperators: "Select operator to use between this filter values"
      },
      SuggestionProviders: {
        SharePointStatic: {
          ProviderName: "SharePoint statiske søkeforslag",
          ProviderDescription: "Hent SharePoint statiske brukerdefinerte søkeforslag"
        }
      }
    }
  })
  
