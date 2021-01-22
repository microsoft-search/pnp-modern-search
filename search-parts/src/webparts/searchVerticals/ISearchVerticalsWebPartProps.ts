import { IBaseWebPartProps } from "../../models/common/IBaseWebPartProps";
import { IDataVertical } from "../../models/common/IDataVertical";

export interface ISearchVerticalsWebPartProps extends IBaseWebPartProps {

    /**
     * The Web Part title
     */
    title: string;

    /**
     * The configured verticals 
     */
    verticals: IDataVertical[];
}