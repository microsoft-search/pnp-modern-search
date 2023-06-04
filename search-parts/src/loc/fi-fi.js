define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Valitse token...",
            Context: {
                ContextTokensGroupName: "Kontekstitokenit",
                SiteAbsoluteUrl: "Sivustokokoelman absoluuttinen URL",
                SiteRelativeUrl: "Sivustokokoelman suhteellinen URL",
                WebAbsoluteUrl: "Sivuston absoluuttinen URL",
                WebRelativeUrl: "Sivuston suhteellinen URL",
                WebTitle: "Sivuston otsikko",
                InputQueryText: "Hakukyselyn teksti"
            },
            Custom: {
                CustomTokensGroupName: "Mukautettu arvo",
                CustomValuePlaceholder: "Syötä arvo...",
                InvalidtokenFormatErrorMessage: "Syötä tuettu token muodossa '{' and '}'. (ex: {Today})"
            },
            Date: {
                DateTokensGroupName: "Päivämäärätokenit",
                Today: "Tänään",
                Yesterday: "Eilen",
                Tomorrow: "Huomenna",
                OneWeekAgo: "Viikko sitten",
                OneMonthAgo: "Kuukausi sitten",
                OneYearAgo: "Vuosi sitten"
            },
            Page: {
                PageTokensGroupName: "Sivun tokenit",
                PageId: "Sivun ID",
                PageTitle: "Sivun otsikko",
                PageCustom: "Muu sivun ominaisuus",
            },
            User: {
                UserTokensGroupName: "Käyttäjätokenit",
                UserName: "Käyttäjän nimi",
                Me: "Minä",
                UserDepartment: "Käyttäjän yksikkö (Department)",
                UserCustom: "Muu käyttäjän ominaisuus"
            }
        },
        General: {
            OnTextLabel: "Käytössä",
            OffTextLabel: "Pois käytöstä",
            StaticArrayFieldName: "Taulukkotyyppinen kenttä",
            About: "Lisätietoa",
            Authors: "Tekijä(t)",
            Version: "Versio",
            InstanceId: "Webosainstanssin ID",
            Resources: {
                GroupName: "Resurssit",
                Documentation: "Dokumentaatio",
                PleaseReferToDocumentationMessage: "Viittaa viralliseen dokumentaatioon, kiitos."
            },
            Extensibility: {
                InvalidDataSourceInstance: "Valittu sisältölähde '{0}' ei toteuta 'BaseDataSource' luokkaa oikein. Jotkut metodit puuttuvat.",
                DataSourceDefinitionNotFound: "Mukautettua sisältölähdettä avaimella '{0}' ei löydy. Varmista että sovellus on asennettu sovellusluetteloon ja manifest ID on rekisteröity webosalle.",
                LayoutDefinitionNotFound: "Mukautettua templaattia avaimella '{0}' ei löydy. Varmista että sovellus on asennettu sovellusluetteloon ja manifest ID on rekisteröity webosalle.",
                InvalidLayoutInstance: "Valittu templaatti '{0}' ei toteuta 'BaseLayout' luokkaa oikein. Jotkut metodit puuttuvat.",
                DefaultExtensibilityLibraryName: "Oletuksena käytettävä laajennuskirjasto",
                InvalidProviderInstance: "Valittu kyselyehdotusten tarjoaja '{0}' ei toteuta 'BaseSuggestionProvider' luokkaa oikein. Jotkut metodit puuttuvat.",
                ProviderDefinitionNotFound: "Mukautettua kyselyehdotusten tarjoajaa avaimella '{0}' ei löydy. Varmista että sovellus on asennettu sovellusluetteloon ja manifest ID on rekisteröity webosalle.",
                QueryModifierDefinitionNotFound: "Mukautettua queryModifieria avaimella '{0}' ei löytynyt. Varmista, että ratkaisu on otettu oikein käyttöön sovelluskatalogiin ja että manifestin ID on rekisteröity tälle Web-osalle.",
                InvalidQueryModifierInstance: "Valittu mukautettu kyselymuodostaja '{0}' ei toteuta abstraktia luokkaa 'BaseQueryModifier' oikein. Jotkin metodit puuttuvat.",
            },
            DateFromLabel: "Alkaa",
            DateTolabel: "Päättyy",
            DatePickerStrings: {
                months: ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'],
                shortMonths: ['tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu'],
                days: ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'],
                shortDays: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
                goToToday: 'Siirry tähän päivään',
                prevMonthAriaLabel: 'Siirry edelliseen kuukauteen',
                nextMonthAriaLabel: 'Siirry seuraavaan kuukauteen',
                prevYearAriaLabel: 'Siirry edelliseen vuoteen',
                nextYearAriaLabel: 'Siirry seuraavaan vuoteen',
                closeButtonAriaLabel: 'Sulje päivämäärävalitsin',
                isRequiredErrorMessage: 'Alkamispäivä on pakollinen.',
                invalidInputErrorMessage: 'Virheellinen päivämäärän muotoilu.'
            },
            DateIntervalStrings: {
                AnyTime: "Milloin tahansa",
                PastDay: "Viimeiset 24 tuntia",
                PastWeek: "Viimeisestä 24 tunnista viime viikkoon",
                PastMonth: "Edellisestä viikosta viime kuukauteen",
                Past3Months: "Viime kuukaudesta viimeiseen kolmeen kuukauteen",
                PastYear: "Viimeisen 3 kuukauden ajalta viime vuoteen",
                Older: "Vuotta vanhempi"
            },
            SameTabOpenBehavior: "Avaa samaan välilehteen",
            NewTabOpenBehavior: "Avaa uuteen välilehteen",
            PageOpenBehaviorLabel: "Avautumistapa",
            EmptyFieldErrorMessage: "Tämä kenttä ei voi olla tyhjä",
            TagPickerStrings: {
                NoResultsSearchMessage: "Tuloksia ei löytynyt",
                SearchPlaceholder: "Hae arvoa..."
            },
            CurrentVerticalNotSelectedMessage: "Valittu vertikaali ei ole yhdistetty hakutulososaan ({0}). Hakutulososa on tyhjä sivun lukutilassa."
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "SharePoint haku",
                SourceConfigurationGroupName: "Lähteen konfigurointi",
                QueryTextFieldLabel: "Hakukysely",
                QueryTextFieldInfoMessage: "Käytä <strong>Tarjolla olevat yhteydet</strong> konfigurointisivua määrittääksesi joko staattisen arvon tai arvon dynaamisesta komponentista sivulla, kuten hakukentästä",
                QueryTemplateFieldLabel: "Kyselytemplaatti",
                QueryTemplatePlaceHolderText: "esimerkki: Path:{Site}",
                QueryTemplateFieldDescription: "Hakukyselyn templaatti. Voit myös käyttää {<tokens>} muotoilua rakentaaksesi dynaamisen kyselyn.",
                ResultSourceIdLabel: "Haun tuloslähteen Id / Scope|Nimi",
                ResultSourceIdDescription: "Valitse tarjolla oleva tuloslähde, syötä mukautetun tuloslähteen GUID, tai SCOPE ja NIMI erotettuna pystyviivalla | (i.e: SPSite|News). Mahdolliset tuloslähteet ovat [SPSiteSubscription, SPSite, SPWeb]. Paina [Enter] tallentaaksesi.",
                InvalidResultSourceIdMessage: "Syötetty arvo ei ole toimiva GUID, tai muotoiltu muodossa SCOPE|NIMI",
                EnableQueryRulesLabel: "Salli kyselysäännöt",
                RefinementFilters: "Suodattimet",
                RefinementFiltersDescription: "Suoraan hakukyselyyn liitettävät suodattimet. Nämä eivät näy valituissa suodattimissa. Tekstimuotoisissa suodattimissa käytä tuplalainausmerkkejä (\") yksittäisen hipsun sijasta (').",
                EnableLocalizationLabel: "Salli lokalisointi",
                EnableLocalizationOnLabel: "Käytössä",
                EnableLocalizationOffLabel: "Pois käytöstä",
                QueryCultureLabel: "Hakukyselyn kieli",
                QueryCultureUseUiLanguageLabel: "Käytä käyttöliittymäkieltä",
                SelectedPropertiesFieldLabel: "Valitut ominaisuudet",
                SelectedPropertiesFieldDescription: "Määrittää ominaisuudet, jotka palautetaan hakutulosten joukosta",
                SelectedPropertiesPlaceholderLabel: "Valitse ominaisuudet",
                TermNotFound: "(Termiä ID:llä '{0}' ei löydy)",
                ApplyQueryTemplateBtnText: "Ota käyttöön",
                EnableAudienceTargetingTglLabel: "Salli käyttäjäryhmäkohdennus",
                TrimDuplicates: "Leikkaa kaksoiskappaleet",
                CollapseSpecificationLabel: "Kutista määritys"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Hakukysely",
                QueryTextFieldInfoMessage: "Käytä <strong>Tarjolla olevat yhteydet</strong> konfigurointisivua määrittääksesi joko staattisen arvon tai arvon dynaamisesta komponentista sivulla, kuten hakukentästä",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Haettavat entiteetit",
                SelectedFieldsPropertiesFieldLabel: "Valitut ominaisuudet",
                SelectedFieldsPropertiesFieldDescription: "Määrittää ominaisuudet, jotka palautetaan hakutulosten joukosta",
                SelectedFieldsPlaceholderLabel: "Valitse ominaisuudet",
                EnableTopResultsLabel: "Salli parhaat tulokset",
                ContentSourcesFieldLabel: "Sisältölähteet",
                ContentSourcesFieldDescriptionLabel: "Microsoft Search yhdistimien hallintaportaalissa määritettyjen yhteyksien ID:t.",
                ContentSourcesFieldPlaceholderLabel: "esimerkki: 'MyCustomConnectorId'",
                EnableSuggestionLabel: "Salli kirjoitusasun ehdotukset",
                EnableModificationLabel: "Salli kirjoitusasun muutokset",
                QueryTemplateFieldLabel: "Kyselytemplaatti",
                QueryTemplatePlaceHolderText: "esimerkki: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "Hakukyselyn templaatti. Voit myös käyttää {<tokens>} muotoilua ja KQL-määreitä rakentaaksesi dynaamisen kyselyn.",
                ApplyQueryTemplateBtnText: "Ota käyttöön",
                UseBetaEndpoint: "Käytä beta endpointtia",
                TrimDuplicates: "Leikkaa kaksoiskappaleet",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Muokkaa tiivistysasetuksia",
                    CollapsePropertiesDescription: "Especifique la configuración de contracción para los resultados de búsqueda. Puede seleccionar un campo de la lista desplegable (solo si los datos de la fuente de datos ya se han obtenido) o escribir su propio valor personalizado (presione 'Entrar' para guardar su entrada)",
                    CollapsePropertiesPropertyPaneFieldLabel: "Tiivistysasetukset",
                    CollapseLimitFieldLabel: "Raja",
                    CollapsePropertiesFieldColumnPlaceholder: "Tiivistä kentän mukaan"
                }
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Lajittelujärjestys",
                    SortListDescription: "Määritä oletusarvoinen hakutulosten lajittelujärjestys. Voit joko valita kentän pudotusvalikosta (jos tulosjoukon data on jo haettu) tai kirjoittaa oman mukautetun arvosi (paina 'Enter' tallentaaksesi lisäyksen)",
                    SortDirectionAscendingLabel: "Nouseva",
                    SortDirectionDescendingLabel: "Laskeva",
                    SortErrorMessage: "Virheellinen haun ominaisuus (Tarkista, että hallittu ominaisuus on lajiteltava).",
                    SortPanelSortFieldLabel: "Lajittele kentän perusteella",
                    SortPanelSortFieldAria: "Lajitteluperuste",
                    SortPanelSortFieldPlaceHolder: "Lajitteluperuste",
                    SortPanelSortDirectionLabel: "Lajittelusuunta",
                    SortDirectionColumnLabel: "Suunta",
                    SortFieldColumnLabel: "Kentän nimi",
                    SortFieldDefaultSortLabel: "Oletuslajittelu",
                    SortFieldFriendlyNameLabel: "Lajittele kentän näyttönimi",
                    SortFieldUserSortLabel: "Käyttäjälajittelu",
                    EditSortLabel: "Muokkaa lajittelujärjestystä",
                    SortInvalidSortableFieldMessage: "Tämä ominaisuus ei ole lajiteltava",
                    SortFieldColumnPlaceholder: "Valitse kenttä..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Lisää Handlebars komento",
            TextDialogTitle: "Muokkaa Handlebars komentoja",
            TextDialogCancelButtonText: "Peruuta",
            TextDialogSaveButtonText: "Tallenna",
            SelectItemComboPlaceHolder: "Valitse ominaisuus",
            AddStaticDataLabel: "Lisää staattinen arvo",
            TextFieldApplyButtonText: "Ota käyttöön",
            SortByPlaceholderText: "Järjestä...",
            SortByDefaultOptionText: "Oletus"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            CustomHandlebars: {
                Name: "Mukautettu"
            },
            CustomAdaptiveCards: {
                Name: "Mukautettu"
            },
            SimpleList: {
                Name: "Lista",
                ShowFileIconLabel: "Näytä tiedostotyypin ikoni",
                ShowItemThumbnailLabel: "Näytä pikkukuva"
            },
            DetailsList: {
                Name: "Yksityiskohtainen lista",
                UseHandlebarsExpressionLabel: "Käytä Handlebars komentoa",
                MinimumWidthColumnLabel: "Minimileveys  (px)",
                MaximumWidthColumnLabel: "Maksimileveys (px)",
                SortableColumnLabel: "Lajiteltava",
                ResizableColumnLabel: "Leveys säädettävissä",
                MultilineColumnLabel: "Monirivinen",
                LinkToItemColumnLabel: "Linkki kohteeseen",
                CompactModeLabel: "Tiivis muotoilu",
                ShowFileIcon: "Näytä tiedostotyypin ikoni",
                ManageDetailsListColumnDescription: "Lisää, muokkaa tai poista sarakkeita yksityiskohtaisen listan templaatista. Voit käyttää suoraan ominaisuuksien arvoja ilman muotoilua, tai käyttää Handlebars komentoja arvokentässä. Myös HTML-muotoilu on tuettu.",
                ManageDetailsListColumnLabel: "Hallitse sarakkeita",
                ValueColumnLabel: "Sarakkeen arvo",
                ValueSortingColumnLabel: "Valitse lajittelukenttä...",
                ValueSortingColumnNoFieldsLabel: "Ei kenttiä käytettävissä",
                DisplayNameColumnLabel: "Sarakkeen näyttönimi",
                FileExtensionFieldLabel: "Kenttä tiedostotyypin määrittämiseen",
                GroupByFieldLabel: "Ryhmittele kentän mukaan",
                EnableGrouping: "Salli ryhmittely",
                GroupingDescription: "Varmista, että tulosten verkko-osassa on tietoja, jotta voit näyttää ominaisuusluettelon.",
                CollapsedGroupsByDefault: "Näytä ryhmät tiivistettynä",
                ResetFieldsBtnLabel: "Palauta kentät templaatin oletusarvoihin"
            },
            Cards: {
                Name: "Kortit",
                ManageTilesFieldsLabel: "Hallitse korttien kenttiä",
                ManageTilesFieldsPanelDescriptionLabel: "Yhdistä mukautettuja kenttiä korttitemplaatin sarakkeisiin. Voit käyttää suoraan ominaisuuksien arvoja ilman muotoilua, tai käyttää Handlebars komentoja arvokentässä. Myös HTML-muotoilu on tuettu.",
                PlaceholderNameFieldLabel: "Nimi",
                SupportHTMLColumnLabel: "Salli HTML",
                PlaceholderValueFieldLabel: "Arvo",
                UseHandlebarsExpressionLabel: "Käytä Handlebars komentoa",
                EnableItemPreview: "Salli tuloksen esikatselu",
                EnableItemPreviewHoverMessage: "Jos tä'mä vaihtoehto on käytössä, sillä voi olla vaikutusta suorituskykyyn jos liian monta kohdetta ladataan kerralla näkyviin ja käytät 'AutoPreviewUrl' muotoilumäärettä (slot). Suosittelemme, että valitset tämän vaihtoehdon vain pienille tulosmäärille tai käytät sisältölähteen kenttien perusteella ennalta muodostettuja esikatselukuvan URL-osoitteita.",
                ShowFileIcon: "Näytä tiedostotyypin ikoni",
                CompactModeLabel: "Tiivistetty muotoilu",
                PreferedCardNumberPerRow: "Toivottu korttien määrä per rivi",
                Fields: {
                    Title: "Otsikko",
                    Location: "Sijainti",
                    Tags: "Aihesanat",
                    PreviewImage: "Esikatselukuva",
                    PreviewUrl: "Esikatselun URL",
                    Url: "Url",
                    Date: "Päiväys",
                    Author: "Tekijä",
                    ProfileImage: "Profiilikuvan URL",
                    FileExtension: "Tiedostotyyppi",
                    IsContainer: "On kansio"
                },
                ResetFieldsBtnLabel: "Palauta kentät templaatin oletusarvoihin"
            },
            Slider: {
                Name: "Slider",
                SliderAutoPlay: "Toista automaattisesti",
                SliderAutoPlayDuration: "Automaattisen toiston kesto (sekunneissa)",
                SliderPauseAutoPlayOnHover: "Pysäytä hoverilla",
                SliderGroupCells: "Yhteen ryhmiteltävien elementtien määrä",
                SliderShowPageDots: "Näytä sivujen pallurat",
                SliderWrapAround: "Ääretön skrollaus",
                SlideHeight: "Korkeus (px)",
                SlideWidth: "Leveys (px)"
            },
            People: {
                Name: "Henkilöt",
                ManagePeopleFieldsLabel: "Hallitse kenttiä",
                ManagePeopleFieldsPanelDescriptionLabel: "Tässä voit yhdistää templaatin kentät käyttäjäprofiilin ominaisuuksiin. Voit käyttää suoraan ominaisuuksien arvoja ilman muotoilua, tai käyttää Handlebars komentoja arvokentässä.",
                PlaceholderNameFieldLabel: "Nimi",
                PlaceholderValueFieldLabel: "Arvo",
                UseHandlebarsExpressionLabel: "Käytä Handlebars komentoa",
                PersonaSizeOptionsLabel: "Komponentin koko",
                PersonaSizeExtraSmall: "Erittäin pieni",
                PersonaSizeSmall: "Pieni",
                PersonaSizeRegular: "Normaali",
                PersonaSizeLarge: "Iso",
                PersonaSizeExtraLarge: "Erittäin iso",
                ShowInitialsToggleLabel: "Näytä nimikirjaimet jos kuva ei ole saatavilla",
                SupportHTMLColumnLabel: "Salli HTML",
                ResetFieldsBtnLabel: "Palauta kentät templaatin oletusarvoihin",
                ShowPersonaCardOnHover: "Näytä henkilökortti hoverilla",
                ShowPersonaCardOnHoverCalloutMsg: "Tämä ominaisuus käyttää Microsoft Graphia käyttäjäprofiilin tietojen näyttämiseen, ja tarvitsee seuraavat API oikeudet tenantissa toimiakseen: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                Fields: {
                    ImageUrl: "Kuvan URL",
                    PrimaryText: "Ensimmäisen rivin teksti",
                    SecondaryText: "Toisen rivin teksti",
                    TertiaryText: "Kolmannes rivin teksti",
                    OptionalText: "Valinnainen teksti"
                }
            },
            Vertical: {
                Name: "Vertikaalinen"
            },
            Horizontal: {
                Name: "Horisontaalinen",
                PreferedFilterNumberPerRow: "Toivottu suodattimien määrä per rivi",
            },
            Panel: {
                Name: "Paneeli",
                IsModal: "Modal",
                IsLightDismiss: "Kevyt poistuminen",
                Size: "Paneelin koko",
                ButtonLabel: "Näytä suodattimet",
                ButtonLabelFieldName: "Painikkeen näkyvä teksti",
                HeaderText: "Suodattimet",
                HeaderTextFieldName: "Paneelin ylätunnisteen teksti",
                SizeOptions: {
                    SmallFixedFar: 'Pieni (oletus)',
                    SmallFixedNear: 'Pieni, lähellä sivua',
                    Medium: 'Keskikokoinen',
                    Large: 'Suuri',
                    LargeFixed: 'Suuri kiinteälevyinen',
                    ExtraLarge: 'Erittäin suuri',
                    SmallFluid: 'Täysleveä (fluid)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> tulosta kyselylle '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> tulosta",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Tarjolla olevat yhteydet",
                UseDataVerticalsWebPartLabel: "Yhdistä hakuvertikaalien webosaan",
                UseDataVerticalsFromComponentLabel: "Käytä vertikaaleja tästä webosasta"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Laajennusten konfigurointi",
                    FieldLabel: "Ladattavat laajennuskirjastot",
                    ManageBtnLabel: "Konfiguroi",
                    Columns: {
                        Name: "Nimi/Tarkoitus",
                        Id: "Manifest GUID",
                        Enabled: "Käytössä/Pois käytöstä"
                    }
                },
                ImportExport: "Vienti/Tuonti asetukset"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Ota käyttöön",
            ClearAllFiltersButtonLabel: "Tyhjennä",
            FilterNoValuesMessage: "Ei arvoja tälle suodattimelle",
            OrOperator: "TAI",
            AndOperator: "JA",
            ComboBoxPlaceHolder: "Valitse arvo",
            UseAndOperatorValues: "Käytä JA operaattoria arvojen välissä",
            UseOrOperatorValues: "Käytä TAI operaattoria arvojen välissä",
            UseValuesOperators: "Valitse operaattori käytettäväksi arvojen välissä"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "SharePoint staattiset kyselyehdotukset",
                ProviderDescription: "Palauta SharePoint staattiset käyttäjän määrittämät kyselyehdotukset"
            }
        }
    }
})
