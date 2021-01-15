export interface ISuggestion {

    /**
     * The text to display for that suggestion
     */
    displayText: string;

    /**
     * The text to display when hover
     */
    hoverText?: string;

    /**
     * A quick sub description of this suggestion
     */
    description?: string;

    /**
     * The suggestion URL
     */
    targetUrl?: string;

    /**
     * Optionnal icon source
     */
    iconSrc?: string;

    /**
     * The groupe name where belong this suggestion
     */
    groupName?: string;

    /**
     * Callback handler when the suggestion is clicked
     */
    onSuggestionSelected?: (suggestion: ISuggestion) => void;
}
