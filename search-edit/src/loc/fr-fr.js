define([], function() {
  return {
    "ExtensibilityEditor" : {
      "PanelTitle":"Manage Third Party Extensibility Libraries",
      "PropertyPaneDescription": "Description",
      "BasicGroupName": "Group Name",
      "DescriptionFieldLabel": "Description Field",
      "Delete": "Delete",
      "NoExtensions": "No extensions in this library",
      "DisplayNameLabel": "Display Name",
      "IconLabel": "Icon",
      "NameLabel": "Name",
      "DescLabel": "Description",
      "AddPlaceholder": "Enter extensibility library GUID ...",
      "NoLibrariesAdded": "It's quiet in here. Enter the library manifest GUID to load third party extensibility.",
      "AddLibraryLabel": "Load Library",
      "EnterValidGuid": "Please enter a valid guid :).",
      "LibraryCouldNotBeLoaded": "The library could not be loaded. Please make sure the package is uploaded and the library GUID matches the value entered.",
      "LibraryHasNoExtensions": "The library was loaded successfully but contains no extensions. Please review the getExtensions method in the library you are trying to load.",
      "WebComponentLabel":"Web Component",
      "QueryModifierLabel":"Query Modifier",
      "SuggestionProviderLabel":"Suggestion Provider",
      "HandlebarsHelperLabel":"Handlebars Helper",
      "LibraryDescription":"Description: ",
      "LibraryGuid":"GUID: ",
      "LibraryAlreadyLoaded": "This library is already loaded. Please try another GUID :)."
    },
    "RefinementEditor" : {
      "AddRefiner": "Add Filter",
      "NewFilter": "New Filter",
      "CodeHeaderText": "Edit Refiner Template",
      "HeaderText": "Edit Refiners",
      "ApplyButtonLabel" : "Apply",
      "CancelButtonLabel": "Cancel",
      "ExportButtonLabel": "Export",
      "ImportButtonLabel": "ImportButtonLabel",
      "JsonFileRequiredMessage": "Please upload a json file",
      "ManagedPropertiesListPlaceHolder": "Sélectionnez ou ajoutez une propriété gérée",      

      "SaveButtonLabel": "Enregistrer",
      "EditHandlebarsExpressionLabel": "Modifier l'expression des guidons",
      "AddHandlebarsExpressionDialogLabel": "Ajouter une expression de guidon",
      "AvailableRefinersLabel": "Filtre(s) disponible(s)",
      "RefinerDisplayValueField": "Intitulé du filtre à afficher",
      "RefinerTemplateField": "Modèle de filtre",      
      "SaveNewRefiner": "Save New Refiner",
      "IsCollapsed":"Show Expanded",
      "ShowValueFilter":"Show Filter",
      "EnterDefaultTemplate":"Enter template url",
      "CustomItemTemplateFileLabel":"Custom Template Url",
      "Templates": {
        "RefinerSortTypeSortDirectionAscending": "Ascendant",
        "RefinerSortTypeSortDirectionDescending": "Descendant",
        "RefinerSortTypeLabel": "Trier selon ce critère",
        "RefinerSortTypeAlphabetical": "Alphabétique",
        "RefinerSortTypeByNumberOfResults": "Par nombre de résultats",
        "RefinerSortTypeSortOrderLabel": "Ordre de tri",
        "RefinementItemTemplateLabel": "Filtre par défaut",
        "MutliValueRefinementItemTemplateLabel": "Filtre à valeurs multiples",
        "PersonaRefinementItemLabel": "Persona",
        "DateRangeRefinementItemLabel": "Sélecteur de dates",
        "FixedDateRangeRefinementItemLabel": "Sélecteur de dates (intervalles fixes)",
        "FileTypeRefinementItemTemplateLabel": "Types de fichier",
        "FileTypeMutliValueRefinementItemTemplateLabel": "Types de fichier multiple",
        "ContainerTreeRefinementItemTemplateLabel": "Hiérarchie de conteneurs",   
        "CustomItemTemplateLabel": "Modèle personnalisé",
        "CustomEditLabel": "Edit Template"
      }
    },
    "Sort": {
      "SortInvalidSortableFieldMessage": "Cette propriété n'est pas triable"      
    }
  }
});