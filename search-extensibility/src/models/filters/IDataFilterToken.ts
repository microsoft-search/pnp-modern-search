import { FilterConditionOperator, IDataFilterValue } from "../..";

/**
 * Representation of selected filters as a token
 */
export interface IDataFilterToken {

    /**
     * The operator to use between filter ('and' or 'or)
     */
    operator: FilterConditionOperator;
        
    /**
     * Individual filters information
     */
    [filterName: string] : IDataFilterTokenValue | FilterConditionOperator;

}

export interface IDataFilterTokenValue {

    /**
     * The filter value as object (ex: to be parsed by a custom adaptive function)
     */
    valueAsObject: IDataFilterValue[];

    /**
     * The filter value as text. If the filter is multi values, all values will be seperated by a comma ','
     */
    valueAsText: string;
    
    /**
     * If the filter is a date, the from date value
     */
    fromDate?: string;

    /**
     * If the filter is a date, the to date value
     */
    toDate?: string;

    /**
     * The operator to use between filter values ('and' or 'or)
     */
    operator: FilterConditionOperator;
}