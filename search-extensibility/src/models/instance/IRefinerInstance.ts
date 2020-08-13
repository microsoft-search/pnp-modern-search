import { IExtensionInstance, IRefinerProps, IPropertyPaneComposite } from "../..";

export interface IRefinerInstance extends IExtensionInstance, IRefinerProps, IPropertyPaneComposite {
    render: () => Promise<void>;    
}