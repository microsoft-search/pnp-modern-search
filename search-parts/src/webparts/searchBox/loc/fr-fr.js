define([], function() {
    return {
      General: {
        DynamicPropertyDefinition: "Requête de recherche"
      },
      PropertyPane: {
        SearchBoxSettingsGroup: {
          GroupName: "Paramètres de la boîte de recherche",
          PlaceholderTextLabel: "Texte de remplacement à afficher dans la boîte de recherche",
          SearchInNewPageLabel: "Envoyer la requête à une nouvelle page",
          PageUrlLabel: "URL de la page",
          UrlErrorMessage: "Veuillez fournir une URL valide.",
          QueryPathBehaviorLabel: "Méthode",
          UrlFragmentQueryPathBehavior: "Fragment d'URL",
          QueryStringQueryPathBehavior: "Paramètre de la chaîne d'interrogation",
          QueryStringParameterName: "Nom du paramètre",
          QueryParameterNotEmpty: "Veuillez fournir une valeur pour le paramètre."
        },
        AvailableConnectionsGroup: {
          GroupName: "Connexions disponibles",
          UseDynamicDataSourceLabel: "Utiliser une source de données dynamique comme entrée par défaut",
          QueryKeywordsPropertyLabel: ""
        },
        QuerySuggestionsGroup: {
          GroupName: "Suggestions de requête",
          EnableQuerySuggestions: "Activer les suggestions d'interrogation",
          EditSuggestionProvidersLabel: "Configurer les fournisseurs disponibles",
          SuggestionProvidersLabel: "Fournisseurs de suggestions",
          SuggestionProvidersDescription: "Activer ou désactiver les fournisseurs de suggestions individuelles.",
          EnabledPropertyLabel: "Activé",
          ProviderNamePropertyLabel: "Nom",
          ProviderDescriptionPropertyLabel: "Description",
          DefaultSuggestionGroupName: "Recommandé",
          NumberOfSuggestionsToShow: "Nombre de suggestions à présenter par groupe"
        },
        InformationPage: {
          Extensibility: {
            PanelHeader: "Configurer les bibliothèques d'extensibilité à charger au démarrage pour les fournisseurs de suggestions personnalisées",
            PanelDescription: "Ajoutez/supprimez ici vos identifiants de bibliothèque d'extensibilité personnalisés. Vous pouvez spécifier un nom d'affichage et décider si la bibliothèque doit être chargée ou non au démarrage. Seuls les fournisseurs de suggestions personnalisées seront chargés ici.",
          }
        }
      },
      SearchBox: {
        DefaultPlaceholder: "Entrez vos termes de recherche..."
      }
    }
  });