import { IComboBoxOption } from '@fluentui/react';

export interface IAsyncComboState {

    /**
     * Selected keys (multi values mode)
     */
    selectedOptionKeys?: string[];

    /**
     * The text value to show in the combo box
     */
    textDisplayValue: string;

    /**
     * Options to display in the combo box
     */
    options: IComboBoxOption[];

    /**
     * Error message to display if needed
     */
    errorMessage?: string;
}