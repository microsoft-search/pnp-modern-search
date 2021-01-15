export interface INonReactiveTextFieldProps {

    /**
     * The default value to display
     */
    defaultValue?: string;

    /**
     * Handler when a field value is updated
     */
    onUpdate: (value: string) => void;

    /**
     * The placeholder to display in the text field
     */
    placeholderText?: string;

    /**
     * If the text field should be multiline
     */
    multiline?: boolean;

    /**
     * The text field lable
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