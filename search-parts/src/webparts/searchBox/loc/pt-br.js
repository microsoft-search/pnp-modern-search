define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Texto da consulta"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Configurações da caixa de pesquisa",
                PlaceholderTextLabel: "Texto para exibir no <i>placeholder</i> da caixa de pesquisa",
                SearchInNewPageLabel: "Enviar a consulta para uma nova página",
                ReQueryOnClearLabel: "Redefinir consulta em limpar",
                PageUrlLabel: "URL da página",
                UrlErrorMessage: "Por favor, forneça uma URL válida.",
                QueryPathBehaviorLabel: "Método",
                QueryInputTransformationLabel: "Template de transformação do texto da consulta",
                UrlFragmentQueryPathBehavior: "Fragmento de URL",
                QueryStringQueryPathBehavior: "Parâmetro de <i>query string</i>",
                QueryStringParameterName: "Nome do parâmetro",
                QueryParameterNotEmpty: "Por favor, forneça um valor para o parâmetro."
            },
            AvailableConnectionsGroup: {
                GroupName: "Conexões disponíveis",
                UseDynamicDataSourceLabel: "Usar uma fonte de dados dinâmica como a entrada padrão",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Sugestões de pesquisa",
                EnableQuerySuggestions: "Ativar sugestões de pesquisa",
                EditSuggestionProvidersLabel: "Configurar provedores disponíveis",
                SuggestionProvidersLabel: "Provedor de sugestões",
                SuggestionProvidersDescription: "Habilitar ou desabilitar provedores de sugestões individuais.",
                EnabledPropertyLabel: "Habilitado",
                ProviderNamePropertyLabel: "Nome",
                ProviderDescriptionPropertyLabel: "Descrição",
                DefaultSuggestionGroupName: "Recomendado",
                NumberOfSuggestionsToShow: "Número de sugestões para exibir por grupo"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configurar bibliotecas de extensibilidade para carregar no início para provedores de sugestão customizados",
                    PanelDescription: "Adicione/Remova os IDs de suas bibliotecas de extensibilidade customizadas aqui. Você pode especificar um nome para exibir e decidir se a biblioteca deve ou não ser carregada no início. Apenas provedores de sugestão customizados serão carregados aqui.",
                }
            },
            
        },
        SearchBox: {
            DefaultPlaceholder: "Informe seus termos de busca...",
            SearchButtonLabel: "Procurar"
        }
    }
});
