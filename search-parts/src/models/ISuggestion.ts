import { SuggestionType } from "./SuggestionType";

export interface ISuggestion {
  type: SuggestionType;
  displayText: string;
  hoverText?: string;
  targetUrl?: string;
  icon?: string;
  groupName?: string;
  onSuggestionSelected?: (suggestion: ISuggestion) => void;
}
