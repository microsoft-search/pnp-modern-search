import { IHandlebarsHelperInstance, IQueryModifierInstance, ISuggestionProviderInstance, IWebComponentInstance, IRefinerInstance } from '..';

export class ExtensionTypes {
    public static HandlebarsHelper : string = "HandlebarsHelper";
    public static QueryModifer : string = "QueryModifier";
    public static SuggestionProvider: string = "SuggestionProvider";
    public static WebComponent: string = "WebComponent";
    public static Refiner: string = "Refiner";
}

export type ExtensionType = IHandlebarsHelperInstance | IQueryModifierInstance | ISuggestionProviderInstance | IWebComponentInstance | IRefinerInstance;