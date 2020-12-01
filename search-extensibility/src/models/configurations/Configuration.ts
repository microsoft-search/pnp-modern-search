import { IPropertyPaneField } from "@microsoft/sp-property-pane";
import { IConfiguration } from "./IConfiguration";
import { IConfigurationProps } from "./IConfigurationProps";

/**
 * Abstract Configuration Class.  Used to create custom configurations in 3rd party extensibility libraries.
 */
export abstract class Configuration implements IConfiguration {

    /**
     * The Properties for this configuration. Can be extended
     */
    public properties: IConfigurationProps;

    /**
     * Base constructor ensures properties are created.
     */
    constructor() {
        this.properties = {
            key: "",
            configurationId: ""
        };
    }

    /**
     * getPropertyPaneFields: Abstract method to expose the creation of property pane fields
     * @param targetPropertyPrefix The path to the target property in the web parts property bag. Used to prefix targetProperty in property pane control to ensure changes are serialized into the correct place.
     */
    public abstract getPropertyPaneFields(targetPropertyPrefix: string): IPropertyPaneField<any>[];

    /**
     * initProperties: Initializes custom properties into the Configuration's base properties.
     * @param properties The new properties to add to this Configuration. 
     */
    protected initProperties(properties: any) {
        this.properties = {
            ...this.properties,
            ...properties
        };
    }

}
