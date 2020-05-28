declare interface IModernSearchExtensibilityLibraryStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  Delete: string;
  NoExtensions: string;
  DisplayNameLabel: string;
  IconLabel: string;
  NameLabel: string;
  DescLabel: string;
  LoadButtonLabel: string;
  AddPlaceholder: string;
  PanelTitle: string;
  NoLibrariesAdded: string;
  AddLibraryLabel:string;
  EnterValidGuid:string;
  LibraryCouldNotBeLoaded:string;
  LibraryHasNoExtensions:string;
  WebComponentLabel:string;
  QueryModifierLabel:string;
  SuggestionProviderLabel:string;
  HandlebarsHelperLabel:string;
  LibraryDescription:string;
  LibraryGuid:string;
  LibraryAlreadyLoaded:string;
}

declare module 'ModernSearchExtensibilityLibraryStrings' {
  const strings: IModernSearchExtensibilityLibraryStrings;
  export = strings;
}
