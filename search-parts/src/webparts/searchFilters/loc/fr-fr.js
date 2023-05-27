define([], function() {
    return {
        General: {
            PlaceHolder: {
                EditLabel: "Modifier",
                IconText: "Filtres de recherche par @PnP",
                Description: "Affiche les filtres d'un composant Web connecté des résultats de recherche ",
                ConfigureBtnLabel: "Configurer"
            },
            NoAvailableFilterMessage: "Aucun filtre disponible à afficher.",
            WebPartDefaultTitle: "Composant Web des filtres de recherche"
        },
        PropertyPane: {
            ConnectionsPage: {
                UseDataResultsWebPartLabel: "Se connecter à un composant Web des résultats des données",
                UseDataResultsFromComponentsLabel: "Utiliser les données de ces composants Web",
                UseDataResultsFromComponentsDescription: "Si vous connectez plusieurs composants Web, les valeurs et les nombres de filtres seront fusionnés avec les noms de filtres similaires",
                UseDataVerticalsWebPartLabel: "Se connecter à un composant WebPart de verticales",
                UseDataVerticalsFromComponentLabel: "Utiliser les verticales de ce composant",
                LinkToVerticalLabel: "Afficher les données uniquement lorsque les verticales suivantes sont sélectionnées",
                LinkToVerticalLabelHoverMessage: "Les filtres ne seront affichés que si la verticale sélectionnée correspond à celles configurées pour ce composant WebPart. Sinon, le composant WebPart restera vide (pas de marge ni de remplissage) en mode affichage."
            },
            FiltersSettingsPage: {
                SettingsGroupName: "Paramètres des filtres",
                FilterOperator: "Opérateur à utiliser entre les filtres"
            },
            DataFilterCollection: {
                SelectFilterComboBoxLabel: "Sélectionner un champ",
                FilterNameLabel: "Champ Filtre",
                FilterMaxBuckets: "Nombre de valeurs",
                FilterDisplayName: "Nom d'affichage",
                FilterTemplate: "Modèle",
                FilterExpandByDefault: "Agrandir par défaut",
                FilterType: "Type de filtre",
                FilterTypeRefiner: "Ce modèle de filtre sert de raffineur et reçoit/envoie les valeurs disponibles/sélectionnées à partir de/vers la source de données connectée.",
                FilterTypeStaticFilter: "Ce modèle de filtre agit comme un filtre statique et envoie uniquement les valeurs sélectionnées de façon arbitraire à la source de données connectée. Les valeurs des filtres entrants ne sont pas prises en compte",
                CustomizeFiltersBtnLabel: "Modifier",
                CustomizeFiltersHeader: "Modifier les filtres",
                CustomizeFiltersDescription: "Configurez les filtres de recherche en ajoutant ou en supprimant des lignes Vous pouvez sélectionner des champs dans les résultats de la source de données (si vous l’avez déjà fait) ou utiliser des valeurs statiques pour les filtres.",
                CustomizeFiltersFieldLabel: "Personnaliser les filtres",
                ShowCount: "Afficher le nombre",
                Operator: "Opérateur entre les valeurs",
                ANDOperator: "ET",
                OROperator: "OU",
                IsMulti: "Valeur multiple",
                Templates: {
                    CheckBoxTemplate: "Case à cocher",
                    DateRangeTemplate: "Période",
                    ComboBoxTemplate: "Zone de liste modifiable",
                    DateIntervalTemplate: "Intervalle de dates",
                    TaxonomyPickerTemplate: "Sélecteur de taxonomie"
                },
                SortBy: "Trier les valeurs par",
                SortDirection: "Sens de tri",
                SortByName: "Par nom",
                SortByCount: "Par nombre",
                SortAscending: "Croissant",
                SortDescending: "Décroissant"
            },
            LayoutPage: {
                AvailableLayoutsGroupName: "Mises en page disponibles",
                LayoutTemplateOptionsGroupName: "Options de mise en page",
                TemplateUrlFieldLabel: "Utiliser une adresse URL de modèle externe",
                TemplateUrlPlaceholder: "https://myfile.html",
                ErrorTemplateExtension: "Le modèle doit être un fichier .txt, .htm ou .html valide",
                ErrorTemplateResolve: "Impossible de résoudre le modèle indiqué. Renseignements sur l'erreur '{0}'",
                FiltersTemplateFieldLabel: "Modifier le modèle de filtres",
                FiltersTemplatePanelHeader: "Modifier le modèle de filtres"
            }
        }
    }
});