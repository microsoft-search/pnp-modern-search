import { IPropertyPaneField } from "@microsoft/sp-property-pane";
import { IConfigurationProps } from "./IConfigurationProps";

/**
 * The Configuration Instance model.
 */
export interface IConfiguration {

    /**
     * The properties this configuration is exposing
     */
    properties: IConfigurationProps;

    /**
     * Returns the property pane controls this configuration is providing.
     * @param targetPropertyPrefix prefix path to the property within the web part property bag
     */
    getPropertyPaneFields(targetPropertyPrefix: string): IPropertyPaneField<any>[];

}
