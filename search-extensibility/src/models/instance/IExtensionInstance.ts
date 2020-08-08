import { IExtensionContext } from "../IExtensionContext";

export interface IExtensionInstance {
    
    extensionType: string;
    context: IExtensionContext;

}
