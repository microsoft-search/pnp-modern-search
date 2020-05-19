import { IExtensionInstance } from "./IExtensionInstance";
import { ISuggestion } from '../ISuggestion';

export interface ISuggestionProviderInstance extends IExtensionInstance {

    readonly isSuggestionsEnabled: boolean;

    readonly isZeroTermSuggestionsEnabled: boolean;

    onInit(): Promise<void>;

    getSuggestions(queryText: string): Promise<ISuggestion[]>;

    getZeroTermSuggestions(): Promise<ISuggestion[]>;

}

