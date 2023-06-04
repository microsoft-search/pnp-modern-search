define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Seleccione un token...",
            Context: {
                ContextTokensGroupName: "Tokens de contexto",
                SiteAbsoluteUrl: "URL absoluta del sitio",
                SiteRelativeUrl: "URL relativa al servidor del sitio",
                WebAbsoluteUrl: "URL absoluta del web",
                WebRelativeUrl: "URL relativa al servidor del web",
                WebTitle: "Título del web",
                InputQueryText: "Introducir el texto de la consulta"
            },
            Custom: {
                CustomTokensGroupName: "Valor personalizado",
                CustomValuePlaceholder: "Introduzca un valor...",
                InvalidtokenFormatErrorMessage: "Por favor, introduzca un formato de token soportado usando '{' y '}'. (por ejemplo: {Hoy})"
            },
            Date: {
                DateTokensGroupName: "Tokens de fecha",
                Today: "Hoy",
                Yesterday: "Ayer",
                Tomorrow: "Mañana",
                OneWeekAgo: "Hace una semana",
                OneMonthAgo: "Hace un mes",
                OneYearAgo: "Hace un año"
            },
            Page: {
                PageTokensGroupName: "Tokens de página",
                PageId: "ID página",
                PageTitle: "Título",
                PageCustom: "Otra columna de la página",
            },
            User: {
                UserTokensGroupName: "Tokens de usuario",
                UserName: "Nombre del usuario",
                Me: "Yo",
                UserDepartment: "Departamento del usuario",
                UserCustom: "Propiedad personalizada del usuario"
            }
        },
        General: {
            OnTextLabel: "Activado",
            OffTextLabel: "Desactivado",
            StaticArrayFieldName: "Campo tipo array",
            About: "Acerca de",
            Authors: "Autor(es)",
            Version: "Versión",
            InstanceId: "ID de instancia del Web Part",
            Resources: {
                GroupName: "Recursos",
                Documentation: "Documentación",
                PleaseReferToDocumentationMessage: "Consulte la documentación oficial."
            },
            Extensibility: {
                InvalidDataSourceInstance: "La fuente de datos seleccionada '{0}' no implementa correctamente la clase abstracta 'BaseDataSource'. Faltan algunos métodos.",
                DataSourceDefinitionNotFound: "No se ha encontrado el origen de datos personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y el ID del manifiesto se ha registrado para este Web Part.",
                LayoutDefinitionNotFound: "No se ha encontrado el diseño personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y el ID del manifiesto se ha registrado para este Web Part.",
                InvalidLayoutInstance: "El diseño seleccionado '{0}' no implementa correctamente la clase abstracta 'BaseLayout'. Faltan algunos métodos.",
                DefaultExtensibilityLibraryName: "Biblioteca de extensibilidad por defecto",
                InvalidProviderInstance: "El proveedor de sugerencias seleccionado '{0}' no implementa correctamente la clase abstracta 'BaseSuggestionProvider'. Faltan algunos métodos.",
                ProviderDefinitionNotFound: "No se ha encontrado el proveedor de sugerencias personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y de que el ID del manifiesto se ha registrado para este Web Part.",
                QueryModifierDefinitionNotFound: "No se ha encontrado el queryModifier personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y el ID del manifiesto se ha registrado para esta Web Part.",
                InvalidQueryModifierInstance: "El queryModifier personalizado seleccionado '{0}' no implementa correctamente la clase abstracta 'BaseQueryModifier'. Faltan algunos métodos.",
            },
            DateFromLabel: "Desde",
            DateTolabel: "Hasta",
            DatePickerStrings: {
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                shortMonths: ['en.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'agto.', 'sept.', 'oct.', 'nov.', 'dic'],
                days: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
                shortDays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
                goToToday: 'Ir al día de hoy',
                prevMonthAriaLabel: 'Ir al mes anterior',
                nextMonthAriaLabel: 'Ir al mes siguiente',
                prevYearAriaLabel: 'Ir al año anterior',
                nextYearAriaLabel: 'Ir al próximo año',
                closeButtonAriaLabel: 'Cerrar el selector de fecha',
                isRequiredErrorMessage: 'Se requiere una fecha de inicio.',
                invalidInputErrorMessage: 'Formato de fecha no válido.'
            },
            DateIntervalStrings:  {
                AnyTime: "En cualquier momento",
                PastDay: "Últimas 24 horas",
                PastWeek: "De las últimas 24 horas a la semana pasada",
                PastMonth: "De la semana pasada al mes pasado",
                Past3Months: "Del mes pasado a los últimos 3 meses",
                PastYear: "De los últimos 3 meses al año pasado",
                Older: "Más de un año"
            },
            SameTabOpenBehavior: "Utilizar la pestaña actual",
            NewTabOpenBehavior: "Abrir en una nueva pestaña",
            PageOpenBehaviorLabel: "Comportamiento de apertura",
            EmptyFieldErrorMessage: "Este campo no puede estar vacío",
            TagPickerStrings: {
                NoResultsSearchMessage: "No se han encontrado resultados",
                SearchPlaceholder: "Buscar un valor..."
            },
            CurrentVerticalNotSelectedMessage: "La vertical seleccionada actualmente no coincide con las asociadas a este Web Part ({0}). Permanecerá en blanco en el modo de visualización."
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "Búsqueda SharePoint",
                SourceConfigurationGroupName: "Configuración de la fuente",
                QueryTextFieldLabel: "Texto de la consulta",
                QueryTextFieldInfoMessage: "Utilice la pestaña de configuración del Web Part <strong>Conexiones disponibles</strong> para especificar un valor estático o un valor de un componente dinámico de la página como un cuadro de búsqueda",
                QueryTemplateFieldLabel: "Plantilla de consulta",
                QueryTemplatePlaceHolderText: "ej.: Path:{Site}",
                QueryTemplateFieldDescription: "Plantilla de consulta de búsqueda. También puede utilizar {<tokens>} para construir una consulta dinámica.",
                ResultSourceIdLabel: "Resultado Fuente Id / ÁMBITO|NOMBRE",
                ResultSourceIdDescription: "Seleccione una fuente incorporada, escriba un GUID de fuente personalizado, o el ÁMBITO y el NOMBRE de la fuente separados por | (es decir, SPSite|Noticias). Los ámbitos válidos son [SPSiteSubscription, SPSite, SPWeb]. Pulse [Intro] para guardar.",
                InvalidResultSourceIdMessage: "El valor proporcionado no es un GUID válido, o está formateado como ÁMBITO|NOMBRE",
                EnableQueryRulesLabel: "Habilitar las reglas de consulta",
                RefinementFilters: "Filtros de refinamiento",
                RefinementFiltersDescription: "Filtros de refinamiento iniciales para aplicar a la consulta. Estos no aparecerán en los filtros seleccionados. Para las expresiones de cadena, utilice comillas dobles (\") en lugar de comillas simples (').",
                EnableLocalizationLabel: "Activar la localización",
                EnableLocalizationOnLabel: "Activar",
                EnableLocalizationOffLabel: "Desactivar",
                QueryCultureLabel: "Idioma de la solicitud de búsqueda",
                QueryCultureUseUiLanguageLabel: "Utilizar el lenguaje de la interfaz",
                SelectedPropertiesFieldLabel: "Propiedades seleccionadas",
                SelectedPropertiesFieldDescription: "Especifica las propiedades a recuperar de los resultados de la búsqueda.",
                SelectedPropertiesPlaceholderLabel: "Seleccione las propiedades",
                HitHighlightedPropertiesFieldLabel: "Propiedades destacadas",
                HitHighlightedPropertiesFieldDescription: "Proporcionar la lista de propiedades gestionadas para contenido resaltado (es decir, Departamento, UserName).",
                TermNotFound: "(Término con ID '{0}' no encontrado)",
                ApplyQueryTemplateBtnText: "Aplicar",
                EnableAudienceTargetingTglLabel: "Permitir la segmentación de la audiencia",
                TrimDuplicates: "Recortar duplicados",
                CollapseSpecificationLabel: "Ocultar especificación"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Texto de la consulta",
                QueryTextFieldInfoMessage: "Utilice la pestaña de configuración de la parte web <strong>Conexiones disponibles</strong> para especificar un valor estático o un valor de un componente dinámico de la página, como un cuadro de búsqueda",
                SourceName: "Búsqueda Microsoft",
                SourceConfigurationGroupName: "Búsqueda Microsoft",
                EntityTypesField: "Tipos de entidades a buscar",
                SelectedFieldsPropertiesFieldLabel: "Seleccione los campos",
                SelectedFieldsPropertiesFieldDescription: "especifique los campos a recuperar de los resultados de la búsqueda.",
                SelectedFieldsPlaceholderLabel: "Seleccione los campos",
                EnableTopResultsLabel: "Habilitar los mejores resultados",
                ContentSourcesFieldLabel: "Fuentes de contenido",
                ContentSourcesFieldDescriptionLabel: "IDs de conexiones definidas en el portal de administración de conectores de Microsoft Search.",
                ContentSourcesFieldPlaceholderLabel: "ex: 'MyCustomConnectorId'",
                EnableSuggestionLabel: "Activar las sugerencias ortográficas",
                EnableModificationLabel: "Habilitar las modificaciones ortográficas",
                QueryTemplateFieldLabel: "Plantilla de consulta",
                QueryTemplatePlaceHolderText: "ex: {searchTerms} IsDocument:true",
                QueryTemplateFieldDescription: "La plantilla de consulta de búsqueda. También puede utilizar {<tokens>} y KQL para construir una consulta dinámica.",
                ApplyQueryTemplateBtnText: "Aplicar",
                UseBetaEndpoint: "Utilizar endpoint beta",
                TrimDuplicates: "Recortar duplicados",
                CollapseProperties: {
                    EditCollapsePropertiesLabel: "Editar configuración de contracción",
                    CollapsePropertiesDescription: "Especifique la configuración de contracción para los resultados de búsqueda. Puede seleccionar un campo de la lista desplegable (solo si los datos de la fuente de datos ya se han obtenido) o escribir su propio valor personalizado (presione 'Entrar' para guardar su entrada)",
                    CollapsePropertiesPropertyPaneFieldLabel: "Configuración de colapso",
                    CollapseLimitFieldLabel: "Límite",
                    CollapsePropertiesFieldColumnPlaceholder: "Contraer por campo"
                }
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Configuración de ordenación",
                    SortListDescription: "Especifique la configuración de ordenación de los resultados de la búsqueda. Puede seleccionar un campo de la lista desplegable (sólo si los datos de la fuente de datos ya se han obtenido) o escribir su propio valor personalizado (pulse 'Intro' para guardar su selección)",
                    SortDirectionAscendingLabel: "Ascender",
                    SortDirectionDescendingLabel: "Descender",
                    SortErrorMessage: "Propiedad de búsqueda no válida (Compruebe si la propiedad gestionada es ordenable).",
                    SortPanelSortFieldLabel: "Ordenar por campo",
                    SortPanelSortFieldAria: "Ordenar por",
                    SortPanelSortFieldPlaceHolder: "Ordenar por",
                    SortPanelSortDirectionLabel: "Dirección de ordenación",
                    SortDirectionColumnLabel: "Dirección",
                    SortFieldColumnLabel: "Nombre del campo",
                    SortFieldDefaultSortLabel: "Ordenación por defecto",
                    SortFieldFriendlyNameLabel: "Nombre de visualización del campo de ordenación",
                    SortFieldUserSortLabel: "Ordenación por usuario",
                    EditSortLabel: "Editar la configuración de ordenación",
                    SortInvalidSortableFieldMessage: "Esta propiedad no es ordenable",
                    SortFieldColumnPlaceholder: "Seleccione el campo..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Añadir expresión Handlebars",
            TextDialogTitle: "Editar la expresión Handlebars",
            TextDialogCancelButtonText: "Cancelar",
            TextDialogSaveButtonText: "Guardar",
            SelectItemComboPlaceHolder: "Seleccione la propiedad",
            AddStaticDataLabel: "Añadir datos estáticos",
            TextFieldApplyButtonText: "Aplicar",
            SortByPlaceholderText: "Ordenar por...",
            SortByDefaultOptionText: "Defecto"
        },
        Layouts: {
            Debug: {
                Name: "Depuración"
            },
            CustomHandlebars: {
                Name: "Personalizado"
            },
            CustomAdaptiveCards: {
                Name: "Personalizado"
            },
            SimpleList: {
                Name: "Lista",
                ShowFileIconLabel: "Mostrar icono de archivo",
                ShowItemThumbnailLabel: "Mostrar imagen en miniatura"
            },
            DetailsList: {
                Name: "Lista de detalles",
                UseHandlebarsExpressionLabel: "Utilizar expresiones Handlebars",
                MinimumWidthColumnLabel: "Anchura mínima (px)",
                MaximumWidthColumnLabel: "Ancho máximo (px)",
                SortableColumnLabel: "Clasificable",
                ResizableColumnLabel: "Redimensionable",
                MultilineColumnLabel: "Multilínea",
                LinkToItemColumnLabel: "Enlace al elemento",
                CompactModeLabel: "Modo compacto",
                ShowFileIcon: "Mostrar icono de archivo",
                ManageDetailsListColumnDescription: "Añade, actualiza o elimina columnas para el diseño de la lista de detalles. Puede utilizar los valores de las propiedades en la lista directamente sin ninguna transformación o utilizar una expresión Handlebars en el campo de valor. También se admite HTML para todos los campos.",
                ManageDetailsListColumnLabel: "Administrar columnas",
                ValueColumnLabel: "Valor de la columna",
                ValueSortingColumnLabel: "Seleccione el campo de ordenación...",
                ValueSortingColumnNoFieldsLabel: "No hay campos disponibles",
                DisplayNameColumnLabel: "Nombre de la columna",
                FileExtensionFieldLabel: "Campo a utilizar para la extensión del archivo",
                GroupByFieldLabel: "Agrupar por campo",
                EnableGrouping: "Activar la agrupación",
                GroupingDescription: "Asegúrese de tener datos que se muestren en el elemento web de resultados para que se muestre una lista de propiedades.",
                CollapsedGroupsByDefault: "Mostrar colapsado",
                ResetFieldsBtnLabel: "Restablecer los valores por defecto de los campos"
            },
            Cards: {
                Name: "Tarjetas",
                ManageTilesFieldsLabel: "Campos gestionados de la tarjeta",
                ManageTilesFieldsPanelDescriptionLabel: "Aquí puede asignar los valores de cada campo con los correspondientes marcadores de posición de la tarjeta. Puede utilizar una propiedad de resultado directamente sin ninguna transformación o utilizar una expresión de Handlebars como valor de campo. Además, cuando se especifica, también puede inyectar su propio código HTML en los campos anotados.",
                PlaceholderNameFieldLabel: "Nombre",
                SupportHTMLColumnLabel: "Permitir HTML",
                PlaceholderValueFieldLabel: "Valor",
                UseHandlebarsExpressionLabel: "Utilizar expresiones Handlebars",
                EnableItemPreview: "Activar la vista previa de los resultados",
                EnableItemPreviewHoverMessage: "La activación de esta opción puede tener un impacto en el rendimiento si se muestran demasiados elementos a la vez y se utiliza el campo de ranura 'AutoPreviewUrl'. Le recomendamos que utilice esta opción con una pequeña cantidad de elementos o que utilice URLs de vista previa predefinidas de sus campos de fuente de datos en las ranuras.",
                ShowFileIcon: "Mostrar icono de archivo",
                CompactModeLabel: "Modo compacto",
                PreferedCardNumberPerRow: "Número preferido de tarjetas por fila",
                Fields: {
                    Title: "Título",
                    Location: "Ubicación",
                    Tags: "Etiquetas",
                    PreviewImage: "Vista previa de la imagen",
                    PreviewUrl: "Url de vista previa",
                    Url: "Url",
                    Date: "Fecha",
                    Author: "Autor",
                    ProfileImage: "Url de la imagen del perfil",
                    FileExtension: "Extensión del archivo",
                    IsContainer: "Es carpeta"
                },
                ResetFieldsBtnLabel: "Restablecer los valores por defecto de los campos"
            },
            Slider: {
                Name: "Slider",
                SliderAutoPlay: "Reproducción automática",
                SliderAutoPlayDuration: "Duración de la reproducción automática (en segundos)",
                SliderPauseAutoPlayOnHover: "Pausa al pasar por encima",
                SliderGroupCells: "Número de elementos a agrupar en las diapositivas",
                SliderShowPageDots: "Mostrar puntos de la página",
                SliderWrapAround: "Desplazamiento infinito",
                SlideHeight: "Altura de la diapositiva (en px)",
                SlideWidth: "Ancho de la diapositiva (en px)"
            },
            People: {
                Name: "Personas",
                ManagePeopleFieldsLabel: "Gestionar campos de persona",
                ManagePeopleFieldsPanelDescriptionLabel: "Aquí puede asignar los valores de cada campo con los correspondientes marcadores de posición de la persona. Puede utilizar el valor del campo de la fuente de datos directamente sin ninguna transformación o utilizar una expresión de Handlebars en el valor del campo.",
                PlaceholderNameFieldLabel: "Nombre",
                PlaceholderValueFieldLabel: "Valor",
                UseHandlebarsExpressionLabel: "Utilizar la expresión de Handlebars",
                PersonaSizeOptionsLabel: "Tamaño del componente",
                PersonaSizeExtraSmall: "Extra pequeño",
                PersonaSizeSmall: "Pequeño",
                PersonaSizeRegular: "Normal",
                PersonaSizeLarge: "Grande",
                PersonaSizeExtraLarge: "Extra grande",
                ShowInitialsToggleLabel: "Mostrar las iniciales si no hay imagen disponible",
                SupportHTMLColumnLabel: "Permitir HTML",
                ResetFieldsBtnLabel: "Restablecer los valores por defecto de los campos",
                ShowPersonaCardOnHover: "Mostrar tarjeta de persona al pasar el ratón por encima",
                ShowPersonaCardOnHoverCalloutMsg: "Esta función utiliza Microsoft Graph para mostrar información sobre el usuario y necesita los siguientes permisos de la API en su inquilino para funcionar: ['User.Read','People.Read','Contacts.Read','User.Read.All'].",
                Fields: {
                    ImageUrl: "URL de la imagen",
                    PrimaryText: "Texto principal",
                    SecondaryText: "Texto secundario",
                    TertiaryText: "Texto terciario",
                    OptionalText: "Texto opcional"
                }
            },
            Vertical: {
                Name: "Vertical"
            },
            Horizontal: {
                Name: "Horizontal",
                PreferedFilterNumberPerRow: "Número preferido de filtros por fila",
            },
            Panel: {
                Name: "Panel",
                IsModal: "Modal",
                IsLightDismiss: "Descarte rápido",
                Size: "Tamaño del panel",
                ButtonLabel: "Mostrar filtros",
                ButtonLabelFieldName: "Etiqueta del botón a mostrar",
                HeaderText: "Filtros",
                HeaderTextFieldName: "Texto de la cabecera del panel",
                SizeOptions: {
                    SmallFixedFar: 'Pequeño (por defecto)',
                    SmallFixedNear: 'Pequeño, lado cercano',
                    Medium: 'Medio',
                    Large: 'Grande',
                    LargeFixed: 'Fijo grande',
                    ExtraLarge: 'Extra grande',
                    SmallFluid: 'Ancho completo (fluido)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> resultados para '<em>{1}</em>'",
            CountMessageShort: "<b>{0}</b> resultados",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Conexiones disponibles",
                UseDataVerticalsWebPartLabel: "Conectar con Web Part de verticales",
                UseDataVerticalsFromComponentLabel: "Utilizar las verticales de este componente"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Configuración de la extensibilidad",
                    FieldLabel: "Bibliotecas de extensibilidad para cargar",
                    ManageBtnLabel: "Configurar",
                    Columns: {
                        Name: "Nombre/Finalidad",
                        Id: "GUID del manifiesto",
                        Enabled: "Activado/Desactivado"
                    }
                },
                ImportExport: "Importación/Exportación de configuración"
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Aplicar",
            ClearAllFiltersButtonLabel: "Limpiar",
            FilterNoValuesMessage: "No hay valores para este filtro",
            OrOperator: "O",
            AndOperator: "Y",
            ComboBoxPlaceHolder: "Seleccione el valor",
            UseAndOperatorValues: "Utilizar un operador Y entre valores",
            UseOrOperatorValues: "Utilizar un operador O entre valores",
            UseValuesOperators: "Seleccione el operador a utilizar entre los valores de este filtro"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "Sugerencias de búsqueda estática en SharePoint",
                ProviderDescription: "Recuperar las sugerencias de búsqueda estática de SharePoint definidas por el usuario"
            }
        }
    }
})
