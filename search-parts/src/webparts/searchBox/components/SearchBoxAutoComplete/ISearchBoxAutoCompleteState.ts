import { ISuggestion } from "@pnp/modern-search-extensibility";

export interface ISearchBoxAutoCompleteState {
    /**
     * List of proposed suggestions in the dropdown list
     */
    proposedQuerySuggestions: ISuggestion[];

    /**
     * List of query suggestions shown with an empty search box "zero term"
     */
    zeroTermQuerySuggestions: ISuggestion[];

    /**
     * The current value of the input string
     */
    searchInputValue: string;

    /**
     * Term used as basis to get suggestion
     */
    termToSuggestFrom: string;

    /**
     * Indicates the component is retrieving suggestions
     */
    isRetrievingSuggestions: boolean;

    /**
     * Indicates the component is retrieving zero term suggestions
     */
    isRetrievingZeroTermSuggestions: boolean;

    /**
     * Indicates the component has checked for zero term suggestions
     */
    hasRetrievedZeroTermSuggestions: boolean;

    /**
     * Error message
     */
    errorMessage: string;

    /**
     * Has the current input value been searched
     */
    isSearchExecuted: boolean;
}
