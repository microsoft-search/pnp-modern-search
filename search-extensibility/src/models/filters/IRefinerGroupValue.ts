export interface IRefinerGroupValue {

    /**
     * The label shown in the filter
     */
    label: string;
    /**
     * If advanced = false: A comma seperated list of values belonging to the filter group 
     * If advanced = true: A fql statement
     */
    fql:string;
    /**
     * Advanced = false for simple filter group fql
     * Advanced = true for advanced filter group fql
     */
    advanced:boolean;
}