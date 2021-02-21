define([], function() {
    return {
        Tokens: {
          SelectTokenLabel: "Seleccione una ficha...",
          Context: {
            ContextTokensGroupName: "Fichas de contexto",
            SiteAbsoluteUrl: "URL absoluta del sitio",
            SiteRelativeUrl: "URL relativa del servidor del sitio",
            WebAbsoluteUrl: "URL absoluta de la web",
            WebRelativeUrl: "URL relativa del servidor web",
            WebTitle: "Título de la web",
            InputQueryText: "Introducir el texto de la consulta"
          },
          Custom: {
            CustomTokensGroupName: "Valor personalizado",
            CustomValuePlaceholder: "Introduzca un valor...",
            InvalidtokenFormatErrorMessage: "Por favor, introduzca un formato de token soportado usando '{' y '}'. (por ejemplo: {Hoy})"
          },
          Date: {
            DateTokensGroupName: "Fichas de fechas",
            Today: "Hoy",
            Yesterday: "Ayer",
            Tomorrow: "Mañana",
            OneWeekAgo: "Semana anterior",
            OneMonthAgo: "Mes anterior",
            OneYearAgo: "Año pasado"
          },
          Page: {
            PageTokensGroupName: "Fichas de página",
            PageId: "ID de la página",
            PageTitle: "Título de la página",
            PageCustom: "Otra columna de la página",
          },
          User: {
            UserTokensGroupName: "Fichas de usuario",
            UserName: "Nombre de usuario",
            Me: "Yo",
            UserDepartment: "Departamento de Usuario",
            UserCustom: "Propiedad personalizada del usuario"
          }
        },
        General:{
          OnTextLabel: "Encendido",
          OffTextLabel: "Apagado",
          StaticArrayFieldName: "Matriz como campo",
          About: "Acerca de",
          Authors: "Autor(es)",
          Version: "Versión",
          InstanceId: "ID de la instancia de la Parte Web",
          Resources: {
            GroupName: "Recursos",
            Documentation: "Documentación",
            PleaseReferToDocumentationMessage: "Consulte la documentación oficial."
          },
          Extensibility: {
            InvalidDataSourceInstance: "La fuente de datos seleccionada '{0}' no implementa correctamente la clase abstracta 'BaseDataSource'. Faltan algunos métodos.",
            DataSourceDefinitionNotFound: "No se ha encontrado el origen de datos personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y de que el ID del manifiesto se ha registrado para esta Web Part.",
            LayoutDefinitionNotFound: "No se ha encontrado el diseño personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y de que el ID del manifiesto se ha registrado para esta Web Part.",
            InvalidLayoutInstance: "El diseño seleccionado '{0}' no implementa correctamente la clase abstracta 'BaseLayout'. Faltan algunos métodos.",
            DefaultExtensibilityLibraryName: "Biblioteca de extensibilidad por defecto",
            InvalidProviderInstance: "El proveedor de sugerencias seleccionado '{0}' no implementa correctamente la clase abstracta 'BaseSuggestionProvider'. Faltan algunos métodos.",
            ProviderDefinitionNotFound: "No se ha encontrado el proveedor de sugerencias personalizado con la clave '{0}'. Asegúrese de que la solución se ha desplegado correctamente en el catálogo de aplicaciones y de que el ID del manifiesto se ha registrado para esta Web Part.",
          },
          DateFromLabel: "De",
          DateTolabel: "Hasta",
          DatePickerStrings: {
            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            shortDays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            goToToday: 'Ir a hoy',
            prevMonthAriaLabel: 'Ir al mes anterior',
            nextMonthAriaLabel: 'Ir al mes siguiente',
            prevYearAriaLabel: 'Ir al año anterior',
            nextYearAriaLabel: 'Ir al año siguiente',
            closeButtonAriaLabel: 'Cerrar el selector de fecha',
            isRequiredErrorMessage: 'Fecha de Inicio es requerida.',
            invalidInputErrorMessage: 'Formato de Fecha Inválido.'
          },
          DateIntervalStrings: {
            AnyTime: "Cualquier hora",
            PastDay: "Últimas 24 horas",
            PastWeek: "Semana anterior",
            PastMonth: "Mes anterior",
            Past3Months: "Últimos 3 meses",
            PastYear: "Año pasado",
            Older: "Antigüedad superior a un año"
          },
          SameTabOpenBehavior: "Utilizar la ficha actual",
          NewTabOpenBehavior: "Abrir en una nueva pestaña",
          PageOpenBehaviorLabel: "Comportamiento de apertura",
          EmptyFieldErrorMessage: "Este campo no puede estar vacío"
        },
        DataSources: {
          SharePointSearch: {
            SourceName:  "Búsqueda en SharePoint",
            SourceConfigurationGroupName: "Configuración de la fuente",
            QueryTextFieldLabel: "Texto de la consulta",
            QueryTextFieldInfoMessage: "Utilice la pestaña de configuración de la parte web <strong>Conexiones disponibles</strong> para especificar un valor estático o un valor de un componente dinámico de la página, como un cuadro de búsqueda",
            QueryTemplateFieldLabel: "Plantilla de consulta",
            QueryTemplatePlaceHolderText: "ex: Path:{Site}",
            QueryTemplateFieldDescription: "La plantilla de consulta de búsqueda. También puede utilizar {<tokens>} para construir una consulta dinámica.",
            ResultSourceIdLabel: "ID de la fuente de resultados",
            ResultSourceIdDescription: "Utilice un ID de origen de resultados de SharePoint por defecto o escriba su propio valor GUID y pulse 'Intro' para guardar.",
            InvalidResultSourceIdMessage: "El valor proporcionado no es un GUID válido",
            EnableQueryRulesLabel: "Habilitar las reglas de consulta",            
            IncludeOneDriveResultsLabel: "Incluir los resultados de OneDrive para la Empresa",
            RefinementFilters: "Filtros de refinamiento",
            RefinementFiltersDescription: `Initial refinement filters to apply to the query. These won't appear in the selected filters. For string expressions, use double quotes (") instead of single quote (').`,
            EnableLocalizationLabel: "Habilitar la localización",
            EnableLocalizationOnLabel: "Encendido",
            EnableLocalizationOffLabel: "Apagado",
            QueryCultureLabel: "Idioma de la solicitud de búsqueda",
            QueryCultureUseUiLanguageLabel: "Utilizar el lenguaje de la interfaz",
            SelectedPropertiesFieldLabel: "Propiedades seleccionadas",
            SelectedPropertiesFieldDescription: "Especifica las propiedades a recuperar de los resultados de la búsqueda.",
            SelectedPropertiesPlaceholderLabel: "Seleccione las propiedades",
            TermNotFound: "(Término con ID '{0}' no encontrado)",
            ApplyQueryTemplateBtnText: "Aplique",
            EnableAudienceTargetingTglLabel: "Habilitar Audencias Segmentadas"
          },
          MicrosoftSearch: {
            QueryTextFieldLabel: "Texto de la consulta",
            QueryTextFieldInfoMessage: "Utilice la pestaña de configuración de la parte web <strong>Conexiones disponibles</strong> para especificar un valor estático o un valor de un componente dinámico de la página, como un cuadro de búsqueda",
            SourceName: "Búsqueda de Microsoft",
            SourceConfigurationGroupName: "Búsqueda de Microsoft",
            EntityTypesField: "Tipos de entidades a buscar",
            SelectedFieldsPropertiesFieldLabel: "Campos seleccionados",
            SelectedFieldsPropertiesFieldDescription: "Especifica las propiedades a recuperar de los resultados de la búsqueda.",
            SelectedFieldsPlaceholderLabel: "Seleccione los campos",
            EnableTopResultsLabel: "Habilitar los mejores resultados",
            ContentSourcesFieldLabel: "Fuentes de contenido",
            ContentSourcesFieldDescriptionLabel: "ID de las conexiones definidas en el portal de administración de los conectores de Búsqueda de Microsoft.",
            ContentSourcesFieldPlaceholderLabel: "ex: 'MyCustomConnectorId'"
          },
          SearchCommon: {
            Sort: {
              SortPropertyPaneFieldLabel: "Orden de clasificación",
              SortListDescription: "Especifique el orden inicial de los resultados de la búsqueda. Puede seleccionar un campo de la lista desplegable (sólo si los datos de la fuente de datos ya se han obtenido) o escribir su propio valor personalizado (pulse 'Intro' para guardar su entrada)",
              SortDirectionAscendingLabel: "Ascendente",
              SortDirectionDescendingLabel: "Descendiendo",
              SortErrorMessage: "Propiedad de búsqueda no válida (Compruebe si la propiedad gestionada es ordenable).",
              SortPanelSortFieldLabel: "Ordenar por campo",
              SortPanelSortFieldAria: "Ordenar por",
              SortPanelSortFieldPlaceHolder: "Ordenar por",
              SortPanelSortDirectionLabel: "Dirección de clasificación",
              SortDirectionColumnLabel: "Dirección",
              SortFieldColumnLabel: "Nombre del campo",
              EditSortLabel: "Cambiar el orden de clasificación",
              SortInvalidSortableFieldMessage: "Esta propiedad no es ordenable",
              SortFieldColumnPlaceholder: "Seleccione campo..."
            }
          }
        },
        Controls: {
          TextDialogButtonText: "Agregar expresión Handlebars",
          TextDialogTitle: "Editar la expresión Handlebars",
          TextDialogCancelButtonText: "Cancelar",
          TextDialogSaveButtonText: "Guardar",
          SelectItemComboPlaceHolder: "Seleccione la propiedad",
          AddStaticDataLabel: "Añadir datos estáticos",
          TextFieldApplyButtonText: "Aplique"
        },
        Layouts: {
          Debug: {
            Name: "Depurar"
          },
          Custom: {
            Name: "Personalizada"
          },
          SimpleList: {
            Name: "Lista",
            ShowFileIconLabel: "Mostrar icono de archivo",
            ShowItemThumbnailLabel: "Mostrar miniatura"
          },
          DetailsList: {
            Name: "Lista de detalles",
            UseHandlebarsExpressionLabel: "Utilizar la expresión Handlebars",
            MinimumWidthColumnLabel: "Anchura mínima (px)",
            MaximumWidthColumnLabel: "Ancho máximo (px)",
            SortableColumnLabel: "Es ordenable",
            ResizableColumnLabel: "Redimensionable",
            MultilineColumnLabel: "Multilínea",
            LinkToItemColumnLabel: "Enlace al elemento",
            SupportHTMLColumnLabel: "Permitir HTML",
            CompactModeLabel: "Modo compacto",
            ShowFileIcon: "Mostrar icono de archivo",
            ManageDetailsListColumnDescription: "Añade, actualiza o elimina columnas para el diseño de la lista de detalles. Puede utilizar los valores de las propiedades en la lista directamente sin ninguna transformación o utilizar una expresión Handlebars en el campo de valor. También se admite HTML para todos los campos.",
            ManageDetailsListColumnLabel: "Administrar columnas",
            ValueColumnLabel: "Valor de columna",
            DisplayNameColumnLabel: "Nombre para mostrar de la columna",
            FileExtensionFieldLabel: "Campo a utilizar para la extensión del archivo",
            GroupByFieldLabel: "Agrupar por campo",
            EnableGrouping: "Habilitar agrupación",
            CollapsedGroupsByDefault: "Mostrar contraído",
            ResetFieldsBtnLabel: "Restablecer los valores por defecto de los campos"
          },
          Cards: { 
            Name: "Tarjetas",
            ManageTilesFieldsLabel: "Campos de la tarjeta gestionada",
            ManageTilesFieldsPanelDescriptionLabel: "Aquí puede asignar los valores de cada campo con los correspondientes marcadores de posición de la tarjeta. Puede utilizar una propiedad de resultado directamente sin ninguna transformación o utilizar una expresión de Handlebars como valor de campo. Además, cuando se especifica, también puede inyectar su propio código HTML en los campos anotados.",
            PlaceholderNameFieldLabel: "Nombre",
            SupportHTMLColumnLabel: "Permitir HTML",
            PlaceholderValueFieldLabel: "Valor",
            UseHandlebarsExpressionLabel: "Utilizar la expresión Handlebars",
            EnableItemPreview: "Activar la vista previa de resultado",
            EnableItemPreviewHoverMessage: "La activación de esta opción puede afectar al rendimiento si se muestran demasiados elementos a la vez y se utiliza el campo de ranura 'AutoPreviewUrl'. Le recomendamos que utilice esta opción con una pequeña cantidad de elementos o que utilice URLs de vista previa predefinidas de sus campos de fuente de datos en las ranuras.",
            ShowFileIcon: "Mostrar icono de archivo",
            CompactModeLabel:"Modo compacto",
            PreferedCardNumberPerRow: "Número preferido de tarjetas por fila",
            Fields: {
              Title: "Título",
              Location: "Ubicación",
              Tags: "Etiquetas",
              PreviewImage: "Imagen previa",
              PreviewUrl: "Url de vista previa",
              Url: "Url",
              Date: "Fecha",
              Author: "Autor",
              ProfileImage: "Url de la imagen del perfil",
              FileExtension: "Extensión del archivo",
              IsContainer: "Est una carpeta"
            },
            ResetFieldsBtnLabel: "Restablecer los valores por defecto de los campos"
          },
          Slider: { 
            Name: "Deslizador",
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
            Name: "Gente",
            ManagePeopleFieldsLabel: "Gestionar campos de personas",
            ManagePeopleFieldsPanelDescriptionLabel: "Aquí puede asignar los valores de cada campo con los correspondientes marcadores de posición de la persona. Puede utilizar el valor del campo de la fuente de datos directamente sin ninguna transformación o utilizar una expresión Handlebars en el campo de valor.",
            PlaceholderNameFieldLabel: "Nombre",
            PlaceholderValueFieldLabel: "Valor",
            UseHandlebarsExpressionLabel: "Utilizar la expresión Handlebars",
            PersonaSizeOptionsLabel: "Tamaño de los componentes",
            PersonaSizeExtraSmall: "Extra pequeño",
            PersonaSizeSmall: "Pequeño",
            PersonaSizeRegular: "Regular",
            PersonaSizeLarge: "Grande",
            PersonaSizeExtraLarge: "Extra grande",
            ShowInitialsToggleLabel: "Mostrar las iniciales si no hay imagen disponible",
            SupportHTMLColumnLabel: "Permitir HTML",
            ResetFieldsBtnLabel: "Restablecer los valores por defecto de los campos",
            ShowPersonaCardOnHover: "Mostrar tarjeta de personaje al pasar el mouse",
            ShowPersonaCardOnHoverCalloutMsg: "Esta función utiliza Microsoft Graph para mostrar información sobre el usuario y necesita los siguientes permisos de la API en su inquilino para funcionar: ['User.Read','People.Read','Contacts.Read','User.ReadBasic.All'].",
            Fields: {
              ImageUrl: "URL de la imagen",
              PrimaryText: "Texto primario",
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
            IsLightDismiss: "Despido ligero",
            Size: "Tamaño del panel",
            ButtonLabel: "Mostrar filtros",
            ButtonLabelFieldName: "Etiqueta del botón a mostrar",
            HeaderText: "Filtros",
            HeaderTextFieldName: "Texto de la cabecera del panel",
            SizeOptions: {
              SmallFixedFar: 'Pequeño (por defecto)',
              SmallFixedNear: 'Pequeño, lado cercano',
              Medium: 'Medio',
              Large:'Grande',
              LargeFixed: 'Gran anchura fija',
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
            DataConnectionsGroupName: "Conexiones disponibles"
          },
          InformationPage: {
            Extensibility: {
              GroupName: "Configuración de la extensibilidad",
              FieldLabel: "Bibliotecas de extensibilidad para cargar",
              ManageBtnLabel: "Configura",             
              Columns: {
                Name: "Nombre/Propósito",
                Id: "GUID de manifiesto",
                Enabled: "Habilitado/Deshabilitado"
              }
            }
          }
        },
        Filters: {
          ApplyAllFiltersButtonLabel: "Aplique",
          ClearAllFiltersButtonLabel: "Claro",
          FilterNoValuesMessage: "No hay valores para este filtro",
          OrOperator: "OR",
          AndOperator: "AND",
          ComboBoxPlaceHolder: "Seleccione el valor"
        },
        SuggestionProviders: {
          SharePointStatic: {
            ProviderName: "Sugerencias de búsqueda estática en SharePoint",
            ProviderDescription: "Recuperar las sugerencias de búsqueda estática de SharePoint definidas por el usuario"
          }
        }
    }
})