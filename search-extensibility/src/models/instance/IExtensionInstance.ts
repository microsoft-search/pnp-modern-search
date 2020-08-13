import { IExtensionContext } from "../..";

export interface IExtensionInstance {
    
    extensionType: string;
    context: IExtensionContext;

}
