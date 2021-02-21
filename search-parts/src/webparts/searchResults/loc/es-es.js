define([], function() {
    return {
      General: {
        PlaceHolder: {
          EditLabel: "Editar",
          IconText: "Parte Web de resultados de búsqueda por @PnP",
          Description: "Muestra los resultados de la búsqueda en SharePoint o en la búsqueda de Microsoft.",
          ConfigureBtnLabel: "Configura"
        },
        WebPartDefaultTitle: "Parte Web de Resultados de Búsqueda",
        ShowBlankEditInfoMessage: "No se devuelve ningún resultado para esta consulta. Esta Parte Web permanecerá en blanco en el modo de visualización según los parámetros.",
        CurrentVerticalNotSelectedMessage: "La vertical seleccionada actualmente no coincide con la asociada a esta Parte Web. Permanecerá en blanco en el modo de visualización."
      },
      PropertyPane: {
        DataSourcePage: {
          DataSourceConnectionGroupName: "Fuentes de datos disponibles",
          PagingOptionsGroupName: "Opciones de paginación",
          ItemsCountPerPageFieldName: "Número de elementos por página",
          PagingRangeFieldName: "Número de páginas a mostrar en el rango",
          ShowPagingFieldName: "Mostrar paginación",
          HidePageNumbersFieldName: "Ocultar números de página",
          HideNavigationFieldName: "Ocultar botones de navegación (página anterior, página siguiente)",
          HideFirstLastPagesFieldName: "Ocultar los botones de navegación primero/último",
          HideDisabledFieldName: "Ocultar los botones de navegación (prev, next, first, last) si están desactivados.",
          TemplateSlots: {
            GroupName: "Ranuras de distribución",
            ConfigureSlotsLabel: "Editar ranuras de diseño para esta fuente de datos",
            ConfigureSlotsBtnLabel: "Personalizar",
            ConfigureSlotsPanelHeader: "Ranuras de distribución",
            ConfigureSlotsPanelDescription: "Añada aquí las ranuras que se utilizarán para los diferentes diseños. Una ranura es una variable de marcador de posición que usted pone en sus plantillas donde el valor será sustituido dinámicamente por un valor de campo de la fuente de datos. De esta manera, sus plantillas se vuelven más genéricas y reutilizables independientemente de los campos específicos de la fuente de datos. Para usarlas, utilice la expresión de las barras de control `{{slot item @root.slots.<SlotName>}}`.",
            SlotNameFieldName: "Nombre de la ranura",
            SlotFieldFieldName: "Campo de la ranura",
            SlotFieldPlaceholderName: "Elija un campo"
          }
        },
        LayoutPage: {
          LayoutSelectionGroupName: "Diseños disponibles",
          LayoutTemplateOptionsGroupName: "Opciones de diseño",
          CommonOptionsGroupName: "Común",
          TemplateUrlFieldLabel: "Utilice una URL de plantilla externa",
          TemplateUrlPlaceholder: "https://myfile.html",
          ErrorTemplateExtension: "La plantilla debe ser un archivo .htm o .html válido",
          ErrorTemplateResolve: "No se ha podido resolver la plantilla especificada. Detalles del error: '{0}'",
          DialogButtonLabel: "Editar plantilla de resultados",
          DialogTitle: "Editar plantilla de resultados",
          ShowSelectedFilters: "Mostrar los filtros seleccionados",
          ShowBlankIfNoResult: "Ocultar esta Parte Web si no hay nada que mostrar",
          ShowResultsCount: "Mostrar el contador de resultados",
          UseMicrosoftGraphToolkit: "Utilizar Microsoft Graph Toolkit",
          ResultTypes: {
            ResultTypeslabel: "Tipos de resultado",
            ResultTypesDescription: "Añada aquí las plantillas que se utilizarán para los elementos de resultado según una o varias condiciones. Las condiciones se evalúan en el orden configurado y las plantillas externas tienen prioridad sobre las plantillas en línea. Asegúrese también de que los campos de la fuente de datos que utiliza están presentes en la respuesta de datos.",
            InlineTemplateContentLabel: "Inline template",
            EditResultTypesLabel: "Editar tipos de resultado",
            ConditionPropertyLabel: "Campo de la fuente de datos",
            ConditionValueLabel: "Valo de condición",
            CondtionOperatorValue: "Operador",
            ExternalUrlLabel: "URL de plantilla externa",
            EqualOperator: "Iguales",
            NotEqualOperator: "No iguales",
            ContainsOperator: "Contiene",
            StartsWithOperator: "Empieza por",
            NotNullOperator: "No es nulo",
            GreaterOrEqualOperator: "Mayor o igual",
            GreaterThanOperator: "Mayor que",
            LessOrEqualOperator: "Menor o igual",
            LessThanOperator: "Menos que",
            CancelButtonText: "Cancelar",
            DialogButtonLabel: "Editar plantilla",
            DialogButtonText: "Editar plantilla",
            DialogTitle: "Editar plantilla de resultados",
            SaveButtonText: "Guardar"
          }
        },
        ConnectionsPage: {
          ConnectionsPageGroupName: "Conexiones disponibles",
          UseFiltersWebPartLabel: "Conectar con una Parte Web de filtros",
          UseFiltersFromComponentLabel: "Utilizar los filtros de este componente",
          UseSearchVerticalsWebPartLabel: "Conectarse a una Parte Web vertical",
          UseSearchVerticalsFromComponentLabel: "Utilizar las verticales de este componente",
          LinkToVerticalLabel: "Mostrar datos solo cuando se selecciona esta vertical",
          LinkToVerticalLabelHoverMessage: "Los resultados solo se mostrarán si la vertical seleccionada corresponde a la configurada para este Parte Web. De lo contrario, el Parte Web estará vacío (sin márgenes ni relleno) en el modo de visualización.",
          UseInputQueryText: "Utilizar el texto de la consulta de entrada",
          UseInputQueryTextHoverMessage: "Utilice el token {searchQueryText} en su fuente de datos para recuperar este valor",
          SearchQueryTextFieldLabel: "Texto de la consulta",
          SearchQueryTextFieldDescription: "",
          SearchQueryPlaceHolderText: "Ingrese el texto de la consulta...",
          InputQueryTextStaticValue: "Valor estático",
          InputQueryTextDynamicValue: "Valor dinámico",
          SearchQueryTextUseDefaultQuery: "Usar un valor predeterminado",
          SearchQueryTextDefaultValue: "Valor por defecto"
        },
        InformationPage: {
          Extensibility: {
            PanelHeader: "Configure las bibliotecas de extensibilidad para que se carguen al inicio.",
            PanelDescription: "Agregue / elimine sus credenciales de biblioteca de extensibilidad personalizada aquí. Puede especificar un nombre para mostrar y decidir si la biblioteca debe cargarse al inicio o no. Aquí solo se cargarán fuentes de datos personalizadas, diseños, componentes web y ayudas para el manillar.",
          }
        }
      }
    }
  });