define([], function() {
    return {
        Tokens: {
            SelectTokenLabel: "Sélectionnez un jeton...",
            Context: {
                ContextTokensGroupName: "Jetons de contexte",
                SiteAbsoluteUrl: "URL absolue du site",
                SiteRelativeUrl: "URL relative du serveur du site",
                WebAbsoluteUrl: "URL absolue du Web",
                WebRelativeUrl: "URL relative du serveur Web",
                WebTitle: "Titre Web",
                InputQueryText: "Saisir le texte de la requête"
            },
            Custom: {
                CustomTokensGroupName: "Valeur personnalisée",
                CustomValuePlaceholder: "Entrez une valeur...",
                InvalidtokenFormatErrorMessage: "Veuillez entrer un format de jeton pris en charge utilisant « {et} » (p. ex., « {Aujourd’hui} »)"
            },
            Date: {
                DateTokensGroupName: "Jetons de date",
                Today: "Aujourd’hui",
                Yesterday: "Hier",
                Tomorrow: "Demain",
                OneWeekAgo: "Il y a une semaine",
                OneMonthAgo: "Il y a un mois",
                OneYearAgo: "Il y a un an"
            },
            Page: {
                PageTokensGroupName: "Jetons de page",
                PageId: "Identifiant de page",
                PageTitle: "Titre de la page",
                PageCustom: "Colonne Autre page",
            },
            User: {
                UserTokensGroupName: "Jetons utilisateur",
                UserName: "Nom d’utilisateur",
                Me: "Moi",
                UserDepartment: "Service utilisateurs",
                UserCustom: "ropriété personnalisée de l’utilisateur"
            }
        },
        General: {
            OnTextLabel: "Activé",
            OffTextLabel: "Désactivé",
            StaticArrayFieldName: "Champs de type groupés",
            About: "À propos",
            Authors: "Auteur(s)",
            Version: "Version",
            InstanceId: "Identifiant d’instance de composant Web",
            Resources: {
                GroupName: "Ressources",
                Documentation: "Documents",
                PleaseReferToDocumentationMessage: "Pour de plus amples renseignements, veuillez consulter les documents officiels."
            },
            Extensibility: {
                InvalidDataSourceInstance: "La source de données sélectionnée « {0} » n’applique pas correctement la classe abstraite « BaseDataSource ». Certaines méthodes sont manquantes.",
                DataSourceDefinitionNotFound: "La source de données personnalisée contenant la clé « {0} » est introuvable Assurez-vous que la solution est correctement déployée dans le catalogue de l’application et que l’identifiant de manifeste est enregistré pour ce composant Web",
                LayoutDefinitionNotFound: "La présentation personnalisée contenant la clé « {0} » est introuvable Vérifiez que la solution est correctement déployée dans le catalogue de l’application et que l’identifiant de manifeste est enregistré pour ce composant Web",
                InvalidLayoutInstance: "La mise en page sélectionnée « {0} » n’applique pas correctement la classe abstraite « BaseLayout ». Certaines méthodes sont manquantes.",
                DefaultExtensibilityLibraryName: "Bibliothèque d’extensibilité par défaut",
                InvalidProviderInstance: "Le fournisseur de suggestions sélectionné « {0} » n’applique pas correctement la classe abstraite « BaseSuggestionProvider ». Certaines méthodes sont manquantes.",
                ProviderDefinitionNotFound: "Le fournisseur de suggestions personnalisées contenant la clé « {0} » est introuvable Assurez-vous que la solution est correctement déployée dans le catalogue de l’application et que l’identifiant de manifeste est enregistré pour ce composant Web",
            },
            DateFromLabel: "De",
            DateTolabel: "À",
            DatePickerStrings: {
                months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                shortMonths: ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juill.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
                days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                shortDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
                goToToday: 'Aller à aujourd’hui',
                prevMonthAriaLabel: 'Aller au mois précédent',
                nextMonthAriaLabel: 'Aller au mois suivant',
                prevYearAriaLabel: 'Aller à l’année précédente',
                nextYearAriaLabel: 'Aller à l’année suivante',
                closeButtonAriaLabel: 'Fermer le sélecteur de date',
                isRequiredErrorMessage: 'La date de début est obligatoire',
                invalidInputErrorMessage: 'Format de date non valide'
            },
            DateIntervalStrings: {
                AnyTime: "N’importe quand",
                PastDay: "Entre 24 heures et 1 semaine",
                PastWeek: "Entre 1 semaine et 1 mois",
                PastMonth: "Entre 1 et 3 mois",
                Past3Months: "Entre 3 mois et 1 an",
                PastYear: "Depuis l'année dernière",
                Older: "Il y a plus d'un an"
            },
            SameTabOpenBehavior: "Utiliser l’onglet actuel",
            NewTabOpenBehavior: "Ouvrir dans un nouvel onglet",
            PageOpenBehaviorLabel: "Comportement d’ouverture",
            EmptyFieldErrorMessage: "Ce champ ne doit pas être vide."
        },
        DataSources: {
            SharePointSearch: {
                SourceName: "Recherche dans SharePoint",
                SourceConfigurationGroupName: "Configuration de la source",
                QueryTextFieldLabel: "Texte de la requête",
                QueryTextFieldInfoMessage: "Utilisez l’onglet de configuration de composant Web <strong>Connexions disponibles</strong> pour indiquer une valeur statique ou une valeur de composant dynamique sur la page, comme une boîte de recherche",
                QueryTemplateFieldLabel: "Modèle de requête",
                QueryTemplatePlaceHolderText: "Exemple : Chemin d’accès : {Site}",
                QueryTemplateFieldDescription: "Modèle de requête de recherche Vous pouvez également utiliser {<jetons>} pour créer une requête dynamique.",
                ResultSourceIdLabel: "Identifiant d’origine de résultat",
                ResultSourceIdDescription: "Utilisez un identifiant d’origine de résultat par défaut dans SharePoint ou entrez votre propre valeur GUID et appuyez sur Entrée pour enregistrer.",
                InvalidResultSourceIdMessage: "La valeur fournie n’est pas une valeur GUID valide",
                EnableQueryRulesLabel: "Activer les règles de requête",
                IncludeOneDriveResultsLabel: "Inclure les résultats de OneDrive Entreprise",
                RefinementFilters: "Filtres de recherche avancée",
                RefinementFiltersDescription: "Filtres initiaux de recherche avancée à appliquer à la requête Ils ne figureront pas dans les filtres sélectionnés. Pour les expressions de chaîne, utilisez des guillemets doubles (\") plutôt qu’ un seul guillemet(‘).",
                EnableLocalizationLabel: "Activer la localisation",
                EnableLocalizationOnLabel: "Activé",
                EnableLocalizationOffLabel: "Désactivé",
                QueryCultureLabel: "Langue de la requête de recherche",
                QueryCultureUseUiLanguageLabel: "Utilisez la langue de l’interface",
                SelectedPropertiesFieldLabel: "Propriétés sélectionnées",
                SelectedPropertiesFieldDescription: "Indique les propriétés à extraire des résultats de recherche",
                SelectedPropertiesPlaceholderLabel: "Propriétés de sélection",
                TermNotFound: "(Le critère contenant l’identifiant « {0} » est introuvable)",
                ApplyQueryTemplateBtnText: "Appliquer",
                EnableAudienceTargetingTglLabel: "Permet de cibler l’auditoire"
            },
            MicrosoftSearch: {
                QueryTextFieldLabel: "Texte de la requête",
                QueryTextFieldInfoMessage: "Utilisez l’onglet de configuration de composant Web <strong>Connexions disponibles</strong> pour indiquer une valeur statique ou une valeur de composant dynamique sur la page, comme une boîte de recherche",
                SourceName: "Recherche dans Microsoft",
                SourceConfigurationGroupName: "Recherche dans Microsoft",
                EntityTypesField: "Types d’entités à rechercher",
                SelectedFieldsPropertiesFieldLabel: "Champs sélectionnés",
                SelectedFieldsPropertiesFieldDescription: "Indique les champs à extraire des résultats de recherche",
                SelectedFieldsPlaceholderLabel: "Sélectionner les champs",
                EnableTopResultsLabel: "Obtenir les meilleurs résultats",
                ContentSourcesFieldLabel: "Sources du contenu",
                ContentSourcesFieldDescriptionLabel: "Identifiants de connexion définis dans le portail d’administration des connecteurs de recherche Microsoft.",
                ContentSourcesFieldPlaceholderLabel: "Exemple : « MyCustomConnectorID » "
            },
            SearchCommon: {
                Sort: {
                    SortPropertyPaneFieldLabel: "Ordre de tri",
                    SortListDescription: "Précisez l’ordre de tri initial pour les résultats de recherche. Vous pouvez sélectionner un champ dans la liste déroulante (seulement si les données sources des données ont déjà été récupérées) ou entrer votre propre valeur personnalisée (appuyer sur Entrée pour enregistrer)",
                    SortDirectionAscendingLabel: "Croissant",
                    SortDirectionDescendingLabel: "Décroissant",
                    SortErrorMessage: "Propriété de recherche non valide (vérifier si la propriété gérée est triable).",
                    SortPanelSortFieldLabel: "Trier par champ",
                    SortPanelSortFieldAria: "Trier par",
                    SortPanelSortFieldPlaceHolder: "Trier par",
                    SortPanelSortDirectionLabel: "Sens de tri",
                    SortDirectionColumnLabel: "Sens",
                    SortFieldColumnLabel: "Nom du champ",
                    EditSortLabel: "Modifier l’ordre de tri",
                    SortInvalidSortableFieldMessage: "Cette propriété n’est pas triable",
                    SortFieldColumnPlaceholder: "Sélectionner le champ..."
                }
            }
        },
        Controls: {
            TextDialogButtonText: "Ajouter les expressions entre accolades",
            TextDialogTitle: "Modifier les expressions entre accolades",
            TextDialogCancelButtonText: "Annuler",
            TextDialogSaveButtonText: "Enregistrer",
            SelectItemComboPlaceHolder: "Sélectionnez la propriété",
            AddStaticDataLabel: "Ajouter des données statiques",
            TextFieldApplyButtonText: "Appliquer"
        },
        Layouts: {
            Debug: {
                Name: "Déboguer"
            },
            Custom: {
                Name: "Personnalisé"
            },
            SimpleList: {
                Name: "Liste",
                ShowFileIconLabel: "Afficher l’icône de fichier",
                ShowItemThumbnailLabel: "Afficher le volet Miniatures"
            },
            DetailsList: {
                Name: "Liste de détails",
                UseHandlebarsExpressionLabel: "Utiliser les expressions entre accolades",
                MinimumWidthColumnLabel: "Largeur minimale (pixels)",
                MaximumWidthColumnLabel: "Largeur maximale (pixels)",
                SortableColumnLabel: "Triable",
                ResizableColumnLabel: "Redimensionnable",
                MultilineColumnLabel: "Multiligne",
                LinkToItemColumnLabel: "Lien de l’élément",
                SupportHTMLColumnLabel: "Autoriser HTML",
                CompactModeLabel: "Mode compact",
                ShowFileIcon: "Afficher l’icône de fichier",
                ManageDetailsListColumnDescription: "Ajouter, modifier ou supprimer des colonnes dans la présentation de la liste de détails. Vous pouvez utiliser la valeur des propriétés directement dans la liste, sans modification, ou utiliser une expression entre accolades dans le champ de valeur Le format HTML est également pris en charge dans tous les champs",
                ManageDetailsListColumnLabel: "Gérer les colonnes",
                ValueColumnLabel: "Valeur de la colonne",
                ValueSortingColumnLabel: "Tri par valeur de colonne",
                DisplayNameColumnLabel: "Nom d’affichage de la colonne",
                FileExtensionFieldLabel: "Champ à utiliser pour l’extension de fichier",
                GroupByFieldLabel: "Regrouper par champ",
                EnableGrouping: "Permettre le regroupement",
                CollapsedGroupsByDefault: "Afficher les groupes réduits",
                ResetFieldsBtnLabel: "Rétablir la valeur par défaut dans les champs"
            },
            Cards: {
                Name: "Cartes",
                ManageTilesFieldsLabel: "Champs des cartes gérées",
                ManageTilesFieldsPanelDescriptionLabel: "Ici, vous pouvez mettre en correspondance les valeurs de chaque champ avec les espaces réservés correspondant à la carte. Vous pouvez utiliser une propriété de résultat directement sans modification ou utiliser une expression entre accolades comme valeur de champ. De plus, si cela est indiqué, vous pouvez également ajouter votre propre code HTML dans les champs annotés.",
                PlaceholderNameFieldLabel: "Nom",
                SupportHTMLColumnLabel: "Autoriser HTML",
                PlaceholderValueFieldLabel: "Valeur",
                UseHandlebarsExpressionLabel: "Utiliser les expressions entre accolades",
                EnableItemPreview: "Activer l’aperçu des résultats",
                EnableItemPreviewHoverMessage: "L’activation de cette option peut avoir une incidence sur la performance si un trop grand nombre d’éléments s’affichent en même temps et que vous utilisez le champ d’emplacement « AutoPreviewURL ». Nous vous recommandons d’utiliser cette option avec un petit nombre d’éléments ou d’utiliser des URL d’aperçu prédéfinies de vos champs de sources de données pour les emplacements.",
                ShowFileIcon: "Afficher l’icône de fichier",
                CompactModeLabel: "Mode compact",
                PreferedCardNumberPerRow: "Nombre de cartes privilégié par ligne",
                Fields: {
                    Title: "Titre",
                    Location: "Emplacement",
                    Tags: "Mots-clés",
                    PreviewImage: "Aperçu de l’image",
                    PreviewUrl: "Aperçu de l’adresse URL",
                    Url: "Url",
                    Date: "Date",
                    Author: "Auteur",
                    ProfileImage: "URL de l’image du profil",
                    FileExtension: "Extension de fichier",
                    IsContainer: "Est un dossier"
                },
                ResetFieldsBtnLabel: "Rétablir la valeur par défaut dans les champs"
            },
            Slider: {
                Name: "Curseur de défilement",
                SliderAutoPlay: "Lecture automatique",
                SliderAutoPlayDuration: "Durée de la lecture automatique",
                SliderPauseAutoPlayOnHover: "Pause en pointant le curseur",
                SliderGroupCells: "Nombre d’éléments à regrouper dans les diapositives",
                SliderShowPageDots: "Afficher les points de numéro de page",
                SliderWrapAround: "Défilement à l’infini",
                SlideHeight: "Hauteur de la diapositive (en pixels)",
                SlideWidth: "Largeur de la diapositive (en pixels)"
            },
            People: {
                Name: "Personnel",
                ManagePeopleFieldsLabel: "Champs de gestion des employés",
                ManagePeopleFieldsPanelDescriptionLabel: "Ici, vous pouvez mettre en correspondance les valeurs de chaque champ avec les espaces réservés aux personnages correspondants. Vous pouvez utiliser la valeur du champ de la source des données directement, sans modification, ou utiliser une expression entre accolades dans le champ de valeur.",
                PlaceholderNameFieldLabel: "Nom",
                PlaceholderValueFieldLabel: "Valeur",
                UseHandlebarsExpressionLabel: "Utiliser les expressions entre accolades",
                PersonaSizeOptionsLabel: "Taille des composantes",
                PersonaSizeExtraSmall: "Très petit",
                PersonaSizeSmall: "Petit",
                PersonaSizeRegular: "Régulier",
                PersonaSizeLarge: "Grand",
                PersonaSizeExtraLarge: "Très grand",
                ShowInitialsToggleLabel: "Afficher les initiales si aucune photo n’est disponible",
                SupportHTMLColumnLabel: "Autoriser HTML",
                ResetFieldsBtnLabel: "Rétablir la valeur par défaut dans les champs",
                ShowPersonaCardOnHover: "Afficher l’image de la carte en pointant le curseur",
                ShowPersonaCardOnHoverCalloutMsg: "Cette fonction utilise Microsoft Graph pour afficher des renseignements sur l’utilisateur et nécessite les autorisations API suivantes pour que votre utilisateur puisse travailler : [« User.Read », « People.Read », « Contacts.Read », « User.Read.All »].",
                Fields: {
                    ImageUrl: "URL de l’image",
                    PrimaryText: "Texte principal",
                    SecondaryText: "Texte secondaire",
                    TertiaryText: "Texte tertiaire",
                    OptionalText: "Texte facultatif"
                }
            },
            Vertical: {
                Name: "Secteur vertical"
            },
            Horizontal: {
                Name: "Horizontal",
                PreferedFilterNumberPerRow: "Nombre de filtres privilégiés par ligne",
            },
            Panel: {
                Name: "Panneau",
                IsModal: "Modal",
                IsLightDismiss: "Abandon interactif",
                Size: "Taille du panneau",
                ButtonLabel: "Afficher les filtres",
                ButtonLabelFieldName: "Étiquette du bouton à afficher",
                HeaderText: "Filtres",
                HeaderTextFieldName: "Texte de l’en-tête du panneau",
                SizeOptions: {
                    SmallFixedFar: 'Petit (par défaut)',
                    SmallFixedNear: 'Petit, à gauche de l’écran',
                    Medium: 'Moyen',
                    Large: 'Grand',
                    LargeFixed: 'Grand-largeur fixe',
                    ExtraLarge: 'Très grand',
                    SmallFluid: 'Pleine largeur (fluide)'
                }
            }
        },
        HandlebarsHelpers: {
            CountMessageLong: "<b>{0}</b> résultats de « <em>{1}</em> »",
            CountMessageShort: "<b>{0}</b> résultats",
        },
        PropertyPane: {
            ConnectionsPage: {
                DataConnectionsGroupName: "Connexions disponibles"
            },
            InformationPage: {
                Extensibility: {
                    GroupName: "Configuration de l’extensibilité",
                    FieldLabel: "Bibliothèques d’extensibilité à télécharger",
                    ManageBtnLabel: "Configurer",
                    Columns: {
                        Name: "Nom/Objet",
                        Id: "GUID manifeste",
                        Enabled: "Activé/Désactivé"
                    }
                }
            }
        },
        Filters: {
            ApplyAllFiltersButtonLabel: "Appliquer",
            ClearAllFiltersButtonLabel: "Effacer",
            FilterNoValuesMessage: "Aucune valeur pour ce filtre",
            OrOperator: "OU",
            AndOperator: "ET",
            ComboBoxPlaceHolder: "Choisir une valeur"
        },
        SuggestionProviders: {
            SharePointStatic: {
                ProviderName: "Suggestions de recherche statique dans SharePoint",
                ProviderDescription: "Récupération des suggestions de recherche définies par l’utilisateur dans SharePoint"
            }
        }
    }
})