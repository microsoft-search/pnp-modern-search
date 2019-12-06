import { ISuggestion } from "./ISuggestion";

export interface ISuggestionProvider {
    id: string;
    displayName: string;
    description: string;
    defaultTemplateContent: string;
    getSuggestions?: (queryText: string) => Promise<ISuggestion[]>;
    getZeroTermSuggestions?: () => Promise<ISuggestion[]>;
    enabled?: boolean;
    inlineTemplateContent?: string;
    externalTemplateUrl?: string;
}
