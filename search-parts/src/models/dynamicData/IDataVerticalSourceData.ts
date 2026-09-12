import { IDataVertical } from "@pnp/modern-search-extensibility";
import { IDataVerticalConfiguration } from "../common/IDataVerticalConfiguration";

export interface IDataVerticalSourceData {

    /**
     * The current selected vertical
     */
    selectedVertical: IDataVertical;

    /**
     * Determines whether connected filters are cleared when the selected vertical changes.
     */
    clearFiltersOnVerticalChange?: boolean;

    /**
     * The serch verticals configuration. Used to determnine counts for other tabs.
     */
    verticalsConfiguration: IDataVerticalConfiguration[];
}