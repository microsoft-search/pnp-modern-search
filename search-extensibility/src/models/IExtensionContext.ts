import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISearchContext, ITemplateContext } from '..';

export interface IExtensionContext {
    webPart: WebPartContext;
    search: ISearchContext;
    template: ITemplateContext;
}