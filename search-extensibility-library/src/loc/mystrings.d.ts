declare interface ISearchExtensibilityReferenceExtensionLibraryStrings {
  Library: {
    Name: string;
    Description: string;
  },
  Extensions: {
    HandlebarsHelper: {
      Custom: {
        DisplayName: string;
        Description: string;
      },
      Switch: {
        DisplayName: string;
        Description: string;
      },
      Case: {
        DisplayName: string;
        Description: string;
      },
      Default: {
        DisplayName: string;
        Description: string;
      }
    },
    QueryModifier: {
      Custom : {
        DisplayName: string;
        Description: string;
      }
    },
    Suggestion: {
      SharePoint: {
        DisplayName: string,
        Description: string,
        GroupName: string
      },
      Custom: {
        DisplayName: string,
        Description: string,
        GroupName: string,
        Zero: {
          DisplayText: string,
          Description: string,
          HoverText: string
        },
        ResultOne: {
          GroupName: string,
          DisplayText: string,
          Description: string,
          HoverText: string
        },
        ResultTwo:{
          GroupName: string,
          DisplayText: string,
          Description: string,
          HoverText: string
        }
      }
    },
    WebComponent: {
      Custom: {
        DisplayName: string,
        Description: string
      },
      Example: {
        DisplayName: string,
        Description: string
      }
    }
  }
}

declare module 'SearchExtensibilityReferenceExtensionLibraryStrings' {
  const strings: ISearchExtensibilityReferenceExtensionLibraryStrings;
  export = strings;
}
