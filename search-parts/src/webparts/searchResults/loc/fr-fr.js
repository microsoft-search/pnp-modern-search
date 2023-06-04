define([], function() {
  return {
    General: {
      PlaceHolder: {
            EditLabel: "Modifier",
            IconText: "Composant Web des résultats de recherche par @PnP",
            Description: "Affiche les résultats de la recherche dans SharePoint ou Microsoft.",
            ConfigureBtnLabel: "Configurer"
      },
      WebPartDefaultTitle: "Composant Web des résultats de recherche",
      ShowBlankEditInfoMessage: "Cette requête n’a donné aucun résultat. Ce composant Web doit demeurer vide en mode d’affichage en fonction des critères.",
      CurrentVerticalNotSelectedMessage: "Le secteur vertical sélectionné ne correspond pas à ce composant Web. Il doit demeurer vide en mode d’affichage."
    },
    PropertyPane: {
      DataSourcePage: {
            DataSourceConnectionGroupName: "Sources de données disponibles",
            PagingOptionsGroupName: "Options de pagination",
            ItemsCountPerPageFieldName: "Nombre d’éléments par page",
            PagingRangeFieldName: "Nombre de pages à afficher dans la série",
            ShowPagingFieldName: "Afficher la pagination",
            HidePageNumbersFieldName: "Masquer les numéros de page",
            HideNavigationFieldName: "Masquer les boutons de navigation (page précédente, page suivante)",
            HideFirstLastPagesFieldName: "Masquer les boutons de navigation (première, dernière)",
            HideDisabledFieldName: "Masquer les boutons de navigation (précédente, suivante, première, dernière) s’ils sont désactivés.",
        TemplateSlots: {
          GroupName: "Emplacements de la mise en page",
          ConfigureSlotsLabel: "Modifier les emplacements de la mise en page pour cette source de données",
          ConfigureSlotsBtnLabel: "Personnaliser",
          ConfigureSlotsPanelHeader: "Emplacements de la mise en page",
          ConfigureSlotsPanelDescription: "Ajoutez ici les emplacements à utiliser pour les différentes mises en page. Un emplacement est une variable d’espace réservé que vous ajoutez à vos modèles et dont la valeur sera remplacée de façon dynamique par une valeur de champ source de données. Ainsi, vos modèles deviendront plus génériques et réutilisables, peu importe les champs de la source des données. Pour les utiliser, utilisez l’expression entre accolades `{{slot item @root.slots.<SlotName>}}`.",
          SlotNameFieldName: "Nom de l’emplacement",
          SlotFieldFieldName: "Champ de l’emplacement",
          SlotFieldPlaceholderName: "Choisissez un champ"
        }
      },
      LayoutPage: {
        LayoutSelectionGroupName: "Mises en page disponibles",
        LayoutTemplateOptionsGroupName: "Options de mise en page",
        CommonOptionsGroupName: "Courantes",
        TemplateUrlFieldLabel: "Utiliser une adresse URL de modèle externe",
        TemplateUrlPlaceholder: "https://myfile.html",
        ErrorTemplateExtension: "Le modèle doit être un fichier .txt, .htm ou .html valide",
        ErrorTemplateResolve: "Impossible de résoudre le modèle indiqué. Renseignements sur l’erreur '{0}'",
        DialogButtonLabel: "Modifier le modèle de résultats",
        DialogTitle: "Modifier le modèle de résultats",
        ShowSelectedFilters: "Afficher les filtres sélectionnés",
        ShowBlankIfNoResult: "Masquer ce composant Web s’il n’y a rien à afficher",
        ShowResultsCount: "Afficher le nombre de résultats",
        UseMicrosoftGraphToolkit: "Utiliser la boîte à outils Microsoft Graph",
        HandlebarsRenderTypeLabel: "Handlebars/HTML",
        HandlebarsRenderTypeDesc: "Sélectionnez un affichage basé sur HTML, CSS and Handlebars",
        AdaptiveCardsRenderTypeLabel: "Cartes adaptatives",
        AdaptiveCardsRenderTypeDesc: "Sélectionnez un affichage basé sur des cartes adaptatives JSON",
        Handlebars: {
          UseMicrosoftGraphToolkit: "Use Microsoft Graph Toolkit",
          ResultTypes: {
            ResultTypeslabel: "Type de résultat",
            ResultTypesDescription: "Ajoutez ici les modèles à utiliser pour les éléments de résultat selon une ou plusieurs conditions supplémentaires. Les conditions sont évaluées dans l’ordre configuré et les modèles externes ont préséance sur les modèles intégrés. Assurez-vous également que les champs de la source des données que vous utilisez sont présents dans la réponse aux données.",
            InlineTemplateContentLabel: "Modèle intégré",
            EditResultTypesLabel: "Modifier les types de résultats",
            ConditionPropertyLabel: "Champ de source des données",
            ConditionValueLabel: "Valeur de la condition",
            CondtionOperatorValue: "Opérateur",
            ExternalUrlLabel: "URL du modèle externe",
            EqualOperator: "Égal à",
            NotEqualOperator: "N’est pas égal à",
            ContainsOperator: "Contient",
            StartsWithOperator: "Commence par",
            NotNullOperator: "N’est pas nul",
            GreaterOrEqualOperator: "Supérieur ou égal à",
            GreaterThanOperator: "Supérieur à",
            LessOrEqualOperator: "Inférieur ou égal à",
            LessThanOperator: "Inférieur à",
            CancelButtonText: "Annuler",
            DialogButtonLabel: "Modifier le modèle",
            DialogButtonText: "Modifier le modèle",
            DialogTitle: "Modifier le modèle de résultats",
            SaveButtonText: "Enregistrer",
          },
          AllowItemSelection: "Autoriser la sélection d'éléments",
          AllowMultipleItemSelection: "Autoriser la sélection multiple",
          SelectionModeLabel: "Mode de sélection",
          AsTokensSelectionMode: "Traiter les valeurs en tant que tokens (manuel)",
          AsDataFiltersSelectionMode: "Traiter les valeurs en tant que filtres (default)",
          AsDataFiltersDescription: "Dans ce mode, les éléments sélectionnés sont traités en tant que qu'affinements de recherche. Cela signifie que la propriété de destination doit être affinables dans le schéma de recherche.",
          AsTokensDescription: "Dans ce mode, les éléments sélectionnés sont traités manuellement en tant que tokens. Exemple avec la recherche SharePoint et le modèle de requête: {?Title:{filters.&lt;destination_field_name&gt;.valueAsText}}",
          FilterValuesOperator: "L'opérateur logique entre les valeurs sélectionnées",
          FieldToConsumeLabel: "Champ source à utiliser",
          FieldToConsumeDescription: "Utiliser la valeur de ce champ pour les éléments sélectionnés",
        },
        AdaptiveCards: {
            HostConfigFieldLabel: "Configuration de l'hôte"
        }  
      },
      ConnectionsPage: {
        ConnectionsPageGroupName: "Connexions disponibles",
        UseFiltersWebPartLabel: "Connexion à un composant Web des filtres",
        UseDynamicFilteringsWebPartLabel: "Se connecter à un WebPart de résultats",
        UseDataResultsFromComponentsLabel: "Utiliser les données de ce composant WebPart",
        UseDataResultsFromComponentsDescription: "Récupère les informations des éléments sélectionnés à partir de ce composant",
        UseFiltersFromComponentLabel: "Utiliser les filtres de cette composante",
        UseSearchVerticalsWebPartLabel: "Se connecter à composant Web des secteurs verticaux",
        UseSearchVerticalsFromComponentLabel: "Utiliser les secteurs verticaux de ce composant",
        LinkToVerticalLabel: "Afficher les données seulement lorsque le composant vertical suivant est sélectionné",
        LinkToVerticalLabelHoverMessage: "Les résultats s’afficheront seulement si le secteur vertical sélectionné correspond à celui configuré pour ce composant Web Sinon, le composant Web sera vide (aucune marge et aucun remplissage) en mode d’affichage.",
        UseInputQueryText: "Utiliser le texte de la requête",
        UseInputQueryTextHoverMessage: "Utilisez le jeton {inputQueryText} de votre source de données pour récupérer cette valeur",
        SearchQueryTextFieldLabel: "Texte de la requête",
        SearchQueryTextFieldDescription: "",
        SearchQueryPlaceHolderText: "Entrez le texte qui suit...",
        InputQueryTextStaticValue: "Valeur statique",
        InputQueryTextDynamicValue: "Valeur dynamique",
        SearchQueryTextUseDefaultQuery: "Utilisez une valeur par défaut",
        SearchQueryTextDefaultValue: "Valeur par défaut",
        SourceDestinationFieldLabel: "Champ de destination",
        SourceDestinationFieldDescription: "Champ de destination dans cette source à utiliser pour la correspondance des valeurs sélectionnées",
        AvailableFieldValuesFromResults: "Champ contenant la valeur de filtre"
      },
      InformationPage: {
        Extensibility: {
          PanelHeader: "Configurez les bibliothèques d’extensibilité pour qu’elles soient chargées au démarrage.",
          PanelDescription: "Ajoutez ou supprimez vos identifiants personnalisés de la bibliothèque d’extensibilités ici. Vous pouvez préciser un nom d’affichage et décider si la bibliothèque doit être téléchargée ou non au démarrage. Seuls les sources de données, les mises en page, les composants Web et les assistants d’expressions entre accolades personnalisés sont chargés ici.",
        },
        EnableTelemetryLabel: "Télémétrie PnP",
        EnableTelemetryOn: "Activer la télémétrie",
        EnableTelemetryOff: "Désactiver la télémétrie"
      },
      CustomQueryModifier: {
            EditQueryModifiersLabel: "Configurer les modificateurs de requête personnalisés disponibles",
            QueryModifiersLabel: "Modificateurs de requête personnalisés",
            QueryModifiersDescription: "Activez ou désactivez les modificateurs de requête personnalisés individuels.",
            EnabledPropertyLabel: "Activé",
            ModifierNamePropertyLabel: "Nom",
            ModifierDescriptionPropertyLabel: "Description",
            EndWhenSuccessfullPropertyLabel:"Fin en cas de succès"        
      }
    }
  }
});