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
}