import { IPropertyPaneField, PropertyPaneSlider, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { Configuration, IConfigurationProps } from "@pnp/modern-search-extensibility";

/**
 * Additional properties to be added to the configuration
 */
export interface ExampleConfigurationProps extends IConfigurationProps {
    exampleString:string;
    exampleNumber:number;
}

/**
 * Example Configuration Class
 */
export class ExampleConfiguration extends Configuration {

    /**
     * Overload the properties to include our custom properties
     */
    public properties : ExampleConfigurationProps;

    /**
     * Overload constructor to ensure properties are being created.
     */
    constructor() {
        super(); 
        
        // Initialize Custom Properties into the instance.
        this.initProperties({
            exampleString: "",
            exampleNumber: 0
        });

    }

    /**
     * Return custom property pane fields
     * @param targetPropertyPrefix The path to the target properties within the web parts property bag
     */
    public getPropertyPaneFields(targetPropertyPrefix:string): IPropertyPaneField<any>[] {
        return [
            PropertyPaneTextField(targetPropertyPrefix + "exampleString",{ // note we need to combine the targetPropertyPrefix with the name of the custom property
                label: "Example Property",
                value: this.properties.exampleString, 
                deferredValidationTime: 500,    // The web part refreshes on changes to the property bag. We throttle key changes with the below settings to ensure a decent UX.
                validateOnFocusIn: true,
                validateOnFocusOut: true, 
                onGetErrorMessage: this._validateEmptyField.bind(this)
            }),
            PropertyPaneSlider(targetPropertyPrefix + "exampleNumber",{ // note we need to combine the targetPropertyPrefix with the name of the custom property
                label: "Example Number",
                min: 1,
                max: 5,
                value: this.properties.exampleNumber
            })
        ];
    }

    /**
     * Example custom validation
     * @param value the string to validate
     */
    private _validateEmptyField(value: string): string {

        if (!value) {
            return "Example Component says this value cannot be empty :).";
        }

        return '';

    }

}