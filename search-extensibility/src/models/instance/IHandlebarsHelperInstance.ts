import { IExtensionInstance } from "../..";

export interface IHandlebarsHelperInstance extends IExtensionInstance {

    helper(...args:any[]) : any;

}