export interface ISuggestion {
    text: string;
    onSuggestionSelected?: (suggestion: ISuggestion) => boolean;
}
