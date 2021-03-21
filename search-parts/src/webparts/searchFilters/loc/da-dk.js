define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Redigér",
                IconText: "PnP-søgefiltre",
                Description: "Viser datafiltre fra en forbundet søgeresultats-webpart",
                ConfigureBtnLabel: "Konfigurér"
            },
            NoAvailableFilterMessage: "Ingen tilgængelige filtre at vise.",
            WebPartDefaultTitle: "Søgefiltre-webpart"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Forbind til en dataresultat-webpart",
                UseDataResultsFromComponentsLabel: "Anvend data fra disse webparts",
                UseDataResultsFromComponentsDescription: "Hvis du forbinder mere end en webpart, flettes filterværdier til lignende filternavne.",
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Indstillinger til filtre",
                FilterOperator: "Operatør til anvendelse mellem filtre"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Vælg felt",
                FilterNameLabel: "Felt til filter",
                FilterDisplayName: "Visningsnavn",
                FilterMaxBuckets: "Antal værdier",
                FilterTemplate: "Skabelon",
                FilterExpandByDefault: "Udvid som default",
                FilterType: "Filtertype",
                FilterTypeRefiner: "Denne skabelon til filtre agerer som en refiner og modtager/sender tilgængelige/valgte værdier fra/til the forbundne datakilde.",
                FilterTypeStaticFilter: "Denne skabelon til filtre agerer som et statisk filter og sender kun vilkårligt udvalgte værdier til den forbundne datakilde. Indgående filterværdier bliver ikke taget i betragtning.",
                CustomizeFiltersBtnLabel: "Redigér",
                CustomizeFiltersHeader: "Redigér filtre",
                CustomizeFiltersDescription: "Konfigurér filtre til søgning ved at tilføje eller fjerne rækker. Du kan vælge felter fra datakildens resultater (hvis disse allerede er valgt), eller du kan anvende statiske værdier.",
                CustomizeFiltersFieldLabel: "Tilpas filtre",
                ShowCount: "Vis antal",
                Operator: "Operatør mellem værdier",
                ANDOperator: "OG",
                OROperator: "ELLER",
                IsMulti: "Multiværdier",
                Templates: {
                    CheckBoxTemplate: "Check box",
                    DateRangeTemplate: "Datointerval",
                    ComboBoxTemplate: "Combo-boks",
                    DateIntervalTemplate: "Datointerval",
                    TaxonomyPickerTemplate: "Taksonomivælger"
                },
                SortBy: "Sortér værdier efter",
                SortDirection: "Sortér efter retning",
                SortByName: "Efter navn",
                SortByCount: "Efter optælling",
                SortAscending: "Stigende",
                SortDescending: "Faldende"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Mulige layouts",
                LayoutTemplateOptionsGroupName: "Layout-muligheder",
                TemplateUrlFieldLabel: "Anvend en ekstern URL til skabelonen",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Skabelonen skal være en valid .htm eller .html fil",
                ErrorTemplateResolve: "Ude af stand til at vise den specifikke skabelon. Fejloplysninger: '{0}'",
                FiltersTemplateFieldLabel: "Redigér skabelon til filtre",
                FiltersTemplatePanelHeader: "Redigér skabelon til filtre"
            }
        }
    }
});