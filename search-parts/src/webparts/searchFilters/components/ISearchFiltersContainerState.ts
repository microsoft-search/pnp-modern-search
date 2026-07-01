import { IDataFilter, IDataFilterInternal } from "@pnp/modern-search-extensibility";

export interface ISearchFiltersContainerState {

    /**
     * The selected/unselected filters sent to the Handlebars templates as context for rendering
     */
    currentUiFilters: IDataFilterInternal[];

    /**
     * Filters submitted to the data source
     */
    submittedFilters: IDataFilter[];

    /**
     * Indicates if filter updates are currently being processed
     */
    isUpdatingResults?: boolean;

    /**
     * Filter name currently driving the busy state.
     */
    activeBusyFilterName?: string;
}