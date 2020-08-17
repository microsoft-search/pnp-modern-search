
import { PropertyPaneExtensibilityEditor } from '../../components/ExtensibilityEditor/ExtensibilityEditorPropertyPane';

export class SearchEditComponentsLibrary {
  
  public getExtensibilityEditor() : typeof PropertyPaneExtensibilityEditor {
    return PropertyPaneExtensibilityEditor;
  }

  public getRefinersEditor() {

  }

}
