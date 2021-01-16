export interface IPagingSettings {

    /**
     * Indicates whether or not the paging should be displayed
     */
    showPaging: boolean;
    
    /**
     * The number of items to display per page
     */
    itemsCountPerPage: number;

    /**
     * The page range to display (default 5)
     */
    pagingRange: number;

    /**
     * Hide first/last navigation buttons for the paging control
     */
    hideFirstLastPages: boolean;

    /**
     * Hide navigation buttons (prev page, next page)
     */
    hideNavigation: boolean;

    /**
     * Hide navigation buttons (prev, next, first, last) if they are disabled.
     */
    hideDisabled: boolean;

    /**
     * Flag indicating if the data source use @odata.nextLink to handle server-side paging
     */
    useNextLinks: boolean;
}