define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Redigera",
                IconText: "Sökfilter av @PnP",
                Description: "Visar datafilter från ansluten webbdel för sökresultat",
                ConfigureBtnLabel: "Konfigurera"
            },
            NoAvailableFilterMessage: "Inget tillgängligt filter att visa.",
            WebPartDefaultTitle: "Sökfilters webbdel"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Anslut till en webbdel för dataresultat",
                UseDataResultsFromComponentsLabel: "Använd data från dessa webbdelar",
                UseDataResultsFromComponentsDescription: "Om du ansluter mer än en webbdel slås filtervärden samman till liknande filternamn.",
                LinkToVerticalLabel: "Visa filter endast när följande vertikaler är valda",
                LinkToVerticalLabelHoverMessage: "Filtren kommer endast att visas om den valda vertikalen matchar de som konfigurerats för den här webbdelen. Annars kommer webbdelen att vara tom (ingen marginal och ingen utfyllnad) i visningsläge."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Filterinställningar",
                FilterOperator: "Operator för användning mellan filter"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Välj fält",
                FilterNameLabel: "Fält för filter",
                FilterMaxBuckets: "# av värden",
                FilterDisplayName: "Visningsnamn",
                FilterTemplate: "Filtermall",
                FilterExpandByDefault: "Expandera som standard",
                FilterType: "Filtertyp",
                FilterTypeRefiner: "Denna filtermall fungerar som en raffinör och tar emot/skickar tillgängliga/valda värden från/till den anslutna datakällan.",
                FilterTypeStaticFilter: "Denna filtermall fungerar som ett statiskt filter och skickar endast slumpmässigt valda värden till den anslutna datakällan. Inkommande filtervärden beaktas inte.",
                CustomizeFiltersBtnLabel: "Redigera",
                CustomizeFiltersHeader: "Redigera filter",
                CustomizeFiltersDescription: "Konfigurera sökfilter genom att lägga till eller ta bort rader. Du kan välja fält från datakällans resultat (om dessa redan är markerade), eller så kan du använda statiska värden.",
                CustomizeFiltersFieldLabel: "Anpassa filter",
                ShowCount: "Visa antal",
                Operator: "Operator mellan värden",
                ANDOperator: "OCH",
                OROperator: "ELLER",
                IsMulti: "Flera värden",
                Templates: {
                    CheckBoxTemplate: "Kryssruta",
                    DateRangeTemplate: "Datumintervall",
                    ComboBoxTemplate: "Kombinationsruta",
                    DateIntervalTemplate: "Datumintervall (fasta intervall)",
                    TaxonomyPickerTemplate: "Taxonomiväljare"
                },
                SortBy: "Sorteringsordning",
                SortDirection: "Sorteringsriktning",
                SortByName: "Efter namn",
                SortByCount: "Efter antal",
                SortAscending: "Stigande",
                SortDescending: "Fallande"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Tillgängliga layouter",
                LayoutTemplateOptionsGroupName: "Layoutalternativ",
                TemplateUrlFieldLabel: "Använd en extern URL för mall",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Mallen måste vara en giltig .txt, .htm eller .html-fil",
                ErrorTemplateResolve: "Det går inte att visa den angivna mallen. Felinformation: '{0}'",
                FiltersTemplateFieldLabel: "Redigera filtermall",
                FiltersTemplatePanelHeader: "Redigera filtermall"
            }
        }
    }
});
