import { IReadonlyTheme } from '@microsoft/sp-component-base';
//import { ISuggestionProviderInstance } from '../../../../services/ExtensibilityService/ISuggestionProviderInstance';
import { ISuggestionProviderInstance } from 'search-extensibility';

export interface ISearchBoxAutoCompleteProps {
  placeholderText: string;
  suggestionProviders: ISuggestionProviderInstance[];
  inputValue: string;
  onSearch: (queryText: string, isReset?: boolean) => void;
  domElement: HTMLElement;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
}
