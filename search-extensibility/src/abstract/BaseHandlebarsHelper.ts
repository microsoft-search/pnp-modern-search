import { IExtensionContext, IHandlebarsHelperInstance, ExtensionTypes } from "..";

export abstract class BaseHandlebarsHelper implements IHandlebarsHelperInstance {

    public extensionType : string = ExtensionTypes.HandlebarsHelper;
    public context : IExtensionContext;

    public abstract helper(...args:any[]) : any;

}