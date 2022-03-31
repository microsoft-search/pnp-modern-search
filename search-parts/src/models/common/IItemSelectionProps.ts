import { FilterConditionOperator } from "@pnp/modern-search-extensibility";

export interface IItemSelectionProps {
    /**
     * Flag indicating if items can be selected in the results
     */
    allowItemSelection: boolean;

    /**
     * The destination field
     */
    destinationFieldName: string;

    /**
     * The selection mode (i.e. how to use the selected value)
     */
    selectionMode: ItemSelectionMode;

    /**
     * Allow multiple values to be select=ed
     */
    allowMulti: boolean;

    /**
     * The logical operator to use between values
     */
    valuesOperator: FilterConditionOperator;
}

export enum ItemSelectionMode {
    AsTokenValue = 'AsTokenValue',
    AsDataFilter = 'AsDataFilter'
}