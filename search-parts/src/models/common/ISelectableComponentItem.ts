export interface ISelectableComponentItem {
    /**
     * The key of the element used for selection. Needed to track selected items when pages are updated
     */
    itemKey?: string;

    /**
     * The current selection keys. Needed to set the selected state of the component.
     */
    selectedKeys?: string[];

    /**
     * Flag indicating if items can be selected in the results
     */
    allowItemSelection?: boolean;

    /**
     * The current index of item. Needed for the the SelectionZone to lookup the correct item im the collection.
     */
    index?: string;
}