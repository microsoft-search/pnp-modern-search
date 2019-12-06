import { PageOpenBehavior, QueryPathBehavior } from '../../helpers/UrlHelper';
import { DynamicProperty } from '@microsoft/sp-component-base';
import { ISuggestionProviderDefinition } from '../../services/ExtensibilityService/ISuggestionProviderDefinition';

interface ISearchBoxWebPartProps {
    searchInNewPage: boolean;
    pageUrl: string;
    queryPathBehavior: QueryPathBehavior;
    queryStringParameter: string;
    openBehavior: PageOpenBehavior;
    enableQuerySuggestions: boolean;
    useDynamicDataSource: boolean;
    NlpServiceUrl: string;
    enableNlpService: boolean;
    enableDebugMode: boolean;
    isStaging: boolean;
    defaultQueryKeywords: DynamicProperty<string>;
    placeholderText: string;
    suggestionProviders: ISuggestionProviderDefinition<any>[];
}

export default ISearchBoxWebPartProps;
