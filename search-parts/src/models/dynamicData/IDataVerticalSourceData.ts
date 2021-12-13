import { IDataVertical } from "@pnp/modern-search-extensibility";
import { IDataVerticalConfiguration } from "../common/IDataVerticalConfiguration";

export interface IDataVerticalSourceData {

    /**
     * The current selected vertical
     */
    selectedVertical: IDataVertical;

    /**
     * The serch verticals configuration. Used to determnine counts for other tabs.
     */
    verticalsConfiguration: IDataVerticalConfiguration[];
}