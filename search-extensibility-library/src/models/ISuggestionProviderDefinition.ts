export interface ISuggestionProviderDefinition<T> {
    providerName: string;
    providerDisplayName: string;
    providerDescription: string;
    providerClass: T;
    providerEnabled?: boolean;
}
