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

  /**
   * Search box height in pixels
   */
  searchBoxHeight?: number;

  /**
   * Search box font size in pixels
   */
  searchBoxFontSize?: number;

  /**
   * Search box border color
   */
  searchBoxBorderColor?: string;

  /**
   * Search button background color
   */
  searchButtonColor?: string;

  /**
   * Placeholder text color
   */
  placeholderTextColor?: string;

  /**
   * Search box text color
   */
  searchBoxTextColor?: string;

  /**
   * Show search button when no text is present
   */
  showSearchButtonWhenEmpty?: boolean;

  /**
   * Search button display mode: 'icon', 'text', 'both'
   */
  searchButtonDisplayMode?: 'icon' | 'text' | 'both';

  /**
   * Search icon name (Fluent UI icon)
   */
  searchIconName?: string;

  /**
   * Text to display in search button
   */
  searchButtonText?: string;
}
