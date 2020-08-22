import { PropertyPaneSearchManagedProperties } from '../../editors/PropertyPaneSearchManagedProperties/PropertyPaneSearchManagedProperties';
import { PropertyPaneExtensibilityEditor } from '../../editors/ExtensibilityEditor/ExtensibilityEditorPropertyPane';
import { PropertyPaneRefinerEditor } from '../../editors/RefinerEditor/RefinerEditorPropertyPane';
import { TemplateValueFieldEditor } from '../../editors/TemplateValueFieldEditor/TemplateValueFieldEditor';
import { SearchManagedProperties } from '../../controls/SearchManagedProperties/SearchManagedProperties';
import { IEditorLibrary } from 'search-extensibility';

export class SearchEditComponentsLibrary implements IEditorLibrary {
  
  public getExtensibilityEditor() : typeof PropertyPaneExtensibilityEditor {
    return PropertyPaneExtensibilityEditor;
  }

  public getRefinersEditor() : typeof PropertyPaneRefinerEditor {
    return PropertyPaneRefinerEditor;
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
