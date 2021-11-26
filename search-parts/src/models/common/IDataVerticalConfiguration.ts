import { PageOpenBehavior } from "../../helpers/UrlHelper";

export interface IDataVerticalConfiguration {
    /**
     * Unique key for the vertical
     */
    key: string;

    /**
     * The vertical tab name
     */
    tabName: string;

    /**
     * The vertical tab value that will be sent to connected Web Parts
     */
    tabValue: string;

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
     * If the vertical is a link, show a icon near the tab name to indicate user it is a link.
     */
    showLinkIcon: boolean;

    /**
     * The Fluent UI icon name
     */
    iconName?: string;
}