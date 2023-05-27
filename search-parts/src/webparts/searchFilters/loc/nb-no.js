define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Rediger",
                IconText: "Søkefilter-nettdel, av @PnP",
                Description: "Viser filter fra en tilkoblet søkenettdel",
                ConfigureBtnLabel: "Konfigurer"
            },
            NoAvailableFilterMessage: "Det er ingen tilgjengelige filter.",
            WebPartDefaultTitle: "Søkefilter"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Koble til den søkeresultat-nettdel",
                UseDataResultsFromComponentsLabel: "Bruk data fra disse nettdelene",
                UseDataResultsFromComponentsDescription: "Om du kobler til mer enn 1 nettdel slås filterverdiene sammen til liknende filternavn.",
                LinkToVerticalLabel: "Vis filtre bare når følgende vertikaler er valgt",
                LinkToVerticalLabelHoverMessage: "Filtrene vil bare vises hvis den valgte vertikalen samsvarer med de som er konfigurert for denne webdelen. Ellers vil webdelen være tom (ingen marg og ingen utfylling) i visningsmodus."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filterinnstillinger",
                FilterOperator: "Uttrykk som skal brukes mellom filter"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Velg felt",
                FilterNameLabel: "Felt for filter",
                FilterMaxBuckets: "Antall verdier",
                FilterDisplayName: "Visningsnavn",
                FilterTemplate: "Mal",
                FilterExpandByDefault: "Utvid som standard",
                FilterType: "Filtertype",
                FilterTypeRefiner: "Denne filtermalen fungerer som en refiner og mottar/sender tilgjengelige/valgte verdier fra/til den tilkoblede datakilden.",
                FilterTypeStaticFilter: "Denne filtermalen fungerer som et statisk filter og sender angitte verdier til den tilkoblede datakilden. Innkommende filterverdier har ingen effekt.",
                CustomizeFiltersBtnLabel: "Rediger",
                CustomizeFiltersHeader: "Rediger filter",
                CustomizeFiltersDescription: "Konfigurer søkefilter ved å legge til eller fjerne rader. Du kan velge felt fra datakildens resultater (om disse allerede er lastet lastet inn), eller så kan du bruke statiske verdier for filter.",
                CustomizeFiltersFieldLabel: "Tilpass filter",
                ShowCount: "Vis antall",
                Operator: "Uttrykk mellom verdier",
                ANDOperator: "OG",
                OROperator: "ELLER",
                IsMulti: "Flere verdier",
                Templates: {
                    CheckBoxTemplate: "Avkrysning",
                    DateRangeTemplate: "Datointervall",
                    ComboBoxTemplate: "Kombinasjonsboks",
                    DateIntervalTemplate: "Datointervall (faste intervaller)",
                    TaxonomyPickerTemplate: "Taksonomivelger"
                },
                SortBy: "Sorter verdier etter",
                SortDirection: "Sorteringsretning",
                SortByName: "Etter navn",
                SortByCount: "Etter antall",
                SortAscending: "Stigende",
                SortDescending: "Synkende"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Tilgjengelige maler",
                LayoutTemplateOptionsGroupName: "Malvalg",
                TemplateUrlFieldLabel: "Bruk URL for mal",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Malen må være en gyldig .txt, .htm eller .html-fil",
                ErrorTemplateResolve: "Det går ikke å vise denne malen. Feil: '{0}'",
                FiltersTemplateFieldLabel: "Rediger filtermal",
                FiltersTemplatePanelHeader: "Rediger filtermal"
            }
        }
    }
});
