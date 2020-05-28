import { ModernSearchExtensibilityLibrary, IExtension } from 'search-extensibility';
import * as strings from 'SearchExtensibilityReferenceExtensionLibraryStrings';
import { MyCustomComponentWebComponent } from "../../extensions/webComponents/CustomComponent/CustomComponent";
import ExampleWebComponent from '../../extensions/webComponents/ExampleComponent/ExampleWebComponent';
import SharePointSuggestionProvider from '../../extensions/suggestionProviders/SharePointSuggestionProvider/SharePointSuggestionProvider';
import CustomSuggestionProvider from '../../extensions/suggestionProviders/CustomSuggestionProvider/CustomSuggestionProvider';
import CustomQueryModifier from '../../extensions/queryModifiers/CustomQueryProvider/CustomQueryProvider';
import { CustomHelper } from '../../extensions/handlebarsHelpers/Custom/CustomHelper';
import { SwitchHelper } from '../../extensions/handlebarsHelpers/Switch/SwitchHelper';
import { SwitchCaseHelper } from '../../extensions/handlebarsHelpers/SwitchCase/SwitchCaseHelper';
import { SwitchDefaultHelper } from '../../extensions/handlebarsHelpers/SwitchDefault/SwitchDefaultHelper';

export class MyCompanyLibraryLibrary extends ModernSearchExtensibilityLibrary {

  public name         : string = strings.Library.Name;
  public description  : string = strings.Library.Description;
  public icon         : string = "Settings";

  public getExtensions(): IExtension<any>[] {
    return [
      {
        name: 'pnp-custom',
        description: strings.Extensions.WebComponent.Custom.Description,
        displayName: strings.Extensions.WebComponent.Custom.DisplayName,
        icon: "StatusCircleQuestionMark",
        extensionClass: MyCustomComponentWebComponent
      },
      {
        name: "pnp-example",
        description: strings.Extensions.WebComponent.Example.Description,
        displayName: strings.Extensions.WebComponent.Example.DisplayName,
        icon: "Link",
        extensionClass: ExampleWebComponent
      },
      {
        name: "sharepoint-suggestion-provider",
        description: strings.Extensions.Suggestion.SharePoint.Description,
        displayName: strings.Extensions.Suggestion.SharePoint.DisplayName,
        icon: "SharePointAppIcon16",
        extensionClass: SharePointSuggestionProvider
      },
      {
        name: "custom-suggestion-provider",
        description: strings.Extensions.Suggestion.Custom.Description,
        displayName: strings.Extensions.Suggestion.Custom.DisplayName,
        icon:"TextOverflow",
        extensionClass: CustomSuggestionProvider
      },
      {
        name: "custom-query-modifer",
        description: strings.Extensions.QueryModifier.Custom.Description,
        displayName: strings.Extensions.QueryModifier.Custom.DisplayName,
        icon: "BranchSearch",
        extensionClass: CustomQueryModifier
      },
      {
        name: "logprop",
        description: strings.Extensions.HandlebarsHelper.Custom.Description,
        displayName: strings.Extensions.HandlebarsHelper.Custom.DisplayName,
        icon: "Handwriting",
        extensionClass: CustomHelper
      },
      {
        name:"switch",
        description: strings.Extensions.HandlebarsHelper.Switch.Description,
        displayName: strings.Extensions.HandlebarsHelper.Switch.DisplayName,
        icon: "Switch",
        extensionClass: SwitchHelper
      },
      {
        name:"case",
        description: strings.Extensions.HandlebarsHelper.Case.Description,
        displayName: strings.Extensions.HandlebarsHelper.Case.DisplayName,
        icon: "Switch",
        extensionClass: SwitchCaseHelper
      },
      {
        name:"default",
        description: strings.Extensions.HandlebarsHelper.Default.Description,
        displayName: strings.Extensions.HandlebarsHelper.Default.DisplayName,
        icon: "Switch",
        extensionClass: SwitchDefaultHelper
      }
    ];
  }

}
