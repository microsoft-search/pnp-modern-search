import { IHandlebarsHelperInstance } from '../models/instance/IHandlebarsHelperInstance';
import { IQueryModifierInstance } from '../models/instance/IQueryModifierInstance';
import { ISuggestionProviderInstance } from '../models/instance/ISuggestionProviderInstance';
import { IWebComponentInstance } from '../models/instance/IWebComponentInstance';
import { IRefinerInstance } from '../models/instance/IRefinerInstance';

export class ExtensionTypes {
    public static HandlebarsHelper : string = "HandlebarsHelper";
    public static QueryModifer : string = "QueryModifier";
    public static SuggestionProvider: string = "SuggestionProvider";
    public static WebComponent: string = "WebComponent";
    public static Refiner: string = "Refiner";
}

export type ExtensionType = IHandlebarsHelperInstance | IQueryModifierInstance | ISuggestionProviderInstance | IWebComponentInstance | IRefinerInstance;