import { ITemplateSlot, LayoutRenderType } from "@pnp/modern-search-extensibility";
import { IDataResultType } from "../../models/common/IDataResultType";
import { IPagingSettings } from "../../models/common/IPagingSettings";
import { IBaseWebPartProps } from "../../models/common/IBaseWebPartProps";
import { DynamicProperty } from "@microsoft/sp-component-base";
import { IExtensibilityConfiguration } from "../../models/common/IExtensibilityConfiguration";
import { IItemSelectionProps } from "../../models/common/IItemSelectionProps";
import { IQueryModifierConfiguration } from "../../queryModifier/IQueryModifierConfiguration";

export enum QueryTextSource {
    StaticValue,
    DynamicValue
}

export default interface ISearchResultsWebPartProps extends IBaseWebPartProps {

    /**
     * The selected data source key
     */
    dataSourceKey: string;

    /**
     * The data source properties. We need a weel identified property to isolate data sources (avoid playing in the root property bag values)
     */
    dataSourceProperties: {
        [key: string]: any
    };

    /**
     * The selected layout key
     */
    selectedLayoutKey: string;

    /**
     * External template URL
     */
    externalTemplateUrl: string;

    /**
     * Content of the template if customized inline (i.e. without external file of custom layout)
     */
    inlineTemplateContent: string;

    /**
     * Indicates if the selected filters should be displayed
     */
    showSelectedFilters: boolean;

    /**
     * Indicates if the current results count should be displayed 
     */
    showResultsCount: boolean;

    /**
     * Enable/Disabled the use of Microsoft Graph Toolkit
     */
    useMicrosoftGraphToolkit: boolean;

    /**
     * The layout properties
     */
    layoutProperties: {

        /**
         * Any other property from layouts (builtin + custom)
         */
        [key: string]: any;
    };

    /**
     * The layout type
     */
    layoutRenderType: LayoutRenderType;

    /**
     * Adaptive cards host config
     */
    adaptiveCardsHostConfig: string;

    /**
     * Current version of the Web Part (set by CI)
     */
    version: string;

    /**
     * The result types for template
     */
    resultTypes: IDataResultType[];

    /**
     * The Web Part paging settings
     */
    paging: IPagingSettings;

    /**
     * Determines if the Web Part should use filters component connection
     */
    useFilters: boolean;

    /**
     * Determines if the Web Part should use an input query text from a static field value or a dynamic data source on the current page
     */
    useInputQueryText: boolean;

    /**
     * Determines if the Web Part should use search verticals from an other Web Part
     */
    useVerticals: boolean;

    /**
     * Determines if the Web Part should use data from other Search Results Web Parts on the page. 
     */
    useDynamicFiltering: boolean;

    /**
     * Dynamic data connection references for filters
     */
    filtersDataSourceReference: string;

    /**
     * Dynamic data connection references for verticals
     */
    verticalsDataSourceReference: string;

    /**
     * The selected vertical fro the Web Part
     */
    selectedVerticalKeys: string[];

    /**
     * Configured slots for the current data source
     */
    templateSlots: ITemplateSlot[];

    /**
     * The input query text to pass to the data sources
     */
    queryText: DynamicProperty<string>;

    /**
     * Indicates ifthe query text comes from a static or dynamic value
     */
    queryTextSource: QueryTextSource;

    /**
     * Flag indicating if a default query text should be applied
     */
    useDefaultQueryText: boolean;

    /**
     *  The default query text to apply
     */
    defaultQueryText: string;

    /**
     * Flag indicating if the component should show nothing
     */
    showBlankIfNoResult: boolean;

    /**
     * The extensibility configuraion to load
     */
    extensibilityLibraryConfiguration: IExtensibilityConfiguration[];

    /**
     * The item selection settings
     */
    itemSelectionProps: IItemSelectionProps;

    /**
     * The data source field values when an item is selected
     * Can't be a nested property to be able to use with OOTB Dynamic Data property pane fields  
     */
    selectedItemFieldValue: DynamicProperty<string>;

    /**
     * Flag indicating if telemetry are enabled
     */
    enableTelemetry: boolean;

    /**
     * The queryModifier properties
     */
    queryModifierProperties: {
        [key: string]: any;
    };

    /**
    * Selected query modifier definition
    */
    queryModifierConfiguration: IQueryModifierConfiguration[];
}

