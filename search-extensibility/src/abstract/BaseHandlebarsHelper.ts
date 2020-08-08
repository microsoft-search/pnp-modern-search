import { IExtensionContext } from "../models/IExtensionContext";
import { IHandlebarsHelperInstance } from "../models/instance/IHandlebarsHelperInstance";
import { ExtensionTypes } from "../utility/ExtensionTypes";

export abstract class BaseHandlebarsHelper implements IHandlebarsHelperInstance {

    public extensionType : string = ExtensionTypes.HandlebarsHelper;
    public context : IExtensionContext;

    public abstract helper(...args:any[]) : any;

}