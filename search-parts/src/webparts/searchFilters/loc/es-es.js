define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Editar",
                IconText: "Filtros de búsqueda por @PnP",
                Description: "Muestra los filtros de una Parte Web de resultados de búsqueda conectada",
                ConfigureBtnLabel: "Configura"
            },
            NoAvailableFilterMessage: "No hay filtro disponible para mostrar.",
            WebPartDefaultTitle: "Parte Web de filtros de búsqueda"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Conectar con una Parte Web de resultados de datos",
                UseDataResultsFromComponentsLabel: "Utilizar los datos de estas Parte Web",
                UseDataResultsFromComponentsDescription: "Si conecta más de una Parte Web, los valores y recuentos de los filtros se fusionarán para nombres de filtros similares.",
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Configuración de los filtros",
                FilterOperator: "Operador a utilizar entre filtros"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Seleccionar campo",
                FilterNameLabel: "Campo de filtrado",
                FilterDisplayName: "Visualizar nombre",
                FilterTemplate: "Plantilla",
                FilterExpandByDefault: "Expandir por defecto",
                FilterType: "Tipo de filtro",
                FilterTypeRefiner: "Esta plantilla de filtro actúa como un refinador y recibe / envía valores disponibles / seleccionados desde / hacia la fuente de datos conectada.",
                FilterTypeStaticFilter: "Esta plantilla de filtro actúa como un filtro estático y sólo envía valores seleccionados arbitrariamente a la fuente de datos conectada. Los valores entrantes del filtro no se tienen en cuenta.",
                CustomizeFiltersBtnLabel: "Editar",
                CustomizeFiltersHeader: "Editar filtros",
                CustomizeFiltersDescription: "Configure los filtros de búsqueda añadiendo o eliminando filas. Puede seleccionar campos de los resultados de la fuente de datos (si ya están seleccionados) o utilizar valores estáticos para los filtros.",
                CustomizeFiltersFieldLabel: "Personalizar los filtros",
                ShowCount: "Mostrar el recuento",
                Operator: "Operador entre valores",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Multivalor",
                Templates: {
                    CheckBoxTemplate: "Marcar casilla",
                    DateRangeTemplate: "Rango de fechas",
                    ComboBoxTemplate: "Cuadro combinado",
                    DateIntervalTemplate: "Intervalo de fechas",
                    TaxonomyPickerTemplate: "Selector de taxonomía"
                },
                SortBy: "Ordenar valores por",
                SortDirection: "Ordenar dirección",
                SortByName: "Por nombre",
                SortByCount: "Por recuento",
                SortAscending: "Ascendiendo",
                SortDescending: "Descendiendo"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Diseños disponibles",
                LayoutTemplateOptionsGroupName: "Opciones de diseño",
                TemplateUrlFieldLabel: "Utilice una URL de plantilla externa",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "La plantilla debe ser un archivo .htm o .html válido",
                ErrorTemplateResolve: "No se ha podido resolver la plantilla especificada. Detalles del error: '{0}'",
                FiltersTemplateFieldLabel: "Editar plantilla de filtros",
                FiltersTemplatePanelHeader: "Editar plantilla de filtros"
            }
        }
    }
});