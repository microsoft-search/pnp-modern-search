import { IExtensionInstance } from "../..";

export interface IWebComponentInstance extends IExtensionInstance {

    allAttributes : { [key: string] : any };

}