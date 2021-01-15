import { IDataFilterValue } from "./IDataFilter";

/**
 * This interface is used to send filter information back to the Web Part through predefined events
 */
export interface IDataFilterInfo {

    /**
     * The filter internal name (not the display name)
     */
    filterName: string;

    /**
     * The selected or unselected values for that filter
     */
    filterValues: IDataFilterValueInfo[];

    /**
     * Indicates if the new filters should be submitted to the data source. This is useful when you want to clear multi values filters in a single operation
     */
    forceUpdate?: boolean;

    /**
     * The Web Part instance ID
     */
    instanceId: string;
}

export interface IDataFilterValueInfo extends IDataFilterValue {

    /**
     * Indicates if the value is selected or not
     */
    selected: boolean;
}