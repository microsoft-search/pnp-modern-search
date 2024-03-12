define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Editar",
                IconText: "Filtros de búsqueda por @PnP",
                Description: "Muestra los filtros de un Web Part de resultados de búsqueda conectado",
                ConfigureBtnLabel: "Configurar"
            },
            NoAvailableFilterMessage: "No hay ningún filtro disponible para mostrar.",
            WebPartDefaultTitle: "Web Part de filtros de búsqueda"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Conectar con un Web Part de resultados de búsqueda",
                UseDataResultsFromComponentsLabel: "Utilizar los datos de estos Web Parts",
                UseDataResultsFromComponentsDescription: "Si conecta más de un Web Part, los valores de los filtros y los recuentos se fusionarán para nombres de filtros similares.",
                LinkToVerticalLabel: "Muestra los filtros sólo cuando se seleccionan las siguientes verticales",
                LinkToVerticalLabelHoverMessage: "Los filtros se mostrarán sólo si la vertical seleccionada coincide con las configuradas para este Web Part. De lo contrario, el Web Part estará en blanco (sin margen y sin relleno) en el modo de visualización."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Configuración de los filtros",
                FilterOperator: "Operador a utilizar entre filtros"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Seleccionar campo",
                FilterNameLabel: "Campo de filtrado",
                FilterMaxBuckets: "# de valores",
                FilterDisplayName: "Nombre para mostrar",
                FilterTemplate: "Plantilla",
                FilterExpandByDefault: "Expandir por defecto",
                FilterType: "Tipo de filtro",
                FilterTypeRefiner: "Esta plantilla de filtro actúa como un refinador y recibe/envía valores disponibles/seleccionados desde/a la fuente de datos conectada.",
                FilterTypeStaticFilter: "Esta plantilla de filtro actúa como un filtro estático y sólo envía valores seleccionados arbitrariamente a la fuente de datos conectada. Los valores entrantes del filtro no se tienen en cuenta.",
                CustomizeFiltersBtnLabel: "Editar",
                CustomizeFiltersHeader: "Editar filtros",
                CustomizeFiltersDescription: "Configure los filtros de búsqueda añadiendo o eliminando filas. Puede seleccionar campos de los resultados de la fuente de datos (si ya están seleccionados) o utilizar valores estáticos para los filtros.",
                CustomizeFiltersFieldLabel: "Personalizar los filtros",
                ShowCount: "Mostrar el recuento",
                Operator: "Operador entre valores",
                ANDOperator: "Y",
                OROperator: "O",
                IsMulti: "Valores múltiples",
                Templates: {
                    CheckBoxTemplate: "Casilla de verificación",
                    DateRangeTemplate: "Rango de fechas",
                    ComboBoxTemplate: "Caja combo",
                    DateIntervalTemplate: "Intervalo de fechas",
                    TaxonomyPickerTemplate: "Selector de taxonomía"
                },
                SortBy: "Ordenar los valores por",
                SortDirection: "Dirección de ordenación",
                SortByName: "Por nombre",
                SortByCount: "Por el recuento",
                SortAscending: "Ascendente",
                SortDescending: "Descendente"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Diseños disponibles",
                LayoutTemplateOptionsGroupName: "Opciones de diseño",
                TemplateUrlFieldLabel: "Utilizar una URL de plantilla externa",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "La plantilla debe ser un archivo .txt, .htm o .html válido",
                ErrorTemplateResolve: "No se ha podido resolver la plantilla especificada. Detalles del error: '{0}'",
                FiltersTemplateFieldLabel: "Editar plantilla de filtros",
                FiltersTemplatePanelHeader: "Editar plantilla de filtros"
            }
        }
    }
});