define([], function () {
  return {
    SearchVerticalsGroupName: "Configuración de verticales de búsqueda",
    PlaceHolderEditLabel: "Editar",
    PlaceHolderConfigureBtnLabel: "Configurar",
    PlaceHolderIconText: "Buscar elemento Web de verticals",
    PlaceHolderDescription: "Este componente le permite buscar dentro de los ámbitos (verticales)",
    SameTabOpenBehavior: "Usar la pestaña actual",
    NewTabOpenBehavior: "Abrir en una nueva pestaña",
    PageOpenBehaviorLabel: "Comportamiento de apertura",
    PropertyPane: {
      Verticals: {
        PropertyLabel: "Verticales de Búsqueda",
        PanelHeader: "Configurar Verticales de Búsqueda",
        PanelDescription: "Agregue una nueva vertical para permitir a los usuarios buscar en un ámbito predefinido.",
        ButtonLabel: "Configurar",
        FieldValidationErrorMessage: "este campo es requerido",
        Fields: {
          TabName: "Nombre de Etiqueta",
          QueryTemplate: "Plantilla de Consulta",
          ResultSource: "Identificador de origen de resultados",
          IconName: "Nombre de icono de Office UI Fabric",
          IsLink: "Es enlace",
          LinkUrl: "URL del enlace",
          OpenBehavior: "Comportamiento de apertura"
        }
      },
      ShowCounts: {
        PropertyLabel: "Mostrar el contador de resultados"
      },
      DefaultVerticalQuerystringParam: {
        PropertyLabel: "Parámetro de querystring vertical predeterminado"
      },
      SearchResultsDataSource: {
        PropertyLabel: "Conectar con Web Part de Resultados de Búsqueda"
      }
    }
  }
});