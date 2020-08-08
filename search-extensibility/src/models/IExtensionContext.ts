import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IContextTemplate } from "./IContextTemplate";
import { IContextSearch } from "./IContextSearch";

export interface IExtensionContext {
    webPart: WebPartContext;
    search: IContextSearch;
    template: IContextTemplate;
}