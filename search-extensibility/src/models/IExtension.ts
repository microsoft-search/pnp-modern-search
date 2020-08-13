import { IExtensionInstance } from "..";

export interface IExtension<T extends IExtensionInstance> {
    
    /**
     * The class implementing the logic of the component
     */
    extensionClass: T;

    /**
     * The name of the component
     */
    name: string;

    /**
     * The display name of the component
     */
    displayName: string;
    
    /**
     * The description of the component
     */
    description: string;

    /**
     * The fabric icon to display the extension in the UI
     */
    icon?:string;

    /**
     * Determines if the extension is enabled
     */
    enabled?:boolean;

}