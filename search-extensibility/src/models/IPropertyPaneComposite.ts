import { IPropertyPanePage } from "@microsoft/sp-webpart-base";

export interface IPropertyPaneComposite {
    getPropertyPages?: () => IPropertyPanePage[];
}