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
                QueryTextFieldInfoMessage: "Use the <strong>Available connections</strong> Web Part configuration tab to specifiy either a static value or a value from a dynamic component on the page like a searchbox",
                QueryTemplateFieldLabel: "Zoekopdracht template",
                QueryTemplatePlaceHolderText: "ex: Path:{Site}",
                QueryTemplateFieldDescription: "Het zoekopdracht template. Je kan ook {<tokens>} gebruiken om een dynamische zoekopdracht op te bouwen.",
                ResultSourceIdLabel: "Resultaatbron ID",
                ResultSourceIdDescription: "Use a default SharePoint result source ID or type your own GUID value and press 'Enter' to save.",
                InvalidResultSourceIdMessage: "De opgegeven waarde is geen valide GUID",
                EnableQueryRulesLabel: "Zoekregels inschakelen",
                IncludeOneDriveResultsLabel: "Resultaten van OneDrive voor Bedrijven opnemen",
                RefinementFilters: "Refinement filters",
                RefinementFiltersDescription: "Initial refinement filters to apply to the query. These won't appear in the selected filters. For string expressions, use double quotes (\") instead of single quote (').",
                EnableLocalizationLabel: "Lokalisatie inschakelen",
                EnableLocalizationOnLabel: "Aan",
                EnableLocalizationOffLabel: "Uit",
                QueryCultureLabel: "Taal van de zoekopdracht",
                QueryCultureUseUiLanguageLabel: "Gebruik taal van de gebruikersinterface",
                SelectedPropertiesFieldLabel: "Geselecteerde eigenschappen",
                SelectedPropertiesFieldDescription: "Specificeert de uit de zoekresultaten op te halen eigenschappen.",
                SelectedPropertiesPlaceholderLabel: "Selecteer eigenschappen",
                TermNotFound: "(Term with ID '{0}' not found)",
                ApplyQueryTemplateBtnText: "Apply",
                EnableAudienceTargetingTglLabel: "Enable audience targeting"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Query text",
                QueryTextFieldInfoMessage: "Use the <strong>Available connections</strong> Web Part configuration tab to specifiy either a static value or a value from a dynamic component on the page like a searchbox",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Entity types to search",
                SelectedFieldsPropertiesFieldLabel: "Selected fields",
                SelectedFieldsPropertiesFieldDescription: "Specifies the fields to retrieve from the search results.",
                SelectedFieldsPlaceholderLabel: "Select fields",
                EnableTopResultsLabel: "Enable top results",
                ContentSourcesFieldLabel: "Content sources",
                ContentSourcesFieldDescriptionLabel: "IDs of connections defined in the Microsoft Search connectors administration portal.",
                ContentSourcesFieldPlaceholderLabel: "ex: 'MyCustomConnectorId'"
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Sort order",
                    SortListDescription: "Specify the initial sort order for the search results. You can either select a field from the dropdown list (only if the data source data have already be fetched) or type your own custom value (press 'Enter' to save your entry)",
                    SortDirectionAscendingLabel: "Ascending",
                    SortDirectionDescendingLabel: "Descending",
                    SortErrorMessage: "Invalid search property (Check if the managed property is sortable).",
                    SortPanelSortFieldLabel: "Sort on field",
                    SortPanelSortFieldAria: "Sort by",
                    SortPanelSortFieldPlaceHolder: "Sort by",
                    SortPanelSortDirectionLabel: "Sort Direction",
                    SortDirectionColumnLabel: "Direction",
                    SortFieldColumnLabel: "Field name",
                    EditSortLabel: "Edit sort order",
                    SortInvalidSortableFieldMessage: "This property is not sortable",
                    SortFieldColumnPlaceholder: "Select field..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Add Handlebars expression",
            TextDialogTitle: "Edit Handlebars expression",
            TextDialogCancelButtonText: "Cancel",
            TextDialogSaveButtonText: "Save",
            SelectItemComboPlaceHolder: "Select property",
            AddStaticDataLabel: "Add static data",
            TextFieldApplyButtonText: "Apply"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            Custom: {
                Name: "Custom"
            },
            SimpleList: {
                Name: "List",
                ShowFileIconLabel: "Show file icon",
                ShowItemThumbnailLabel: "Show thumbnail"
            },
            DetailsList: {
                Name: "Details List",
                UseHandlebarsExpressionLabel: "Use Handlebars expression",
                MinimumWidthColumnLabel: "Minimum width (px)",
                MaximumWidthColumnLabel: "Maximum width (px)",
                SortableColumnLabel: "Sortable",
                ResizableColumnLabel: "Resizable",
                MultilineColumnLabel: "Multiline",
                LinkToItemColumnLabel: "Link to item",
                CompactModeLabel: "Compact mode",
                ShowFileIcon: "Show file icon",
                ManageDetailsListColumnDescription: "Add, update or remove columns for the details list layout. You can use either property values in the list directly without any transformation or use an Handlebars expression in the value field. HTML is supported for all fields as well.",
                ManageDetailsListColumnLabel: "Manage columns",
                ValueColumnLabel: "Column value",
                DisplayNameColumnLabel: "Column display name",
                FileExtensionFieldLabel: "Field to use for file extension",
                GroupByFieldLabel: "Group by field",
                EnableGrouping: "Enable grouping",
                CollapsedGroupsByDefault: "Show collapsed",
                ResetFieldsBtnLabel: "Reset fields to default values"
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
