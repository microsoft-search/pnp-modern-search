export interface IExtensibilityConfiguration {
    
    /**
     * A friendly name/purpose of the library to load
     */
    name: string;

    /**
     * The manifest GUID of the library
     */
    id: string;

    /**
     * Flag indicating if the ibrary is enabled/disabled
     */
    enabled: boolean;
}