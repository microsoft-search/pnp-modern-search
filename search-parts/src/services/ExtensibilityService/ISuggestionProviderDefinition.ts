export interface ISuggestionProviderDefinition<T> {
  providerName: string;
  providerDisplayName: string;
  providerDescription: string;
  providerDefaultTemplateContent: string;
  providerClass: T;
  providerEnabled?: boolean;
  providerExternalTemplateUrl?: string;
}
