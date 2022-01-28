export interface IPropertyPaneNonReactiveTextFieldProps {
    
    /**
     * The unique key for the component
     */
    componentKey: string;

    /**
     * The default value to display
     */
    defaultValue?: string;
    /**
     * The placeholder to display in the text field
     */
    placeholderText?: string;

    /**
     * If the text field should be multiline
     */
    multiline?: boolean;

    /**
     * The text field label
     */
    label?: string;

    /**
     * The text field description
     */
    description?: string;

    /**
     * The text to display in the 'apply' button
     */
    applyBtnText?: string;

    /**
     * The number of rows to display
     */
    rows?: number;

    /**
     * Flag indicating if the user can save an empty value
     */
    allowEmptyValue?: boolean;
}