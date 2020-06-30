import { PageOpenBehavior } from "../helpers/UrlHelper";

export interface ISearchVertical {
    /**
     * Unique key for the vertical
     */
    key: string;

    /**
     * The query template corresponding to the vertical
     */
    queryTemplate: string;

    /**
     * The result source id corresponding to the vertical
     */
    resultSourceId: string;

    /**
     * The vertical tab name
     */
    tabName: string;

    /**
     * The Office UI Fabric icon name
     */
    iconName?: string;

    /**
     * The result count for this vertical
     */
    count?: number;

    /**
     * Specifes if the vertical is a link
     */
    isLink: boolean;

    /**
     * The link URL
     */
    linkUrl: string;

    /**
     * The link open behavior
     */
    openBehavior: PageOpenBehavior;
}