
import { MyCustomComponentWebComponent } from "../CustomComponent";
import { IComponentDefinition } from "../../models/IComponentDefinition";
import { IExtensibilityLibrary } from "../../models/IExtensibilityLibrary";

export class MyCompanyLibraryLibrary implements IExtensibilityLibrary {

  public getCustomWebComponents(): IComponentDefinition<any>[] {
    return [
      {
        componentName: 'my-custom-component',
        componentClass: MyCustomComponentWebComponent
      }
    ];
  }
}
