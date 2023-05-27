define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Editar",
                IconText: "Filtros de busca <i>by</i> @PnP",
                Description: "Exibe filtros de uma Web Part de resultados de busca conectada",
                ConfigureBtnLabel: "Configurar"
            },
            NoAvailableFilterMessage: "Nenhum filtro disponível para exibir.",
            WebPartDefaultTitle: "Web Part de Filtro de Busca"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Conectar a uma Web Part de resultados de busca",
                UseDataResultsFromComponentsLabel: "Usar dados destas Web Parts",
                UseDataResultsFromComponentsDescription: "Se você conectar mais de uma Web Part, os valores e contadores do filtro vão ser mesclados em nomes de filtro similares.",
                LinkToVerticalLabel: "Exibir filtros somente quando as seguintes verticais forem selecionadas",
                LinkToVerticalLabelHoverMessage: "Os filtros serão exibidos somente se a vertical selecionada combinar com uma das configuradas para esta Web Part. Caso contrário, a Web Part ficará em branco (sem margens nem preenchimento) no mode de exibição."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Configurações dos filtros",
                FilterOperator: "Operador para usar entre os filtros"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Selecionar campo",
                FilterNameLabel: "Campo de filtro",
                FilterMaxBuckets: "# de valores",
                FilterDisplayName: "Nome de exibição",
                FilterTemplate: "Modelo",
                FilterExpandByDefault: "Expandido por padrão",
                FilterType: "Tipo de filtro",
                FilterTypeRefiner: "Este modelo de filtro age como um refinador e recebe/envia valores disponíveis/selecionados de/para a fonte de dados conectada.",
                FilterTypeStaticFilter: "Este modelo de filtro age como um filtro estático e apensa envia valores selecionados arbitrários para a fonte de dados selecionada. Valores de filtro de entrada não são levados em consideração.",
                CustomizeFiltersBtnLabel: "Editar",
                CustomizeFiltersHeader: "Editar filtros",
                CustomizeFiltersDescription: "Configurar filtros de busca adicionando ou removendo linhas. Você pode selecionar campos dos resultados da fonte de dados (se já selecionados) ou usar valores estáticos como filtros.",
                CustomizeFiltersFieldLabel: "Customizar filtros",
                ShowCount: "Exibir contagem",
                Operator: "Operador entre os valores",
                ANDOperator: "E",
                OROperator: "OU",
                IsMulti: "Vários valores",
                Templates: {
                    CheckBoxTemplate: "Caixa de seleção",
                    DateRangeTemplate: "Período",
                    ComboBoxTemplate: "Lista de seleção",
                    DateIntervalTemplate: "Intervalo de datas",
                    TaxonomyPickerTemplate: "Seletor de taxonomia"
                },
                SortBy: "Ordenar valores por",
                SortDirection: "Direção da ordenação",
                SortByName: "Por nome",
                SortByCount: "Por contagem",
                SortAscending: "Ascendente",
                SortDescending: "Descendente"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Layout disponíveis",
                LayoutTemplateOptionsGroupName: "Opções de layout",
                TemplateUrlFieldLabel: "Usar um URL de modelo externo",
                TemplateUrlPlaceholder: "https://meu-site/meu-arquivo.html",
                ErrorTemplateExtension: "O modelo precisa ser um arquivo .txt, .htm ou .html válido",
                ErrorTemplateResolve: "Não foi possível resolver o modelo especificado. Detalhes do erro: '{0}'",
                FiltersTemplateFieldLabel: "Modelo de edição de filtros",
                FiltersTemplatePanelHeader: "Modelo de edição de filtros"
            }
        }
    }
});