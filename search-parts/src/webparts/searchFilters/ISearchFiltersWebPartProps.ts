import { IBaseWebPartProps } from "../../models/common/IBaseWebPartProps";
import { IDataFilterConfiguration, FilterConditionOperator } from "@pnp/modern-search-extensibility";

export default interface ISearchFiltersWebPartProps extends IBaseWebPartProps {
    
    /**
     * Dynamic data connection references for connected Search Results Web Parts
     */
    dataResultsDataSourceReferences: string[];

    /**
     * The filters configuration
     */
    filtersConfiguration: IDataFilterConfiguration[];

    /**
     * Content of the template if customized inline (i.e. without external file of custom layout)
     */
    inlineTemplateContent: string;

    /**
     * External template URL
     */
    externalTemplateUrl: string;

    /**
     * The selected layout key
     */
    selectedLayoutKey: string;

    /**
     * The configured logical operator to use between filters
     */
    filterOperator: FilterConditionOperator;
    
    /**
     * The layout properties
     */
    layoutProperties: {

        /**
         * Any other property from layouts (builtin + custom)
         */
        [key:string]: any 
    };

    /**
     * Determines if the Web Part shoul use data verticals from an othe Web Part
    */
    useVerticals: boolean;

    /**
     * Dynamic data connection references for verticals
     */
    verticalsDataSourceReference: string;

    /**
     * The selected vertical fro the Web Part
     */
    selectedVerticalKeys: string[];
}