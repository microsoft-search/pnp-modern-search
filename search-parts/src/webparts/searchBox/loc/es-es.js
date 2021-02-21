define([], function() {
    return {
      General: {
        DynamicPropertyDefinition: "Consulta de búsqueda"
      },
      PropertyPane: {
        SearchBoxSettingsGroup: {
          GroupName: "Configuración del cuadro de búsqueda",
          PlaceholderTextLabel: "Texto del marcador de posición para mostrar en el cuadro de búsqueda",
          SearchInNewPageLabel: "Enviar la consulta a una nueva página",
          PageUrlLabel: "URL de la página",
          UrlErrorMessage: "Por favor, proporcione una URL válida.",
          QueryPathBehaviorLabel: "Método",
          UrlFragmentQueryPathBehavior: "Fragmento de URL",
          QueryStringQueryPathBehavior: "Parámetro de la cadena de consulta",
          QueryStringParameterName: "Nombre del parámetro",
          QueryParameterNotEmpty: "Proporcione un valor para el parámetro."
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
          SuggestionProvidersDescription: "Activar o desactivar proveedores de sugerencias individuales.",
          EnabledPropertyLabel: "Habilitado",
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
        }
      },
      SearchBox: {
        DefaultPlaceholder: "Introduzca los términos de búsqueda..."
      }
    }
  });