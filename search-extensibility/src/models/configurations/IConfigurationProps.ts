/**
 * Configuration Properties
 */
export interface IConfigurationProps {
    
    /**
     * The id of the Configuration Definition to relate properties to functionality
     */
    configurationId:string;

    /**
     * Unique key to access this configuration from within the template context root
     */
    key: string;

    /**
     * Any other custom properties exposed in this configuration
     */
    [key:string]: any;
    
}