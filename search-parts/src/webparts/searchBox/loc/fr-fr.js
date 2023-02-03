define([], function() {
    return {
        General: {
            DynamicPropertyDefinition: "Requête de recherche"
        },
        PropertyPane: {
            SearchBoxSettingsGroup: {
                GroupName: "Recherche des paramètres de la zone",
                PlaceholderTextLabel: "Texte de l’espace réservé à afficher dans la zone de recherche",
                SearchInNewPageLabel: "Envoyer la requête vers une nouvelle page",
                ReQueryOnClearLabel: "Réinitialiser la requête en cas d'effacement",
                PageUrlLabel: "Adresse URL de la page",
                UrlErrorMessage: "Entrez une adresse URL valide",
                QueryPathBehaviorLabel: "Méthode",
                QueryInputTransformationLabel: "Modèle de transformation de la saisie de requêtes",
                UrlFragmentQueryPathBehavior: "Fragment d’URL",
                QueryStringQueryPathBehavior: "Paramètres de la chaîne de requête",
                QueryStringParameterName: "Nom du paramètre",
                QueryParameterNotEmpty: "Veuillez fournir une valeur pour le critère"
            },
            AvailableConnectionsGroup: {
                GroupName: "Connexions disponibles",
                UseDynamicDataSourceLabel: "Utiliser la source de données dynamique comme entrée par défaut",
                QueryKeywordsPropertyLabel: ""
            },
            QuerySuggestionsGroup: {
                GroupName: "Suggestions de requête",
                EnableQuerySuggestions: "Activer les suggestions de requête",
                EditSuggestionProvidersLabel: "Configurer les fournisseurs disponibles",
                SuggestionProvidersLabel: "Fournisseurs de suggestions",
                SuggestionProvidersDescription: "Activez ou désactivez chaque fournisseur de suggestions",
                EnabledPropertyLabel: "Activé",
                ProviderNamePropertyLabel: "Nom",
                ProviderDescriptionPropertyLabel: "Description",
                DefaultSuggestionGroupName: "Recommandation",
                NumberOfSuggestionsToShow: "Nombre de suggestions à afficher par groupe"
            },
            InformationPage: {
                Extensibility: {
                    PanelHeader: "Configurer les bibliothèques d’extensibilité pour qu’elles soient téléchargées au démarrage pour les fournisseurs de suggestions personnalisées",
                    PanelDescription: "Ajoutez ou supprimez vos identifiants personnalisés de la bibliothèque d’extensibilités ici. Vous pouvez préciser un nom d’affichage et décider si la bibliothèque doit être téléchargée ou non au démarrage. Seuls les fournisseurs de suggestions personnalisées seront chargés ici.",
                }
            }
        },
        SearchBox: {
            DefaultPlaceholder: "Entrez les critères de recherche…",
            SearchButtonLabel: "Chercher"
        }
    }
});
