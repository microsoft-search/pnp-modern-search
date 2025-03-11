define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Vyberte token...",
            Context: {
                ContextTokensGroupName: "Kontextové tokeny",
                SiteAbsoluteUrl: "Absolutní URL webu",
                SiteRelativeUrl: "Relativní URL webu vůči serveru",
                WebAbsoluteUrl: "Absolutní URL podstránky",
                WebRelativeUrl: "Relativní URL podstránky vůči serveru",
                WebTitle: "Název webu",
                InputQueryText: "Text dotazu"
            },
            Custom: {
                CustomTokensGroupName: "Vlastní hodnota",
                CustomValuePlaceholder: "Zadejte hodnotu...",
                InvalidtokenFormatErrorMessage: "Zadejte podporovaný formát tokenu pomocí '{' a '}'. (např.: {Today})"
            },
            Date: {
                DateTokensGroupName: "Datumové tokeny",
                Today: "Dnes",
                Yesterday: "Včera",
                Tomorrow: "Zítra",
                OneWeekAgo: "Před týdnem",
                OneMonthAgo: "Před měsícem",
                OneYearAgo: "Před rokem"
            },
            Page: {
                PageTokensGroupName: "Tokeny stránky",
                PageId: "ID stránky",
                PageTitle: "Název stránky",
                PageCustom: "Jiný sloupec stránky"
            },
            User: {
                UserTokensGroupName: "Uživatelské tokeny",
                UserName: "Uživatelské jméno",
                Me: "Já",
                UserDepartment: "Oddělení uživatele",
                UserCustom: "Vlastní vlastnost uživatele"
            }
        },
        General: {
            OnTextLabel: "Zapnuto",
            OffTextLabel: "Vypnuto",
            StaticArrayFieldName: "Pole podobné poli",
            About: "O aplikaci",
            Authors: "Autor(ři)",
            Version: "Verze",
            InstanceId: "ID instance webové části",
            Resources: {
                GroupName: "Zdroje",
                Documentation: "Dokumentace",
                PleaseReferToDocumentationMessage: "Prosím, podívejte se na oficiální dokumentaci."
            },
            Extensibility: {
                InvalidDataSourceInstance: "Vybraný zdroj dat '{0}' neimplementuje správně abstraktní třídu 'BaseDataSource'. Chybí některé metody.",
                DataSourceDefinitionNotFound: "Vlastní zdroj dat s klíčem '{0}' nebyl nalezen. Ujistěte se, že je řešení správně nasazeno do katalogu aplikací a že je ID manifestu registrováno pro tuto webovou část.",
                LayoutDefinitionNotFound: "Vlastní rozvržení s klíčem '{0}' nebylo nalezeno. Ujistěte se, že je řešení správně nasazeno do katalogu aplikací a že je ID manifestu registrováno pro tuto webovou část.",
                InvalidLayoutInstance: "Vybrané rozvržení '{0}' neimplementuje správně abstraktní třídu 'BaseLayout'. Chybí některé metody.",
                DefaultExtensibilityLibraryName: "Výchozí knihovna rozšiřitelnosti",
                InvalidProviderInstance: "Vybraný poskytovatel návrhů '{0}' neimplementuje správně abstraktní třídu 'BaseSuggestionProvider'. Chybí některé metody.",
                ProviderDefinitionNotFound: "Vlastní poskytovatel návrhů s klíčem '{0}' nebyl nalezen. Ujistěte se, že je řešení správně nasazeno do katalogu aplikací a že je ID manifestu registrováno pro tuto webovou část.",
                QueryModifierDefinitionNotFound: "Vlastní modifikátor dotazu s klíčem '{0}' nebyl nalezen. Ujistěte se, že je řešení správně nasazeno do katalogu aplikací a že je ID manifestu registrováno pro tuto webovou část.",
                InvalidQueryModifierInstance: "Vybraný vlastní modifikátor dotazu '{0}' neimplementuje správně abstraktní třídu 'BaseQueryModifier'. Chybí některé metody."
            },
            DateFromLabel: "Od",
            DateTolabel: "Do",
            DatePickerStrings: {
                months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
                shortMonths: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'],
                days: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
                shortDays: ['N', 'P', 'Ú', 'S', 'Č', 'P', 'S'],
                goToToday: 'Přejít na dnešek',
                prevMonthAriaLabel: 'Přejít na předchozí měsíc',
                nextMonthAriaLabel: 'Přejít na další měsíc',
                prevYearAriaLabel: 'Přejít na předchozí rok',
                nextYearAriaLabel: 'Přejít na další rok',
                closeButtonAriaLabel: 'Zavřít výběr data',
                isRequiredErrorMessage: 'Počáteční datum je povinné.',
                invalidInputErrorMessage: 'Neplatný formát data.'
            },
            DateIntervalStrings: {
                AnyTime: "Kdykoliv",
                PastDay: "Posledních 24 hodin",
                PastWeek: "Od posledních 24 hodin do posledního týdne",
                PastMonth: "Od posledního týdne do posledního měsíce",
                Past3Months: "Od posledního měsíce do posledních 3 měsíců",
                PastYear: "Od posledních 3 měsíců do posledního roku",
                Older: "Starší než rok"
            },
            SameTabOpenBehavior: "Použít aktuální kartu",
            NewTabOpenBehavior: "Otevřít na nové kartě",
            PageOpenBehaviorLabel: "Chování při otevírání",
            EmptyFieldErrorMessage: "Toto pole nemůže být prázdné",
            TagPickerStrings: {
                NoResultsSearchMessage: "Nebyla nalezena žádná shoda",
                SearchPlaceholder: "Hledat hodnotu..."
            },
            CurrentVerticalNotSelectedMessage: "Aktuálně vybraná vertikála neodpovídá těm, které jsou přiřazeny k této webové části ({0}). V režimu zobrazení zůstane prázdná."
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "Vyhledávání v SharePointu",
                SourceConfigurationGroupName: "Konfigurace zdroje",
                QueryTextFieldLabel: "Text dotazu",
                QueryTextFieldInfoMessage: "Použijte kartu konfigurace webové části <strong>Dostupná připojení</strong> k určení statické hodnoty nebo hodnoty z dynamické komponenty na stránce, například vyhledávacího pole.",
                QueryTemplateFieldLabel: "Šablona dotazu",
                QueryTemplatePlaceHolderText: "např.: Path:{Site}",
                QueryTemplateFieldDescription: "Šablona vyhledávacího dotazu. Můžete také použít {<tokens>} k sestavení dynamického dotazu.",
                ResultSourceIdLabel: "ID/Zdroj výsledků | Název",
                ResultSourceIdDescription: "Vyberte vestavěný zdroj, zadejte vlastní GUID zdroje nebo SCOPE a NAME zdroje oddělené znakem | (např.: SPSite|News). Platné rozsahy jsou [SPSiteSubscription, SPSite, SPWeb]. Stisknutím [Enter] uložte.",
                InvalidResultSourceIdMessage: "Zadaná hodnota není platné GUID nebo není správně formátována jako SCOPE|NAME.",
                EnableQueryRulesLabel: "Povolit pravidla dotazu",
                RefinementFilters: "Filtry upřesnění",
                RefinementFiltersDescription: "Počáteční filtry upřesnění, které se použijí na dotaz. Nebudou se zobrazovat ve vybraných filtrech. Pro řetězcové výrazy používejte dvojité uvozovky (\") místo jednoduchých (').",
                EnableLocalizationLabel: "Povolit lokalizaci",
                EnableLocalizationOnLabel: "Zapnuto",
                EnableLocalizationOffLabel: "Vypnuto",
                QueryCultureLabel: "Jazyk vyhledávacího dotazu",
                QueryCultureUseUiLanguageLabel: "Použít jazyk rozhraní",
                SelectedPropertiesFieldLabel: "Vybrané vlastnosti",
                SelectedPropertiesFieldDescription: "Určuje vlastnosti, které se mají načíst z výsledků vyhledávání.",
                SelectedPropertiesPlaceholderLabel: "Vybrat vlastnosti",
                HitHighlightedPropertiesFieldLabel: "Vlastnosti s označeným výskytem",
                HitHighlightedPropertiesFieldDescription: "Zadejte seznam spravovaných vlastností pro označení výskytu (např.: Department, UserName).",
                TermNotFound: "(Termín s ID '{0}' nenalezen)",
                ApplyQueryTemplateBtnText: "Použít",
                EnableAudienceTargetingTglLabel: "Povolit cílení na publikum",
                TrimDuplicates: "Odstranit duplicity",
                CollapseSpecificationLabel: "Specifikace sbalení"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Text dotazu",
                QueryTextFieldInfoMessage: "Použijte kartu konfigurace webové části <strong>Dostupná připojení</strong> k určení statické hodnoty nebo hodnoty z dynamické komponenty na stránce, například vyhledávacího pole.",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Typy entit k vyhledání",
                SelectedFieldsPropertiesFieldLabel: "Vybraná pole",
                SelectedFieldsPropertiesFieldDescription: "Určuje pole, která se mají načíst z výsledků vyhledávání.",
                SelectedFieldsPlaceholderLabel: "Vybrat pole",
                EnableTopResultsLabel: "Povolit nejlepší výsledky",
                ContentSourcesFieldLabel: "Zdroje obsahu",
                ContentSourcesFieldDescriptionLabel: "ID připojení definovaných v administračním portálu konektorů Microsoft Search.",
                ContentSourcesFieldPlaceholderLabel: "např.: 'MyCustomConnectorId'",
                EnableSuggestionLabel: "Povolit návrhy pravopisu",
                EnableModificationLabel: "Povolit úpravy pravopisu",
                QueryTemplateFieldLabel: "Šablona dotazu",
                QueryTemplatePlaceHolderText: "např.: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "Šablona vyhledávacího dotazu. Můžete také použít {<tokens>} a KQL k sestavení dynamického dotazu.",
                ApplyQueryTemplateBtnText: "Použít",
                UseBetaEndpoint: "Použít beta endpoint",
                TrimDuplicates: "Odstranit duplicity",
                showSPEmbeddedContentLabel: "Zobrazit SharePoint Embedded (skryté) ve výsledcích vyhledávání",
                showMSArchivedContentLabel: "Zobrazit archivovaný obsah Microsoft ve výsledcích vyhledávání",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Upravit nastavení sbalení",
                    CollapsePropertiesDescription: "Zadejte nastavení sbalení výsledků vyhledávání. Můžete buď vybrat pole ze seznamu (pouze pokud již byla data zdroje načtena), nebo zadat vlastní hodnotu (stiskněte 'Enter' pro uložení).",
                    CollapsePropertiesPropertyPaneFieldLabel: "Nastavení sbalení",
                    CollapseLimitFieldLabel: "Limit",
                    CollapsePropertiesFieldColumnPlaceholder: "Sbalit podle pole"
                }
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Nastavení řazení",
                    SortListDescription: "Zadejte nastavení řazení pro výsledky vyhledávání. Můžete buď vybrat pole ze seznamu (pouze pokud již byla data zdroje načtena), nebo zadat vlastní hodnotu (stiskněte 'Enter' pro uložení).",
                    SortDirectionAscendingLabel: "Vzestupně",
                    SortDirectionDescendingLabel: "Sestupně",
                    SortErrorMessage: "Neplatná vlastnost vyhledávání (zkontrolujte, zda je spravovaná vlastnost řaditelná).",
                    SortPanelSortFieldLabel: "Řadit podle pole",
                    SortPanelSortFieldAria: "Řadit podle",
                    SortPanelSortFieldPlaceHolder: "Řadit podle",
                    SortPanelSortDirectionLabel: "Směr řazení",
                    SortDirectionColumnLabel: "Směr",
                    SortFieldColumnLabel: "Název pole",
                    SortFieldDefaultSortLabel: "Výchozí řazení",
                    SortFieldFriendlyNameLabel: "Zobrazovaný název pole pro řazení",
                    SortFieldUserSortLabel: "Uživatelské řazení",
                    EditSortLabel: "Upravit nastavení řazení",
                    SortInvalidSortableFieldMessage: "Tato vlastnost nelze řadit",
                    SortFieldColumnPlaceholder: "Vyberte pole..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Přidat výraz Handlebars",
            TextDialogTitle: "Upravit výraz Handlebars",
            TextDialogCancelButtonText: "Zrušit",
            TextDialogSaveButtonText: "Uložit",
            SelectItemComboPlaceHolder: "Vyberte vlastnost",
            AddStaticDataLabel: "Přidat statická data",
            TextFieldApplyButtonText: "Použít",
            SortByPlaceholderText: "Řadit podle...",
            SortByDefaultOptionText: "Výchozí",
            DownloadButtonText: "Stáhnout"
        },
        Layouts: {
            Debug: {
                Name: "Ladění"
            },
            CustomHandlebars: {
                Name: "Vlastní"
            },
            CustomAdaptiveCards: {
                Name: "Vlastní"
            },
            SimpleList: {
                Name: "Seznam",
                ShowFileIconLabel: "Zobrazit ikonu souboru",
                ShowItemThumbnailLabel: "Zobrazit miniaturu"
            },
            DetailsList: {
                Name: "Podrobný seznam",
                UseHandlebarsExpressionLabel: "Použít výraz Handlebars",
                MinimumWidthColumnLabel: "Minimální šířka (px)",
                MaximumWidthColumnLabel: "Maximální šířka (px)",
                SortableColumnLabel: "Řaditelný",
                ResizableColumnLabel: "Změnitelná velikost",
                MultilineColumnLabel: "Víceřádkový",
                LinkToItemColumnLabel: "Odkaz na položku",
                CompactModeLabel: "Kompaktní režim",
                ShowFileIcon: "Zobrazit ikonu souboru",
                ManageDetailsListColumnDescription: "Přidat, aktualizovat nebo odstranit sloupce pro rozložení podrobného seznamu. Můžete použít hodnoty vlastností v seznamu přímo bez transformace nebo použít výraz Handlebars v poli hodnoty. HTML je podporováno pro všechna pole.",
                ManageDetailsListColumnLabel: "Spravovat sloupce",
                ValueColumnLabel: "Hodnota sloupce",
                ValueSortingColumnLabel: "Vyberte pole pro řazení...",
                ValueSortingColumnNoFieldsLabel: "Žádná dostupná pole",
                DisplayNameColumnLabel: "Zobrazený název sloupce",
                FileExtensionFieldLabel: "Pole pro použití přípony souboru",
                GroupByFieldLabel: "Seskupit podle pole",
                AdditionalGroupByButtonLabel: "Přidat pole pro seskupení",
                AdditionalGroupByFieldsLabel: "Další pole pro seskupení",
                AdditionalGroupByFieldsDescription: "Přidejte další seskupovací pole pro vytvoření hierarchie v rozložení. Každý sloupec je přidán v pořadí, jak je zobrazen.",
                EnableGrouping: "Povolit seskupování",
                GroupingDescription: "Ujistěte se, že máte data zobrazena ve výsledkové části webu pro seznam vlastností k zobrazení.",
                CollapsedGroupsByDefault: "Zobrazit sbalené",
                ResetFieldsBtnLabel: "Obnovit výchozí hodnoty polí",
                EnableStickyHeader: "Povolit pevnou hlavičku",
                StickyHeaderListViewHeight: "Výška zobrazení seznamu (v px)",
                EnableDownload: "Povolit stažení"
            },
            Cards: {
                Name: "Karty",
                ManageTilesFieldsLabel: "Spravované pole karet",
                ManageTilesFieldsPanelDescriptionLabel: "Zde můžete mapovat hodnoty každého pole s odpovídajícími zástupnými poli karet. Můžete použít buď vlastnost výsledku přímo bez transformace, nebo použít výraz Handlebars jako hodnotu pole. Také, pokud je specifikováno, můžete do anotovaných polí vložit vlastní HTML kód.",
                PlaceholderNameFieldLabel: "Název",
                SupportHTMLColumnLabel: "Povolit HTML",
                PlaceholderValueFieldLabel: "Hodnota",
                UseHandlebarsExpressionLabel: "Použít výraz Handlebars",
                EnableItemPreview: "Povolit náhled položky",
                EnableItemPreviewHoverMessage: "Povolení této možnosti může mít vliv na výkon, pokud je zobrazeno příliš mnoho položek najednou a používáte pole 'AutoPreviewUrl'. Doporučujeme použít tuto možnost s menším množstvím položek nebo použít předdefinované náhledové URL z vašich datových zdrojů v polích.",
                ShowFileIcon: "Zobrazit ikonu souboru",
                CompactModeLabel: "Kompaktní režim",
                PreferedCardNumberPerRow: "Preferovaný počet karet na řádku",
                Fields: {
                    Title: "Název",
                    Location: "Místo",
                    Tags: "Štítky",
                    PreviewImage: "Náhledový obrázek",
                    PreviewUrl: "URL náhledu",
                    Url: "URL",
                    Date: "Datum",
                    Author: "Autor",
                    ProfileImage: "URL obrázku profilu",
                    FileExtension: "Přípona souboru",
                    IsContainer: "Je složka"
                },
                ResetFieldsBtnLabel: "Obnovit výchozí hodnoty polí"
            },
            Slider: {
                Name: "Karusel",
                SliderAutoPlay: "Automatické přehrávání",
                SliderAutoPlayDuration: "Délka automatického přehrávání (v sekundách)",
                SliderPauseAutoPlayOnHover: "Pozastavit při najetí myší",
                SliderGroupCells: "Počet prvků, které se mají seskupit v karuselu",
                SliderShowPageDots: "Zobrazit body stránky",
                SliderWrapAround: "Nekonečné rolování",
                SlideHeight: "Výška karuselu (v px)",
                SlideWidth: "Šířka karuselu (v px)"
            },
            People: {
                Name: "Lidé",
                ManagePeopleFieldsLabel: "Spravovat pole osob",
                ManagePeopleFieldsPanelDescriptionLabel: "Zde můžete mapovat hodnoty každého pole s odpovídajícími zástupnými poli pro osobu. Můžete použít buď hodnotu pole datového zdroje přímo bez jakékoliv transformace, nebo použít výraz Handlebars v poli hodnoty.",
                PlaceholderNameFieldLabel: "Název",
                PlaceholderValueFieldLabel: "Hodnota",
                UseHandlebarsExpressionLabel: "Použít výraz Handlebars",
                PersonaSizeOptionsLabel: "Velikost komponenty",
                PersonaSizeExtraSmall: "Extra malá",
                PersonaSizeSmall: "Malá",
                PersonaSizeRegular: "Normální",
                PersonaSizeLarge: "Velká",
                PersonaSizeExtraLarge: "Extra velká",
                ShowInitialsToggleLabel: "Zobrazit iniciály, pokud není k dispozici obrázek",
                SupportHTMLColumnLabel: "Povolit HTML",
                ResetFieldsBtnLabel: "Obnovit výchozí hodnoty polí",
                ShowPersonaCardOnHover: "Zobrazit kartu osoby při najetí myší",
                ShowPersonaCardOnHoverCalloutMsg: "Tato funkce používá Microsoft Graph k zobrazení informací o uživateli a potřebuje následující oprávnění API ve vaší tenant: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                ShowPersonaCardOnHoverNative: "Zobrazit kartu osoby při najetí myší (LPC)",
                ShowPersonaCardOnHoverCalloutMsgNative: "Tato funkce používá nativní implementaci SharePointu pro zobrazení živé karty osoby (LPC). Viz https://pnp.github.io/sp-dev-fx-controls-react/controls/LivePersona/ pro další informace.",
                ShowPersonaPresenceInfo: "Zobrazit přítomnost",
                ShowPersonaPresenceInfoCalloutMsg: "Tato funkce potřebuje následující oprávnění API ve vaší tenant: ['Presence.Read.All']",
                Fields: {
                    ImageUrl: "URL obrázku",
                    PrimaryText: "Hlavní text",
                    SecondaryText: "Sekundární text",
                    TertiaryText: "Třetí text",
                    OptionalText: "Volitelný text",
                    UPN: "UPN"
                }
            },
            Vertical: {
                Name: "Vertikální"
            },
            Horizontal: {
                Name: "Horizontální",
                PreferedFilterNumberPerRow: "Preferovaný počet filtrů na řadku",
            },
            Panel: {
                Name: "Panel",
                IsModal: "Modální",
                IsLightDismiss: "Zavřít kliknutím mimo panel",
                Size: "Velikost panelu",
                ButtonLabel: "Zobrazit filtry",
                ButtonLabelFieldName: "Název tlačítka pro zobrazení",
                HeaderText: "Filtry",
                HeaderTextFieldName: "Text záhlaví panelu",
                SizeOptions: {
                    SmallFixedFar: 'Malý (výchozí)',
                    SmallFixedNear: 'Malý, bližší strana',
                    Medium: 'Střední',
                    Large: 'Velký',
                    LargeFixed: 'Velký pevné šířka',
                    ExtraLarge: 'Extra velký',
                    SmallFluid: 'Plná šířka (fluidní)'
                }
            },
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> výsledků pro '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> výsledků",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Dostupná připojení",
                UseDataVerticalsWebPartLabel: "Připojit k Web Part pro vertikály",
                UseDataVerticalsFromComponentLabel: "Použít vertikály z této komponenty"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Konfigurace rozšiřitelnosti",
                    FieldLabel: "Knihovny rozšiřitelnosti k načtení",
                    ManageBtnLabel: "Konfigurovat",
                    Columns: {
                        Name: "Název/Účel",
                        Id: "Manifest GUID",
                        Enabled: "Povoleno/Zakázáno"
                    }
                },
                ImportExport: "Import/Export nastavení"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Použít",
            ClearAllFiltersButtonLabel: "Vyčistit",
            FilterNoValuesMessage: "Žádné hodnoty pro tento filtr",
            OrOperator: "NEBO",
            AndOperator: "A",
            ComboBoxPlaceHolder: "Vyberte hodnotu",
            UseAndOperatorValues: "Použijte operátor A mezi hodnotami",
            UseOrOperatorValues: "Použijte operátor NEBO mezi hodnotami",
            UseValuesOperators: "Vyberte operátor, který chcete použít mezi těmito hodnotami filtru"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "Statické návrhy pro SharePoint vyhledávání",
                ProviderDescription: "Získat statické uživatelské definované návrhy pro SharePoint vyhledávání"
            }
        }
    }
})
