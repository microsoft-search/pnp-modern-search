import { INlpResponse } from "../../../../models/INlpResponse";

interface ISearchBoxContainerState {

    /**
     * The enhanced query response
     */
    enhancedQuery: INlpResponse;

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

export default ISearchBoxContainerState;
