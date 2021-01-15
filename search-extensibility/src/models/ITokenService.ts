export interface ITokenService {

    /**
     * Sets the value for a specific token
     * @internal this method is not intended to be used directly in your code.
     * @param token the token name
     * @param value the value to set
     */
    setTokenValue(token: string, value: any): void;

    /**
     * Resolves tokens for the specified input string.
     * @param string 
     */
    resolveTokens(string: string): Promise<string>;

    /**
     * Retrieves available current page properties
     * @internal this method is not intended to be used directly in your code.
     */
    getPageProperties(): Promise<any>;

    /**
     * Retrieve all current user profile properties
     * @internal this method is not intended to be used directly in your code.
     */
    getUserProfileProperties(): Promise<IProfileProperties>;
}

export interface IProfileProperties {
    [propertyName: string]: string;
}