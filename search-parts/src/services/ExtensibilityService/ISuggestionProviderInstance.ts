import { ISuggestionProviderDefinition } from "./ISuggestionProviderDefinition";
import { BaseSuggestionProvider } from "../../providers/BaseSuggestionProvider";

export interface ISuggestionProviderInstance<T> extends ISuggestionProviderDefinition<T> {
  instance: BaseSuggestionProvider;
  isInitialized: boolean;
}
