
import { MyCustomComponentWebComponent } from "../CustomComponent";
import { IComponentDefinition } from "../../models/IComponentDefinition";
import { IExtensibilityLibrary } from "../../models/IExtensibilityLibrary";
import { ISuggestionProviderDefinition } from "../../models/ISuggestionProviderDefinition";
import { CustomSuggestionProvider } from "../CustomSuggestionProvider";

export class MyCompanyLibraryLibrary implements IExtensibilityLibrary {

  public getCustomWebComponents(): IComponentDefinition<any>[] {
    return [
      {
        componentName: 'my-custom-component',
        componentClass: MyCustomComponentWebComponent
      }
    ];
  }

  public getCustomSuggestionProviders(): ISuggestionProviderDefinition<any>[] {
    return [
      {
        providerName: CustomSuggestionProvider.ProviderName,
        providerDisplayName: CustomSuggestionProvider.ProviderDisplayName,
        providerDescription: CustomSuggestionProvider.ProviderDescription,
        providerClass: CustomSuggestionProvider
      },
    ];
  }
}
