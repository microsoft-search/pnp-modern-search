
export class ExtensionHelper {
    
    public static create<T>(type: {new(...args:any[]): T;}, ...args:any[]): T {
        return new type(...args);
    }

    public static IsWebComponent(extensionClass: any) : boolean {
        return (typeof extensionClass.prototype.connectedCallback == "function"
                && typeof extensionClass.prototype.disconnectedCallback == "function"
                && typeof extensionClass.prototype.resolveAttributes == "function");
    }

    public static IsQueryModifier(extensionClass:any): boolean {
        return (typeof extensionClass.prototype.onInit == "function" && typeof extensionClass.prototype.modifyQuery == "function");
    }

    public static IsSuggestionProvider(extensionClass:any):boolean {
        return (typeof extensionClass.prototype.onInit =="function"
            && typeof extensionClass.prototype.getSuggestions =="function"
            && typeof extensionClass.prototype.getZeroTermSuggestions =="function"
            && typeof extensionClass.prototype.isSuggestionsEnabled =="boolean"
            && typeof extensionClass.prototype.isZeroTermSuggestionsEnabled == "boolean"
            );
    }

    public static IsHandlebarsHelper(extensionClass:any): boolean {
        return (typeof extensionClass.prototype.helper == "function");
    }

}
