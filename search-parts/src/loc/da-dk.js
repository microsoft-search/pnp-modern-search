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
                QueryModifierDefinitionNotFound: "Den brugerdefinerede queryModifier med nøglen '{0}' blev ikke fundet. Sørg for, at løsningen er korrekt implementeret i app-kataloget, og at manifest-ID'et er registreret for denne webpart.",
                InvalidQueryModifierInstance: "Den valgte brugerdefinerede queryModifier '{0}' implementerer ikke den abstrakte klasse 'BaseQueryModifier' korrekt. Der mangler nogle metoder.",
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
                PastWeek: "Fra sidste 24 timer til sidste uge",
                PastMonth: "Fra sidste uge til sidste måned",
                Past3Months: "Fra sidste måned til seneste 3 måneder",
                PastYear: "Fra sidste 3 måneder til sidste år",
                Older: "Ældre end et år"
            },
            SameTabOpenBehavior: "Brug det nuværende faneblad",
            NewTabOpenBehavior: "Åben i et nyt faneblad",
            PageOpenBehaviorLabel: "Opening-egenskaber",
            EmptyFieldErrorMessage: "Dette felt må ikke stå tomt",
            TagPickerStrings: {
                NoResultsSearchMessage: "Ingen resultater fundet",
                SearchPlaceholder: "Søg efter en værdi..."
            },
            CurrentVerticalNotSelectedMessage: "Den aktuelle valgte vertikal stemmer ikke overens med dem, der er knyttet til denne webdel ({0}). Den forbliver tom i visningstilstand.",
            True: "Ja",
            False: "Nej"
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
                ResultSourceIdLabel: "Søgekildens Id / Niveau|Navn",
                ResultSourceIdDescription: "Vælg en indbygget kilde, skriv en brugerdefineret kilde-GUID eller NIVEAU og NAVN på kilden adskilt af | (dvs.: SPSite|Nyheder). Gyldige niveauer er [SPSiteSubscription, SPSite, SPWeb]. Tryk på [Enter] for at gemme.",
                InvalidResultSourceIdMessage: "Værdien er ikke en gyldig GUID eller formateret som NIVEAU|NAVN",
                EnableQueryRulesLabel: "Aktivér forespørgselsregler",
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
                HitHighlightedPropertiesFieldLabel: "Resultatfremhævede egenskaber",
                HitHighlightedPropertiesFieldDescription: "Angiv listen med administrerede egenskaber til fremhævning af resultater.",
                TermNotFound: "(Term med ID '{0}' blev ikke fundet)",
                ApplyQueryTemplateBtnText: "Anvend",
                EnableAudienceTargetingTglLabel: "Aktivér målgruppestyring",
                TrimDuplicates: "Trim dubletter",
                CollapseSpecificationLabel: "Skjul specifikation",
                CacheTimeoutLabel: "Cache timeout in minutes (Set to 0 for no caching)"            
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
                ContentSourcesFieldPlaceholderLabel: "Fx: 'MyCustomConnectorId'",
                EnableSuggestionLabel: "Aktiver staveforslag",
                EnableModificationLabel: "Aktiver staveændringer",
                QueryTemplateFieldLabel: "Forespørgselsmodifikator",
                QueryTemplatePlaceHolderText: "ex: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "Søgemodifikator-skabelonen. Du kan også bruge {<tokens>} og KQL til at bygge en dynamisk forespørgsel. Alt sammenkædes til inputQueryText",
                ApplyQueryTemplateBtnText: "Anvend",
                UseBetaEndpoint: "Brug beta-endepunkt",
                TrimDuplicates: "Trim dubletter",
                showSPEmbeddedContentLabel: "Vis SharePoint Embedded (skjult) i søgeresultater",
                showMSArchivedContentLabel: "Vis MS Arkiveret indhold i søgeresultater",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Rediger indstillinger for skjul",
                    CollapsePropertiesDescription: "Angiv indstillingerne for sammenbrud for søgeresultaterne. Du kan enten vælge et felt fra rullelisten (kun hvis datakildedataene allerede er hentet) eller indtaste din egen tilpassede værdi (tryk på 'Enter' for at gemme din indtastning)",
                    CollapsePropertiesPropertyPaneFieldLabel: "Indstillingerne for sammenbrud",
                    CollapseLimitFieldLabel: "Begrænse",
                    CollapsePropertiesFieldColumnPlaceholder: "Kollaps efter felt"
                }
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
                    SortFieldDefaultSortLabel: "Standard sortering",
                    SortFieldFriendlyNameLabel: "Visningsnavn for sortering",
                    SortFieldUserSortLabel: "Bruger sortering",
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
            TextFieldApplyButtonText: "Anvend",
            SortByPlaceholderText: "Sorter efter...",
            SortByDefaultOptionText: "Standard",
            DownloadButtonText: "Download"
        },
        Layouts: {
            Debug: {
                Name: "Fejlfind"
            },
            CustomHandlebars: {
                Name: "Brugerdefineret"
            },
            CustomAdaptiveCards: {
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
                CompactModeLabel: "Kompaktvisning",
                ShowFileIcon: "Vis filikon",
                ManageDetailsListColumnDescription: "Tilføj, opdatér eller fjern kolonner fra layoutet på detaljelisten. Du kan enten bruge egenskabsværdier i listen direkte uden nogen transformation, eller du kan bruge et Handlebars-udtryk som feltets værdi. HTML er supporteret til brug i alle felter.",
                ManageDetailsListColumnLabel: "Administrér kolonner",
                ValueColumnLabel: "Kolonnes værdi",
                ValueSortingColumnLabel: "Vælg sorteringsfelt...",
                ValueSortingColumnNoFieldsLabel: "Ingen tilgængelige felter",
                DisplayNameColumnLabel: "Kolonnens visningsnavn",
                FileExtensionFieldLabel: "Felt til brug af file extension",
                GroupByFieldLabel: "Gruppér efter felt",
                GroupByOthersGroupFieldLabel: "Gruppetitel for andre varer",
                GroupByOthersGroupDefaultValue: "Ingen værdi",
                AdditionalGroupByButtonLabel: "Tilføj felt",
                AdditionalGroupByFieldsLabel: "Yderligere grupperingsfelter",
                AdditionalGroupByFieldsDescription: "Tilføj yderligere grupperingsfelter for at skabe et hierarki i layoutet. Hver kolonne tilføjes i den viste rækkefølge.",
                EnableGrouping: "Aktivér gruppering",
                GroupingDescription: "Sørg for, at du har data vist i resultatwebdelen for at få vist en liste over egenskaber.",
                CollapsedGroupsByDefault: "Vis collapsed",
                ResetFieldsBtnLabel: "Nulstil felter til standardværdier",
                EnableStickyHeader: "Aktivér fastgjort header",
                StickyHeaderListViewHeight: "Listevisningshøjde (px)",
                EnableDownload: "Aktivér download",
                UseAlternatingBackgroundColor:"Vis skiftende baggrundsfarve"
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
                ShowPersonaCardOnHoverNative: "Vis persona-card ved at hover (LPC)",
                ShowPersonaCardOnHoverCalloutMsg: "Denne feature bruger Microsoft Graph til at vise information om brugeren og skal bruge de følgende API-tilladelser i din tenant, for at det virker: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                ShowPersonaPresenceInfo: "Vis tilstedeværelse",
                ShowPersonaPresenceInfoCalloutMsg: "Denne funktion kræver følgende API-tilladelser i din tenant for at fungere: ['Presence.Read.All']",
                Fields: {
                    ImageUrl: "Billede-URL",
                    PrimaryText: "Primær tekst",
                    SecondaryText: "Sekundær tekst",
                    TertiaryText: "Tertiær tekst",
                    OptionalText: "Valgfri tekst",
                    UPN: "UPN"
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
            },
            PersonCard: {
              SendEmailLinkSubtitle: "Send e-mail",
              StartChatLinkSubtitle: "Start chat",
              ShowMoreSectionButton: "Vis mere",
              ContactSectionTitle: "Kontakt",
              ReportsToSectionTitle: "Rapporterer til",
              DirectReportsSectionTitle: "Direkte underordnede",
              OrganizationSectionTitle: "Organisation",
              YouWorkWithSubSectionTitle: "Du arbejder med",
              UserWorksWithSubSectionTitle: "arbejder med",
              EmailsSectionTitle: "E-mails",
              FilesSectionTitle: "Filer",
              SharedTextSubtitle: "Delt",
              SkillsAndExperienceSectionTitle: "Færdigheder & Erfaring",
              AboutCompactSectionTitle: "Om",
              SkillsSubSectionTitle: "Færdigheder",
              LanguagesSubSectionTitle: "Sprog",
              WorkExperienceSubSectionTitle: "Arbejdserfaring",
              EducationSubSectionTitle: "Uddannelse",
              ProfessionalInterestsSubSectionTitle: "Professionelle interesser",
              PersonalInterestsSubSectionTitle: "Personlige interesser",
              BirthdaySubSectionTitle: "Fødselsdag",
              CurrentYearSubtitle: "Nuværende",
              EndOfCard: "Slut på kortet",
              QuickMessage: "Send en hurtig besked",
              ExpandDetailsLabel: "Udvid detaljer",
              SendMessageLabel: "Send besked",
              EmailButtonLabel: "E-mail",
              CallButtonLabel: "Ring",
              ChatButtonLabel: "Chat",
              CloseCardLabel: "Luk kort",
              VideoButtonLabel: "Video",
              GoBackLabel: "Gå tilbage",
              EmailTitle: "E-mail",
              ChatTitle: "Teams",
              BusinessPhoneTitle: "Arbejdstelefon",
              CellPhoneTitle: "Mobiltelefon",
              DepartmentTitle: "Afdeling",
              PersonTitle: "Titel",
              OfficeLocationTitle: "Kontorplacering",
              CopyToClipboardButton: "Kopier til udklipsholder",
              ShowMoreSubtitle: "Vis flere elementer",
              SocialMediaSubSectionTitle: "Sociale medier"
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> resultater for '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> resultater",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Tilgængelige forbindelser",
                UseDataVerticalsWebPartLabel: "Forbind til en vertikal webbdel",
                UseDataVerticalsFromComponentLabel: "Anvend vertikaler fra denne komponent"
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
                },
                ImportExport: "Indstillinger for import/eksport"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Anvend",
            ClearAllFiltersButtonLabel: "Slet",
            FilterNoValuesMessage: "Ingen værdier for dette filter",
            OrOperator: "ELLER",
            AndOperator: "OG",
            ComboBoxPlaceHolder: "Vælg værdi",
            UseAndOperatorValues: "Brug en AND operator imellem værdierne",
            UseOrOperatorValues: "Brug en OR operator imellem værdierne",
            UseValuesOperators: "Vælg en operator for disse filter værdier"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "SharePoint-statiske søgeforslag",
                ProviderDescription: "Hent SharePoint-statiske brugerdefinerede søgeforslag"
            }
        }
    }
})
