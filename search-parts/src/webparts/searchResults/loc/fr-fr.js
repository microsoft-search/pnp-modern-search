define([], function() {
    return {
      General: {
        PlaceHolder: {
          EditLabel: "Éditer",
          IconText: "Résultats de la recherche Web Part by @PnP",
          Description: "Affiche les résultats de la recherche SharePoint ou Microsoft.",
          ConfigureBtnLabel: "Configurer"
        },
        WebPartDefaultTitle: "Web Part de Recherche",
        ShowBlankEditInfoMessage: "Aucun résultat n'a été obtenu pour cette requête. Ce Web Part restera vide en mode d'affichage selon les paramètres.",
        CurrentVerticalNotSelectedMessage: "La verticale sélectionnée actuellement ne correspond pas à celle associée pour cette Web Part. Elle reste vide en mode d'affichage."
      },
      PropertyPane: {
        DataSourcePage: {
          DataSourceConnectionGroupName: "Sources de données disponibles",
          PagingOptionsGroupName: "Options de pagination",
          ItemsCountPerPageFieldName: "Nombre d'éléments par page",
          PagingRangeFieldName: "Nombre de pages à afficher dans la gamme",
          ShowPagingFieldName: "Afficher la pagination",
          HidePageNumbersFieldName: "Cacher les numéros de page",
          HideNavigationFieldName: "Cacher les boutons de navigation (page précédente, page suivante)",
          HideFirstLastPagesFieldName: "Cacher les premiers/derniers boutons de navigation",
          HideDisabledFieldName: "Cacher les boutons de navigation (précédent, suivant, premier, dernier) s'ils sont désactivés.",
          TemplateSlots: {
            GroupName: "Fentes des Disposition",
            ConfigureSlotsLabel: "Éditer les emplacements de mise en page pour cette source de données",
            ConfigureSlotsBtnLabel: "Personnaliser",
            ConfigureSlotsPanelHeader: "Fentes des Disposition",
            ConfigureSlotsPanelDescription: "Ajoutez ici les fentes à utiliser pour les différentes mises en page. Un fente est une variable placeholder que vous mettez dans vos modèles et dont la valeur sera remplacée dynamiquement par celle d'un champ de source de données. De cette façon, vos modèles deviennent plus génériques et réutilisables, quels que soient les champs spécifiques de la source de données. Pour les utiliser, utilisez l'expression `{{slot item @root.slots.<SlotName>}}` Handlebars.",
            SlotNameFieldName: "Nom de la fente",
            SlotFieldFieldName: "Champ de la fente",
            SlotFieldPlaceholderName: "Choisissez un champ"
          }
        },
        LayoutPage: {
          LayoutSelectionGroupName: "Mises en page disponibles",
          LayoutTemplateOptionsGroupName: "Options de mise en page",
          CommonOptionsGroupName: "Commun",
          TemplateUrlFieldLabel: "Utiliser un URL modèle externe",
          TemplateUrlPlaceholder: "https://myfile.html",
          ErrorTemplateExtension: "Le file modèle doit être un fichier .htm ou .html valide",
          ErrorTemplateResolve: "Impossible de résoudre le modèle spécifié. Détails de l'erreur : '{0}'",
          DialogButtonLabel: "Éditer modèle de résultats",
          DialogTitle: "Éditer modèle de résultats",
          ShowSelectedFilters: "Afficher les filtres sélectionnés",
          ShowBlankIfNoResult: "Cachez cette partie du site s'il n'y a rien à montrer",
          ShowResultsCount: "Afficher le nombre de résultats",
          UseMicrosoftGraphToolkit: "Utiliser boîte à outils Microsoft Graph",
          ResultTypes: {
            ResultTypeslabel: "Types de résultats",
            ResultTypesDescription: "Ajoutez ici les modèles à utiliser pour les éléments de résultat selon une ou plusieurs conditions. Les conditions sont évaluées dans l'ordre configuré et les modèles externes ont la priorité sur les modèles en ligne. Assurez-vous également que les champs de source de données que vous utilisez sont présents dans la réponse.",
            InlineTemplateContentLabel: "Contenu du modèle",
            EditResultTypesLabel: "Éditer les types de résultats",
            ConditionPropertyLabel: "Champ de la source de données",
            ConditionValueLabel: "Valeur de la condition",
            CondtionOperatorValue: "Opérateur",
            ExternalUrlLabel: "URL du template externe",
            EqualOperator: "Égal",
            NotEqualOperator: "N'est pas égal",
            ContainsOperator: "Contient",
            StartsWithOperator: "Commence par",
            NotNullOperator: "N'est pas nul",
            GreaterOrEqualOperator: "Supérieur ou égal",
            GreaterThanOperator: "Supérieur à",
            LessOrEqualOperator: "Inférieur ou égal",
            LessThanOperator: "Inférieur",
            CancelButtonText: "Annuler",
            DialogButtonLabel: "Éditer le modèle",
            DialogButtonText: "Éditer le modèle",
            DialogTitle: "Éditer le modèle de résulat",
            SaveButtonText: "Enregistrer"
          }
        },
        ConnectionsPage: {
          ConnectionsPageGroupName: "Connexions disponibles",
          UseFiltersWebPartLabel: "Se connecter à un Web Part du filtre ",
          UseFiltersFromComponentLabel: "Utilisez les filtres de ce composant",
          UseSearchVerticalsWebPartLabel: "Se connecter à un composant Web Part vertical",
          UseSearchVerticalsFromComponentLabel: "Utilisez les verticales de ce composant",
          LinkToVerticalLabel: "Afficher les données uniquement lorsque cette verticale est sélectionnée",
          LinkToVerticalLabelHoverMessage: "Les résultats ne seront affichés que si la verticale sélectionnée correspond à celle configurée pour cette Web Part. Dans le cas contraire, la partie web sera vide (pas de marge et pas de remplissage) en mode d'affichage.",
          UseInputQueryText: "Utiliser le texte de la requête d'entrée",
          UseInputQueryTextHoverMessage: "Utilisez le jeton {searchQueryText} dans votre source de données pour récupérer cette valeur",
          SearchQueryTextFieldLabel: "Texte de la requête",
          SearchQueryTextFieldDescription: "",
          SearchQueryPlaceHolderText: "Entrez le texte de la requête...",
          InputQueryTextStaticValue: "Valeur statique",
          InputQueryTextDynamicValue: "Valeur dynamique",
          SearchQueryTextUseDefaultQuery: "Utiliser une valeur par défaut",
          SearchQueryTextDefaultValue: "Valeur par défaut"
        },
        InformationPage: {
          Extensibility: {
            PanelHeader: "Configurer les bibliothèques d'extensibilité à charger au démarrage.",
            PanelDescription: "Ajoutez/supprimez ici vos identifiants de bibliothèque d'extensibilité personnalisés. Vous pouvez spécifier un nom d'affichage et décider si la bibliothèque doit être chargée ou non au démarrage. Seules les sources de données personnalisées, les mises en page, les composants web et les aides au guidon seront chargés ici.",
          }
        }
      }
    }
  });