/**
 * A Configuration Definition. Exposed in the IExtensibilityLibrary and consumed in the web part project.
 */
export interface IConfigurationDefinition <T> {

    /**
     * The unique ID of the configuration. Should be set to a GUID.  Used to link IConfigurationProps to IConfigurations.
     */
    id:string;
    
    /**
     * The display name for the configuration. To be used in the User Interface.
     */
    displayName:string;
    
    /**
     * The instance class for the configuration. A single configuration definition may be created several times by end users.
     */
    configurationClass:T;

}