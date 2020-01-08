export interface ISuggestion {
  displayText: string;
  hoverText?: string;
  description?: string;
  targetUrl?: string;
  icon?: string;
  groupName?: string;
  onSuggestionSelected?: (suggestion: ISuggestion) => void;
}
