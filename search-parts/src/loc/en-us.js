define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Select a token...",
            Context: {
                ContextTokensGroupName: "Context tokens",
                SiteAbsoluteUrl: "Site absolute URL",
                SiteRelativeUrl: "Site server relative URL",
                WebAbsoluteUrl: "Web absolute URL",
                WebRelativeUrl: "Web server relative URL",
                WebTitle: "Web title",
                InputQueryText: "Input query text"
            },
            Custom: {
                CustomTokensGroupName: "Custom value",
                CustomValuePlaceholder: "Enter a value...",
                InvalidtokenFormatErrorMessage: "Please enter a supported token format using '{' and '}'. (ex: {Today})"
            },
            Date: {
                DateTokensGroupName: "Date tokens",
                Today: "Today",
                Yesterday: "Yesterday",
                Tomorrow: "Tomorrow",
                OneWeekAgo: "One week ago",
                OneMonthAgo: "One month ago",
                OneYearAgo: "One year ago"
            },
            Page: {
                PageTokensGroupName: "Page tokens",
                PageId: "Page ID",
                PageTitle: "Page Title",
                PageCustom: "Other page column",
            },
            User: {
                UserTokensGroupName: "User tokens",
                UserName: "User Name",
                Me: "Me",
                UserDepartment: "User Department",
                UserCustom: "User custom property"
            }
        },
        General: {
            OnTextLabel: "On",
            OffTextLabel: "Off",
            StaticArrayFieldName: "Array like field",
            About: "About",
            Authors: "Author(s)",
            Version: "Version",
            InstanceId: "Web Part instance ID",
            Resources: {
                GroupName: "Resources",
                Documentation: "Documentation",
                PleaseReferToDocumentationMessage: "Please refer to the official documentation."
            },
            Extensibility: {
                InvalidDataSourceInstance: "The selected data source '{0}' does not implement the 'BaseDataSource' abstract class correctly. Some methods are missing.",
                DataSourceDefinitionNotFound: "The custom data source with key '{0}' was not found. Make sure the solution is correctly deployed to the app caltog and the manifest ID registered for this Web Part.",
                LayoutDefinitionNotFound: "The custom layout with key '{0}' was not found. Make sure the solution is correctly deployed to the app caltog and the manifest ID registered for this Web Part.",
                InvalidLayoutInstance: "The selected layout '{0}' does not implement the 'BaseLayout' abstract class correctly. Some methods are missing.",
                DefaultExtensibilityLibraryName: "Default extensibility library",
                InvalidProviderInstance: "The selected suggestions provider '{0}' does not implement the 'BaseSuggestionProvider' abstract class correctly. Some methods are missing.",
                ProviderDefinitionNotFound: "The custom suggestions provider with key '{0}' was not found. Make sure the solution is correctly deployed to the app caltog and the manifest ID registered for this Web Part.",
            },
            DateFromLabel: "From",
            DateTolabel: "To",
            DatePickerStrings: {
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                goToToday: 'Go to today',
                prevMonthAriaLabel: 'Go to previous month',
                nextMonthAriaLabel: 'Go to next month',
                prevYearAriaLabel: 'Go to previous year',
                nextYearAriaLabel: 'Go to next year',
                closeButtonAriaLabel: 'Close date picker',
                isRequiredErrorMessage: 'Start date is required.',
                invalidInputErrorMessage: 'Invalid date format.'
            },
            DateIntervalStrings: {
                AnyTime: "Any time",
                PastDay: "Past 24 hours",
                PastWeek: "Past week",
                PastMonth: "Past month",
                Past3Months: "Past 3 months",
                PastYear: "Past year",
                Older: "Older than a year"
            },
            SameTabOpenBehavior: "Use the current tab",
            NewTabOpenBehavior: "Open in a new tab",
            PageOpenBehaviorLabel: "Opening behavior",
            EmptyFieldErrorMessage: "This field cannot be empty"
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint Search",
                SourceConfigurationGroupName: "Source configuration",
                QueryTextFieldLabel: "Query text",
                QueryTextFieldInfoMessage: "Use the <strong>Available connections</strong> Web Part configuration tab to specifiy either a static value or a value from a dynamic component on the page like a searchbox",
                QueryTemplateFieldLabel: "Query template",
                QueryTemplatePlaceHolderText: "ex: Path:{Site}",
                QueryTemplateFieldDescription: "The search query template. You can also use {<tokens>} to build a dynamic query.",
                ResultSourceIdLabel: "Result source ID",
                ResultSourceIdDescription: "Use a default SharePoint result source ID or type your own GUID value and press 'Enter' to save.",
                InvalidResultSourceIdMessage: "The provided value is not a valid GUID",
                EnableQueryRulesLabel: "Enable query rules",
                IncludeOneDriveResultsLabel: "Include OneDrive for Business results",
                RefinementFilters: "Refinement filters",
                RefinementFiltersDescription: "Initial refinement filters to apply to the query. These won't appear in the selected filters. For string expressions, use double quotes (\") instead of single quote (').",
                EnableLocalizationLabel: "Enable localization",
                EnableLocalizationOnLabel: "On",
                EnableLocalizationOffLabel: "Off",
                QueryCultureLabel: "Language of search request",
                QueryCultureUseUiLanguageLabel: "Use interface language",
                SelectedPropertiesFieldLabel: "Selected properties",
                SelectedPropertiesFieldDescription: "Specifies the properties to retrieve from the search results.",
                SelectedPropertiesPlaceholderLabel: "Select properties",
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
                SupportHTMLColumnLabel: "Allow HTML",
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