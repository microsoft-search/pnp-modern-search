define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Muokkaa",
                IconText: "PnP Haun suodattimet",
                Description: "Näyttää suodattimet yhdistetylle hakutulosten webosalle",
                ConfigureBtnLabel: "Konfiguroi"
            },
            NoAvailableFilterMessage: "Ei suodattimia näytettäväksi.",
            WebPartDefaultTitle: "Haun suodattimet webosa"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Yhdistä hakutulosten webosaan",
                UseDataResultsFromComponentsLabel: "Käytä tuloksia näistä hakutulosten webosista",
                UseDataResultsFromComponentsDescription: "Jos yhdistät useamman kuin yhden hakutulosten webosan, suodatinarvot ja tulosmäärät yhdistetään samannimisille suodattimille.",
                LinkToVerticalLabel: "Näytä suodattimet vain, kun nämä vertikaalit ovat valittuna",
                LinkToVerticalLabelHoverMessage: "Suodattimet näytetään vain, jos valittu vertikaali on sama kuin tälle webosalle konfiguroitu. Muussa tapauksessa suodatinwebosa on tyhjä (ei vie tilaa eikä näytä kehystä) sivun lukutilassa."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Suodattimien asetukset",
                FilterOperator: "Suodattimien välinen operaattori"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Valitse kenttä",
                FilterNameLabel: "Suodatinkenttä",
                FilterMaxBuckets: "# arvojen määrä",
                FilterDisplayName: "Näyttönimi",
                FilterTemplate: "Templaatti",
                FilterExpandByDefault: "Näytä oletuksena laajennettuna",
                FilterType: "Suodatintyyppi",
                FilterTypeRefiner: "Tämä suodatintemplaatti mukautuu sisältölähteen palauttaman tulosjoukon saatavilla olevien arvojen perusteella, ja rajaa hakutulosta suodattimesta valittujen arvojen perusteella.",
                FilterTypeStaticFilter: "Tämä suodatintemplaatti on staattinen ja ainoastaan lähettää valitut suodatinarvot yhdistettyyn sisältölähteeseen. Palautunut hakutulos ei vaikuta suodattimen arvoihin.",
                CustomizeFiltersBtnLabel: "Muokkaa",
                CustomizeFiltersHeader: "Muokkaa suodattimia",
                CustomizeFiltersDescription: "Konfiguroi haun suodattimet lisäämällä tai poistamalla rivejä. Voit valita kenttiä kaikista sisältölähteistä tai käyttää staattisia arvoja suodattimina.",
                CustomizeFiltersFieldLabel: "Mukauta suodattimia",
                ShowCount: "Näytä tulosten määrä",
                Operator: "Suodatinarvojen välinen operaattori",
                ANDOperator: "JA",
                OROperator: "TAI",
                IsMulti: "Monivalinta",
                Templates: {
                    CheckBoxTemplate: "Valintaruudut",
                    DateRangeTemplate: "Päivämäärärajaus",
                    ComboBoxTemplate: "Yhdistelmävalinta",
                    DateIntervalTemplate: "Ajankohtarajaus (esim. viime kuussa)",
                    TaxonomyPickerTemplate: "Taksonomiavalinta"
                },
                SortBy: "Lajitteluperuste",
                SortDirection: "Lajittelun suunta",
                SortByName: "Nimi",
                SortByCount: "Tulosmäärä",
                SortAscending: "Nouseva",
                SortDescending: "Laskeva"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Tarjolla olevat muotoilut",
                LayoutTemplateOptionsGroupName: "Muotoiluvaihtoehdot",
                TemplateUrlFieldLabel: "Käytä ulkoisen templaatin URL-osoitetta",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Templaatin pitää olla oikein muotoiltu .txt, .htm tai .html tiedosto",
                ErrorTemplateResolve: "Templaatin tunnistaminen ei onnistunut. Virhetiedot: '{0}'",
                FiltersTemplateFieldLabel: "Muokkaa suodatintemplaattia",
                FiltersTemplatePanelHeader: "Muokkaa suodatintemplaattia"
            }
        }
    }
});