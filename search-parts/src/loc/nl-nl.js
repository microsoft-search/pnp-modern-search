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
                PleaseReferToDocumentationMessage: "Raadpleeg de officiele documentatie."
            },
            Extensibility: {
                InvalidDataSourceInstance: "Geselecteerde databron '{0}' implemententeert de abstracte class 'BaseDataSource' niet op correcte wijze. Sommige methodes missen.",
                DataSourceDefinitionNotFound: "aangepaste databron met sleutel '{0}' kon niet worden gevonden. Zorg er voor dat het pakket correct geinstalleerd is in de app catalogus en dat het manifest ID dat geregistreerd is voor dit webonderdeel de juiste is.",
                LayoutDefinitionNotFound: "De aangepaste indeling met sleutel '{0}' kon niet worden gevonden. Zorg er voor dat het pakket correct geinstalleerd is in de app catalogus en dat het manifest ID dat geregistreerd is voor dit webonderdeel de juiste is.",
                InvalidLayoutInstance: "Geselecteerde indeling '{0}' implementeert de abstracte class 'BaseLayout' niet op correcte wijze. Sommige methodes missen.",
                DefaultExtensibilityLibraryName: "Standaard uitbreidingsbibliotheek",
                InvalidProviderInstance: "Geselecteerde zoeksuggestiebron '{0}' implemententeert de abstracte class 'BaseSuggestionProvider' niet op correcte wijze. Sommige methodes missen.",
                ProviderDefinitionNotFound: "De aangepaste zoeksuggestiebron met sleutel '{0}' kon niet worden gevonden. Zorg er voor dat het pakket correct geinstalleerd is in de app catalogus en dat het manifest ID dat geregistreerd is voor dit webonderdeel de juiste is.",
                QueryModifierDefinitionNotFound: "De aangepaste queryModifier met sleutel '{0}' is niet gevonden. Zorg ervoor dat de oplossing correct is ingezet in de app-catalogus en dat de manifest-ID voor dit webonderdeel is geregistreerd.",
                InvalidQueryModifierInstance: "De geselecteerde aangepaste queryModifier '{0}' implementeert de abstracte klasse 'BaseQueryModifier' niet correct. Sommige methoden ontbreken.",
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
                AnyTime: "Elk moment",
                PastDay: "Afgelopen 24 uur",
                PastWeek: "Van afgelopen 24 uur tot afgelopen week",
                PastMonth: "Van afgelopen week tot afgelopen maand",
                Past3Months: "Van afgelopen maand tot afgelopen 3 maanden",
                PastYear: "Van de afgelopen 3 maanden tot het afgelopen jaar",
                Older: "Ouder dan een jaar"
            },
            SameTabOpenBehavior: "Gebruik de huidige tab",
            NewTabOpenBehavior: "Open in een nieuwe tab",
            PageOpenBehaviorLabel: "Gedrag voor openen",
            EmptyFieldErrorMessage: "Dit veld mag niet leeg zijn",
            TagPickerStrings: {
                NoResultsSearchMessage: "Geen resultaten gevonden",
                SearchPlaceholder: "Zoek een waarde..."
            },
            CurrentVerticalNotSelectedMessage: "De huidige geselecteerde branche komt niet overeen met die welke zijn gekoppeld aan dit webonderdeel ({0}). Het blijft leeg in de weergavemodus."
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint Zoeken",
                SourceConfigurationGroupName: "Bron configuratie",
                QueryTextFieldLabel: "Zoekopdracht",
                QueryTextFieldInfoMessage: "Gebruik de <strong>Beschikbare verbindingen</strong> webonderdeel instellingen tab om een statische waarde of een waarde uit een dynamische component op de pagina zoals een zoekvak in te stellen",
                QueryTemplateFieldLabel: "Zoekopdracht template",
                QueryTemplatePlaceHolderText: "bijv: Path:{Site}",
                QueryTemplateFieldDescription: "Het zoekopdracht template. Je kan ook {<tokens>} gebruiken om een dynamische zoekopdracht op te bouwen.",
                ResultSourceIdLabel: "Resultaatbron Id / Niveau|Naam",
                ResultSourceIdDescription: "Selecteer een ingebouwde bron, typ een aangepaste bron-GUID of NIVEAU en NAAM van de bron gescheiden door | (d.w.z. SPSite|Nieuws). Geldige niveaus zijn [SPSiteSubscription, SPSite, SPWeb]. Druk op [Enter] om op te slaan.",
                InvalidResultSourceIdMessage: "De opgegeven waarde is geen valide GUID of is opgemaakt als NIVEAU|NAAM",
                EnableQueryRulesLabel: "Zoekregels inschakelen",
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
                HitHighlightedPropertiesFieldLabel: "Hit-gemarkeerde eigenschappen",
                HitHighlightedPropertiesFieldDescription: "De lijst van beheerde eigenschappen opgeven om markeren in te schakelen. ",
                TermNotFound: "(Term met ID '{0}' niet gevonden)",
                ApplyQueryTemplateBtnText: "Toepassen",
                EnableAudienceTargetingTglLabel: "Schakel doelgroepen in",
                TrimDuplicates: "Duplicaten bijsnijden",
                CollapseSpecificationLabel: "Specificatie samenvouwen"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Zoekopdracht",
                QueryTextFieldInfoMessage: "Gebruik de <strong>Beschikbare verbindingen</strong> webonderdeel instellingen tab om een statische waarde of een waarde uit een dynamische component op de pagina zoals een zoekvak in te stellen",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Entiteitstypen om te zoeken",
                SelectedFieldsPropertiesFieldLabel: "Geselecteerde velden",
                SelectedFieldsPropertiesFieldDescription: "Specificeert de velden om op te halen uit de zoekresultaten.",
                SelectedFieldsPlaceholderLabel: "Selecteer velden",
                EnableTopResultsLabel: "Topresultaten inschakelen",
                ContentSourcesFieldLabel: "Inhoudsbronnen",
                ContentSourcesFieldDescriptionLabel: "IDs van verbingingen gedefinieerd in de Microsoft Search connectors administratie portaal.",
                ContentSourcesFieldPlaceholderLabel: "bijv: 'MyCustomConnectorId'",
                EnableSuggestionLabel: "Spellingsuggesties inschakelen",
                EnableModificationLabel: "Spellingaanpassingen inschakelen",
                QueryTemplateFieldLabel: "Query-modifier",
                QueryTemplatePlaceHolderText: "ex: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "De sjabloon voor zoekmodificatie. U kunt ook {<tokens>} en KQL gebruiken om een ​​dynamische query te maken. Alles is aaneengeschakeld naar de inputQueryText",
                ApplyQueryTemplateBtnText: "Toepassen",
                UseBetaEndpoint: "Bèta-eindpunt gebruiken",
                TrimDuplicates: "Duplicaten bijsnijden",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Instellingen voor samenvouwen bewerken",
                    CollapsePropertiesDescription: "Geef de samenvouwinstellingen op voor de zoekresultaten. U kunt een veld selecteren uit de vervolgkeuzelijst (alleen als de gegevensbrongegevens al zijn opgehaald) of uw eigen aangepaste waarde typen (druk op 'Enter' om uw invoer op te slaan)",
                    CollapsePropertiesPropertyPaneFieldLabel: "Samenvouwinstellingen",
                    CollapseLimitFieldLabel: "Begrenzing",
                    CollapsePropertiesFieldColumnPlaceholder: "Samenvouwen op veld"
                }
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
                    SortFieldDefaultSortLabel: "Standaard sortering",
                    SortFieldFriendlyNameLabel: "Weergavenaam veld sorteren",
                    SortFieldUserSortLabel: "Gebruiker sorteren",
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
            TextFieldApplyButtonText: "Toepassen",
            SortByPlaceholderText: "Sorteer op...",
            SortByDefaultOptionText: "Standaard"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            CustomHandlebars: {
                Name: "Aangepast"
            },
            CustomAdaptiveCards: {
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
                ManageDetailsListColumnDescription: "Kolommen toevoegen, bewerken of verwijderen voor de detailslijst indeling. Je kan eigenschapswaarden direct in de lijst gebruiken zonder transformaties toe te passen, of een Handlebars-uitdrukking gebruiken als veldwaarde. HTML wordt ook ondersteund voor alle velden.",
                ManageDetailsListColumnLabel: "Beheer kolommen",
                ValueColumnLabel: "Kolomwaarde",
                ValueSortingColumnLabel: "Selecteer sorteerveld...",
                ValueSortingColumnNoFieldsLabel: "Geen velden beschikbaar",
                FileExtensionFieldLabel: "Te gebruiken veld voor bestandsextensie",
                GroupByFieldLabel: "Groepeer op veld",
                EnableGrouping: "Groeperen inschakelen",
                GroupingDescription: "Zorg ervoor dat er gegevens worden weergegeven in het resultaatwebonderdeel voor een lijst met eigenschappen die moeten worden weergegeven.",
                CollapsedGroupsByDefault: "Toon ingeklapt",
                ResetFieldsBtnLabel: "Reset velden naar standaard waarden"
            },
            Cards: {
                Name: "Kaarten",
                ManageTilesFieldsLabel: "Beheer velden op kaart",
                ManageTilesFieldsPanelDescriptionLabel: "Hier kunt u veldwaarden toewijzen aan de bijbehorende placeholder op de kaart. U kunt een resultaateigenschap rechtstreeks gebruiken zonder enige transformatie of een Handlebars-uitdrukking gebruiken als veldwaarde. Ook kunt u, indien opgegeven, uw eigen HTML-code invoegen in geannoteerde velden.",
                PlaceholderNameFieldLabel: "Naam",
                SupportHTMLColumnLabel: "Sta HTML toe",
                PlaceholderValueFieldLabel: "Waarde",
                UseHandlebarsExpressionLabel: "Gebruik Handlebars-uitdrukking",
                EnableItemPreview: "Schakel resultaatvoorbeeld in",
                EnableItemPreviewHoverMessage: "Het aanzetten van deze optie kan negatieve impact hebben op de performance wanneer er te veel items tegelijk worden weergegeven in combinatie met het 'AutoPreviewUrl' sleuf. We raden aan deze optie enkel te gebruiken bij kleine aantallen items of gebruik te maken van voorgedefinieerde preview URLs vanuit de databron in de sleuven.",
                ShowFileIcon: "Toon bestandspictogram",
                CompactModeLabel: "Compacte modus",
                PreferedCardNumberPerRow: "Gewenst aantal kaarten per rij",
                Fields: {
                    Title: "Titel",
                    Location: "Locatie",
                    Tags: "Tags",
                    PreviewImage: "Voorbeeld afbeelding",
                    PreviewUrl: "Voorbeeld Url",
                    Url: "Url",
                    Date: "Datum",
                    Author: "Auteur",
                    ProfileImage: "Proefielafbeelding Url",
                    FileExtension: "Bestandsextensie",
                    IsContainer: "Is folder"
                },
                ResetFieldsBtnLabel: "Velden resetten naar standaardwaarde"
            },
            Slider: {
                Name: "Slider",
                SliderAutoPlay: "Automatisch afspelen",
                SliderAutoPlayDuration: "Duur van automatisch afsprelen (in seconden)",
                SliderPauseAutoPlayOnHover: "Pauzeren bij 'hover'",
                SliderGroupCells: "Aantal te groeperen elementen in slides",
                SliderShowPageDots: "Toon puntjes voor callout",
                SliderWrapAround: "Oneindig scrollen",
                SlideHeight: "Slide hoogte (in px)",
                SlideWidth: "Slide breedte (in px)"
            },
            People: {
                Name: "Personen",
                ManagePeopleFieldsLabel: "Beheer velden voor personen",
                ManagePeopleFieldsPanelDescriptionLabel: "Hier kan je elke veldwaarde koppelen aan de corresponderende Persona placeholders. Je kan een veld uit de databron direct gebruiken zonder transformatie of een handlebars expressie gebruiken in de veldwaarde.",
                PlaceholderNameFieldLabel: "Naam",
                PlaceholderValueFieldLabel: "Waarde",
                UseHandlebarsExpressionLabel: "Gebruik Handlebars-uitdrukking",
                PersonaSizeOptionsLabel: "Grootte onderdeel",
                PersonaSizeExtraSmall: "Extra klein",
                PersonaSizeSmall: "Klein",
                PersonaSizeRegular: "Normaal",
                PersonaSizeLarge: "Groot",
                PersonaSizeExtraLarge: "Extra groot",
                ShowInitialsToggleLabel: "Toon initialen wanneer geen foto beschikbaar",
                SupportHTMLColumnLabel: "Sta HTML toe",
                ResetFieldsBtnLabel: "Reset velden naar standaard waarden",
                ShowPersonaCardOnHover: "Toon persona card bij 'hover'",
                ShowPersonaCardOnHoverCalloutMsg: "Deze feature gebruikt Microsoft Graph om informatie over de gebruiker te tonen en heeft de volgende API rechten nodig in de tenant om te kunnen werken: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                Fields: {
                    ImageUrl: "Afbeeldings URL",
                    PrimaryText: "Primaire tekst",
                    SecondaryText: "Secondaire tekst",
                    TertiaryText: "Tertiaire tekst",
                    OptionalText: "Optionele tekst"
                }
            },
            Vertical: {
                Name: "Verticaal"
            },
            Horizontal: {
                Name: "Horizontaal",
                PreferedFilterNumberPerRow: "Gewenst aantal filters per rij",
            },
            Panel: {
                Name: "Paneel",
                IsModal: "Modal",
                IsLightDismiss: "'Light dismiss'",
                Size: "Paneel grootte",
                ButtonLabel: "Toon filters",
                ButtonLabelFieldName: "Te tonen tekst op knop",
                HeaderText: "Filters",
                HeaderTextFieldName: "Paneel koptekst",
                SizeOptions: {
                    SmallFixedFar: 'Klein (standaard)',
                    SmallFixedNear: 'Klein, bij rand',
                    Medium: 'Medium',
                    Large: 'Groot',
                    LargeFixed: 'Groot vaste breedte',
                    ExtraLarge: 'Extra groot',
                    SmallFluid: 'Volledige breedte (fluid)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> resultaten voor '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> resultaten",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Beschikbare verbindingen",
                UseDataVerticalsWebPartLabel: "Verbinding maken met een verticaal webonderdeel",
                UseDataVerticalsFromComponentLabel: "Gebruik verticalen van dit onderdeel"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Configuratie van uitbreidingen",
                    FieldLabel: "Te laden uitbreidingsbiliotheken",
                    ManageBtnLabel: "Configureer",
                    Columns: {
                        Name: "Naam/Doel",
                        Id: "Manifest GUID",
                        Enabled: "Aan/Uit"
                    }
                },
                ImportExport: "Importeer/Exporteer instellingen"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Toepassen",
            ClearAllFiltersButtonLabel: "Wissen",
            FilterNoValuesMessage: "Geen waarden voor deze filter",
            OrOperator: "OR",
            AndOperator: "AND",
            ComboBoxPlaceHolder: "Selecteer waarde",
            UseAndOperatorValues: "Use an AND operator between values",
            UseOrOperatorValues: "Use an OR operator between values",
            UseValuesOperators: "Select operator to use between this filter values"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "SharePoint statische zoeksuggesties",
                ProviderDescription: "Haal statische door gebruiker gedefinieerde SharePoint zoeksuggesties op"
            }
        }
    }
})
