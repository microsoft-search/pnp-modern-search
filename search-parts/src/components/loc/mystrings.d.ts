declare interface IExtensibilityEditorStrings {
    Extensibility: {
        Delete: string;
        NoExtensions: string;
        DisplayNameLabel: string;
        IconLabel: string;
        NameLabel: string;
        DescLabel: string;
    }
}

declare module 'ExtensibilityEditorStrings' {
    const strings: IExtensibilityEditorStrings;
    export = strings;
}
