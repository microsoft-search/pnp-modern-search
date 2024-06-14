define([], function () {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Modifica",
                IconText: "Filtri di ricerca di @PnP",
                Description: "Visualizza filtri da una Web Part dei risultati di ricerca collegato",
                ConfigureBtnLabel: "Configura"
            },
            NoAvailableFilterMessage: "Nessun filtro disponibile da visualizzare.",
            WebPartDefaultTitle: "Web Part dei Filtri di Ricerca"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Connetti a una Web Part dei risultati di ricerca",
                UseDataResultsFromComponentsLabel: "Usa dati da questa Web Part",
                UseDataResultsFromComponentsDescription: "Se colleghi più di una Web Part, i valori e i conteggi dei filtri saranno uniti per nomi di filtro simili.",
                LinkToVerticalLabel: "Visualizza i filtri solo quando sono selezionati i seguenti verticali",
                LinkToVerticalLabelHoverMessage: "I filtri saranno visualizzati solo se il verticale selezionato corrisponde a quelli configurati per questa Web Part. Altrimenti, la Web Part sarà vuota (nessun margine e nessun padding) in modalità di visualizzazione."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Impostazioni dei filtri",
                FilterOperator: "Operatore da usare tra i filtri"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Seleziona campo",
                FilterNameLabel: "Campo filtro",
                FilterMaxBuckets: "# di valori",
                FilterDisplayName: "Nome visualizzato",
                FilterTemplate: "Modello",
                FilterExpandByDefault: "Espandi per impostazione predefinita",
                FilterType: "Tipo di filtro",
                FilterTypeRefiner: "Questo modello di filtro agisce come un raffinatore e riceve/invia valori disponibili/selezionati da/a la fonte dati collegata.",
                FilterTypeStaticFilter: "Questo modello di filtro agisce come un filtro statico e invia solo valori selezionati arbitrariamente alla fonte dati collegata. I valori dei filtri in entrata non sono presi in considerazione.",
                CustomizeFiltersBtnLabel: "Modifica",
                CustomizeFiltersHeader: "Modifica filtri",
                CustomizeFiltersDescription: "Configura i filtri di ricerca aggiungendo o rimuovendo righe. Puoi selezionare campi dai risultati della fonte dati (se già selezionati) o usare valori statici per i filtri.",
                CustomizeFiltersFieldLabel: "Personalizza filtri",
                ShowCount: "Mostra conteggio",
                Operator: "Operatore tra i valori",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Valori multipli",
                Templates: {
                    CheckBoxTemplate: "Casella di controllo",
                    DateRangeTemplate: "Intervallo di date",
                    ComboBoxTemplate: "Casella combinata",
                    DateIntervalTemplate: "Intervallo di tempo",
                    TaxonomyPickerTemplate: "Selettore di tassonomia"
                },
                SortBy: "Ordina valori per",
                SortDirection: "Direzione di ordinamento",
                SortByName: "Per nome",
                SortByCount: "Per conteggio",
                SortAscending: "Crescente",
                SortDescending: "Decrescente"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Layout disponibili",
                LayoutTemplateOptionsGroupName: "Opzioni del layout",
                TemplateUrlFieldLabel: "Usa un URL di modello esterno",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Il modello deve essere un file .txt, .htm o .html valido",
                ErrorTemplateResolve: "Impossibile risolvere il modello specificato. Dettagli dell'errore: '{0}'",
                FiltersTemplateFieldLabel: "Modifica modello di filtri",
                FiltersTemplatePanelHeader: "Modifica modello di filtri"
            }
        }
    }
});