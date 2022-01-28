/**
 * Representation of selected filters as a token
 */
export interface IDataFilterToken {
       
    /**
     * Individual filters information
     */
    [filterName: string] : IDataFilterTokenValue;

}

export interface IDataFilterTokenValue {

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
}