import { IPropertyFieldGroupOrPerson } from "@pnp/spfx-property-controls";

export interface IBaseWebPartProps {

    /**
     * The link URL to the solution documenation
     */
    documentationLink: string;

    /**
     * The Web Part title
     */
    title: string;

    /**
     * Target audiences for the web part (users, SharePoint groups, or security groups)
     */
    audiences: IPropertyFieldGroupOrPerson[];

    /**
     * Duration in hours to cache audience membership information
     */
    audienceCacheDuration: number;

    /**
     * The font family for the web part title
     */
    titleFont?: string;

    /**
     * The font size for the web part title
     */
    titleFontSize?: number;

    /**
     * The font color for the web part title
     */
    titleFontColor?: string;
}