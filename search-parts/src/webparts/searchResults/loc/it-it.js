define([], function () {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Modifica",
                IconText: "Web Part dei Risultati di Ricerca di @PnP",
                Description: "Visualizza i risultati della ricerca da SharePoint o Microsoft search.",
                ConfigureBtnLabel: "Configura"
            },
            WebPartDefaultTitle: "Web Part dei Risultati di Ricerca",
            ShowBlankEditInfoMessage: "Nessun risultato restituito per questa query. Questa Web Part rimarrà vuota in modalità di visualizzazione secondo i parametri.",
            CurrentVerticalNotSelectedMessage: "Il verticale selezionato attualmente non corrisponde a quello associato a questa Web Part. Rimarrà vuoto in modalità di visualizzazione."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Fonti di dati disponibili",
                PagingOptionsGroupName: "Opzioni di paginazione",
                ItemsCountPerPageFieldName: "Numero di elementi per pagina",
                PagingRangeFieldName: "Numero di pagine da visualizzare nell'intervallo",
                ShowPagingFieldName: "Mostra paginazione",
                HidePageNumbersFieldName: "Nascondi numeri di pagina",
                HideNavigationFieldName: "Nascondi pulsanti di navigazione (pagina precedente, pagina successiva)",
                HideFirstLastPagesFieldName: "Nascondi pulsanti di navigazione prima/ultima pagina",
                HideDisabledFieldName: "Nascondi pulsanti di navigazione (precedente, successiva, prima, ultima) se disabilitati.",
                TemplateSlots: {
                    GroupName: "Slot di layout",
                    ConfigureSlotsLabel: "Modifica slot di layout per questa fonte di dati",
                    ConfigureSlotsBtnLabel: "Personalizza",
                    MissingSlotsMessage: "Trovati slot mancanti nel modello di layout: {0}",
                    ConfigureSlotsPanelHeader: "Slot di layout",
                    ConfigureSlotsPanelDescription: "Aggiungi qui gli slot da utilizzare per i diversi layout. Uno slot è una variabile segnaposto che metti nei tuoi modelli dove il valore verrà sostituito dinamicamente da un valore di campo della fonte dati. In questo modo, i tuoi modelli diventano più generici e riutilizzabili indipendentemente dai campi specifici della fonte dati. Per usarli, usa l'espressione Handlebars `{{slot item @root.slots.<SlotName>}}`.",
                    SlotNameFieldName: "Nome slot",
                    SlotFieldFieldName: "Campo slot",
                    SlotFieldPlaceholderName: "Scegli un campo"
                },
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Layout disponibili",
                LayoutTemplateOptionsGroupName: "Opzioni del layout",
                CommonOptionsGroupName: "Comune",
                TemplateUrlFieldLabel: "Usa un URL di modello esterno",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Il modello deve essere un file .txt, .htm o .html valido",
                ErrorTemplateResolve: "Impossibile risolvere il modello specificato. Dettagli dell'errore: '{0}'",
                DialogButtonLabel: "Modifica modello dei risultati",
                DialogTitle: "Modifica modello dei risultati",
                MissingSlotsMessage: "I seguenti slot non sono stati configurati: {0}",
                ShowSelectedFilters: "Mostra filtri selezionati",
                ShowBlankIfNoResult: "Nascondi questa web part se non c'è nulla da mostrare",
                ShowResultsCount: "Mostra conteggio dei risultati",
                HandlebarsRenderTypeLabel: "Handlebars/HTML",
                HandlebarsRenderTypeDesc: "Seleziona layout basati su HTML, CSS e Handlebars",
                AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
                AdaptiveCardsRenderTypeDesc: "Seleziona layout basati su JSON adaptive cards",
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Usa Microsoft Graph Toolkit",
                    ResultTypes: {
                        ResultTypeslabel: "Tipi di risultati",
                        ResultTypesDescription: "Aggiungi qui i modelli da utilizzare per gli elementi dei risultati in base a una o più condizioni. Le condizioni sono valutate nell'ordine configurato e i modelli esterni hanno la precedenza sui modelli inline. Assicurati inoltre che i campi della fonte dati che utilizzi siano presenti nella risposta dei dati.",
                        InlineTemplateContentLabel: "Modello inline",
                        EditResultTypesLabel: "Modifica tipi di risultati",
                        ConditionPropertyLabel: "Campo della fonte dati",
                        ConditionValueLabel: "Valore della condizione",
                        CondtionOperatorValue: "Operatore",
                        ExternalUrlLabel: "URL del modello esterno",
                        EqualOperator: "Uguale",
                        NotEqualOperator: "Non uguale",
                        ContainsOperator: "Contiene",
                        StartsWithOperator: "Inizia con",
                        NotNullOperator: "Non è nullo",
                        GreaterOrEqualOperator: "Maggiore o uguale",
                        GreaterThanOperator: "Maggiore di",
                        LessOrEqualOperator: "Minore o uguale",
                        LessThanOperator: "Minore di",
                        CancelButtonText: "Annulla",
                        DialogButtonText: "Modifica modello",
                        DialogTitle: "Modifica modello dei risultati",
                        SaveButtonText: "Salva"
                    },
                    AllowItemSelection: "Consenti selezione elementi",
                    AllowMultipleItemSelection: "Consenti selezione multipla",
                    SelectionPreservedOnEmptyClick: "Mantieni selezione su clic vuoto",
                    SelectionModeLabel: "Modalità di selezione",
                    AsTokensSelectionMode: "Elabora valori selezionati come token (modalità manuale)",
                    AsDataFiltersSelectionMode: "Elabora valori selezionati come filtri (modalità predefinita)",
                    AsDataFiltersDescription: "In questa modalità, i valori selezionati vengono inviati alla fonte dati come raffinatori di ricerca regolari. In questo caso, la proprietà di destinazione scelta deve essere raffinabile nello schema di ricerca.",
                    AsTokensDescription: "In questa modalità, i valori selezionati vengono utilizzati manualmente tramite token e metodi disponibili. Esempio con modello di query di SharePoint Search: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "Operatore logico da usare tra i valori selezionati",
                    FieldToConsumeLabel: "Campo fonte da consumare",
                    FieldToConsumeDescription: "Usa il valore di questo campo per gli elementi selezionati",
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Configurazione host"
                }
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Connessioni disponibili",
                UseFiltersWebPartLabel: "Connetti ad una Web Part di filtri",
                UseFiltersFromComponentLabel: "Usa filtri da questo componente",
                UseDynamicFilteringsWebPartLabel: "Connetti ad una Web Part dei risultati di ricerca",
                UseDataResultsFromComponentsLabel: "Usa dati da questa Web Part",
                UseDataResultsFromComponentsDescription: "Usa dati da elementi selezionati in queste Web Parts",
                UseSearchVerticalsWebPartLabel: "Connetti ad una Web Part verticale",
                UseSearchVerticalsFromComponentLabel: "Usa verticali da questo componente",
                LinkToVerticalLabel: "Visualizza dati solo quando è selezionato il seguente verticale",
                LinkToVerticalLabelHoverMessage: "I risultati saranno visualizzati solo se il verticale selezionato corrisponde a quello configurato per questa Web Part. Altrimenti, la Web part sarà vuota (nessun margine e nessun padding) in modalità di visualizzazione.",
                UseInputQueryText: "Usa testo di input query",
                UseInputQueryTextHoverMessage: "Usa il token {inputQueryText} nella tua fonte dati per recuperare questo valore",
                SearchQueryTextFieldLabel: "Testo della query",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Inserisci il testo della query...",
                InputQueryTextStaticValue: "Valore statico",
                InputQueryTextDynamicValue: "Valore dinamico",
                SearchQueryTextUseDefaultQuery: "Usa un valore predefinito",
                SearchQueryTextDefaultValue: "Valore predefinito",
                SourceDestinationFieldLabel: "Nome campo di destinazione",
                SourceDestinationFieldDescription: "Campo di destinazione da usare in questa Web Part per corrispondere ai valori selezionati",
                AvailableFieldValuesFromResults: "Campo contenente il valore del filtro"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configura le librerie di estensibilità da caricare all'avvio.",
                    PanelDescription: "Aggiungi/Rimuovi qui gli ID della tua libreria di estensibilità personalizzata. Puoi specificare un nome visualizzato e decidere se la libreria deve essere caricata o meno all'avvio. Solo le fonti dati personalizzate, i layout, i componenti web e gli helper Handlebars saranno caricati qui.",
                }
            },
            CustomQueryModifier: {
                EditQueryModifiersLabel: "Configura modificatori di query",
                QueryModifiersLabel: "Modificatori di Query personalizzati",
                QueryModifiersDescription: "Abilita o disabilita singoli modificatori di query personalizzati",
                EnabledPropertyLabel: "Abilitato",
                ModifierNamePropertyLabel: "Nome",
                ModifierDescriptionPropertyLabel: "Descrizione",
                EndWhenSuccessfullPropertyLabel: "Termina quando ha successo"
            }
        }
    }
});