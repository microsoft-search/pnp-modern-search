import { IExtensionInstance } from "./IExtensionInstance";

export interface IHandlebarsHelperInstance extends IExtensionInstance {

    helper(...args:any[]) : any;

}