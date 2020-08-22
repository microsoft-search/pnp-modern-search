import { ISearchContext } from '../..';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';

/**
 * Defines only relevant properties
 */
export interface IPropertyPaneSearchManagedPropertiesProps {
    
    /**
     * The control label
     */
    label: string;

    /**
     * Description of the control
     */
    description: string;

    /**
     * The default selected key
     */
    defaultSelectedKey?: string;

    /**
     * The default selected key
     */
    defaultSelectedKeys: string[];

    /**
     * The search service instance
     */
    searchService: ISearchContext;

    /**
     * Callback when the list of managed properties is fetched by the control
     */
    onUpdateAvailableProperties: (properties: IComboBoxOption[]) => void;

    /**
     * Callback when the property valu is updated
     */
    onPropertyChange: (propertyPath: string, newValue: any) => void;

    /**
     * The list of available managed properties already fetched once
     */
    availableProperties: IComboBoxOption[];

    /**
     * Indicates whether or not we should allow multiple selection
     */
    allowMultiSelect?: boolean;
}