import { ICustomCollectionField } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { ISearchContext } from '../..';

export interface ITemplateValueFieldEditorProps {

    /**
     * The search service instance
     */
    searchService: ISearchContext;

    /**
     * The field mode to render
     */
    useHandlebarsExpr: boolean;

    /**
     * The current CollectionData item (i.e. row)
     */
    currentItem: any;

    /**
     * The current field on the rownpm
     */
    field: ICustomCollectionField;

    /**
     * Handler when a field value is updated
     */
    onUpdate: (fieldId: string, value: any) => {};

    /**
     * The default value to display in the field
     */
    value: any;

    /**
     * Handler to validate the field at row level
     * @param fieldId the field id
     * @param errorMsg the error message to display
     */
    onCustomFieldValidation(fieldId: string, errorMsg: string);

    /**
     * Callback when the list of managed properties is fetched by the control
     */
    onUpdateAvailableProperties: (properties: IComboBoxOption[]) => void;

    /**
     * The list of available manged properties
     */
    availableProperties: IComboBoxOption[];

    /**
     * Indicates whether or not we should check if the selected proeprty is sortable or not
     */
    validateSortable?: boolean;
}