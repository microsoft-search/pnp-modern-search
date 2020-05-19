import { IExtensionInstance } from "./IExtensionInstance";

export interface IWebComponentInstance extends IExtensionInstance {

    allAttributes : { [key: string] : any };

}