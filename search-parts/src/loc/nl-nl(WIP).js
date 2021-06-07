define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Selecteer een token...",
            Context: {
                ContextTokensGroupName: "Context tokens",
                SiteAbsoluteUrl: "Absolute site URL",
                SiteRelativeUrl: "Server-relatieve site URL",
                WebAbsoluteUrl: "Absolute web URL",
                WebRelativeUrl: "Server-relatieve web URL",
                WebTitle: "Web titel",
                InputQueryText: "Zoekopdracht"
            },
            Custom: {
                CustomTokensGroupName: "Aangepaste waarde",
                CustomValuePlaceholder: "Geef een waarde op...",
                InvalidtokenFormatErrorMessage: "Geef een ondersteund token formaat op gebruik makend van '{' en '}'. (bijv: {Today})"
            },
            Date: {
                DateTokensGroupName: "Datum tokens",
                Today: "Vandaag",
                Yesterday: "Gisteren",
                Tomorrow: "Morgen",
                OneWeekAgo: "Een week geleden",
                OneMonthAgo: "Een maand geleden",
                OneYearAgo: "Een jaar geleden",
            },
            Page: {
                PageTokensGroupName: "Pagina tokens",
                PageId: "Pagina ID",
                PageTitle: "Pagina Titel",
                PageCustom: "Andere paging kolom",
            },
            User: {
                UserTokensGroupName: "Gebruikerstokens",
                UserName: "Gebruikersnaam",
                Me: "Ik",
                UserDepartment: "Afdeling gebruiker",
                UserCustom: "Aangepaste gebruikerseigenschap"
            }
        },
        General: {
            OnTextLabel: "Aan",
            OffTextLabel: "Uit",
            StaticArrayFieldName: "Array-achtig veld",
            About: "Over",
            Authors: "Auteur(s)",
            Version: "Versie",
            InstanceId: "Webonderdeel instantie ID",
            Resources: {
                GroupName: "Bronnen",
                Documentation: "Documentatie",
                PleaseReferToDocumentationMessage: "Raadpleeg de officiele documetatie."
            },
            Extensibility: { //TODO!!
                InvalidDataSourceInstance: "The selected data source '{0}' does not implement the 'BaseDataSource' abstract class correctly. Some methods are missing.",
                DataSourceDefinitionNotFound: "The custom data source with key '{0}' was not found. Make sure the solution is correctly deployed to the app caltog and the manifest ID registered for this Web Part.",
                LayoutDefinitionNotFound: "The custom layout with key '{0}' was not found. Make sure the solution is correctly deployed to the app caltog and the manifest ID registered for this Web Part.",
                InvalidLayoutInstance: "The selected layout '{0}' does not implement the 'BaseLayout' abstract class correctly. Some methods are missing.",
                DefaultExtensibilityLibraryName: "Default extensibility library",
                InvalidProviderInstance: "The selected suggestions provider '{0}' does not implement the 'BaseSuggestionProvider' abstract class correctly. Some methods are missing.",
                ProviderDefinitionNotFound: "The custom suggestions provider with key '{0}' was not found. Make sure the solution is correctly deployed to the app caltog and the manifest ID registered for this Web Part.",
            },
            DateFromLabel: "Van",
            DateTolabel: "Tot",
            DatePickerStrings: {
                months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
                shortMonths: ['jan','feb','maa','apr','mei','jun','jul','aug', 'sep','okt','nov','dec'],
                days: ['Zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'],
                shortDays: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
                goToToday: 'Ga naar vandaag',
                prevMonthAriaLabel: 'Ga naar vorige maand',
                nextMonthAriaLabel: 'Ga naar volgende maand',
                prevYearAriaLabel: 'Ga naar vorig jaar',
                nextYearAriaLabel: 'Ga naar volgend jaar',
                closeButtonAriaLabel: 'Sluit datumkiezer',
                isRequiredErrorMessage: 'Startdatum is verplich.',
                invalidInputErrorMessage: 'Verkeerde datumnotatie.'
            },
            DateIntervalStrings: {
                AnyTime: "Altijd",
                PastDay: "Laatste 24 uur",
                PastWeek: "Laatste week",
                PastMonth: "Laatste maand",
                Past3Months: "Laatste 3 maanden",
                PastYear: "Laatste jaar",
                Older: "Ouder dan 1 jaar"
            },
            SameTabOpenBehavior: "Gebruik de huidige tab",
            NewTabOpenBehavior: "Open in een nieuwe tab",
            PageOpenBehaviorLabel: "Gedrag voor openen",
            EmptyFieldErrorMessage: "Dit veld mag niet leeg zijn"
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint Zoeken",
                SourceConfigurationGroupName: "Bron configuratie",
                QueryTextFieldLabel: "Zoekopdracht",
                QueryTextFieldInfoMessage: "Gebruik de  <strong>Beschikbare verbindingen</strong> webonderdeel instellingen tab om een statische waarde of een waarde uit een dynamische component op de pagina zoals een zoekvak in te stellen",
                QueryTemplateFieldLabel: "Zoekopdracht template",
                QueryTemplatePlaceHolderText: "ex: Path:{Site}",
                QueryTemplateFieldDescription: "Het zoekopdracht template. Je kan ook {<tokens>} gebruiken om een dynamische zoekopdracht op te bouwen.",
                ResultSourceIdLabel: "Resultaatbron ID",
                ResultSourceIdDescription: "Gebruik een standaard resultaatbron ID of geef je eigen GUID waarde in en druk op 'Enter' om op te slaan.",
                InvalidResultSourceIdMessage: "De opgegeven waarde is geen valide GUID",
                EnableQueryRulesLabel: "Zoekregels inschakelen",
                IncludeOneDriveResultsLabel: "Resultaten van OneDrive voor Bedrijven opnemen",
                RefinementFilters: "Refinement filters",
                RefinementFiltersDescription: "Initiële verfijningen om toe te passen op de zoekopdracht. Deze verschijnen niet in de geselecteerde filters. Voor tekenreeksuitdrukkingen gebruik je dubbele aanhalingstekens (\") in plaats van enkele (').",
                EnableLocalizationLabel: "Lokalisatie inschakelen",
                EnableLocalizationOnLabel: "Aan",
                EnableLocalizationOffLabel: "Uit",
                QueryCultureLabel: "Taal van de zoekopdracht",
                QueryCultureUseUiLanguageLabel: "Gebruik taal van de gebruikersinterface",
                SelectedPropertiesFieldLabel: "Geselecteerde eigenschappen",
                SelectedPropertiesFieldDescription: "Specificeert de uit de zoekresultaten op te halen eigenschappen.",
                SelectedPropertiesPlaceholderLabel: "Selecteer eigenschappen",
                TermNotFound: "(Term met ID '{0}' niet gevonden)",
                ApplyQueryTemplateBtnText: "Toepassen",
                EnableAudienceTargetingTglLabel: "Schakel doelgroepen in"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Zoekopdracht",
                QueryTextFieldInfoMessage: "Gebruik de  <strong>Beschikbare verbindingen</strong> webonderdeel instellingen tab om een statische waarde of een waarde uit een dynamische component op de pagina zoals een zoekvak in te stellen",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Entiteitstypen om te zoeken",
                SelectedFieldsPropertiesFieldLabel: "Geselecteerde velden",
                SelectedFieldsPropertiesFieldDescription: "Specificeert de velden om op te halen uit de zoekresultaten.",
                SelectedFieldsPlaceholderLabel: "Selecteer velden",
                EnableTopResultsLabel: "Topresultaten inschakelen",
                ContentSourcesFieldLabel: "Inhoudsbronnen",
                ContentSourcesFieldDescriptionLabel: "IDs van verbingingen gedefinieerd in de Microsoft Search connectors administratie portaal.",
                ContentSourcesFieldPlaceholderLabel: "bijv: 'MuCustomConnectorId'"
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Sorteervolgorde",
                    SortListDescription: "Specificeer de initiële sorteervolgorde van de zoekresultaten. Je kan een waarde selecteren uit de keuzelijst (alleen als de data uit de databron al geladen is) of geef een eigen aangepaste waarde in (druk op 'Enter' om je invoer te bewaren)",
                    SortDirectionAscendingLabel: "Oplopend",
                    SortDirectionDescendingLabel: "Aflopend",
                    SortErrorMessage: "Ongeldige zoekeigenschap (controleer of de beheerde eigenschap te sorteren is)",
                    SortPanelSortFieldLabel: "Sorteer op een field",
                    SortPanelSortFieldAria: "Sorteer op",
                    SortPanelSortFieldPlaceHolder: "Sorteer op",
                    SortPanelSortDirectionLabel: "Sorteervolgorde",
                    SortDirectionColumnLabel: "Volgorde",
                    SortFieldColumnLabel: "Veldnaam",
                    EditSortLabel: "Bewerk sorteervolgorde",
                    SortInvalidSortableFieldMessage: "Deze eigenschap kan niet worden gesorteerd",
                    SortFieldColumnPlaceholder: "Selecteer veld..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Voeg een Handlebars-uitdrukking toe",
            TextDialogTitle: "Bewerk Handlebars-uitdrukking",
            TextDialogCancelButtonText: "Annuleer",
            TextDialogSaveButtonText: "Bewaar",
            SelectItemComboPlaceHolder: "Selecteer eigenschap",
            AddStaticDataLabel: "Voeg statische data toe",
            TextFieldApplyButtonText: "Toepassen"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            Custom: {
                Name: "Aangepast"
            },
            SimpleList: {
                Name: "Lijst",
                ShowFileIconLabel: "Toon bestandspictogram",
                ShowItemThumbnailLabel: "Toon miniatuurweergave"
            },
            DetailsList: {
                Name: "Details Lijst",
                UseHandlebarsExpressionLabel: "Gebruik Handlebars-uitdrukking",
                MinimumWidthColumnLabel: "Minimale breedte (px)",
                MaximumWidthColumnLabel: "Maximale breedte (px)",
                SortableColumnLabel: "Sorteerbaar",
                ResizableColumnLabel: "Aanpasbaar",
                MultilineColumnLabel: "Meerregelig",
                LinkToItemColumnLabel: "Link naar item",
                CompactModeLabel: "Compacte modus",
                ShowFileIcon: "Toon bestandspictogram",
                ManageDetailsListColumnDescription: "Kolommen toevoegen, bewerken of verwijderen voor de detailslijst indeling. Je kan eigenschapswaarden direct in de lijst gebruiken zonder transformaties toe te passen, of een Handlebars-uitdrukking gebruiken in het veld voor de waarde. HTML wordt ook ondersteund voor alle velden.",
                ManageDetailsListColumnLabel: "Beheer kolommen",
                ValueColumnLabel: "Kolomwaarde",
                DisplayNameColumnLabel: "Kolom weergavenaam",
                FileExtensionFieldLabel: "Field to use for file extension",
                GroupByFieldLabel: "Groepeer op veld",
                EnableGrouping: "Groeperen inschakelen",
                CollapsedGroupsByDefault: "Toon ingeklapt",
                ResetFieldsBtnLabel: "Reset velden naar standaard waarden"
            },
            Cards: {
                Name: "Cards",
                ManageTilesFieldsLabel: "Managed card fields",
                ManageTilesFieldsPanelDescriptionLabel: "Here you can map each field values with the corresponding card placeholders. You can use either a result property directly without any transformation or use an Handlebars expression as field value. Also, when specified, you can also inject your own HTML code in annotated fields.",
                PlaceholderNameFieldLabel: "Name",
                SupportHTMLColumnLabel: "Allow HTML",
                PlaceholderValueFieldLabel: "Value",
                UseHandlebarsExpressionLabel: "Use Handlebars expression",
                EnableItemPreview: "Enable result preview",
                EnableItemPreviewHoverMessage: "Turning on this option may have an impact on performances if too many items are displayed at once and you use the 'AutoPreviewUrl' slot field. We recommend you to use this option with a small amount of items or use predefined preview URLs from your data source fields in slots.",
                ShowFileIcon: "Show file icon",
                CompactModeLabel: "Compact mode",
                PreferedCardNumberPerRow: "Preferred number of cards per row",
                Fields: {
                    Title: "Title",
                    Location: "Location",
                    Tags: "Tags",
                    PreviewImage: "Preview Image",
                    PreviewUrl: "Preview Url",
                    Url: "Url",
                    Date: "Date",
                    Author: "Author",
                    ProfileImage: "Profile Image Url",
                    FileExtension: "File Extension",
                    IsContainer: "Is Folder"
                },
                ResetFieldsBtnLabel: "Reset fields to default values"
            },
            Slider: {
                Name: "Slider",
                SliderAutoPlay: "Auto play",
                SliderAutoPlayDuration: "Auto play duration (in seconds)",
                SliderPauseAutoPlayOnHover: "Pause on hover",
                SliderGroupCells: "Number of elements to group together in slides",
                SliderShowPageDots: "Show page dots",
                SliderWrapAround: "Infinite scrolling",
                SlideHeight: "Slide height (in px)",
                SlideWidth: "Slide width (in px)"
            },
            People: {
                Name: "People",
                ManagePeopleFieldsLabel: "Manage people fields",
                ManagePeopleFieldsPanelDescriptionLabel: "Here you can map each field values with the corresponding persona placeholders. You can use either data source field value directly without any transformation or use an Handlebars expression in the value field.",
                PlaceholderNameFieldLabel: "Name",
                PlaceholderValueFieldLabel: "Value",
                UseHandlebarsExpressionLabel: "Use Handlebars expression",
                PersonaSizeOptionsLabel: "Component size",
                PersonaSizeExtraSmall: "Extra small",
                PersonaSizeSmall: "Small",
                PersonaSizeRegular: "Regular",
                PersonaSizeLarge: "Large",
                PersonaSizeExtraLarge: "Extra large",
                ShowInitialsToggleLabel: "Show initials if no picture available",
                SupportHTMLColumnLabel: "Allow HTML",
                ResetFieldsBtnLabel: "Reset fields to default values",
                ShowPersonaCardOnHover: "Show persona card on hover",
                ShowPersonaCardOnHoverCalloutMsg: "This feature uses Microsoft Graph to display information about the user and needs the following API permissions in your tenant to work: ['User.Read','People.Read','Contacts.Read','User.ReadBasic.All'].",
                Fields: {
                    ImageUrl: "Image URL",
                    PrimaryText: "Primary text",
                    SecondaryText: "Secondary text",
                    TertiaryText: "Tertiary text",
                    OptionalText: "Optional text"
                }
            },
            Vertical: {
                Name: "Vertical"
            },
            Horizontal: {
                Name: "Horizontal",
                PreferedFilterNumberPerRow: "Preferred number of filters per row",
            },
            Panel: {
                Name: "Panel",
                IsModal: "Modal",
                IsLightDismiss: "Light dismiss",
                Size: "Panel size",
                ButtonLabel: "Show filters",
                ButtonLabelFieldName: "Button label to display",
                HeaderText: "Filters",
                HeaderTextFieldName: "Panel header text",
                SizeOptions: {
                    SmallFixedFar: 'Small (default)',
                    SmallFixedNear: 'Small, near side',
                    Medium: 'Medium',
                    Large: 'Large',
                    LargeFixed: 'Large fixed-width',
                    ExtraLarge: 'Extra large',
                    SmallFluid: 'Full-width (fluid)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> results for '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> results",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Available connections"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Extensibility configuration",
                    FieldLabel: "Extensibility libraries to load",
                    ManageBtnLabel: "Configure",
                    Columns: {
                        Name: "Name/Purpose",
                        Id: "Manifest GUID",
                        Enabled: "Enabled/Disabled"
                    }
                }
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Apply",
            ClearAllFiltersButtonLabel: "Clear",
            FilterNoValuesMessage: "No values for this filter",
            OrOperator: "OR",
            AndOperator: "AND",
            ComboBoxPlaceHolder: "Select value"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "SharePoint Static search suggestions",
                ProviderDescription: "Retrieve SharePoint static user defined search suggestions"
            }
        }
    }
})
