define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Web Part de verticales de búsqueda",
        PlaceHolder: {
          EditLabel: "Editar",
          IconText: "Web Part de verticales de búsqueda de @pnp",
          Description: "Permite navegar por los datos en forma de verticales (es decir, silos). Este Web Part está pensado para estar conectado a Web Parts de 'Resultados de búsqueda' en la página.",
          ConfigureBtnLabel: "Configurar"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Configuración de los verticales de búsqueda",
        Verticals: {
          PropertyLabel: "Verticales de búsqueda",
          PanelHeader: "Configurar las verticales de búsqueda",
          PanelDescription: "Añade una nueva vertical para permitir a los usuarios buscar en un ámbito o fuente de datos predefinidos. Para utilizarla, debe conectar este Web Part a uno o más Web Parts de 'Resultados de búsqueda', ya que las verticales controlan la visibilidad de los componentes conectados.",
          ButtonLabel: "Configurar las verticales",
          DefaultVerticalQueryStringParamLabel: "Parámetro de cadena de consulta que se utilizará para seleccionar una pestaña vertical por defecto",
          DefaultVerticalQueryStringParamDescription: "La coincidencia se hará con el nombre de la pestaña o la URL de la página actual (si la pestaña es un hipervínculo)",
          Fields: {
            TabName: "Nombre de la pestaña",
            TabValue: "Valor de la pestaña",
            IconName: "Nombre del icono de Fluent UI",
            IsLink: "Es un hipervínculo",
            LinkUrl: "Enlace URL",
            ShowLinkIcon: "Mostrar icono de enlace",
            OpenBehavior: "Comportamiento de apertura"
          }
        }
      }
    }
  });