import { ISearchContext } from "../ISearchContext";
import { IComboBoxOption } from "office-ui-fabric-react/lib/ComboBox";


export interface ISearchManagedPropertiesProps {

    /**
     * The search service instance
     */
    searchService: ISearchContext;

    /**
     * The default selected key
     */
    defaultSelectedKey?: string;

    /**
     * The default selected key
     */
    defaultSelectedKeys?: string [];

    /**
     * Handler when a field value is updated
     */
    onUpdate: (value: any, isSortable?: boolean) => void;

    /**
     * Callback when the list of managed properties is fetched by the control
     */
    onUpdateAvailableProperties: (properties: IComboBoxOption[]) => void;

    /**
     * The list of available managed properties already fetched once
     */
    availableProperties: IComboBoxOption[];

    /**
     * Indicates whether or not we should check if the selected proeprty is sortable or not
     */
    validateSortable?: boolean;

    /**
     * Indicates whether or not we should allow multiple selection
     */
    allowMultiSelect?: boolean;

    /**
     * The field label
     */
    label?: string;

}