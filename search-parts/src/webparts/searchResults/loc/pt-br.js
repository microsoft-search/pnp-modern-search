define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Editar",
                IconText: "Web Part de resultados de busca <i>by</i> @PnP",
                Description: "Exibe os resultados da pesquisa do SharePoint ou do Microsoft Search.",
                ConfigureBtnLabel: "Configurar"
            },
            WebPartDefaultTitle: "Web Part de resultados de busca",
            ShowBlankEditInfoMessage: "Nenhum resultado retornado para esta consulta. Esta WebPart vai permanecer em branco em modo de exibição de acordo com os parâmetros.",
            CurrentVerticalNotSelectedMessage: "A vertical selecionada atualmente não combina com a associada a esta Web Part. Ela permanecerá em branco no modo de exibição."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Fontes de dados disponíveis",
                PagingOptionsGroupName: "Opções de paginação",
                ItemsCountPerPageFieldName: "Número de itens por página",
                PagingRangeFieldName: "Número de páginas a serem exibidas no intervalo",
                ShowPagingFieldName: "Exibir paginação",
                HidePageNumbersFieldName: "Esconder números de página",
                HideNavigationFieldName: "Esconder botões de navegação (próxima página, página anterior)",
                HideFirstLastPagesFieldName: "Esconder botões de navegação primeiro/último",
                HideDisabledFieldName: "Esconder botões de navegação (anterior, próximo, primeiro, último) de eles estiverem desativados.",
                TemplateSlots: {
                    GroupName: "Slots do layout",
                    ConfigureSlotsLabel: "Editar slots do layout para esta fonte de dados",
                    ConfigureSlotsBtnLabel: "Customizar",
                    ConfigureSlotsPanelHeader: "Slots do layout",
                    ConfigureSlotsPanelDescription: "Adicione aqui os slots para serem usados pelos diferentes layouts. Um slot é um marcador variável que você pode colocar em seus modelos onde o valor será substituído dinamicamente pelo valor do campo da fonte de dados. Dessa forma, seus modelos se tornarão mais genéricos e reutilizáveis independente dos campos específicos da fonte de dados. Para usá-los, use as expressões entre chaves `{{slot item @root.slots.<NomeDoSlot>}}`",
                    SlotNameFieldName: "Nome do Slot",
                    SlotFieldFieldName: "Campo do slot",
                    SlotFieldPlaceholderName: "Escolha um campo"
                }
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Layouts disponíveis",
                LayoutTemplateOptionsGroupName: "Opções de layout",
                CommonOptionsGroupName: "Comum",
                TemplateUrlFieldLabel: "Usar um URL de modelo externo",
                TemplateUrlPlaceholder: "https://meu-site/meu-arquivo.html",
                ErrorTemplateExtension: "O modelo precisa ser um arquivo .txt, .htm ou .html válido",
                ErrorTemplateResolve: "Não foi possível resolver o modelo especificado. Detalhes do erro: '{0}'",
                DialogButtonLabel: "Editar modelo de resultados",
                DialogTitle: "Editar modelo de resultados",
                ShowSelectedFilters: "Mostrar filtros selecionados",
                ShowBlankIfNoResult: "Esconder esta Web Part se não houver nada para mostrar",
                ShowResultsCount: "Mostrar contagem de resultados",
                HandlebarsRenderTypeLabel: "Expressões entre chaves/HTML",
                HandlebarsRenderTypeDesc: "Selecione layouts baseados em HTML, CSS e expressões entre chaves",
                AdaptiveCardsRenderTypeLabel: "Cartões adaptáveis",
                AdaptiveCardsRenderTypeDesc: "Selecione layouts baseados em cartões adaptáveis JSON",
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Usar o Microsoft Graph Toolkit",
                    ResultTypes: {
                        ResultTypeslabel: "Tipos de resultado",
                        ResultTypesDescription: "Adicione aqui os modelos para usar para os itens dos resultados de acordo com uma ou mais condições. Condições são avaliadas na ordem configurada e modelos externos tem precedência sobre os modelos embutidos. Além disso, certifique-se que os campos da fonte de dados que você está usando estão presentes nos dados de resposta.",
                        InlineTemplateContentLabel: "Modelos embutidos",
                        EditResultTypesLabel: "Editar tipos de resultado",
                        ConditionPropertyLabel: "Campo da fonte de dados",
                        ConditionValueLabel: "Valor da condição",
                        CondtionOperatorValue: "Operador",
                        ExternalUrlLabel: "URL do modelo externo",
                        EqualOperator: "Igual",
                        NotEqualOperator: "Não igual",
                        ContainsOperator: "Contém",
                        StartsWithOperator: "Começa com",
                        NotNullOperator: "Não é nulo",
                        GreaterOrEqualOperator: "Maior ou igual",
                        GreaterThanOperator: "Maior que",
                        LessOrEqualOperator: "Menor ou igual",
                        LessThanOperator: "Menor que",
                        CancelButtonText: "Cancelar",
                        DialogButtonText: "Editar modelo",
                        DialogTitle: "Editar modelo de resultados",
                        SaveButtonText: "Salvar"
                    },
                    AllowItemSelection: "Permitir seleção de item",
                    AllowMultipleItemSelection: "Permitir seleção múltipla",
                    SelectionModeLabel: "Modo de seleção",
                    AsTokensSelectionMode: "Processar os valores selecionados como marcações (modo manual)",
                    AsDataFiltersSelectionMode: "Processar os valores selecionados como filtros (modo padrão)",
                    AsDataFiltersDescription: "Neste modo, os valores selecionados são enviados para a fonte de dados como um refinador de busca normal. Neste caso, a propriedade de destino selecionado precisa ser refinável no esquema de busca.",
                    AsTokensDescription: "Neste modo, os valores selecionados são usados manualmente através de marcações e métodos disponíveis. Exemplo com modelo de consulta do SharePoint: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "O operador lógica a ser usado entre os valores selecionados",
                    FieldToConsumeLabel: "Campo da fonte a ser consumido",
                    FieldToConsumeDescription: "Usar o valor deste campo para itens selecionados",
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Configuração do host"
                }
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Conexões disponíveis",
                UseFiltersWebPartLabel: "Conectar com uma Web Part de filtro",
                UseFiltersFromComponentLabel: "Usar filtros deste componente",
                UseDynamicFilteringsWebPartLabel: "Conectar a uma Web Part de resultados de busca",
                UseDataResultsFromComponentsLabel: "Usar os dados desta Web Part",
                UseDataResultsFromComponentsDescription: "Usar dados de itens selecionados destas Web Parts",                
                UseSearchVerticalsWebPartLabel: "Conectar com uma Web Part de verticais",
                UseSearchVerticalsFromComponentLabel: "Usar as verticais deste componente",
                LinkToVerticalLabel: "Exibir dados somente quando a seguinte vertical estiver selecionada",
                LinkToVerticalLabelHoverMessage: "Os resultados serão exibidos somente se a vertical selecionada combinar com a configurada nesta Web Part. Caso contrário, a Web Part ficará em branco (sem margens nem preenchimento) no modo de exibição.",
                UseInputQueryText: "User texto da consulta padrão",
                UseInputQueryTextHoverMessage: "Use a marcação {inputQueryText} na sua fonte de dados para obter este valor",
                SearchQueryTextFieldLabel: "Texto da consulta",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Informe texto da consulta...",
                InputQueryTextStaticValue: "Valor estático",
                InputQueryTextDynamicValue: "Valor dinâmico",
                SearchQueryTextUseDefaultQuery: "Usar um valor padrão",
                SearchQueryTextDefaultValue: "Valor padrão",
                SourceDestinationFieldLabel: "Nome do campo de destino",
                SourceDestinationFieldDescription: "Campo de destino para usar nesta WebPart mara combinar com os valores selecionados",
                AvailableFieldValuesFromResults: "Campo contendo o valor do filtro"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configurar bibliotecas de extensibilidade para carregar no início.",
                    PanelDescription: "Adicione/Remove os IDs de suas bibliotecas de extensibilidade aqui. Você pode especificar um nome de exibição e decidir se a biblioteca dev e ser carregada ou não no início. Apenas fontes de dados customizadas, layouts, componentes web e funções para marcadores entre chaves serão carregados aqui.",
                },
                EnableTelemetryLabel: "Telemetria PnP",
                EnableTelemetryOn: "Ligar telemetria",
                EnableTelemetryOff: "Desligar telemetria"
            },
            CustomQueryModifier: {
                EditQueryModifiersLabel: "Configurar modificadores de consulta personalizados disponíveis",
                QueryModifiersLabel: "Modificadores de consulta personalizados",
                QueryModifiersDescription: "Ativar ou desativar modificadores de consulta personalizados individuais",
                EnabledPropertyLabel: "Ativado",
                ModifierNamePropertyLabel: "Nome",
                ModifierDescriptionPropertyLabel: "Descrição",
                EndWhenSuccessfullPropertyLabel:"Terminar quando bem sucedido!"                
            }
        }
    }
});