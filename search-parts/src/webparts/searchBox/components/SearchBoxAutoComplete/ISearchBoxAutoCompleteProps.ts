import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ISuggestionProviderInstance } from '../../../../services/ExtensibilityService/ISuggestionProviderInstance';

export interface ISearchBoxAutoCompleteProps {
  placeholderText: string;
  suggestionProviders: ISuggestionProviderInstance<any>[];
  inputValue: string;
  onSearch: (queryText: string, isReset?: boolean) => void;
  domElement: HTMLElement;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
};
