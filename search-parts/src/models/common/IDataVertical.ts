import { PageOpenBehavior } from "../../helpers/UrlHelper";

export interface IDataVertical {
    /**
     * Unique key for the vertical
     */
    key: string;

    /**
     * The vertical tab name
     */
    tabName: string;

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

    /**
     * The Office UI Fabric icon name
     */
    iconName?: string;
}