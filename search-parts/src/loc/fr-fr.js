define([], function() {
    return {
        Tokens: {
          SelectTokenLabel: "Sélectionnez un jeton...",
          Context: {
            ContextTokensGroupName: "Jetons de contexte",
            SiteAbsoluteUrl: "URL absolue du site",
            SiteRelativeUrl: "URL relative du serveur du site",
            WebAbsoluteUrl: "URL absolue du Web",
            WebRelativeUrl: "URL relative du serveur web",
            WebTitle: "Titre du site web",
            InputQueryText: "Saisir le texte de la requête"
          },
          Custom: {
            CustomTokensGroupName: "Valeur personnalisée",
            CustomValuePlaceholder: "Entrez une valeur...",
            InvalidtokenFormatErrorMessage: "Veuillez saisir un format de jeton pris en charge en utilisant les caractères '{' et '}'. (ex : {Today})"
          },
          Date: {
            DateTokensGroupName: "Jetons de date",
            Today: "Aujourd'hui",
            Yesterday: "Hier",
            Tomorrow: "Demain",
            OneWeekAgo: "Semaine dernière",
            OneMonthAgo: "Mois dernier",
            OneYearAgo: "Année dernière"
          },
          Page: {
            PageTokensGroupName: "Jetons de page",
            PageId: "ID de la page",
            PageTitle: "Titre de la page",
            PageCustom: "Colonne Autre page",
          },
          User: {
            UserTokensGroupName: "Jetons d'utilisateur",
            UserName: "Nom d'utilisateur",
            Me: "Moi",
            UserDepartment: "Département Utilisateur",
            UserCustom: "Propriété personnalisée de l'utilisateur"
          }
        },
        General:{
          OnTextLabel: "Actif",
          OffTextLabel: "Inactif",
          StaticArrayFieldName: "Un réseau comme un champ",
          About: "À propos de",
          Authors: "Auteur(s)",
          Version: "Version",
          InstanceId: "ID d'instance de la Web Part",
          Resources: {
            GroupName: "Ressources",
            Documentation: "Documentation",
            PleaseReferToDocumentationMessage: "Veuillez vous référer à la documentation officielle."
          },
          Extensibility: {
            InvalidDataSourceInstance: "La source de données sélectionnée '{0}' n'implémente pas correctement la classe abstraite 'BaseDataSource'. Certaines méthodes sont manquantes.",
            DataSourceDefinitionNotFound: "La source de données personnalisée avec la clé '{0}' n'a pas été trouvée.Assurez-vous que la solution est correctement déployée dans le catalogue d'applications et l'ID de manifeste enregistré pour ce Web Part.",
            LayoutDefinitionNotFound: "La mise en page personnalisée avec la touche '{0}' n'a pas été trouvée. Assurez-vous que la solution est correctement déployée dans le catalogue d'applications et l'ID de manifeste enregistré pour ce Web Part.",
            InvalidLayoutInstance: "La mise en page sélectionnée '{0}' n'implémente pas correctement la classe abstraite 'BaseLayout'. Certaines méthodes sont manquantes.",
            DefaultExtensibilityLibraryName: "Bibliothèque d'extensibilité par défaut",
            InvalidProviderInstance: "Le fournisseur de suggestions sélectionné '{0}' n'implémente pas correctement la classe de résumé 'BaseSuggestionProvider'. Certaines méthodes sont manquantes.",
            ProviderDefinitionNotFound: "Le fournisseur de suggestions personnalisées avec la clé '{0}' n'a pas été trouvé. Assurez-vous que la solution est correctement déployée dans le catalogue d'applications et l'ID de manifeste enregistré pour ce Web Part.",
          },
          DateFromLabel: "Du",
          DateTolabel: "Jusqu'au",
          DatePickerStrings: {
            months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            shortMonths: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            shortDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            goToToday: "Aujourd'hui",
            prevMonthAriaLabel: 'Mois précédent',
            nextMonthAriaLabel: 'Mois suivant',
            prevYearAriaLabel: 'Année précédente',
            nextYearAriaLabel: 'Année suivante',
            closeButtonAriaLabel: 'Fermer le sélecteur de date',
            isRequiredErrorMessage: 'La date de début est requise.',
            invalidInputErrorMessage: 'Format de date invalide.'
          },
          DateIntervalStrings: {
            AnyTime: "Tout moment",
            PastDay: "Dernières 24 heures",
            PastWeek: "Semaine dernière",
            PastMonth: "Mois passé",
            Past3Months: "3 derniers mois",
            PastYear: "Année précédente",
            Older: "Antérieur à un an"
          },
          SameTabOpenBehavior: "Utilisez l'onglet actuel",
          NewTabOpenBehavior: "Ouvrir dans un nouvel onglet",
          PageOpenBehaviorLabel: "Comportement d'ouverture",
          EmptyFieldErrorMessage: "Ce champ ne peut pas être vide"
        },
        DataSources: {
          SharePointSearch: {
            SourceName:  "Recherche SharePoint",
            SourceConfigurationGroupName: "Configuration de la source",
            QueryTextFieldLabel: "Texte de la requête",
            QueryTextFieldInfoMessage: "Utilisez l'onglet de configuration <strong>Connexions disponibles</strong> Web Part pour spécifier soit une valeur statique, soit une valeur provenant d'un composant dynamique sur la page comme une boîte de recherche",
            QueryTemplateFieldLabel: "Modèle de requête",
            QueryTemplatePlaceHolderText: "ex: Path:{Site}",
            QueryTemplateFieldDescription: "Le modèle de requête de recherche. Vous pouvez également utiliser {<tokens>} pour construire une requête dynamique.",
            ResultSourceIdLabel: "ID de la source du résultat",
            ResultSourceIdDescription: "Utilisez un ID de source de résultat SharePoint par défaut ou tapez votre propre valeur GUID et appuyez sur 'Entrée' pour sauvegarder.",
            InvalidResultSourceIdMessage: "La valeur fournie n'est pas un GUID valable",
            EnableQueryRulesLabel: "Activer les règles d'interrogation",            
            IncludeOneDriveResultsLabel: "Inclure résultats pour les OneDrive Entreprises",
            RefinementFilters: "Filtres de raffinement",
            RefinementFiltersDescription: `Filtres d'affinage initiaux à appliquer à la requête. Ceux-ci n'apparaîtront pas dans les filtres sélectionnés. Pour les expressions de chaîne de caractères, utilisez des guillemets doubles (") au lieu de guillemets simples (').`,
            EnableLocalizationLabel: "Activer la localisation",
            EnableLocalizationOnLabel: "Actif",
            EnableLocalizationOffLabel: "Inactif",
            QueryCultureLabel: "Langue de la demande de recherche",
            QueryCultureUseUiLanguageLabel: "Utiliser la langue de l'interface",
            SelectedPropertiesFieldLabel: "Propriétés sélectionnées",
            SelectedPropertiesFieldDescription: "Spécifie les propriétés à extraire des résultats de la recherche.",
            SelectedPropertiesPlaceholderLabel: "Sélectionner les propriétés",
            TermNotFound: "(Terme avec ID '{0}' non trouvé)",
            ApplyQueryTemplateBtnText: "Postulez",
            EnableAudienceTargetingTglLabel: "Activer le ciblage de l'audience"
          },
          MicrosoftSearch: {
            QueryTextFieldLabel: "Texte de la requête",
            QueryTextFieldInfoMessage: "Utilisez l'onglet de configuration <strong>Connexions disponibles</strong> Web Part pour spécifier soit une valeur statique, soit une valeur provenant d'un composant dynamique sur la page comme une boîte de recherche",
            SourceName: "Recherche Microsoft",
            SourceConfigurationGroupName: "Recherche Microsoft",
            EntityTypesField: "Types d'entités à rechercher",
            SelectedFieldsPropertiesFieldLabel: "Domaines sélectionnés",
            SelectedFieldsPropertiesFieldDescription: "Spécifie les propriétés à extraire des résultats de la recherche.",
            SelectedFieldsPlaceholderLabel: "Sélectionner les champs",
            EnableTopResultsLabel: "Permettre de meilleurs résultats",
            ContentSourcesFieldLabel: "Sources de contenu",
            ContentSourcesFieldDescriptionLabel: "ID des connexions définies dans le portail d'administration de connectors de Recherche Microsoft.",
            ContentSourcesFieldPlaceholderLabel: "ex: 'MyCustomConnectorId'"
          },
          SearchCommon: {
            Sort: {
              SortPropertyPaneFieldLabel: "Ordre de tri",
              SortListDescription: "Précisez l'ordre de tri initial des résultats de la recherche. Vous pouvez soit sélectionner un champ dans la liste déroulante (uniquement si les données de la source de données ont déjà été extraites), soit taper votre propre valeur personnalisée (appuyez sur 'Entrée' pour enregistrer votre entrée)",
              SortDirectionAscendingLabel: "Ascendant",
              SortDirectionDescendingLabel: "Descendant",
              SortErrorMessage: "Propriété de recherche non valable (Vérifiez si la propriété gérée est triable).",
              SortPanelSortFieldLabel: "Trier par champ",
              SortPanelSortFieldAria: "Trier par",
              SortPanelSortFieldPlaceHolder: "Trier par",
              SortPanelSortDirectionLabel: "Direction du tri",
              SortDirectionColumnLabel: "Direction",
              SortFieldColumnLabel: "Nom du champ",
              EditSortLabel: "Modifier l'ordre de tri",
              SortInvalidSortableFieldMessage: "Cette propriété n'est pas triable",
              SortFieldColumnPlaceholder: "Sélectionner champ..."
            }
          }
        },
        Controls: {
          TextDialogButtonText: "Ajouter l'expression Handlebars",
          TextDialogTitle: "Modifier l'expression Handlebars",
          TextDialogCancelButtonText: "Annuler",
          TextDialogSaveButtonText: "Sauvegarder",
          SelectItemComboPlaceHolder: "Sélectionner un bien",
          AddStaticDataLabel: "Ajouter des données statiques",
          TextFieldApplyButtonText: "Postulez"
        },
        Layouts: {
          Debug: {
            Name: "Debug"
          },
          Custom: {
            Name: "Personnalisé"
          },
          SimpleList: {
            Name: "Lister",
            ShowFileIconLabel: "Afficher l'icône du fichier",
            ShowItemThumbnailLabel: "Afficher la vignette"
          },
          DetailsList: {
            Name: "Liste détaillée",
            UseHandlebarsExpressionLabel: "Utiliser l'expression Handlebars",
            MinimumWidthColumnLabel: "Largeur minimale (px)",
            MaximumWidthColumnLabel: "Largeur maximale (px)",
            SortableColumnLabel: "Triable",
            ResizableColumnLabel: "Redimensionnable",
            MultilineColumnLabel: "Multiligne",
            LinkToItemColumnLabel: "Lien vers éléments",
            SupportHTMLColumnLabel: "Autoriser le HTML",
            CompactModeLabel: "Mode compact",
            ShowFileIcon: "Afficher l'icône du fichier",
            ManageDetailsListColumnDescription: "Ajouter, mettre à jour ou supprimer des colonnes pour la mise en page de la liste des détails. Vous pouvez soit utiliser directement les valeurs des propriétés dans la liste sans aucune transformation, soit utiliser une expression Handlebars dans le champ de valeur. Le HTML est également pris en charge pour tous les champs.",
            ManageDetailsListColumnLabel: "Gérer les colonnes",
            ValueColumnLabel: "Valeur de la colonne",
            DisplayNameColumnLabel: "Nom d'affichage de la colonne",
            FileExtensionFieldLabel: "Champ à utiliser pour l'extension du fichier",
            GroupByFieldLabel: "Groupe par domaine",
            EnableGrouping: "Activer le regroupement",
            CollapsedGroupsByDefault: "Afficher effondrée",
            ResetFieldsBtnLabel: "Rétablir les valeurs par défaut des champs"
          },
          Cards: { 
            Name: "Cartes",
            ManageTilesFieldsLabel: "Champs de carte de gérés",
            ManageTilesFieldsPanelDescriptionLabel: "Ici, vous pouvez faire correspondre les valeurs de chaque champ avec les emplacements de carte correspondants. Vous pouvez soit utiliser directement une propriété de résultat sans aucune transformation, soit utiliser une expression de Handlebars comme valeur de champ. En outre, lorsque cela est spécifié, vous pouvez également injecter votre propre code HTML dans les champs annotés.",
            PlaceholderNameFieldLabel: "Nom",
            SupportHTMLColumnLabel: "Autoriser le HTML",
            PlaceholderValueFieldLabel: "Valeur",
            UseHandlebarsExpressionLabel: "Utiliser l'expression Handlebars",
            EnableItemPreview: "Activer l'aperçu de résultat",
            EnableItemPreviewHoverMessage: "L'activation de cette option peut avoir un impact sur les performances si trop d'éléments sont affichés en même temps et que vous utilisez le champ 'AutoPreviewUrl'. Nous vous recommandons d'utiliser cette option avec un petit nombre d'éléments ou d'utiliser des URL de prévisualisation prédéfinies à partir de vos champs de source de données dans les slots.",
            ShowFileIcon: "Afficher l'icône du fichier",
            CompactModeLabel:"Mode compact",
            PreferedCardNumberPerRow: "Nombre préféré de cartes par ligne",
            Fields: {
              Title: "Titre",
              Location: "Lieu",
              Tags: "Balises",
              PreviewImage: "Image de prévisualisation",
              PreviewUrl: "Url de prévisualisation",
              Url: "Url",
              Date: "Date",
              Author: "Auteur",
              ProfileImage: "Url de l'image du profil",
              FileExtension: "Extension de fichier",
              IsContainer: "Est Dossier"
            },
            ResetFieldsBtnLabel: "Rétablir les valeurs par défaut des champs"
          },
          Slider: { 
            Name: "Glisseur",
            SliderAutoPlay: "Jeu automatique",
            SliderAutoPlayDuration: "Durée de la lecture automatique (en secondes)",
            SliderPauseAutoPlayOnHover: "Pause en vol stationnaire",
            SliderGroupCells: "Nombre d'éléments à regrouper dans les diapositives",
            SliderShowPageDots: "Afficher les points des pages",
            SliderWrapAround: "Le défilement à l'infini",
            SlideHeight: "Hauteur des diapositives (en px)",
            SlideWidth: "Largeur de la diapositive (en px)"
          },
          People: { 
            Name: "Personnes",
            ManagePeopleFieldsLabel: "Gérer les champs de personnes",
            ManagePeopleFieldsPanelDescriptionLabel: "Ici, vous pouvez mapper les valeurs de chaque champ avec les espaces réservés de persona correspondants. Vous pouvez utiliser la valeur du champ de source de données directement sans aucune transformation ou utiliser une expression Handlebars dans le champ de valeur.",
            PlaceholderNameFieldLabel: "Nom",
            PlaceholderValueFieldLabel: "Valeur",
            UseHandlebarsExpressionLabel: "Utiliser l'expression Handlebars",
            PersonaSizeOptionsLabel: "Taille des composants",
            PersonaSizeExtraSmall: "Très petit",
            PersonaSizeSmall: "Petit",
            PersonaSizeRegular: "Régulier",
            PersonaSizeLarge: "Grand",
            PersonaSizeExtraLarge: "Très grand",
            ShowInitialsToggleLabel: "Afficher les initiales si aucune photo n'est disponible",
            SupportHTMLColumnLabel: "Autoriser le HTML",
            ResetFieldsBtnLabel: "Rétablir les valeurs par défaut des champs",
            ShowPersonaCardOnHover: "Afficher la carte de personnage au survol",
            ShowPersonaCardOnHoverCalloutMsg: "Cette fonction utilise Microsoft Graph pour afficher des informations sur l'utilisateur et nécessite les autorisations API suivantes dans votre locataire pour travailler : ['User.Read', 'People.Read', 'Contacts.Read', 'User.ReadBasic.All'].",
            Fields: {
              ImageUrl: "URL de l'image",
              PrimaryText: "Texte primaire",
              SecondaryText: "Texte secondaire",
              TertiaryText: "Texte tertiaire",
              OptionalText: "Texte facultatif"
            }
          },
          Vertical: {
            Name: "Vertical"
          },
          Horizontal: {
            Name: "Horizontal",
            PreferedFilterNumberPerRow: "Nombre préféré de filtres par ligne",
          },
          Panel: {
            Name: "Panel",
            IsModal: "Modal",
            IsLightDismiss: "Léger licenciement",
            Size: "Taille du panel",
            ButtonLabel: "Afficher les filtres",
            ButtonLabelFieldName: "Étiquette du bouton à afficher",
            HeaderText: "Filtres",
            HeaderTextFieldName: "Texte de l'en-tête du panel",
            SizeOptions: {
              SmallFixedFar: 'Petit (par défaut)',
              SmallFixedNear: 'Petit, côté proche',
              Medium: 'Moyen',
              Large:'Grand',
              LargeFixed: 'Grande largeur fixe',
              ExtraLarge: 'Très grand',
              SmallFluid: 'Pleine largeur (fluide)'
            }
          }
        },
        HandlebarsHelpers: {
          CountMessageLong: "<b>{0}</b> résultats pour '<em>{1}</em>'",
          CountMessageShort: "<b>{0}</b> résultats",
        },
        PropertyPane: {
          ConnectionsPage: {
            DataConnectionsGroupName: "Connexions disponibles"
          },
          InformationPage: {
            Extensibility: {
              GroupName: "Configuration d'extensibilité",
              FieldLabel: "Extensibilité des bibliothèques à charger",
              ManageBtnLabel: "Configurer",             
              Columns: {
                Name: "Nom/objectif",
                Id: "GUID du manifeste",
                Enabled: "Activé/Désactivé"
              }
            }
          }
        },
        Filters: {
          ApplyAllFiltersButtonLabel: "Postulez",
          ClearAllFiltersButtonLabel: "Clair",
          FilterNoValuesMessage: "Aucune valeur pour ce filtre",
          OrOperator: "OR",
          AndOperator: "AND",
          ComboBoxPlaceHolder: "Sélectionnez une valeur"
        },
        SuggestionProviders: {
          SharePointStatic: {
            ProviderName: "Suggestions de recherche SharePoint Static",
            ProviderDescription: "Récupérer les suggestions de recherche statique SharePoint définies par l'utilisateur"
          }
        }
    }
})