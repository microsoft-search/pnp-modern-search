define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Hakuvertikaalien webosa",
        PlaceHolder: {
          EditLabel: "Muokkaa",
          IconText: "Pnp Hakuvertikaalien webosa",
          Description: "Mahdollistaa sisällön selaamisen vertikaalien (siilojen) avulla. Tätä webosaa käytetään yhdistettynä Hakutulosten webosaan sivulla.",
          ConfigureBtnLabel: "Konfiguroi"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Hakuvertikaalien konfiguronti",
        Verticals: {
          PropertyLabel: "Hakuvertikaalit",
          PanelHeader: "Konfiguroi hakuvertikaalit",
          PanelDescription: "Lisää vertikaali, jotta käyttäjät voivat kohdistaa haun valmiiksi määritettyyn sisältölähteeseen. Vertikaaleilla kontrolloidaan yhdistettyjen hakutuloswebosien näkymistä sivulla.",
          ButtonLabel: "Konfiguroi hakuvertikaalit",
          DefaultVerticalQueryStringParamLabel: "URL-osoitteen parametri, jolla määritetään oletuksena valittu vertikaali",
          DefaultVerticalQueryStringParamDescription: "Parametri yhdistetään vertikaalin nimeen tai sivun URL-osoitteeseen, jos vertikaali on linkki",
          Fields: {
            TabName: "Vertikaalin nimi",
            TabValue: "Vertikaalin arvo",
            IconName: "Fluent UI ikonin nimi",
            IsLink: "On linkki",
            LinkUrl: "Linkin URL",
            ShowLinkIcon: "Näytä linkin ikoni",
            OpenBehavior: "Linkin avausmuoto",
            Audience: "Kohdeyleisö"
          },
          AudienceInputPlaceholderText: "Hae ryhmää",
          AudienceNoResultsFound: "Yhtään vastaavaa ryhmää ei löytynyt.",
          AudienceLoading: "Ladataan ryhmiä..."
        },
        Styling: {
            WebPartContentStylingGroupName: "WebPart-sisällön muotoilu",
            VerticalBackgroundColorLabel: "Pystysuuntainen taustaväri",
            MouseOverColorLabel: "Hiiren kohdistusväri",
            VerticalBorderColorLabel: "Pystysuuntainen reunaväri",
            VerticalBorderThicknessLabel: "Pystysuuntainen reunan paksuus",
            VerticalFontSizeLabel: "Pystysuuntainen fonttikoko",
            ResetToDefaultLabel: "Palauta oletusarvot",
            ResetToDefaultDescription: "Palauta kaikki sisällön muotoiluasetukset oletusarvoihin",
            WebPartTitleStylingGroupName: "WebPart-otsikon muotoilu",
            TitleFontFamilyLabel: "Otsikon fonttiperhe",
            TitleFontSizeLabel: "Otsikon fonttikoko",
            TitleFontColorLabel: "Otsikon fonttiväri",
            ResetTitleStylingLabel: "Palauta otsikon muotoilu",
            ResetTitleStylingDescription: "Palauta kaikki otsikon muotoiluasetukset oletusarvoihin"
        }
      }
    }
  });