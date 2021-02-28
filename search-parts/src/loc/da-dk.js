define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Vælg token...",
            Context: {
                ContextTokensGroupName: "Kontekst-tokens",
                SiteAbsoluteUrl: "Hele sidens URL",
                SiteRelativeUrl: "Sidens server-relative URL",
                WebAbsoluteUrl: "Websiden fulde URL",
                WebRelativeUrl: "Web-serverens relative URL",
                WebTitle: "Web-titel",
                InputQueryText: "Indsæt variable"
            },
            Custom: {
                CustomTokensGroupName: "Custom-værdi",
                CustomValuePlaceholder: "Indsæt værdi...",
                InvalidtokenFormatErrorMessage: "Indsæt venligst et supporteret token-format ved brug af '{' og '}'. (ex: {I dag})"
            },
            Date: {
                DateTokensGroupName: "Dato-tokens",
                Today: "I dag",
                Yesterday: "I går",
                Tomorrow: "i morgen",
                OneWeekAgo: "En uge siden",
                OneMonthAgo: "En måned siden",
                OneYearAgo: "Et år siden"
            },
            Page: {
                PageTokensGroupName: "Side-tokens",
                PageId: "Sidens ID",
                PageTitle: "Sidens titel",
                PageCustom: "Andre sidekolonner",
            },
            User: {
                UserTokensGroupName: "Bruger-tokens",
                UserName: "Brugernavn",
                Me: "Mig",
                UserDepartment: "Brugerens afdeling",
                UserCustom: "Brugerdefineret egenskab"
            }
        },
        General: {
            OnTextLabel: "On",
            OffTextLabel: "Off",
            StaticArrayFieldName: "Array like-felt",
            About: "Om",
            Authors: "Forfatter(e)",
            Version: "Version",
            InstanceId: "Webpart-instance ID",
            Resources: {
                GroupName: "Ressourcer",
                Documentation: "Dokumentation",
                PleaseReferToDocumentationMessage: "Referér venligst til den officielle dokumentation."
            },
            Extensibility: {
                InvalidDataSourceInstance: "Den valgte datakilde '{0}' kan ikke implementere den abstrakte klasse'BaseDataKilden' korrekt. Der mangler metoder.",
                DataSourceDefinitionNotFound: "Den brugerdefinerede datakilde med nøglen '{0}' blev ikke fundet. Husk at sikre at løsningen er korrekt implementeret til app-kataloget, og at manifest-ID'et er forbundet til webparten.",
                LayoutDefinitionNotFound: "Det brugerdefinerede layout med nøglen '{0}' blev ikke fundet. Husk at sikre at løsningen er korrekt implementeret til app-kataloget, og at manifest-ID'et er forbundet til webparten.",
                InvalidLayoutInstance: "Det valgte layout '{0}' har ikke implementeret den abstrakte klasse 'BaseLayout' korrekt. Der mangler metoder.",
                DefaultExtensibilityLibraryName: "Standard extensibility-bibliotek",
                InvalidProviderInstance: "Den valgte udbyder af forslag '{0}' kan ikke implementere den abstrakte klasse 'BaseForslagsUdbyder' korrekt. Der mangler metoder.",
                ProviderDefinitionNotFound: "Den brugerdefinerede udbyder af forslag med nøglen '{0}' blev ikke fundet. Husk at sikre at løsningen er korrekt implementeret til app-kataloget, og at manifest-ID'et er forbundet til webparten.",
            },
            DateFromLabel: "Fra",
            DateTolabel: "Til",
            DatePickerStrings: {
                months: ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
                shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
                days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
                shortDays: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
                goToToday: 'Gå til i dag',
                prevMonthAriaLabel: 'Gå til foregående måned',
                nextMonthAriaLabel: 'Gå til næste måned',
                prevYearAriaLabel: 'Gå til foregående år',
                nextYearAriaLabel: 'Gå til næste år',
                closeButtonAriaLabel: 'Luk datovælger',
                isRequiredErrorMessage: 'Startdato er obligatorisk.',
                invalidInputErrorMessage: 'Ugyldigt datoformat.'
            },
            DateIntervalStrings: {
                AnyTime: "Når som helst",
                PastDay: "Sidste 24 timer",
                PastWeek: "Sidste uge",
                PastMonth: "Sidste måned",
                Past3Months: "Sidste 3 måneder",
                PastYear: "Sidste år",
                Older: "Ældre end et år"
            },
            SameTabOpenBehavior: "Brug det nuværende faneblad",
            NewTabOpenBehavior: "Åben i et nyt faneblad",
            PageOpenBehaviorLabel: "Opening-egenskaber",
            EmptyFieldErrorMessage: "Dette felt må ikke stå tomt"
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint-søgning",
                SourceConfigurationGroupName: "Konfiguration af kilde",
                QueryTextFieldLabel: "Tekst på variabel",
                QueryTextFieldInfoMessage: "Anvend konfigurationsfaneblad i webparten <strong> tilgængelige forbindelser</strong> for at specificere enten en statisk eller en værdi fra et dynamisk komponent på siden, som fx en søgeboks.",
                QueryTemplateFieldLabel: "Søgeforespørgsselsskabelon",
                QueryTemplatePlaceHolderText: "Fx: Sti:{Site}",
                QueryTemplateFieldDescription: "Søgeforespørgselsskabelonen. Du kan også anvende {<tokens>} for at bygge en dynamisk forespørgsel.",
                ResultSourceIdLabel: "ID på søgeresultatet",
                ResultSourceIdDescription: "Anvend et standard SharePoint ID på søgeresultatet, eller indsæt din egen GUID-værdi eller tryk 'Enter' for at gemme.",
                InvalidResultSourceIdMessage: "Værdien er ikke en gyldig GUID",
                EnableQueryRulesLabel: "Aktivér forespørgselsregler",
                IncludeOneDriveResultsLabel: "Inkludér resultater fra OneDrive for Business",
                RefinementFilters: "Refinement-filtre",
                RefinementFiltersDescription: "Initiale refinement-filtre der kan bruges i en forespørgsel. Disse vil ikke fremgå i de valgte filtre. Hvis du ønsker at indsætte tekst, anvend da sitationstegn (\") frem for (').",
                EnableLocalizationLabel: "Aktivér lokalisering",
                EnableLocalizationOnLabel: "On",
                EnableLocalizationOffLabel: "Off",
                QueryCultureLabel: "Sproget på søgeanmodning",
                QueryCultureUseUiLanguageLabel: "Brug interface-sprog",
                SelectedPropertiesFieldLabel: "Valgte egenskaber",
                SelectedPropertiesFieldDescription: "Specificerer egenskaber der hentes fra søgeresultaterne.",
                SelectedPropertiesPlaceholderLabel: "Vælg egenskaber",
                TermNotFound: "(Term med ID '{0}' blev ikke fundet)",
                ApplyQueryTemplateBtnText: "Anvend",
                EnableAudienceTargetingTglLabel: "Aktivér målgruppestyring"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Forespørgselstekst",
                QueryTextFieldInfoMessage: "Anvend konfigurationsfaneblad i webparten <strong> tilgængelige forbindelser</strong> for at specificere enten en statisk eller en værdi fra et dynamisk komponent på siden, som fx en søgeboks.",
                SourceName: "Microsoft-søgning",
                SourceConfigurationGroupName: "Microsoft-søgning",
                EntityTypesField: "Søgbare entitetstyper",
                SelectedFieldsPropertiesFieldLabel: "Valgte felter",
                SelectedFieldsPropertiesFieldDescription: "Specificerer felter der hentes fra søgeresultaterne.",
                SelectedFieldsPlaceholderLabel: "Vælg felter",
                EnableTopResultsLabel: "Aktivér topresultater",
                ContentSourcesFieldLabel: "Indholdskilder",
                ContentSourcesFieldDescriptionLabel: "Viser ID af de forbindelser der er defineret i administrationsportalen for Microsoft Search-connectors.",
                ContentSourcesFieldPlaceholderLabel: "Fx: 'MyCustomConnectorId'"
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Sorteringsrækkefølge",
                    SortListDescription: "Specificér den initiale sorteringsrækkefølge for søgeresultater. Du kan enten vælge et felt fra dropdown-listen (kun hvis datakilden allerede er blevet hentet), eller indsætte din egen brugerdefinerede værdi (tryk'Enter' for at gemme)",
                    SortDirectionAscendingLabel: "Stigende",
                    SortDirectionDescendingLabel: "Faldende",
                    SortErrorMessage: "Ugyldig søgeegenskab (tjek om din administreret egenskab er sorterbar).",
                    SortPanelSortFieldLabel: "Sortér efter felter",
                    SortPanelSortFieldAria: "Sortér efter",
                    SortPanelSortFieldPlaceHolder: "Sortér efter",
                    SortPanelSortDirectionLabel: "Sortér retning",
                    SortDirectionColumnLabel: "Retning",
                    SortFieldColumnLabel: "Feltnavn",
                    EditSortLabel: "Redigér sorteringsrækkefølge",
                    SortInvalidSortableFieldMessage: "Denne egenskab er ikke sorterbar",
                    SortFieldColumnPlaceholder: "Vælg felt..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Tilføj Handlebars-udtryk",
            TextDialogTitle: "Redigér Handlebars-udtryk",
            TextDialogCancelButtonText: "Annullér",
            TextDialogSaveButtonText: "Gem",
            SelectItemComboPlaceHolder: "Vælg egenskab",
            AddStaticDataLabel: "Tilføj statisk data",
            TextFieldApplyButtonText: "Anvend"
        },
        Layouts: {
            Debug: {
                Name: "Fejlfind"
            },
            Custom: {
                Name: "Brugerdefineret"
            },
            SimpleList: {
                Name: "Liste",
                ShowFileIconLabel: "Vis filikon",
                ShowItemThumbnailLabel: "Vis miniaturebillede"
            },
            DetailsList: {
                Name: "Detaljeliste",
                UseHandlebarsExpressionLabel: "Anvend Handlebars-udtryk",
                MinimumWidthColumnLabel: "Minimum bredde (px)",
                MaximumWidthColumnLabel: "Maksimum bredde (px)",
                SortableColumnLabel: "Sortérbar",
                ResizableColumnLabel: "Størrelse kan redigeres",
                MultilineColumnLabel: "Multi-linje",
                LinkToItemColumnLabel: "Link til item",
                SupportHTMLColumnLabel: "Tillad HTML",
                CompactModeLabel: "Compakt-mode",
                ShowFileIcon: "Vis filikon",
                ManageDetailsListColumnDescription: "Tilføj, opdatér eller fjern kolonner fra layoutet på detaljelisten. Du kan enten bruge egenskabsværdier i listen direkte uden nogen transformation, eller du kan bruge et Handlebars-udtryk som feltets værdi. HTML er supporteret til brug i alle felter.",
                ManageDetailsListColumnLabel: "Administrér kolonner",
                ValueColumnLabel: "Kolonnes værdi",
                DisplayNameColumnLabel: "Kolonnens visningsnavn",
                FileExtensionFieldLabel: "Felt til brug af file extension",
                GroupByFieldLabel: "Gruppér efter felt",
                EnableGrouping: "Aktivér gruppering",
                CollapsedGroupsByDefault: "Vis collapsed",
                ResetFieldsBtnLabel: "Nulstil felter til standardværdier"
            },
            Cards: {
                Name: "Cards",
                ManageTilesFieldsLabel: "Administrér card-felter",
                ManageTilesFieldsPanelDescriptionLabel: "Her kan du mappe hver feltværdi med den tilsvarende card placeholder. Du kan enten bruge en resultatsegenskab direkte uden nogen transformation, eller du kan bruge et Handlebars-udtryk som feltets værdi. Derudover kan du, når det er specificeret, indsætte din egen HTML-kode i annoterede felter.",
                PlaceholderNameFieldLabel: "Navn",
                SupportHTMLColumnLabel: "Tillad HTML",
                PlaceholderValueFieldLabel: "Værdi",
                UseHandlebarsExpressionLabel: "Anvend Handlebars-udtryk",
                EnableItemPreview: "Tillad forhåndsvisning af resultat",
                EnableItemPreviewHoverMessage: "Ved at tillade denne mulighed, kan det have en indvirkning på performance, hvis for mange items vises på samme tid, og du bruger feltet 'AutoPreviewUrl''. Vi anbefaler dig at bruge denne mulighed med få items, eller ved at bruge predefinerede forhåndsvisninger af URL'er fra din datakildes felter i slots.",
                ShowFileIcon: "Vis filikon",
                CompactModeLabel: "Kompakt-mode",
                PreferedCardNumberPerRow: "Fortrukne numre af cards per række",
                Fields: {
                    Title: "Titel",
                    Location: "Lokation",
                    Tags: "Tags",
                    PreviewImage: "Forhåndsvisning af billede",
                    PreviewUrl: "Forhåndsvisning af Url",
                    Url: "Url",
                    Date: "Dato",
                    Author: "Forfatter",
                    ProfileImage: "Url til profilbillede",
                    FileExtension: "Extension af fil",
                    IsContainer: "Er Folder"
                },
                ResetFieldsBtnLabel: "Nulstil felter til standard værdier"
            },
            Slider: {
                Name: "Slider",
                SliderAutoPlay: "Autoplay",
                SliderAutoPlayDuration: "Autoplay-varighed (i sekunder)",
                SliderPauseAutoPlayOnHover: "Pause af hover",
                SliderGroupCells: "Antallet af elementer der skal grupperes sammen i slides",
                SliderShowPageDots: "Vis sidevisningsprikker",
                SliderWrapAround: "Infinitiv scrolling",
                SlideHeight: "Slide-højde (i px)",
                SlideWidth: "Slide bredde (i px)"
            },
            People: {
                Name: "Personer",
                ManagePeopleFieldsLabel: "Administrér personfelter",
                ManagePeopleFieldsPanelDescriptionLabel: "Her kan du mappe hver feltværdi med den tilsvarende persona-placeholder. Du kan enten anvende datakildens feltværdig direkte uden nogen transformation, eller du kan bruge et Handlebars-udtryk i værdifeltet.",
                PlaceholderNameFieldLabel: "Navn",
                PlaceholderValueFieldLabel: "Værdi",
                UseHandlebarsExpressionLabel: "Brug Handlebars-udtryk",
                PersonaSizeOptionsLabel: "Størrelse af komponent",
                PersonaSizeExtraSmall: "Ekstra lille",
                PersonaSizeSmall: "Lille",
                PersonaSizeRegular: "Regulær",
                PersonaSizeLarge: "Stor",
                PersonaSizeExtraLarge: "Ekstra stor",
                ShowInitialsToggleLabel: "Vis initialer hvis der ikke er et billede tilgængeligt",
                SupportHTMLColumnLabel: "Tillad HTML",
                ResetFieldsBtnLabel: "Nulstil felter til standardværdier",
                ShowPersonaCardOnHover: "Vis persona-card ved at hover",
                ShowPersonaCardOnHoverCalloutMsg: "Denne feature bruger Microsoft Graph til at vise information om brugeren og skal bruge de følgende API-tilladelser i din tenant, for at det virker: ['User.Read','People.Read','Contacts.Read','User.ReadBasic.All'].",
                Fields: {
                    ImageUrl: "Billede-URL",
                    PrimaryText: "Primær tekst",
                    SecondaryText: "Sekundær tekst",
                    TertiaryText: "Tertiær tekst",
                    OptionalText: "Valgfri tekst"
                }
            },
            Vertical: {
                Name: "Vertikal"
            },
            Horizontal: {
                Name: "Horisontal",
                PreferedFilterNumberPerRow: "Fortrukne antal filtre per rækkke",
            },
            Panel: {
                Name: "Panel",
                IsModal: "Modal",
                IsLightDismiss: "Let dismiss",
                Size: "Størrelse på panel",
                ButtonLabel: "Vis filtre",
                ButtonLabelFieldName: "Vis Button-label",
                HeaderText: "Filtre",
                HeaderTextFieldName: "Overskrift på panel",
                SizeOptions: {
                    SmallFixedFar: 'Lille (standard)',
                    SmallFixedNear: 'Lille, tæt på side',
                    Medium: 'Medium',
                    Large: 'Stor',
                    LargeFixed: 'Stor, fastsat bredde',
                    ExtraLarge: 'Ekstra stor',
                    SmallFluid: 'Fuld bredde (fluid)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> resultater for '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> resultater",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Tilgængelige forbindelser"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Extensibility-konfiguration",
                    FieldLabel: "Extensibility-biblioteker der skal loade",
                    ManageBtnLabel: "Konfigurér",
                    Columns: {
                        Name: "Navn/Formål",
                        Id: "Manifest GUID",
                        Enabled: "Enabled/Disabled"
                    }
                }
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Anvend",
            ClearAllFiltersButtonLabel: "Slet",
            FilterNoValuesMessage: "Ingen værdier for dette filter",
            OrOperator: "ELLER",
            AndOperator: "OG",
            ComboBoxPlaceHolder: "Vælg værdi"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "SharePoint-statiske søgeforslag",
                ProviderDescription: "Hent SharePoint-statiske brugerdefinerede søgeforslag"
            }
        }
    }
})