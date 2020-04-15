import { ISearchVertical } from "../../models/ISearchVertical";

export interface ISearchVerticalsWebPartProps {
    
    /**
     * The configured search verticals 
     */
    verticals: ISearchVertical[];

    /**
     * Indicates if we should display result counts
     */
    showCounts: boolean;

    /**
     * Indicates which querystring parameter we need to try and get
     */
    defaultVerticalQuerystringParam: string;

    /**
     * The connected search results Web Part data source refrence
     */
    searchResultsDataSourceReference: string;
}
  