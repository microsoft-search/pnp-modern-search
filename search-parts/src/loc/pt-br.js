define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Escolha uma marcação...",
            Context: {
                ContextTokensGroupName: "Marcações de contexto",
                SiteAbsoluteUrl: "URL absoluta do Site",
                SiteRelativeUrl: "URL relativa do servidor do Site",
                WebAbsoluteUrl: "URL absoluta da Web",
                WebRelativeUrl: "URL relativa do servidor da Web",
                WebTitle: "Título da Web",
                InputQueryText: "Texto da caixa de consulta"
            },
            Custom: {
                CustomTokensGroupName: "Valor personalizado",
                CustomValuePlaceholder: "Informe um valor...",
                InvalidtokenFormatErrorMessage: "Por favor, informe um formato suportado de marcação usando '{' e '}'. (ex: {Hoje})"
            },
            Date: {
                DateTokensGroupName: "Marcações de data",
                Today: "Hoje",
                Yesterday: "Ontem",
                Tomorrow: "Amanhã",
                OneWeekAgo: "Uma semana atrás",
                OneMonthAgo: "Um mês atrás",
                OneYearAgo: "Um ano atrás"
            },
            Page: {
                PageTokensGroupName: "Marcações de página",
                PageId: "ID da Página",
                PageTitle: "Título da Página",
                PageCustom: "Outra coluna na página",
            },
            User: {
                UserTokensGroupName: "Marcações de usuário",
                UserName: "Nome do usuário",
                Me: "Eu",
                UserDepartment: "Departamento do usuário",
                UserCustom: "Propriedade customizada do usuário"
            }
        },
        General: {
            OnTextLabel: "Ligado",
            OffTextLabel: "Desligado",
            StaticArrayFieldName: "Campo array",
            About: "Sobre",
            Authors: "Autor(es)",
            Version: "Versão",
            InstanceId: "ID da instância da Web Part",
            Resources: {
                GroupName: "Resources",
                Documentation: "Documentação",
                PleaseReferToDocumentationMessage: "Por favor, consulte a documentação oficial."
            },
            Extensibility: {
                InvalidDataSourceInstance: "A fonte de dados selecionada '{0}' não implementa a classe abstrata 'BaseDataSource' corretamente. Alguns métodos não existem",
                DataSourceDefinitionNotFound: "A fonte de dados customizada com a chave '{0}' não foi encontrada. Certifique-se de que a solução foi implantada corretamente no Catálogo de Aplicações e o ID do manifesto registrado para esta Web Part.",
                LayoutDefinitionNotFound: "O layout personalizado com a chave '{0}' não foi encontrado. Certifique-se de que a solução foi implantada corretamente no Catálogo de Aplicações e o ID do manifesto registrado para esta Web Part.",
                InvalidLayoutInstance: "O layout selecionado '{0}' não implementa a classe abstrata 'BaseLayout' corretamente. Alguns métodos não existem",
                DefaultExtensibilityLibraryName: "Biblioteca de extensibilidade padrão",
                InvalidProviderInstance: "O provedor de sugestões selecionado '{0}' não implementa a classe abstrata 'BaseSuggestionProvider' corretamente. Alguns métodos não existem",
                ProviderDefinitionNotFound: "O provedor de sugestões personalizadas com a chave '{0}' não foi encontrado. Certifique-se de que a solução foi implantada corretamente no Catálogo de Aplicações e o ID do manifesto registrado para esta Web Part.",
                QueryModifierDefinitionNotFound: "A consulta personalizadaModificador com a chave '{0}' não foi encontrada. Certifique-se de que a solução esteja corretamente implantada no catálogo de aplicativos e a identificação do manifesto registrada para esta Parte Web.",
                InvalidQueryModifierInstance: "O queryModifier personalizado selecionado '{0}' não implementa corretamente a classe abstrata 'BaseQueryModifier'. Alguns métodos estão faltando.",
            },
            DateFromLabel: "De",
            DateTolabel: "Até",
            DatePickerStrings: {
                months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
                shortDays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                goToToday: 'Ir para Hoje',
                prevMonthAriaLabel: 'Ir para o mês anterior',
                nextMonthAriaLabel: 'Ir para o próximo mês',
                prevYearAriaLabel: 'Ir para o ano anterior',
                nextYearAriaLabel: 'Ir para o próximo ano',
                closeButtonAriaLabel: 'Fechar o calendário',
                isRequiredErrorMessage: 'Data de início é obrigatória.',
                invalidInputErrorMessage: 'Formato de data inválido.'
            },
            DateIntervalStrings: {
                AnyTime: "Qualquer tempo",
                PastDay: "Últimas 24 horas",
                PastWeek: "Da última semana às últimas 24 horas",
                PastMonth: "Do último mês à última semana",
                Past3Months: "Dos últimos 3 meses ao último mês",
                PastYear: "Do último ano aos últimos 3 meses",
                Older: "Mais antigo que um ano"
            },
            SameTabOpenBehavior: "Usar a aba atual",
            NewTabOpenBehavior: "Abrir em uma nova aba",
            PageOpenBehaviorLabel: "Comportamento de abertura",
            EmptyFieldErrorMessage: "Esta campo não pode estar vazio",
            TagPickerStrings: {
                NoResultsSearchMessage: "Nenhum resultado encontrado",
                SearchPlaceholder: "Procurar por..."
            },
            CurrentVerticalNotSelectedMessage: "A vertical corrente não combina com as associadas para este Web Part ({0}). Ele permanecerá em branco no modo de exibição.",
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "Busca do SharePoint",
                SourceConfigurationGroupName: "Configuração da fonte",
                QueryTextFieldLabel: "Texto da consulta",
                QueryTextFieldInfoMessage: "Use a guia de configurações da Web Part <strong>Conexões disponíveis</strong> para especificar um valor estático ou um componente dinâmico na página para ser o campo de busca",
                QueryTemplateFieldLabel: "Modelo de consulta",
                QueryTemplatePlaceHolderText: "ex: Path:{Site}",
                QueryTemplateFieldDescription: "O modelo da consulta. Você também pode usar {<tokens>} para construir uma consulta dinâmica.",
                ResultSourceIdLabel: "ID da fonte de resultados / Escopo|Nome",
                ResultSourceIdDescription: "Selecione uma fonte incorporada, informe o GUID de uma fonte customizada ou ESCOPO e NOME da fonte separados por | (ex. SPSite|News). Escopos válidos são [SPSiteSubscription, SPSite, SPWeb]. Pressione [Enter] para salvar.",
                InvalidResultSourceIdMessage: "O valor informado não é um GUID válido nem formatado como ESCOPO|NOME",
                EnableQueryRulesLabel: "Habilitar regras de consulta",
                RefinementFilters: "Filtros de refinamento",
                RefinementFiltersDescription: "Filtros de refinamento iniciais para aplicar à consulta. Eles não vão aparecer nos filtros selecionados. Para expressões de texto, use aspas duplas (\") ao invés de aspas simples (').",
                EnableLocalizationLabel: "Habilitar localização",
                EnableLocalizationOnLabel: "Ligado",
                EnableLocalizationOffLabel: "Desligado",
                QueryCultureLabel: "Idioma da solicitação de pesquisa",
                QueryCultureUseUiLanguageLabel: "Usar o idioma da interface",
                SelectedPropertiesFieldLabel: "Propriedades selecionadas",
                SelectedPropertiesFieldDescription: "Especifica as propriedades a serem recuperadas dos resultados da pesquisa.",
                SelectedPropertiesPlaceholderLabel: "Selecionar propriedades",
                HitHighlightedPropertiesFieldLabel: "Propriedades destacadas",
                HitHighlightedPropertiesFieldDescription: "Fornece a lista de propriedades gerenciadas para destacar (ex. Department, UserName)",
                TermNotFound: "(O termo com o ID '{0}' não foi encontrado)",
                ApplyQueryTemplateBtnText: "Aplicar",
                EnableAudienceTargetingTglLabel: "Ativar a segmentação por público-alvo",
                TrimDuplicates: "Limpar duplicados",
                CollapseSpecificationLabel: "Recolher especificação"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Texto da consulta",
                QueryTextFieldInfoMessage: "Use a guia de configurações da Web Part <strong>Conexões disponíveis</strong> para especificar um valor estático ou um componente dinâmico na página para ser o campo de busca",
                SourceName: "Microsoft Search",
                SourceConfigurationGroupName: "Microsoft Search",
                EntityTypesField: "Tipos de entidade para pesquisar",
                SelectedFieldsPropertiesFieldLabel: "Campos selecionados",
                SelectedFieldsPropertiesFieldDescription: "Especifica os campos para retornar dos resultados da busca.",
                SelectedFieldsPlaceholderLabel: "Selecionar campos",
                EnableTopResultsLabel: "Ativar os principais resultados",
                ContentSourcesFieldLabel: "Fontes de conteúdo",
                ContentSourcesFieldDescriptionLabel: "IDs de conexões definidos no portal de administração de conectores do Microsoft Search.",
                ContentSourcesFieldPlaceholderLabel: "ex: 'MeuIdDeConectorPersonalizado'",
                EnableSuggestionLabel: "Ativar sugestões de ortografia",
                EnableModificationLabel: "Ativar modificações de ortografia",
                QueryTemplateFieldLabel: "Modelo de consulta",
                QueryTemplatePlaceHolderText: "ex: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "O modelo da consulta. Você também pode usar {<tokens>} e KQL para construir uma consulta dinâmica.",
                ApplyQueryTemplateBtnText: "Aplicar",
                UseBetaEndpoint: "Usar endpoint <i>beta</i>",
                TrimDuplicates: "Limpar duplicados",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Editar configurações de recolhimento",
                    CollapsePropertiesDescription: "Especifique as configurações de recolhimento para os resultados da pesquisa. Você pode selecionar um campo na lista suspensa (somente se os dados da fonte de dados já tiverem sido buscados) ou digitar seu próprio valor personalizado (pressione 'Enter' para salvar sua entrada)",
                    CollapsePropertiesPropertyPaneFieldLabel: "As configurações de recolhimento",
                    CollapseLimitFieldLabel: "Limite",
                    CollapsePropertiesFieldColumnPlaceholder: "Recolher por campo"
                }
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Configurações de ordenação",
                    SortListDescription: "Especifica as configurações de ordenação para os resultados da busca. Você pode selecionar um campo da lista suspensa (somente se os dados da fonte já tiverem sido obtidos) ou informar um valor personalizado (pressione 'Enter' para salvar)",
                    SortDirectionAscendingLabel: "Ascendente",
                    SortDirectionDescendingLabel: "Descendente",
                    SortErrorMessage: "Propriedade de busca inválida (verifique se a propriedade gerenciada é ordenável).",
                    SortPanelSortFieldLabel: "Ordenar no campo",
                    SortPanelSortFieldAria: "Ordenar por",
                    SortPanelSortFieldPlaceHolder: "Ordenar por",
                    SortPanelSortDirectionLabel: "Direção da ordenação",
                    SortDirectionColumnLabel: "Direção",
                    SortFieldColumnLabel: "Nome do campo",
                    SortFieldDefaultSortLabel: "Ordenação padrão",
                    SortFieldFriendlyNameLabel: "Nome de exibição do campo de ordenação",
                    SortFieldUserSortLabel: "Ordenação do usuário",
                    EditSortLabel: "Editar configurações da ordenação",
                    SortInvalidSortableFieldMessage: "Esta propriedade não é ordenável",
                    SortFieldColumnPlaceholder: "Selecionar campo..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Adicionar expressões entre chaves",
            TextDialogTitle: "Editar expressão entre chaves",
            TextDialogCancelButtonText: "Cancelar",
            TextDialogSaveButtonText: "Salvar",
            SelectItemComboPlaceHolder: "Selecionar propriedade",
            AddStaticDataLabel: "Adicionar dados estáticos",
            TextFieldApplyButtonText: "Aplicar"
        },
        Layouts: {
            Debug: {
                Name: "Debug"
            },
            CustomHandlebars: {
                Name: "Personalizado"
            },
            CustomAdaptiveCards: {
                Name: "Personalizado"
            },
            SimpleList: {
                Name: "Lista",
                ShowFileIconLabel: "Mostrar o ícone do arquivo",
                ShowItemThumbnailLabel: "Mostrar miniatura"
            },
            DetailsList: {
                Name: "Lista de detalhes",
                UseHandlebarsExpressionLabel: "Usar expressões entre chaves",
                MinimumWidthColumnLabel: "Largura mínima (px)",
                MaximumWidthColumnLabel: "Largura máxima (px)",
                SortableColumnLabel: "Ordenável",
                ResizableColumnLabel: "Redimensionável",
                MultilineColumnLabel: "Multilinha",
                LinkToItemColumnLabel: "Link para o item",
                CompactModeLabel: "Modo compacto",
                ShowFileIcon: "Mostrar ícone do arquivo",
                ManageDetailsListColumnDescription: "Adiciona, altera ou remove colunas do layout da lista de detalhes. Você pode usar valores de propriedade na lista diretamente sem qualquer transformação ou usar uma expressão entre chaves no campo de valor. HTML é suportado para todos os campos também.",
                ManageDetailsListColumnLabel: "Gerenciar colunas",
                ValueColumnLabel: "Valor da coluna",
                ValueSortingColumnLabel: "Selecione o campo de ordenação...",
                ValueSortingColumnNoFieldsLabel: "Nenhum campo disponível",
                DisplayNameColumnLabel: "Nome de exibição da coluna",
                FileExtensionFieldLabel: "Campo usado para a extensão do arquivo",
                GroupByFieldLabel: "Agrupar pelo campo",
                EnableGrouping: "Ativar agrupamento",
                GroupingDescription: "Certifique-se de que os dados sejam exibidos na Web Part de resultado para uma lista de propriedades a serem exibidas.",
                CollapsedGroupsByDefault: "Mostrar recolhido",
                ResetFieldsBtnLabel: "Redefinir campos para os valores padrão"
            },
            Cards: {
                Name: "Cartões",
                ManageTilesFieldsLabel: "Campos gerenciados do cartão",
                ManageTilesFieldsPanelDescriptionLabel: "Aqui você pode mapear o valor de cada campo com os espaços reservados correspondentes do cartão. Você pode usar uma propriedade do resultado diretamente sem qualquer transformação ou usar expressões entre chaves como valor do campo. Além disso, quando especificado, você também pode injetar seu próprio código HTML nos campos anotados.",
                PlaceholderNameFieldLabel: "Nome",
                SupportHTMLColumnLabel: "Permitir HTML",
                PlaceholderValueFieldLabel: "Valor",
                UseHandlebarsExpressionLabel: "Usar expressões entre chaves",
                EnableItemPreview: "Ativar previsão do resultado",
                EnableItemPreviewHoverMessage: "Ativar esta opção pode afetar o desempenho se muitos itens forem exibidos ao mesmo tempo e você usar o campo 'AutoPreviewUrl'. Recomentamos que você use esta opção com um número pequeno de itens ou use URLs de visualização predefinidos nos campos da sua fonte de dados.",
                ShowFileIcon: "Mostrar ícone do arquivo",
                CompactModeLabel: "Modo compacto",
                PreferedCardNumberPerRow: "Número preferencial de cartões por linha",
                Fields: {
                    Title: "Título",
                    Location: "Localização",
                    Tags: "Tags",
                    PreviewImage: "Imagem de visualização",
                    PreviewUrl: "Url de visualização",
                    Url: "Url",
                    Date: "Data",
                    Author: "Autor",
                    ProfileImage: "Url da imagem do perfil",
                    FileExtension: "Extensão do arquivo",
                    IsContainer: "É pasta"
                },
                ResetFieldsBtnLabel: "Redefinir campos para os valores padrão"
            },
            Slider: {
                Name: "Controle deslizante",
                SliderAutoPlay: "Reprodução automática",
                SliderAutoPlayDuration: "Duração da reprodução automática (em segundos)",
                SliderPauseAutoPlayOnHover: "Pausar ao passar o mouse",
                SliderGroupCells: "Número de elementos para agrupar nos slides",
                SliderShowPageDots: "Mostrar pontos da página",
                SliderWrapAround: "Rolagem infinita",
                SlideHeight: "Altura do slide (em px)",
                SlideWidth: "Largura do slide (em px)"
            },
            People: {
                Name: "Pessoas",
                ManagePeopleFieldsLabel: "Gerenciar os campos de pessoas",
                ManagePeopleFieldsPanelDescriptionLabel: "Aqui você pode mapear o valor de cada campo com os espaços reservados correspondentes da <i>persona</i>. Você pode usar uma propriedade do resultado diretamente sem qualquer transformação ou usar expressões entre chaves como valor do campo.",
                PlaceholderNameFieldLabel: "Nome",
                PlaceholderValueFieldLabel: "Valor",
                UseHandlebarsExpressionLabel: "Usar expressões entre chaves",
                PersonaSizeOptionsLabel: "Tamanho do componente",
                PersonaSizeExtraSmall: "Muito pequeno",
                PersonaSizeSmall: "Pequeno",
                PersonaSizeRegular: "Regular",
                PersonaSizeLarge: "Grande",
                PersonaSizeExtraLarge: "Extra grande",
                ShowInitialsToggleLabel: "Mostrar iniciais se nenhuma foto estiver disponível",
                SupportHTMLColumnLabel: "Permitir HTML",
                ResetFieldsBtnLabel: "Redefinir campos para os valores padrão",
                ShowPersonaCardOnHover: "Mostrar cartão da <i>persona</i> ao passar o mouse",
                ShowPersonaCardOnHoverCalloutMsg: "Esse recurso usa o Microsoft Graph para exibir informações sobre o usuário e precisa das seguintes permissões de API em seu locatário para funcionar: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                Fields: {
                    ImageUrl: "URL da imagem",
                    PrimaryText: "Texto primário",
                    SecondaryText: "Texto secundário",
                    TertiaryText: "Texto terciário",
                    OptionalText: "Texto opcional"
                }
            },
            Vertical: {
                Name: "Vertical"
            },
            Horizontal: {
                Name: "Horizontal",
                PreferedFilterNumberPerRow: "Número preferencial de filtros por linha",
            },
            Panel: {
                Name: "Painel",
                IsModal: "Modal",
                IsLightDismiss: "Descarte rápido",
                Size: "Tamanho do painel",
                ButtonLabel: "Mostrar filtros",
                ButtonLabelFieldName: "Rótulo para mostrar no botão",
                HeaderText: "Filtros",
                HeaderTextFieldName: "Texto do cabeçalho do painel",
                SizeOptions: {
                    SmallFixedFar: 'Pequeno (padrão)',
                    SmallFixedNear: 'Pequeno, próximo ao lado',
                    Medium: 'Médio',
                    Large: 'Grande',
                    LargeFixed: 'Grande com largura fixa',
                    ExtraLarge: 'Extra grande',
                    SmallFluid: 'Largura total (fluído)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> resultados para '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> resultados",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Conexões disponíveis",
                UseDataVerticalsWebPartLabel: "Conectar-se a uma Web Part de verticais",
                UseDataVerticalsFromComponentLabel: "Usar verticais deste computador"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Configuração de extensibilidade",
                    FieldLabel: "Bibliotecas de extensibilidade para carregar",
                    ManageBtnLabel: "Configurar",
                    Columns: {
                        Name: "Nome/Propósito",
                        Id: "GUID do manifesto",
                        Enabled: "Ativado/desativado"
                    }
                },
                ImportExport: "Configurações de importação/exportação"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Aplicar",
            ClearAllFiltersButtonLabel: "Limpar",
            FilterNoValuesMessage: "Nenhum valor para este filtro",
            OrOperator: "OU",
            AndOperator: "E",
            ComboBoxPlaceHolder: "Escolha o valor",
            UseAndOperatorValues: "Usar um operador E entre os valores",
            UseOrOperatorValues: "Usar um operador OU entre os valores",
            UseValuesOperators: "Escolha o operador para usar entre os valores deste filtro"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "Sugestões de pesquisa estática do SharePoint",
                ProviderDescription: "Recuperar sugestões de pesquisa estáticas definidas pelo usuário do SharePoint"
            }
        }
    }
})
