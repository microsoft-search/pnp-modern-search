import { IDataVertical } from "../common/IDataVertical";

export interface IDataVerticalSourceData {

    /**
     * The current selected vertical
     */
    selectedVertical: IDataVertical;

    /**
     * The serch verticals configuration. Used to determnine counts for other tabs.
     */
    verticalsConfiguration: IDataVertical[];
}