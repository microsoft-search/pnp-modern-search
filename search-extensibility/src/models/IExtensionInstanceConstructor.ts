import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IExtensionInstanceConstructor {
    new (context:WebPartContext);
}