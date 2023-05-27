define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Editar",
                IconText: "Web Part de resultados de búsqueda por @PnP",
                Description: "Muestra los resultados de la búsqueda de SharePoint o de la búsqueda de Microsoft.",
                ConfigureBtnLabel: "Configurar"
            },
            WebPartDefaultTitle: "Web Part de resultados de búsqueda",
            ShowBlankEditInfoMessage: "No se devuelve ningún resultado para esta consulta. Este Web Part permanecerá en blanco en el modo de visualización según los parámetros.",
            CurrentVerticalNotSelectedMessage: "La vertical seleccionada actualmente no coincide con la asociada a este Web Part. Permanecerá en blanco en el modo de visualización."
        },
        PropertyPane: {
            DataSourcePage: {
                DataSourceConnectionGroupName: "Fuentes de datos disponibles",
                PagingOptionsGroupName: "Opciones de paginación",
                ItemsCountPerPageFieldName: "Número de elementos por página",
                PagingRangeFieldName: "Número de páginas a mostrar en el rango",
                ShowPagingFieldName: "Mostrar paginación",
                HidePageNumbersFieldName: "Ocultar los números de página",
                HideNavigationFieldName: "Ocultar los botones de navegación (página anterior, página siguiente)",
                HideFirstLastPagesFieldName: "Ocultar los botones de navegación primero/último",
                HideDisabledFieldName: "Ocultar los botones de navegación (anterior, siguiente, primero, ultimo) si están desactivados.",
                TemplateSlots: {
                    GroupName: "Ranuras de diseño",
                    ConfigureSlotsLabel: "Editar ranuras de diseño para esta fuente de datos",
                    ConfigureSlotsBtnLabel: "Personalizar",
                    ConfigureSlotsPanelHeader: "Ranuras de diseño",
                    ConfigureSlotsPanelDescription: "Añada aquí las ranuras que se utilizarán para los diferentes diseños. Una ranura es una variable de marcador de posición que usted pone en sus plantillas donde el valor será sustituido dinámicamente por un valor de campo de la fuente de datos. De esta manera, sus plantillas se vuelven más genéricas y reutilizables independientemente de los campos específicos de la fuente de datos. Para usarlas, utilice la expresión de Handlebars `{{slot item @root.slots.<SlotName>}}.",
                    SlotNameFieldName: "Nombre de la ranura",
                    SlotFieldFieldName: "Campo de la ranura",
                    SlotFieldPlaceholderName: "Elija un campo"
                }
            },
            LayoutPage: {
                LayoutSelectionGroupName: "Diseños disponibles",
                LayoutTemplateOptionsGroupName: "Opciones de diseño",
                CommonOptionsGroupName: "Común",
                TemplateUrlFieldLabel: "Utilizar una URL de plantilla externa",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "La plantilla debe ser un archivo .txt, .htm o .html válido",
                ErrorTemplateResolve: "No se ha podido resolver la plantilla especificada. Detalles del error: '{0}'",
                DialogButtonLabel: "Editar la plantilla de resultados",
                DialogTitle: "Editar la plantilla de resultados",
                ShowSelectedFilters: "Mostrar los filtros seleccionados",
                ShowBlankIfNoResult: "Ocultar este Web Part si no hay nada que mostrar",
                ShowResultsCount: "Mostrar el recuento de resultados",
                HandlebarsRenderTypeLabel: "Handlebars/HTML",
                HandlebarsRenderTypeDesc: "Selecciona diseños basados en HTML, CSS y Handlebars",
                AdaptiveCardsRenderTypeLabel: "Adaptive Cards",
                AdaptiveCardsRenderTypeDesc: "Seleccione diseños basados en tarjetas adaptables JSON",                
                Handlebars: {
                    UseMicrosoftGraphToolkit: "Utilizar Microsoft Graph Toolkit",
                    ResultTypes: {
                        ResultTypeslabel: "Tipos de resultados",
                        ResultTypesDescription: "Añada aquí las plantillas que se utilizarán para los elementos de resultado según una o varias condiciones. Las condiciones se evalúan en el orden configurado y las plantillas externas tienen prioridad sobre las plantillas en línea. Asegúrese también de que los campos de la fuente de datos que utiliza están presentes en la respuesta de datos.",
                        InlineTemplateContentLabel: "Plantilla en línea",
                        EditResultTypesLabel: "Editar los tipos de resultados",
                        ConditionPropertyLabel: "Campo de origen de los datos",
                        ConditionValueLabel: "Valor de la condición",
                        CondtionOperatorValue: "Operador",
                        ExternalUrlLabel: "URL de la plantilla externa",
                        EqualOperator: "Es igual a",
                        NotEqualOperator: "No es igual a",
                        ContainsOperator: "Contiene",
                        StartsWithOperator: "Comienza con",
                        NotNullOperator: "No es nulo",
                        GreaterOrEqualOperator: "Mayor o igual que",
                        GreaterThanOperator: "Mayor que",
                        LessOrEqualOperator: "Menos o igual que",
                        LessThanOperator: "Menos que",
                        CancelButtonText: "Cancelar",
                        DialogButtonText: "Editar plantilla",
                        DialogTitle: "Editar la plantilla de resultados",
                        SaveButtonText: "Guardar"
                    },
                    AllowItemSelection: "Permitir la selección de elementos",
                    AllowMultipleItemSelection: "Permitir la selección múltiple",
                    SelectionModeLabel: "Modo de selección",
                    AsTokensSelectionMode: "Procesar los valores seleccionados como fichas (modo manual)",
                    AsDataFiltersSelectionMode: "Procesar los valores seleccionados como filtros (modo por defecto)",
                    AsDataFiltersDescription: "En este modo, los valores seleccionados se envían a la fuente de datos como refinadores de búsqueda regulares. En este caso, la propiedad de destino elegida debe ser refinable en el esquema de búsqueda.",
                    AsTokensDescription: "En este modo, los valores seleccionados se utilizan manualmente a través de tokens y métodos disponibles. Ejemplo con la plantilla de consulta de búsqueda de SharePoint: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
                    FilterValuesOperator: "El operador lógico a utilizar entre los valores seleccionados",
                    FieldToConsumeLabel: "Campo de origen a consumir",
                    FieldToConsumeDescription: "Utilice este valor de campo para los elementos seleccionados"
                },
                AdaptiveCards: {
                    HostConfigFieldLabel: "Configuración de host"
                }                
            },
            ConnectionsPage: {
                ConnectionsPageGroupName: "Conexiones disponibles",
                UseFiltersWebPartLabel: "Conectar con un Web Part de filtros",
                UseFiltersFromComponentLabel: "Utilizar los filtros de este componente",
                UseDynamicFilteringsWebPartLabel: "Conectar con un Web Part de resultados de búsqueda",
                UseDataResultsFromComponentsLabel: "Utilizar los datos de este Web Part",
                UseDataResultsFromComponentsDescription: "Utilice los datos de los elementos seleccionados en estos Web Parts",                
                UseSearchVerticalsWebPartLabel: "Conectar con un Web Part vertical",
                UseSearchVerticalsFromComponentLabel: "Utilizar las verticales de este componente",
                LinkToVerticalLabel: "Mostrar datos sólo cuando se selecciona la siguiente vertical",
                LinkToVerticalLabelHoverMessage: "Los resultados se mostrarán sólo si la vertical seleccionada coincide con la configurada para este Web Part. En caso contrario, el Web Part estará en blanco (sin margen y sin relleno) en el modo de visualización.",
                UseInputQueryText: "Utilizar el texto de la consulta de entrada",
                UseInputQueryTextHoverMessage: "Utilice el token {inputQueryText} en su fuente de datos para recuperar este valor",
                SearchQueryTextFieldLabel: "Texto de la consulta",
                SearchQueryTextFieldDescription: "",
                SearchQueryPlaceHolderText: "Introduzca el texto de la consulta...",
                InputQueryTextStaticValue: "Valor estático",
                InputQueryTextDynamicValue: "Valor dinámico",
                SearchQueryTextUseDefaultQuery: "Utilizar un valor por defecto",
                SearchQueryTextDefaultValue: "Valor por defecto",
                SourceDestinationFieldLabel: "Nombre del campo de destino",
                SourceDestinationFieldDescription: "Campo de destino a utilizar en este Web Part para que coincida con los valores seleccionados",
                AvailableFieldValuesFromResults: "Campo que contiene el valor del filtro"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configurar las bibliotecas de extensibilidad para que se carguen al inicio.",
                    PanelDescription: "Añada/elimine sus IDs de bibliotecas de extensibilidad personalizadas aquí. Puede especificar un nombre para mostrar y decidir si la biblioteca debe cargarse o no al inicio. Sólo se cargarán aquí las fuentes de datos personalizadas, los diseños, los componentes web y los elementos auxiliares de Handlebars.",
                },
                EnableTelemetryLabel: "Telemetría PnP",
                EnableTelemetryOn: "Activar la telemetría",
                EnableTelemetryOff: "Desactivar la telemetría"
            },
            CustomQueryModifier: {
                  EditQueryModifiersLabel: "Configurar los modificadores de consulta personalizados disponibles",
                  QueryModifiersLabel: "Modificadores de consulta personalizados",
                  QueryModifiersDescription: "Habilitar o deshabilitar modificadores de consulta personalizados individuales",
                  EnabledPropertyLabel: "Habilitado",
                  ModifierNamePropertyLabel: "Nombre",
                  ModifierDescriptionPropertyLabel: "Descripción",
                  EndWhenSuccessfullPropertyLabel:"Finalizar cuando se ha realizado con éxito"              
            }
        }
    }
});