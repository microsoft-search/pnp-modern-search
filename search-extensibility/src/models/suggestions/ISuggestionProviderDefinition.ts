import { ISuggestionProvider } from './ISuggestionProvider';
import { ServiceKey } from '@microsoft/sp-core-library';

export interface ISuggestionProviderDefinition {

  /**
   * The provider internal name
   */
  name: string;

  /**
   * The provider unique key
   */
  key: string;

  /**
   * The provider description
   */
  description: string;

  /**
   * The layout service key
   */
  serviceKey: ServiceKey<ISuggestionProvider>;
}
