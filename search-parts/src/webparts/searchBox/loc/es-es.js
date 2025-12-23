define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Consulta de búsqueda"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Configuración del cuadro de búsqueda",
                PlaceholderTextLabel: "Texto del marcador de posición que se mostrará en el cuadro de búsqueda",
                SearchInNewPageLabel: "Enviar la consulta a una nueva página",
                ReQueryOnClearLabel: "Restablecer consulta en claro",
                PageUrlLabel: "URL de la página",
                UrlErrorMessage: "Por favor, proporcione una URL válida.",
                QueryPathBehaviorLabel: "Método",
                QueryInputTransformationLabel: "Plantilla de transformación de entrada de la consulta",
                UrlFragmentQueryPathBehavior: "Fragmento URL",
                QueryStringQueryPathBehavior: "Parámetro de la cadena de consulta",
                QueryStringParameterName: "Nombre del parámetro",
                QueryParameterNotEmpty: "Por favor, proporcione un valor para el parámetro."
            },
            SearchBoxStylingGroup: {
                GroupName: "Estilo del cuadro de búsqueda",
                BorderColorLabel: "Color del borde",
                BorderRadiusLabel: "Radio del borde (px)",
                HeightLabel: "Altura (px)",
                FontSizeLabel: "Tamaño de fuente (px)",
                ButtonColorLabel: "Color del botón de búsqueda",
                PlaceholderTextColorLabel: "Color del texto del marcador de posición",
                BackgroundColorLabel: "Color de fondo",
                TextColorLabel: "Color del texto",
                ShowSearchButtonWhenEmptyLabel: "Mostrar botón de búsqueda cuando el campo esté vacío",
                ShowSearchButtonWhenEmptyDescription: "Mostrar el botón de búsqueda cuando el campo de entrada de búsqueda esté vacío",
                SearchButtonDisplayModeLabel: "Visualización del botón de búsqueda",
                SearchIconNameLabel: "Nombre del icono de búsqueda",
                SearchIconNameDescription: "Nombre del icono de Fluent UI (ej: Search, Forward, ChevronRight)",
                SearchButtonTextLabel: "Texto del botón de búsqueda",
                ResetToDefaultLabel: "Restablecer estilo por defecto",
                ResetToDefaultDescription: "Restablecer todas las opciones de estilo a sus valores por defecto",
                ResetTitleStylingLabel: "Restablecer estilo del título por defecto",
                ResetTitleStylingDescription: "Restablecer todas las opciones de estilo del título a sus valores por defecto"
            },
            AvailableConnectionsGroup: {
                GroupName: "Conexiones disponibles",
                UseDynamicDataSourceLabel: "Utilizar la fuente de datos dinámica como entrada por defecto",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Sugerencias de consulta",
                EnableQuerySuggestions: "Activar las sugerencias de consulta",
                EditSuggestionProvidersLabel: "Configurar los proveedores disponibles",
                SuggestionProvidersLabel: "Proveedores de sugerencias",
                SuggestionProvidersDescription: "Activar o desactivar los proveedores de sugerencias individuales.",
                EnabledPropertyLabel: "Activado",
                ProviderNamePropertyLabel: "Nombre",
                ProviderDescriptionPropertyLabel: "Descripción",
                DefaultSuggestionGroupName: "Recomendado",
                NumberOfSuggestionsToShow: "Número de sugerencias a mostrar por grupo"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configurar las bibliotecas de extensibilidad para que se carguen al inicio para los proveedores de sugerencias personalizadas",
                    PanelDescription: "Añada/elimine sus IDs de bibliotecas de extensibilidad personalizadas aquí. Puede especificar un nombre de visualización y decidir si la biblioteca debe cargarse o no al inicio. Aquí sólo se cargarán los proveedores de sugerencias personalizados.",
                }
            },
            
        },
        SearchBox: {
            DefaultPlaceholder: "Introduzca sus términos de búsqueda...",
            SearchButtonLabel: "Buscar"
        }
    }
});
