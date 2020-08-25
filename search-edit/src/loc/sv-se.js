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
      "ManagedPropertiesListPlaceHolder": "Välj eller lägg till en hanterad egenskap",

      "SaveButtonLabel": "Spara",
      "EditHandlebarsExpressionLabel": "Redigera uttrycket för styret",
      "AddHandlebarsExpressionDialogLabel": "Lägg till styret uttryck",
      "AvailableRefinersLabel": "Tillgängliga filter",      
      "RefinerDisplayValueField": "Filternamn som ska visas",
      "RefinerTemplateField": "Filtermall",            
      "SaveNewRefiner": "Save New Refiner",
      "IsCollapsed":"Show Expanded",
      "ShowValueFilter":"Show Filter",
      "EnterDefaultTemplate":"Enter template url",
      "CustomItemTemplateFileLabel":"Custom Template Url",
      "Templates": {
        "RefinerSortTypeSortDirectionAscending": "Stigande",
        "RefinerSortTypeSortDirectionDescending": "Fallande",
        "RefinerSortTypeLabel": "Sorteringsordning",
        "RefinerSortTypeAlphabetical": "Alfabetisk",
        "RefinerSortTypeByNumberOfResults": "Efter antal resultat",
        "RefinerSortTypeSortOrderLabel": "Sorteringriktning",        
        "RefinementItemTemplateLabel": "Standard filter",
        "MutliValueRefinementItemTemplateLabel": "Fler värdes filter",
        "PersonaRefinementItemLabel": "Person",
        "DateRangeRefinementItemLabel": "Datumintervall",
        "FixedDateRangeRefinementItemLabel": "Datumintervall (fasta intervall)",
        "FileTypeRefinementItemTemplateLabel": "Filtyp",
        "FileTypeMutliValueRefinementItemTemplateLabel": "Flera filtyp",
        "ContainerTreeRefinementItemTemplateLabel": "Container-träd",
        "CustomItemTemplateLabel": "Benutzerdefinierte Vorlage",
        "CustomEditLabel": "Edit Template"
      }
    },
    "Sort": {
      "SortInvalidSortableFieldMessage": "Den här egenskapen är inte sorterbar"
    }
  }
});