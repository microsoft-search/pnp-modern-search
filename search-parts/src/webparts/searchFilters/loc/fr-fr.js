define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Éditer",
                IconText: "Filtres de recherche par @PnP",
                Description: "Affiche les filtres d'un Web Part de résultats de recherche connecté",
                ConfigureBtnLabel: "Configurer"
            },
            NoAvailableFilterMessage: "Aucun filtre disponible à afficher.",
            WebPartDefaultTitle: "Filtres de recherche - Partie web"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Se connecter à une web partie de résultats de données",
                UseDataResultsFromComponentsLabel: "Utilisez les données de ces Web Parts",
                UseDataResultsFromComponentsDescription: "Si vous connectez plus d'un Web Part, les valeurs et les comptes des filtres seront fusionnés pour des noms de filtres similaires.",
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Paramètres des filtres",
                FilterOperator: "Opérateur à utiliser entre les filtres"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Sélectionner un champ",
                FilterNameLabel: "Champ de filtre",
                FilterDisplayName: "Nom d'affichage",
                FilterTemplate: "Gabarit",
                FilterExpandByDefault: "Développer par défaut",
                FilterType: "Type de filtre",
                FilterTypeRefiner: "Ce modèle de filtre agit comme un raffineur et reçoit/envoie des valeurs disponibles/sélectionnées depuis/vers la source de données connectée.",
                FilterTypeStaticFilter: "Ce modèle de filtre agit comme un filtre statique et n'envoie que des valeurs sélectionnées arbitrairement à la source de données connectée. Les valeurs de filtrage entrantes ne sont pas prises en compte.",
                CustomizeFiltersBtnLabel: "Éditer",
                CustomizeFiltersHeader: "Modifier les filtres",
                CustomizeFiltersDescription: "Configurez les filtres de recherche en ajoutant ou en supprimant des lignes. Vous pouvez sélectionner des champs dans les résultats de la source de données (s'ils sont déjà sélectionnés) ou utiliser des valeurs statiques pour les filtres.",
                CustomizeFiltersFieldLabel: "Personnaliser les filtres",
                ShowCount: "Afficher décompte",
                Operator: "Opérateur entre les valeurs",
                ANDOperator: "AND",
                OROperator: "OR",
                IsMulti: "Multivaleur",
                Templates: {
                    CheckBoxTemplate: "Cochez case",
                    DateRangeTemplate: "Fourchette de dates",
                    ComboBoxTemplate: "Boîte combo",
                    DateIntervalTemplate: "Intervalle de date",
                    TaxonomyPickerTemplate: "Sélecteur de taxonomie"
                },
                SortBy: "Trier les valeurs par",
                SortDirection: "Direction de tri",
                SortByName: "Par nom",
                SortByCount: "Par décompte",
                SortAscending: "Ascendant",
                SortDescending: "Descendant"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Mises en page disponibles",
                LayoutTemplateOptionsGroupName: "Options de mise en page",
                TemplateUrlFieldLabel: "Utiliser un URL modèle externe",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Le file modèle doit être un fichier .htm ou .html valide",
                ErrorTemplateResolve: "Impossible de résoudre le modèle spécifié. Détails de l'erreur : '{0}'",
                FiltersTemplateFieldLabel: "Editer le modèle de filtres",
                FiltersTemplatePanelHeader: "Editer le modèle de filtres"
            }
        }
    }
});