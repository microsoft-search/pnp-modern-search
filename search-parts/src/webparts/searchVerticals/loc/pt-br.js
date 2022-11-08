define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Web Part de verticais da busca",
        PlaceHolder: {
          EditLabel: "Editar",
          IconText: "Web Part de verticais da busca <i>by</i> @pnp",
          Description: "Permite navegar os dados como verticais (ou silos). Esta Web Part destina-se a ser conectada à Web Part de Resultados de Busca na página.",
          ConfigureBtnLabel: "Configurar"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Configurações das verticais de busca",
        Verticals: {
          PropertyLabel: "Verticais de busca",
          PanelHeader: "Configurar verticais de busca",
          PanelDescription: "Adicione uma nova vertical para permitir aos usuários buscar em um escopo ou fonte de dados pré-definidos. Para usar isto, você precisa conectar esta Web Parte a uma ou mais Web Parts de Resultados de Busca no qual as verticais vão controlar a visibilidade dos componentes conectados.",
          ButtonLabel: "Configurar verticais",
          DefaultVerticalQueryStringParamLabel: "Parâmetro da <i>query string</i> a ser usado para selecionar a aba da vertical por padrão",
          DefaultVerticalQueryStringParamDescription: "A correspondência será feita com o nome da guia ou a URL da página atual (se a guia for um hiperlink)",
          Fields: {
            TabName: "Nome da aba",
            TabValue: "Valor da aba",
            IconName: "Nome do ícone Fluent UI",
            IsLink: "É um link",
            LinkUrl: "URL do link",
            ShowLinkIcon: "Mostrar ícone do link",
            OpenBehavior: "Comportamento de abertura"
          }
        }
      }
    }
  });