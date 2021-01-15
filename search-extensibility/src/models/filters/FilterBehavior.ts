export enum FilterBehavior {

    /**
     * If 'Dynamic', the available filters and values will be the ones returned by the data source in the `filters` array property. 
     */
    Dynamic = 'dynamic',

    /**
     * If 'Static', the available filters and values will be determined using the current results set returned by the data source (using objects properties from the `items` array property).
     */
    Static = 'static',
}