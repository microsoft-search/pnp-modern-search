export interface ISearchBoxContainerState {
    selectedScopeKey: string;

    /**
     * The current value of the input string
     */
    searchInputValue: string;

    /**
     * Error message
     */
    errorMessage: string;

    /**
     * Show Clear button in the Search Box
     */
    showClearButton: boolean;
}