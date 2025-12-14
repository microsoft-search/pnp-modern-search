import { IBaseWebPartProps } from "../../models/common/IBaseWebPartProps";
import { IDataVerticalConfiguration } from "../../models/common/IDataVerticalConfiguration";

export interface ISearchVerticalsWebPartProps extends IBaseWebPartProps {

    /**
     * The Web Part title
     */
    title: string;

    /**
     * The configured search verticals 
     */
    verticals: IDataVerticalConfiguration[];

    /**
     * The query string parameter name to use to select a vertical tab by default
     */
    defaultVerticalQueryStringParam: string;

    /**
     * Vertical tabs background color
     */
    verticalBackgroundColor?: string;

    /**     * Vertical border color
     */
    verticalBorderColor?: string;

    /**
     * Vertical border thickness in pixels
     */
    verticalBorderThickness?: number;

    /**     * Vertical tabs font size in pixels
     */
    verticalFontSize?: number;

    /**
     * Vertical tabs mouse over color
     */
    verticalMouseOverColor?: string;

    /**
     * Title font family
     */
    titleFont?: string;

    /**
     * Title font size in pixels
     */
    titleFontSize?: number;

    /**
     * Title font color
     */
    titleFontColor?: string;
}