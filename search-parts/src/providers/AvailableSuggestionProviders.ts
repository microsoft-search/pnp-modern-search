import * as strings from 'CommonStrings';
import { ISuggestionProviderDefinition } from "@pnp/modern-search-extensibility";

export enum BuiltinSuggestionProviderKeys {
    SharePointStaticSuggestions = 'SharePointStaticSuggestions',
}

export class AvailableSuggestionProviders {

    /**
     * Returns the list of builtin data sources for the Search Results
     */
    public static BuiltinSuggestionProviders: ISuggestionProviderDefinition[] = [
        {
            name: strings.SuggestionProviders.SharePointStatic.ProviderName,
            key: BuiltinSuggestionProviderKeys.SharePointStaticSuggestions.toString(),
            description: strings.SuggestionProviders.SharePointStatic.ProviderDescription,
            serviceKey: null // ServiceKey will be created dynamically for builtin source
        }
    ];
}