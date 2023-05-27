define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Muokkaa",
                IconText: "PnP Hakutulosten webosa",
                Description: "Näyttää hakutulokset SharePoint tai Microsoft hausta.",
                ConfigureBtnLabel: "Konfiguroi"
            },
            WebPartDefaultTitle: "Hakutulosten webosa",
            ShowBlankEditInfoMessage: "Ei tuloksia tälle hakukyselylle. Näillä parametreillä webosa on tyhjä sivun lukutilassa.",
            CurrentVerticalNotSelectedMessage: "Valittu vertikaali ei ole yhdistetty tähän tuloswebosaan. Tuloswebosa on tyhjä sivun lukutilassa."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Saatavilla olevat sisältölähteet",
                PagingOptionsGroupName: "Sivutuksen vaihtoehdot",
                ItemsCountPerPageFieldName: "Kohteiden määrä sivulla",
                PagingRangeFieldName: "Näytettävien sivujen määrä",
                ShowPagingFieldName: "Näytä sivutus",
                HidePageNumbersFieldName: "Piilota sivunumerot",
                HideNavigationFieldName: "Piilota siirtymäpainikkeet (edellinen sivu, seuraava sivu)",
                HideFirstLastPagesFieldName: "Piilota ensimmäinen/viimeinen siirtymäpainikkeet",
                HideDisabledFieldName: "Piilota siirtymäpainikkeet (edellinen, seuraava, ensimmäinen, viimeinen) jos ne eivät ole käytössä.",
                TemplateSlots: {
                    GroupName: "Muotoilumääreet (slots)",
                    ConfigureSlotsLabel: "Muokkaa muotoilumääreitä tälle sisältölähteelle",
                    ConfigureSlotsBtnLabel: "Mukauta",
                    ConfigureSlotsPanelHeader: "Muotoilumääreet",
                    ConfigureSlotsPanelDescription: "Lisää tänne määreitä, joita voit käyttää eri templaateissa. Muotoilumääre on muuttuja, jota käytetään templaatissa, ja jonka arvo korvataan dynaamisesti sisältölähteen kentän arvolla. Tämä mahdollistaa templaattien yleiskäyttöisyyden riippumatta sisältölähteen kentistä. Käytä muotoilumääreitä `{{slot item @root.slots.<SlotName>}}` Handlebar ilmaisulla.",
                    SlotNameFieldName: "Muotoilumääreen nimi",
                    SlotFieldFieldName: "Muotoilumääreen kenttä",
                    SlotFieldPlaceholderName: "Valitse kenttä"
                }
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Tarjolla olevat templaatit",
                LayoutTemplateOptionsGroupName: "Templaattien vaihtoehdot",
                CommonOptionsGroupName: "Yleinen",
                TemplateUrlFieldLabel: "Käytä ulkoisen templaatin URL-osoitetta",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Templaatin pitää olla oikein muotoiltu .txt, .htm tai .html tiedosto",
                ErrorTemplateResolve: "Templaatin tunnistaminen ei onnistunut. Virhetiedot: '{0}'",
                DialogButtonLabel: "Muokkaa hakutulosten templaattia",
                DialogTitle: "Muokkaa hakutulosten templaattia",
                ShowSelectedFilters: "Näytä valitut suodattimet",
                ShowBlankIfNoResult: "Piilota webosa, jos tuloksia ei ole",
                ShowResultsCount: "Näytä tulosten lukumäärä",
                HandlebarsRenderTypeLabel: "Handlebars/HTML",
                HandlebarsRenderTypeDesc: "Valitse asettelut, jotka perustuvat HTML-, CSS- ja ohjaustankoon",
                AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
                AdaptiveCardsRenderTypeDesc: "Valitse mukautuviin JSON-kortteihin perustuvat asettelut",
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Käytä Microsoft Graph Toolkitiä",
                    ResultTypes: {
                        ResultTypeslabel: "Tulostyypit",
                        ResultTypesDescription: "Lisää tähän templaatteja käytettäväksi tuloskohteiden ominaisuuksien perusteella. Ominaisuuksia tarkastellaan konfiguroidussa järjestyksessä ja ulkoiset templaatit yliajavat suoraan webosaan määritetyt templaatit. Varmista, että käyttämäsi sisältölähteen kentät ovat mukana tulosjoukossa.",
                        InlineTemplateContentLabel: "Webosaan määritetty templaatti",
                        EditResultTypesLabel: "Muokkaa tulostyyppejä",
                        ConditionPropertyLabel: "Sisältölähteen kenttä",
                        ConditionValueLabel: "Ehdon arvo",
                        CondtionOperatorValue: "Operaattori",
                        ExternalUrlLabel: "Ulkoisen templaatin URL",
                        EqualOperator: "On yhtä kuin",
                        NotEqualOperator: "On eri suuri kuin",
                        ContainsOperator: "Sisältää",
                        StartsWithOperator: "Alkaa merkkijonolla",
                        NotNullOperator: "Ei ole tyhjä",
                        GreaterOrEqualOperator: "Suurempi tai yhtä suuri",
                        GreaterThanOperator: "Suurempi kuin",
                        LessOrEqualOperator: "Pienempi tai yhtä suuri",
                        LessThanOperator: "Pienempi kuin",
                        CancelButtonText: "Peruuta",
                        DialogButtonText: "Muokkaa templaattia",
                        DialogTitle: "Muokkaa hakutulosten templaattia",
                        SaveButtonText: "Tallenna"
                    },
                    AllowItemSelection: "Salli kohteiden valinta",
                    AllowMultipleItemSelection: "Salli monivalinta",
                    SelectionModeLabel: "Valintatila",
                    AsTokensSelectionMode: "Käsittele valittuja arvoja tokeneina (manuaalitila)",
                    AsDataFiltersSelectionMode: "Käsittele valittuja arvoja suodattimina (oletustila)",
                    AsDataFiltersDescription: "Tässä tilassa valitut arvot lähetetään sisältölähteelle tavallisina haun suodattimina. Valitun ominaisuuden pitää olla suodatettava haun skeemassa.",
                    AsTokensDescription: "Tässä tilassa valittuja arvoja käsitellään manuaalisesti tokenien ja tarjolla olevien metodien avulla. Esimerkki SharePointin kyselyn templaatista: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "Looginen operaattori arvojen välillä",
                    FieldToConsumeLabel: "Käytettävä lähteen kenttä",
                    FieldToConsumeDescription: "Käytä tätä kentän arvoa valituille kohteille"
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Isäntäkokoonpano"
                }
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Tarjolla olevat yhteydet",
                UseFiltersWebPartLabel: "Yhdistä suodatinwebosaan",
                UseFiltersFromComponentLabel: "Käytä suodattimia tästä webosasta",
                UseDynamicFilteringsWebPartLabel: "Yhdistä hakutulosten webosaan",
                UseDataResultsFromComponentsLabel: "Käytä tuloksia tästä webosasta",
                UseDataResultsFromComponentsDescription: "Käytä tuloksia valituista kohteista näissä webosissa",                
                UseSearchVerticalsWebPartLabel: "Yhdistä vertikaalien webosaan",
                UseSearchVerticalsFromComponentLabel: "Käytä vertikaaleja näistä webosista",
                LinkToVerticalLabel: "Näytä tulokset vain, kun seuraava vertikaali on valittu",
                LinkToVerticalLabelHoverMessage: "Tulokset näytetään vain, jos alla konfiguroitu vertikaali vastaa vertikaaliwebosasta valittua vertikaalia. Muussa tapauksessa webosa on tyhjä (ei vie tilaa eikä näytä kehystä) sivun lukutilassa.",
                UseInputQueryText: "Käytä kyselytekstiä",
                UseInputQueryTextHoverMessage: "Käytä {inputQueryText} tokenia sisältölähteessäsi palauttaaksesi tämän arvon",
                SearchQueryTextFieldLabel: "Kyselyn teksti",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Syötä kyselyn teksti...",
                InputQueryTextStaticValue: "Staattinen arvo",
                InputQueryTextDynamicValue: "Dynaaminen arvo",
                SearchQueryTextUseDefaultQuery: "Käytä oletusarvoa",
                SearchQueryTextDefaultValue: "Oletusarvo",
                SourceDestinationFieldLabel: "Kohdekentän nimi",
                SourceDestinationFieldDescription: "Tässä webosassa käytettävä kohdekenttä, joka vastaa valittuihin arvoihin",
                AvailableFieldValuesFromResults: "Kenttä joka sisältää suodatinarvon"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konsiguroi laajennuskirjastot ladattavaksi käynnistyksessä.",
                    PanelDescription: "Lisää/poista mukautetun laajennuskirjastosi ID:t tässä. Voit määrittää näyttönimen ja päättää, ladataanko kirjasto käynnistyksessä. Vain mukautetut sisältölähtee, templaatit, komponentit ja Handlebar helperit tarjoajat ladataan tässä.",
                },
                EnableTelemetryLabel: "PnP telemetria",
                EnableTelemetryOn: "Aseta telemetria käyttöön",
                EnableTelemetryOff: "Poista telemetria käytöstä"
            },
            CustomQueryModifier: {
                  EditQueryModifiersLabel: "Käytettävissä olevien mukautettujen kyselyn muokkaimien määrittäminen",
                  QueryModifiersLabel: "Mukautetut kyselyn muokkaajat",
                  QueryModifiersDescription: "Ota käyttöön tai poista käytöstä yksittäisiä mukautettuja kyselyn muokkaajia.",
                  EnabledPropertyLabel: "Enabled",
                  ModifierNamePropertyLabel: "Nimi",
                  ModifierDescriptionPropertyLabel: "Kuvaus",
                  EndWhenSuccessfullPropertyLabel:"Loppuu, kun onnistuu"              
            }
        }
    }
});