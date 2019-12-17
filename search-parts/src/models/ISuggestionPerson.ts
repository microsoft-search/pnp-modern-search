import { ISuggestion } from "./ISuggestion";

export interface ISuggestionPerson extends ISuggestion {
  emailAddress: string;
  jobTitle: string;
}
