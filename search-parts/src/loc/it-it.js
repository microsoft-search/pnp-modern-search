define([], function () {
    return {
        Tokens: {
            SelectTokenLabel: "Seleziona un token...",
            Context: {
                ContextTokensGroupName: "Token di contesto",
                SiteAbsoluteUrl: "URL assoluto del sito",
                SiteRelativeUrl: "URL relativo al server del sito",
                WebAbsoluteUrl: "URL assoluto del Web",
                WebRelativeUrl: "URL relativo al server del Web",
                WebTitle: "Titolo del Web",
                InputQueryText: "Testo della query di input"
            },
            Custom: {
                CustomTokensGroupName: "Valore personalizzato",
                CustomValuePlaceholder: "Inserisci un valore...",
                InvalidtokenFormatErrorMessage: "Per favore inserisci un formato di token supportato usando '{' e '}'. (es: {Today})"
            },
            Date: {
                DateTokensGroupName: "Token di data",
                Today: "Oggi",
                Yesterday: "Ieri",
                Tomorrow: "Domani",
                OneWeekAgo: "Una settimana fa",
                OneMonthAgo: "Un mese fa",
                OneYearAgo: "Un anno fa"
            },
            Page: {
                PageTokensGroupName: "Token di pagina",
                PageId: "ID della pagina",
                PageTitle: "Titolo della pagina",
                PageCustom: "Altra colonna della pagina",
            },
            User: {
                UserTokensGroupName: "Token utente",
                UserName: "Nome utente",
                Me: "Io",
                UserDepartment: "Dipartimento utente",
                UserCustom: "Proprietà personalizzata utente"
            }
        },
        General: {
            OnTextLabel: "Attivo",
            OffTextLabel: "Inattivo",
            StaticArrayFieldName: "Campo simile ad array",
            About: "Informazioni",
            Authors: "Autore/i",
            Version: "Versione",
            InstanceId: "ID dell'istanza della Web Part",
            Resources: {
                GroupName: "Risorse",
                Documentation: "Documentazione",
                PleaseReferToDocumentationMessage: "Per favore fai riferimento alla documentazione ufficiale."
            },
            Extensibility: {
                InvalidDataSourceInstance: "La fonte dati selezionata '{0}' non implementa correttamente la classe astratta 'BaseDataSource'. Mancano alcuni metodi.",
                DataSourceDefinitionNotFound: "La fonte dati personalizzata con chiave '{0}' non è stata trovata. Assicurati che la soluzione sia correttamente distribuita nel catalogo app e l'ID del manifesto registrato per questa Web Part.",
                LayoutDefinitionNotFound: "Il layout personalizzato con chiave '{0}' non è stato trovato. Assicurati che la soluzione sia correttamente distribuita nel catalogo app e l'ID del manifesto registrato per questa Web Part.",
                InvalidLayoutInstance: "Il layout selezionato '{0}' non implementa correttamente la classe astratta 'BaseLayout'. Mancano alcuni metodi.",
                DefaultExtensibilityLibraryName: "Libreria di estensibilità predefinita",
                InvalidProviderInstance: "Il provider di suggerimenti selezionato '{0}' non implementa correttamente la classe astratta 'BaseSuggestionProvider'. Mancano alcuni metodi.",
                ProviderDefinitionNotFound: "Il provider di suggerimenti personalizzato con chiave '{0}' non è stato trovato. Assicurati che la soluzione sia correttamente distribuita nel catalogo app e l'ID del manifesto registrato per questa Web Part.",
                QueryModifierDefinitionNotFound: "Il queryModifier personalizzato con chiave '{0}' non è stato trovato. Assicurati che la soluzione sia correttamente distribuita nel catalogo app e l'ID del manifesto registrato per questa Web Part.",
                InvalidQueryModifierInstance: "Il queryModifier personalizzato selezionato '{0}' non implementa correttamente la classe astratta 'BaseQueryModifier'. Mancano alcuni metodi."
            },
            DateFromLabel: "Da",
            DateTolabel: "A",
            DatePickerStrings: {
                months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
                shortMonths: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
                days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
                shortDays: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
                goToToday: 'Vai a oggi',
                prevMonthAriaLabel: "Vai al mese precedente",
                nextMonthAriaLabel: "Vai al mese successivo",
                prevYearAriaLabel: "Vai all'anno precedente",
                nextYearAriaLabel: "Vai all'anno successivo",
                closeButtonAriaLabel: "Chiudi selettore data",
                isRequiredErrorMessage: "La data di inizio è obbligatoria.",
                invalidInputErrorMessage: "Formato data non valido."
            },
            DateIntervalStrings: {
                AnyTime: "Qualsiasi momento",
                PastDay: "Ultime 24 ore",
                PastWeek: "Dalle ultime 24 ore all'ultima settimana",
                PastMonth: "Dall'ultima settimana all'ultimo mese",
                Past3Months: "Dall'ultimo mese agli ultimi 3 mesi",
                PastYear: "Dagli ultimi 3 mesi all'ultimo anno",
                Older: "Più vecchio di un anno"
            },
            SameTabOpenBehavior: "Usa la scheda corrente",
            NewTabOpenBehavior: "Apri in una nuova scheda",
            PageOpenBehaviorLabel: "Comportamento di apertura",
            EmptyFieldErrorMessage: "Questo campo non può essere vuoto",
            TagPickerStrings: {
                NoResultsSearchMessage: "Nessun risultato trovato",
                SearchPlaceholder: "Cerca un valore..."
            },
            CurrentVerticalNotSelectedMessage: "Il verticale selezionato attualmente non corrisponde a quelli associati a questa Web Part ({0}). Rimarrà vuoto in modalità di visualizzazione.",
            True:"Sì",
            False:"No"
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint Search",
                SourceConfigurationGroupName: "Configurazione della fonte",
                QueryTextFieldLabel: "Testo della query",
                QueryTextFieldInfoMessage: "Usa la scheda di configurazione <strong>Connessioni disponibili</strong> della Web Part per specificare un valore statico o un valore da un componente dinamico sulla pagina come una casella di ricerca",
                QueryTemplateFieldLabel: "Modello di query",
                QueryTemplatePlaceHolderText: "es: Path:{Site}",
                QueryTemplateFieldDescription: "Il modello di query di ricerca. Puoi anche usare {<tokens>} per costruire una query dinamica.",
                ResultSourceIdLabel: "ID della fonte dei risultati / Scope|Nome",
                ResultSourceIdDescription: "Seleziona una fonte incorporata, digita un GUID di fonte personalizzato, o SCOPE e NOME della fonte separati da | (es: SPSite|News). Gli scope validi sono [SPSiteSubscription, SPSite, SPWeb]. Premi [Enter] per salvare.",
                InvalidResultSourceIdMessage: "Il valore fornito non è un GUID valido, o formattato come SCOPE|NAME",
                EnableQueryRulesLabel: "Abilita regole di query",
                RefinementFilters: "Filtri di affinamento",
                RefinementFiltersDescription: "Filtri di affinamento iniziali da applicare alla query. Questi non appariranno nei filtri selezionati. Per le espressioni di stringa, usa le virgolette doppie (\") invece di quelle singole (').",
                EnableLocalizationLabel: "Abilita localizzazione",
                EnableLocalizationOnLabel: "Attivo",
                EnableLocalizationOffLabel: "Inattivo",
                QueryCultureLabel: "Lingua della richiesta di ricerca",
                QueryCultureUseUiLanguageLabel: "Usa la lingua dell'interfaccia",
                SelectedPropertiesFieldLabel: "Proprietà selezionate",
                SelectedPropertiesFieldDescription: "Specifica le proprietà da recuperare dai risultati di ricerca.",
                SelectedPropertiesPlaceholderLabel: "Seleziona proprietà",
                HitHighlightedPropertiesFieldLabel: "Proprietà evidenziate",
                HitHighlightedPropertiesFieldDescription: "Fornisci l'elenco delle proprietà gestite da evidenziare (es. Department,UserName).",
                TermNotFound: "(Termine con ID '{0}' non trovato)",
                ApplyQueryTemplateBtnText: "Applica",
                EnableAudienceTargetingTglLabel: "Abilita il targeting del pubblico",
                TrimDuplicates: "Elimina duplicati",
                showSPEmbeddedContentLabel: "Mostra SharePoint incorporato (nascosto) nei risultati di ricerca",
                showMSArchivedContentLabel: "Mostra i contenuti archiviati in MS nei risultati di ricerca",
                CollapseSpecificationLabel: "Specifiche di collasso"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Testo della query",
                QueryTextFieldInfoMessage: "Usa la scheda di configurazione <strong>Connessioni disponibili</strong> della Web Part per specificare un valore statico o un valore da un componente dinamico sulla pagina come una casella di ricerca",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Tipi di entità da cercare",
                SelectedFieldsPropertiesFieldLabel: "Campi selezionati",
                SelectedFieldsPropertiesFieldDescription: "Specifica i campi da recuperare dai risultati di ricerca.",
                SelectedFieldsPlaceholderLabel: "Seleziona campi",
                EnableTopResultsLabel: "Abilita i risultati principali",
                ContentSourcesFieldLabel: "Fonti di contenuto",
                ContentSourcesFieldDescriptionLabel: "ID delle connessioni definite nel portale di amministrazione dei connettori di Microsoft Search.",
                ContentSourcesFieldPlaceholderLabel: "es: 'MyCustomConnectorId'",
                EnableSuggestionLabel: "Abilita suggerimenti ortografici",
                EnableModificationLabel: "Abilita modifiche ortografiche",
                QueryTemplateFieldLabel: "Modello di query",
                QueryTemplatePlaceHolderText: "es: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "Il modello di query di ricerca. Puoi anche usare {} e KQL per costruire una query dinamica.",
                ApplyQueryTemplateBtnText: "Applica",
                UseBetaEndpoint: "Usa endpoint beta",
                TrimDuplicates: "Elimina duplicati",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Modifica impostazioni di collasso",
                    CollapsePropertiesDescription: "Specifica le impostazioni di collasso per i risultati di ricerca. Puoi selezionare un campo dall'elenco a discesa (solo se i dati della fonte dati sono già stati recuperati) o digitare il tuo valore personalizzato (premi 'Enter' per salvare l'inserimento)",
                    CollapsePropertiesPropertyPaneFieldLabel: "Impostazioni di collasso",
                    CollapseLimitFieldLabel: "Limite",
                    CollapsePropertiesFieldColumnPlaceholder: "Collassa sul campo"
                }
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Impostazioni di ordinamento",
                    SortListDescription: "Specifica le impostazioni di ordinamento per i risultati di ricerca. Puoi selezionare un campo dall'elenco a discesa (solo se i dati della fonte dati sono già stati recuperati) o digitare il tuo valore personalizzato (premi 'Enter' per salvare l'inserimento)",
                    SortDirectionAscendingLabel: "Crescente",
                    SortDirectionDescendingLabel: "Decrescente",
                    SortErrorMessage: "Proprietà di ricerca non valida (Controlla se la proprietà gestita è ordinabile).",
                    SortPanelSortFieldLabel: "Ordina per campo",
                    SortPanelSortFieldAria: "Ordina per",
                    SortPanelSortFieldPlaceHolder: "Ordina per",
                    SortPanelSortDirectionLabel: "Direzione ordinamento",
                    SortDirectionColumnLabel: "Direzione",
                    SortFieldColumnLabel: "Nome campo",
                    SortFieldDefaultSortLabel: "Ordinamento predefinito",
                    SortFieldFriendlyNameLabel: "Nome visualizzato del campo di ordinamento",
                    SortFieldUserSortLabel: "Ordinamento utente",
                    EditSortLabel: "Modifica impostazioni di ordinamento",
                    SortInvalidSortableFieldMessage: "Questa proprietà non è ordinabile",
                    SortFieldColumnPlaceholder: "Seleziona campo…"
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Aggiungi espressione Handlebars",
            TextDialogTitle: "Modifica espressione Handlebars",
            TextDialogCancelButtonText: "Annulla",
            TextDialogSaveButtonText: "Salva",
            SelectItemComboPlaceHolder: "Seleziona proprietà",
            AddStaticDataLabel: "Aggiungi dati statici",
            TextFieldApplyButtonText: "Applica",
            SortByPlaceholderText: "Ordina per…",
            SortByDefaultOptionText: "Predefinito",
            DownloadButtonText: "Scarica"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            CustomHandlebars: {
                Name: "Personalizzato"
            },
            CustomAdaptiveCards: {
                Name: "Personalizzato"
            },
            SimpleList: {
                Name: "Elenco",
                ShowFileIconLabel: "Mostra icona del file",
                ShowItemThumbnailLabel: "Mostra anteprima"
            },
            DetailsList: {
                Name: "Elenco dettagli",
                UseHandlebarsExpressionLabel: "Usa espressione Handlebars",
                MinimumWidthColumnLabel: "Larghezza minima (px)",
                MaximumWidthColumnLabel: "Larghezza massima (px)",
                SortableColumnLabel: "Ordinabile",
                ResizableColumnLabel: "Ridimensionabile",
                MultilineColumnLabel: "Multilinea",
                LinkToItemColumnLabel: "Collega all'elemento",
                CompactModeLabel: "Modalità compatta",
                ShowFileIcon: "Mostra icona del file",
                ManageDetailsListColumnDescription: "Aggiungi, aggiorna o rimuovi colonne per il layout dell'elenco dettagli. Puoi usare direttamente i valori delle proprietà nella lista senza alcuna trasformazione o usare un'espressione Handlebars nel campo del valore. L'HTML è supportato per tutti i campi.",
                ManageDetailsListColumnLabel: "Gestisci colonne",
                ValueColumnLabel: "Valore colonna",
                ValueSortingColumnLabel: "Seleziona campo di ordinamento…",
                ValueSortingColumnNoFieldsLabel: "Nessun campo disponibile",
                DisplayNameColumnLabel: "Nome visualizzato colonna",
                FileExtensionFieldLabel: "Campo da usare per l'estensione del file",
                GroupByFieldLabel: "Raggruppa per campo",
                GroupByOthersGroupFieldLabel: "Titolo del gruppo per altri elementi",
                GroupByOthersGroupDefaultValue: "Nessun valore",
                AdditionalGroupByButtonLabel: "Aggiungi campo di raggruppamento",
                AdditionalGroupByFieldsLabel: "Campi di raggruppamento aggiuntivi",
                AdditionalGroupByFieldsDescription: "Aggiungi campi di raggruppamento aggiuntivi per creare una gerarchia nel layout. Ogni colonna è aggiunta nell'ordine mostrato.",
                EnableGrouping: "Abilita raggruppamento",
                GroupingDescription: "Assicurati di avere dati visualizzati nella Web Part dei risultati per un elenco di proprietà da mostrare.",
                CollapsedGroupsByDefault: "Mostra collassati",
                ResetFieldsBtnLabel: "Reimposta campi ai valori predefiniti",
                EnableStickyHeader: "Abilita intestazione fissa",
                StickyHeaderListViewHeight: "Altezza vista elenco (in px)",
                EnableDownload: "Abilita download"
            },
            Cards: {
                Name: "Carte",
                ManageTilesFieldsLabel: "Campi delle carte gestite",
                ManageTilesFieldsPanelDescriptionLabel: "Qui puoi mappare i valori di ogni campo con i corrispondenti segnaposto delle carte. Puoi usare direttamente una proprietà del risultato senza alcuna trasformazione o usare un'espressione Handlebars come valore del campo. Inoltre, quando specificato, puoi anche iniettare il tuo codice HTML nei campi annotati.",
                PlaceholderNameFieldLabel: "Nome",
                SupportHTMLColumnLabel: "Consenti HTML",
                PlaceholderValueFieldLabel: "Valore",
                UseHandlebarsExpressionLabel: "Usa espressione Handlebars",
                EnableItemPreview: "Abilita anteprima risultato",
                EnableItemPreviewHoverMessage: "L'attivazione di questa opzione può avere un impatto sulle prestazioni se vengono visualizzati troppi elementi contemporaneamente e si utilizza il campo dello slot 'AutoPreviewUrl'. Si consiglia di utilizzare questa opzione con un numero ridotto di elementi o di utilizzare URL di anteprima predefiniti dai campi della fonte dati negli slot.",
                ShowFileIcon: "Mostra icona del file",
                CompactModeLabel: "Modalità compatta",
                PreferedCardNumberPerRow: "Numero preferito di carte per riga",
                Fields: {
                    Title: "Titolo",
                    Location: "Località",
                    Tags: "Tag",
                    PreviewImage: "Immagine di anteprima",
                    PreviewUrl: "URL di anteprima",
                    Url: "URL",
                    Date: "Data",
                    Author: "Autore",
                    ProfileImage: "URL immagine profilo",
                    FileExtension: "Estensione del file",
                    IsContainer: "È una cartella"
                },
                ResetFieldsBtnLabel: "Reimposta campi ai valori predefiniti"
            },
            Slider: {
                Name: "Slider",
                SliderAutoPlay: "Riproduzione automatica",
                SliderAutoPlayDuration: "Durata riproduzione automatica (in secondi)",
                SliderPauseAutoPlayOnHover: "Pausa al passaggio del mouse",
                SliderGroupCells: "Numero di elementi da raggruppare insieme nelle diapositive",
                SliderShowPageDots: "Mostra punti della pagina",
                SliderWrapAround: "Scorrimento infinito",
                SlideHeight: "Altezza diapositiva (in px)",
                SlideWidth: "Larghezza diapositiva (in px)"
            },
            People: {
                Name: "Persone",
                ManagePeopleFieldsLabel: "Gestisci campi delle persone",
                ManagePeopleFieldsPanelDescriptionLabel: "Qui puoi mappare i valori di ogni campo con i corrispondenti segnaposto delle persone. Puoi usare direttamente il valore del campo della fonte dati senza alcuna trasformazione o usare un'espressione Handlebars nel campo del valore.",
                PlaceholderNameFieldLabel: "Nome",
                PlaceholderValueFieldLabel: "Valore",
                UseHandlebarsExpressionLabel: "Usa espressione Handlebars",
                PersonaSizeOptionsLabel: "Dimensione componente",
                PersonaSizeExtraSmall: "Extra piccola",
                PersonaSizeSmall: "Piccola",
                PersonaSizeRegular: "Regolare",
                PersonaSizeLarge: "Grande",
                PersonaSizeExtraLarge: "Extra grande",
                ShowInitialsToggleLabel: "Mostra iniziali se non disponibile immagine",
                SupportHTMLColumnLabel: "Consenti HTML",
                ResetFieldsBtnLabel: "Reimposta campi ai valori predefiniti",
                ShowPersonaCardOnHover: "Mostra scheda persona al passaggio del mouse",
                ShowPersonaCardOnHoverCalloutMsg: "Questa funzionalità utilizza Microsoft Graph per visualizzare informazioni sull'utente e richiede le seguenti autorizzazioni API nel tuo tenant per funzionare: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                ShowPersonaCardOnHoverNative: "Mostra scheda persona al passaggio del mouse (LPC)",
                ShowPersonaCardOnHoverCalloutMsgNative: "Questa funzionalità utilizza l'implementazione nativa di SharePoint per mostrare la scheda persona live (LPC). Vedi https://pnp.github.io/sp-dev-fx-controls-react/controls/LivePersona/ per considerazioni.",
                ShowPersonaPresenceInfo: "Mostra presenza",
                ShowPersonaPresenceInfoCalloutMsg: "Questa funzionalità richiede le seguenti autorizzazioni API nel tuo tenant per funzionare: ['Presence.Read.All']",
                Fields: {
                    ImageUrl: "URL immagine",
                    PrimaryText: "Testo principale",
                    SecondaryText: "Testo secondario",
                    TertiaryText: "Testo terziario",
                    OptionalText: "Testo opzionale",
                    UPN: "UPN"
                }
            },
            Vertical: {
                Name: "Verticale"
            },
            Horizontal: {
                Name: "Orizzontale",
                PreferedFilterNumberPerRow: "Numero preferito di filtri per riga",
            },
            Panel: {
                Name: "Pannello",
                IsModal: "Modale",
                IsLightDismiss: "Chiusura leggera",
                Size: "Dimensione pannello",
                ButtonLabel: "Mostra filtri",
                ButtonLabelFieldName: "Etichetta del pulsante da visualizzare",
                HeaderText: "Filtri",
                HeaderTextFieldName: "Testo dell'intestazione del pannello",
                SizeOptions: {
                    SmallFixedFar: 'Piccolo (predefinito)',
                    SmallFixedNear: 'Piccolo, lato vicino',
                    Medium: 'Medio',
                    Large: 'Grande',
                    LargeFixed: 'Grande a larghezza fissa',
                    ExtraLarge: 'Extra grande',
                    SmallFluid: 'A larghezza piena (fluido)'
                }
            },
            PersonCard: {
              SendEmailLinkSubtitle: "Invia email",
              StartChatLinkSubtitle: "Avvia chat",
              ShowMoreSectionButton: "Mostra altro",
              ContactSectionTitle: "Contatto",
              ReportsToSectionTitle: "Riporta a",
              DirectReportsSectionTitle: "Subordinati diretti",
              OrganizationSectionTitle: "Organizzazione",
              YouWorkWithSubSectionTitle: "Lavori con",
              UserWorksWithSubSectionTitle: "lavora con",
              EmailsSectionTitle: "Email",
              FilesSectionTitle: "File",
              SharedTextSubtitle: "Condiviso",
              SkillsAndExperienceSectionTitle: "Competenze ed Esperienza",
              AboutCompactSectionTitle: "Informazioni",
              SkillsSubSectionTitle: "Competenze",
              LanguagesSubSectionTitle: "Lingue",
              WorkExperienceSubSectionTitle: "Esperienza lavorativa",
              EducationSubSectionTitle: "Istruzione",
              ProfessionalInterestsSubSectionTitle: "Interessi professionali",
              PersonalInterestsSubSectionTitle: "Interessi personali",
              BirthdaySubSectionTitle: "Compleanno",
              CurrentYearSubtitle: "Attuale",
              EndOfCard: "Fine della scheda",
              QuickMessage: "Invia un messaggio rapido",
              ExpandDetailsLabel: "Espandi dettagli",
              SendMessageLabel: "Invia messaggio",
              EmailButtonLabel: "Email",
              CallButtonLabel: "Chiama",
              ChatButtonLabel: "Chat",
              CloseCardLabel: "Chiudi scheda",
              VideoButtonLabel: "Video",
              GoBackLabel: "Torna indietro",
              EmailTitle: "Email",
              ChatTitle: "Teams",
              BusinessPhoneTitle: "Telefono aziendale",
              CellPhoneTitle: "Telefono cellulare",
              DepartmentTitle: "Dipartimento",
              PersonTitle: "Titolo",
              OfficeLocationTitle: "Sede ufficio",
              CopyToClipboardButton: "Copia negli appunti",
              ShowMoreSubtitle: "Mostra altri elementi",
              SocialMediaSubSectionTitle: "Social Media"
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "{0} risultati per '{1}'",
            CountMessageShort: "{0} risultati",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Connessioni disponibili",
                UseDataVerticalsWebPartLabel: "Connetti ad una Web Part verticale",
                UseDataVerticalsFromComponentLabel: "Usa i verticali da questo componente"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Configurazione di estensibilità",
                    FieldLabel: "Librerie di estensibilità da caricare",
                    ManageBtnLabel: "Configura",
                    Columns: {
                        Name: "Nome/Scopo",
                        Id: "GUID manifesto",
                        Enabled: "Abilitato/Disabilitato"
                    }
                },
                ImportExport: "Importa/Esporta impostazioni"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Applica",
            ClearAllFiltersButtonLabel: "Pulisci",
            FilterNoValuesMessage: "Nessun valore per questo filtro",
            OrOperator: "OR",
            AndOperator: "AND",
            ComboBoxPlaceHolder: "Seleziona valore",
            UseAndOperatorValues: "Usa un operatore AND tra i valori",
            UseOrOperatorValues: "Usa un operatore OR tra i valori",
            UseValuesOperators: "Seleziona l'operatore da usare tra i valori di questo filtro"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "Suggerimenti di ricerca statici di SharePoint",
                ProviderDescription: "Recupera suggerimenti di ricerca definiti dall'utente statici di SharePoint"
            }
        }
    }
})