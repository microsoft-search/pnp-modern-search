import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ISuggestionProvider } from '@pnp/modern-search-extensibility';

export interface ISearchBoxAutoCompleteProps {
  placeholderText: string;
  suggestionProviders: ISuggestionProvider[];
  inputValue: string;
  onSearch: (queryText: string, isReset?: boolean) => void;
  domElement: HTMLElement;

  /**
   * The number of suggestions to display for each group
   */
  numberOfSuggestionsPerGroup: number;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
}
