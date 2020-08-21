import { PropertyPaneSearchManagedProperties } from '../../components/PropertyPaneSearchManagedProperties/PropertyPaneSearchManagedProperties';
import { PropertyPaneExtensibilityEditor } from '../../components/ExtensibilityEditor/ExtensibilityEditorPropertyPane';
import { RefinerEditor } from '../../components/RefinerEditor/RefinerEditor';
import { TemplateValueFieldEditor } from '../../components/TemplateValueFieldEditor/TemplateValueFieldEditor';
import { SearchManagedProperties } from '../../controls/SearchManagedProperties/SearchManagedProperties';

export class SearchEditComponentsLibrary {
  
  public getExtensibilityEditor() : typeof PropertyPaneExtensibilityEditor {
    return PropertyPaneExtensibilityEditor;
  }

  public getRefinersEditor() : typeof RefinerEditor {
    return RefinerEditor;
  }
  
  public getSearchManagedPropertiesEditor() : typeof SearchManagedProperties {
    return SearchManagedProperties;
  }

  public getPropertyPaneSearchManagedProperties() : typeof PropertyPaneSearchManagedProperties {
    return PropertyPaneSearchManagedProperties;
  }

  public getTemplateValueFieldEditor() : typeof TemplateValueFieldEditor {
    return TemplateValueFieldEditor;
  }

}
