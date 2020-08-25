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
      "ManagedPropertiesListPlaceHolder": "Auswählen oder Hinzufügen einer verwalteten Eigenschaft",
      
      "SaveButtonLabel": "Speichern",
      "EditHandlebarsExpressionLabel": "Lenkerausdruck bearbeiten",
      "AddHandlebarsExpressionDialogLabel": "Lenkerausdruck hinzufügen",
      "AvailableRefinersLabel": "Verfügbare Einschränkungen ",
      "RefinerDisplayValueField": "Name des anzuzeigenden Filters",
      "RefinerTemplateField": "Einschränkungs Vorlage",      
      "SaveNewRefiner": "Save New Refiner",
      "IsCollapsed":"Show Expanded",
      "ShowValueFilter":"Show Filter",
      "EnterDefaultTemplate":"Enter template url",
      "CustomItemTemplateFileLabel":"Custom Template Url",
      "Templates": {
        "RefinerSortTypeSortDirectionAscending": "Aufsteigend",
        "RefinerSortTypeSortDirectionDescending": "Absteigend",
        "RefinerSortTypeLabel": "Einschränkungs Sortiertyp",
        "RefinerSortTypeAlphabetical": "Alphabetisch",
        "RefinerSortTypeByNumberOfResults": "Nach Anzahl der Ergebnisse",
        "RefinerSortTypeSortOrderLabel": "Sortierreihenfolge",
        "RefinementItemTemplateLabel": "Standard-Einschränkungselement",
        "MutliValueRefinementItemTemplateLabel": "Mehrwertiges Einschränkungselement",
        "PersonaRefinementItemLabel": "Persona",
        "DateRangeRefinementItemLabel": "Datumsbereich",
        "FixedDateRangeRefinementItemLabel": "Datumsbereich (feste Intervalle)",
        "FileTypeRefinementItemTemplateLabel": "Dateityp",
        "FileTypeMutliValueRefinementItemTemplateLabel": "Mehrere Dateitypen",
        "ContainerTreeRefinementItemTemplateLabel": "Container-Baum",
        "CustomItemTemplateLabel": "Benutzerdefinierte Vorlage",
        "CustomEditLabel": "Edit Template"
      },
      "Sort": {
        "SortInvalidSortableFieldMessage": "Diese Eigenschaft ist nicht sortierbar"
      }
    }
  }
});