define([], function() {
    return {
      General: {
        WebPartDefaultTitle: "Web Part Verticaux de données",
        PlaceHolder: {
          EditLabel: "Editer",
          IconText: "WebPart Verticaux de données par @pnp",
          Description: "Permet de parcourir les données sous forme de verticales (c.-à-d. Silos). Ce composant WebPart est destiné à être connecté aux composants WebPart «Visualiseur de données» sur la page.",
          ConfigureBtnLabel: "Configurer"
        }
      },
      PropertyPane: {
        SearchVerticalsGroupName: "Configuration pour Verticaux de données",
        Verticals: {
          PropertyLabel: "Verticaux de données",
          PanelHeader: "Configurer les verticales de données",
          PanelDescription: "Ajoutez un nouveau secteur vertical pour permettre aux utilisateurs de rechercher dans une étendue ou une source de données prédéfinie. Pour l'utiliser, vous devez connecter ce composant WebPart à un ou plusieurs composants WebPart «Visualiseur de données», car les secteurs verticaux contrôlent la visibilité des composants connectés.",
          ButtonLabel: "Configurer les verticales",
          DefaultVerticalQueryStringParamLabel: "Paramètre de requête à utiliser pour sélectionner un onglet vertical par défaut",
          DefaultVerticalQueryStringParamDescription: "La correspondance sera faite avec le nom de l'onglet ou l'URL de la page actuelle (si l'onglet est un lien hypertexte)",
          Fields: {
            TabName: "Nom de l'onglet",
            TabValue: "Valeur de l'onglet",
            IconName: "Nom de l'icône Fluent UI",
            IsLink: "Est un hyperlien",
            LinkUrl: "URL du lien",
            ShowLinkIcon: "Afficher l'icône de lien",
            OpenBehavior: "Comportement à l'ouverture"
          }
        }
      }
    }
  });