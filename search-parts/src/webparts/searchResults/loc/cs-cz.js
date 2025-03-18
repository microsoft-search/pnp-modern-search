define([], function () {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Upravit",
                IconText: "Webový díl výsledků vyhledávání od @PnP",
                Description: "Zobrazuje výsledky vyhledávání z SharePointu nebo Microsoft vyhledávání.",
                ConfigureBtnLabel: "Konfigurovat"
            },
            WebPartDefaultTitle: "Webový díl výsledků vyhledávání",
            ShowBlankEditInfoMessage: "Pro tento dotaz nebyl vrácen žádný výsledek. Tento webový díl zůstane v režimu zobrazení prázdný podle parametrů.",
            CurrentVerticalNotSelectedMessage: "Aktuálně vybraná vertikála neodpovídá té, která je spojena s tímto webovým dílem. V režimu zobrazení zůstane prázdná."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Dostupné datové zdroje",
                PagingOptionsGroupName: "Možnosti stránkování",
                ItemsCountPerPageFieldName: "Počet položek na stránku",
                PagingRangeFieldName: "Počet stránek, které se zobrazí v rozsahu",
                ShowPagingFieldName: "Zobrazit stránkování",
                HidePageNumbersFieldName: "Skrýt čísla stránek",
                HideNavigationFieldName: "Skrýt navigační tlačítka (předchozí stránka, další stránka)",
                HideFirstLastPagesFieldName: "Skrýt první/poslední navigační tlačítka",
                HideDisabledFieldName: "Skrýt navigační tlačítka (předchozí, další, první, poslední), pokud jsou zakázána.",
                TemplateSlots: {
                    GroupName: "Sloty rozvržení",
                    ConfigureSlotsLabel: "Upravit sloty rozvržení pro tento datový zdroj",
                    ConfigureSlotsBtnLabel: "Přizpůsobit",
                    MissingSlotsMessage: "Chybějící sloty ve šabloně rozvržení: {0}",
                    ConfigureSlotsPanelHeader: "Sloty rozvržení",
                    ConfigureSlotsPanelDescription: "Přidejte sem sloty, které budou použity pro různá rozvržení. Slot je zástupná proměnná, kterou vložíte do svých šablon, kde bude hodnota dynamicky nahrazena hodnotou pole datového zdroje. Tímto způsobem se vaše šablony stanou univerzálnějšími a opakovaně použitelnými bez ohledu na konkrétní pole datového zdroje. Pro použití použijte výraz Handlebars `{{slot item @root.slots.<SlotName>}}`.",
                    SlotNameFieldName: "Název slotu",
                    SlotFieldFieldName: "Pole slotu",
                    SlotFieldPlaceholderName: "Vyberte pole"
                },
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Dostupná rozvržení",
                LayoutTemplateOptionsGroupName: "Možnosti rozvržení",
                CommonOptionsGroupName: "Obecné",
                TemplateUrlFieldLabel: "Použít externí šablonu URL",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Šablona musí být platný soubor .txt, .htm nebo .html",
                ErrorTemplateResolve: "Nelze načíst zadanou šablonu. Podrobnosti chyby: '{0}'",
                DialogButtonLabel: "Upravit šablonu výsledků",
                DialogTitle: "Upravit šablonu výsledků",
                MissingSlotsMessage: "Následující sloty nebyly nakonfigurovány: {0}",
                ShowSelectedFilters: "Zobrazit vybrané filtry",
                ShowBlankIfNoResult: "Skrýt tento webový díl, pokud není co zobrazit",
                ShowResultsCount: "Zobrazit počet výsledků",
                HandlebarsRenderTypeLabel: "Handlebars/HTML",
                HandlebarsRenderTypeDesc: "Vyberte rozvržení založené na HTML, CSS a Handlebars",
                AdaptiveCardsRenderTypeLabel: "Adaptivní karty",
                AdaptiveCardsRenderTypeDesc: "Vyberte rozvržení založené na JSON adaptivních kartách",
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Použít Microsoft Graph Toolkit",
                    ResultTypes: {
                        ResultTypeslabel: "Typy výsledků",
                        ResultTypesDescription: "Přidejte sem šablony, které se použijí pro položky výsledků podle jedné nebo více podmínek. Podmínky se vyhodnocují ve zadaném pořadí a externí šablony mají přednost před vloženými šablonami. Ujistěte se, že použité datové pole je přítomno ve výsledku datového zdroje.",
                        InlineTemplateContentLabel: "Vložená šablona",
                        EditResultTypesLabel: "Upravit typy výsledků",
                        ConditionPropertyLabel: "Pole datového zdroje",
                        ConditionValueLabel: "Hodnota podmínky",
                        CondtionOperatorValue: "Operátor",
                        ExternalUrlLabel: "Externí šablona URL",
                        EqualOperator: "Rovná se",
                        NotEqualOperator: "Nerovná se",
                        ContainsOperator: "Obsahuje",
                        StartsWithOperator: "Začíná na",
                        NotNullOperator: "Není null",
                        GreaterOrEqualOperator: "Větší nebo rovno",
                        GreaterThanOperator: "Větší než",
                        LessOrEqualOperator: "Menší nebo rovno",
                        LessThanOperator: "Menší než",
                        CancelButtonText: "Zrušit",
                        DialogButtonText: "Upravit šablonu",
                        DialogTitle: "Upravit šablonu výsledků",
                        SaveButtonText: "Uložit"
                    },
                    AllowItemSelection: "Povolit výběr položek",
                    AllowMultipleItemSelection: "Povolit výběr více položek",
                    SelectionPreservedOnEmptyClick: "Uchovat výběr při prázdném kliknutí",
                    SelectionModeLabel: "Režim výběru",
                    AsTokensSelectionMode: "Zpracovat vybrané hodnoty jako tokeny (ruční režim)",
                    AsDataFiltersSelectionMode: "Zpracovat vybrané hodnoty jako filtry (výchozí režim)",
                    AsDataFiltersDescription: "V tomto režimu jsou vybrané hodnoty odesílány do datového zdroje jako běžní upřesňovače vyhledávání. V tomto případě musí být vybraný cílový atribut ve vyhledávací schématu možný k upřesnění.",
                    AsTokensDescription: "V tomto režimu jsou vybrané hodnoty ručně použity prostřednictvím tokenů a dostupných metod. Příklad s dotazem SharePointu: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "Logický operátor mezi vybranými hodnotami",
                    FieldToConsumeLabel: "Zdrojové pole k použití",
                    FieldToConsumeDescription: "Použijte hodnotu tohoto pole pro vybrané položky",
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Hostitelská konfigurace"
                }
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Dostupná připojení",
                UseFiltersWebPartLabel: "Připojit k webovému dílu filtrů",
                UseFiltersFromComponentLabel: "Použít filtry z tohoto komponentu",
                UseDynamicFilteringsWebPartLabel: "Připojit k webovému dílu výsledků vyhledávání",
                UseDataResultsFromComponentsLabel: "Použít data z tohoto webového dílu",
                UseDataResultsFromComponentsDescription: "Použijte data z vybraných položek v těchto webových dílech",
                UseSearchVerticalsWebPartLabel: "Připojit k webovému dílu vertikál",
                UseSearchVerticalsFromComponentLabel: "Použít vertikály z tohoto komponentu",
                LinkToVerticalLabel: "Zobrazit data pouze při výběru následující vertikály",
                LinkToVerticalLabelHoverMessage: "Výsledky se zobrazí pouze tehdy, pokud vybraná vertikála odpovídá té, která je nakonfigurována pro tento webový díl. Jinak bude webový díl prázdný (bez okrajů a výplní) v režimu zobrazení.",
                UseInputQueryText: "Použít text dotazu",
                UseInputQueryTextHoverMessage: "Použijte token {inputQueryText} ve vašem datovém zdroji pro získání této hodnoty",
                SearchQueryTextFieldLabel: "Text dotazu",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Zadejte text dotazu...",
                InputQueryTextStaticValue: "Statická hodnota",
                InputQueryTextDynamicValue: "Dynamická hodnota",
                SearchQueryTextUseDefaultQuery: "Použít výchozí hodnotu",
                SearchQueryTextDefaultValue: "Výchozí hodnota",
                SourceDestinationFieldLabel: "Název cílového pole",
                SourceDestinationFieldDescription: "Cílové pole, které se použije v tomto webovém dílu pro shodu s vybranými hodnotami",
                AvailableFieldValuesFromResults: "Pole obsahující hodnotu filtru"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Konfigurujte knihovny rozšiřitelnosti pro načtení při spuštění.",
                    PanelDescription: "Přidejte/odeberte ID vlastní knihovny rozšiřitelnosti zde. Můžete zadat zobrazený název a rozhodnout, zda by knihovna měla být načtena nebo ne při spuštění. Pouze vlastní datové zdroje, rozvržení, webové komponenty a Handlebars pomocníci budou načítány zde.",
                }
            },
            CustomQueryModifier: {
                EditQueryModifiersLabel: "Konfigurovat modifikátory dotazů",
                QueryModifiersLabel: "Vlastní modifikátory dotazů",
                UseMultipleQueryModifiersLabel: "Použít více modifikátorů pro filtraci",
                QueryModifierTypeDropdown: "Typ filtru",
                QueryModifierType: {
                    String: "Řetězec",
                    Integer: "Celé číslo",
                    Boolean: "Boolean",
                    Date: "Datum"
                },
                EnableQueryModificationLabel: "Povolit úpravy dotazu",
                DisableQueryModificationLabel: "Zakázat úpravy dotazu"
            }
        }
    };
});
