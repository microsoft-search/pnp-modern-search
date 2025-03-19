define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Webový díl vyhledávacích vertikál",
        PlaceHolder: {
          EditLabel: "Upravit",
          IconText: "Webový díl vyhledávacích vertikál od @pnp",
          Description: "Umožňuje procházet data jako vertikály (tj. silosy). Tento webový díl je určen k připojení k webovým dílům 'Vyhledávací výsledky' na stránce.",
          ConfigureBtnLabel: "Konfigurovat"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Konfigurace vyhledávacích vertikál",
        Verticals: {
          PropertyLabel: "Vyhledávací vertikály",
          PanelHeader: "Konfigurovat vyhledávací vertikály",
          PanelDescription: "Přidejte novou vertikálu, aby uživatelé mohli vyhledávat v předdefinovaném rozsahu nebo datovém zdroji. Pro použití musíte tento webový díl připojit k jednomu nebo více webovým dílům 'Vyhledávací výsledky', protože vertikály kontrolují viditelnost připojených komponent.",
          ButtonLabel: "Konfigurovat vertikály",
          DefaultVerticalQueryStringParamLabel: "Parametr dotazu pro výběr vertikálního panelu jako výchozího",
          DefaultVerticalQueryStringParamDescription: "Porovnání bude provedeno s názvem panelu nebo aktuální URL stránky (pokud je panel hypertextový odkaz)",
          Fields: {
            TabName: "Název panelu",
            TabValue: "Hodnota panelu",
            IconName: "Název ikony Fluent UI",
            IsLink: "Je hypertextový odkaz",
            LinkUrl: "URL odkazu",
            ShowLinkIcon: "Zobrazit ikonu odkazu",
            OpenBehavior: "Chování při otevření",
            Audience: "Publikum"
          },
          AudienceInputPlaceholderText: "Hledat skupinu",
          AudienceNoResultsFound: "Nenašli jsme žádné odpovídající skupiny.",
          AudienceLoading: "Načítání skupin..."
        }
      }
    }
});
