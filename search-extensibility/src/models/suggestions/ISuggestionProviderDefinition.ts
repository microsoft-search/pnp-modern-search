import { ISuggestionProvider } from './ISuggestionProvider';

export interface ISuggestionProviderDefinition {

    /**
     * The provider internal name
     */
    name: string;

    /**
     * The provider unique key
     */
    key: string;

    /**
     * The provider description
     */
    description: string;

    /**
     * The suggestion provider service key
     */
    serviceKey: any;
}
