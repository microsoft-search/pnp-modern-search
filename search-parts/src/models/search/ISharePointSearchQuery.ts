/**
 * Describes the SearchQuery interface
 */
export interface ISharePointSearchQuery {
    /**
     * A string that contains the text for the search query.
     */
    Querytext?: string;
    /**
     * A string that contains the text that replaces the query text, as part of a query transform.
     */
    QueryTemplate?: string;
    /**
     * A Boolean value that specifies whether the result tables that are returned for
     * the result block are mixed with the result tables that are returned for the original query.
     */
    EnableInterleaving?: boolean;
    /**
     * A Boolean value that specifies whether stemming is enabled.
     */
    EnableStemming?: boolean;
    /**
     * A Boolean value that specifies whether duplicate items are removed from the results.
     */
    TrimDuplicates?: boolean;
    /**
     * A Boolean value that specifies whether the exact terms in the search query are used to find matches, or if nicknames are used also.
     */
    EnableNicknames?: boolean;
    /**
     * A Boolean value that specifies whether the query uses the FAST Query Language (FQL).
     */
    EnableFQL?: boolean;
    /**
     * A Boolean value that specifies whether the phonetic forms of the query terms are used to find matches.
     */
    EnablePhonetic?: boolean;
    /**
     * A Boolean value that specifies whether to perform result type processing for the query.
     */
    BypassResultTypes?: boolean;
    /**
     * A Boolean value that specifies whether to return best bet results for the query.
     * This parameter is used only when EnableQueryRules is set to true, otherwise it is ignored.
     */
    ProcessBestBets?: boolean;
    /**
     * A Boolean value that specifies whether to enable query rules for the query.
     */
    EnableQueryRules?: boolean;
    /**
     * A Boolean value that specifies whether to sort search results.
     */
    EnableSorting?: boolean;
    /**
     * Specifies whether to return block rank log information in the BlockRankLog property of the interleaved result table.
     * A block rank log contains the textual information on the block score and the documents that were de-duplicated.
     */
    GenerateBlockRankLog?: boolean;
    /**
     * The result source ID to use for executing the search query.
     */
    SourceId?: string;
    /**
     * The ID of the ranking model to use for the query.
     */
    RankingModelId?: string;
    /**
     * The first row that is included in the search results that are returned.
     * You use this parameter when you want to implement paging for search results.
     */
    StartRow?: number;
    /**
     * The maximum number of rows overall that are returned in the search results.
     * Compared to RowsPerPage, RowLimit is the maximum number of rows returned overall.
     */
    RowLimit?: number;
    /**
     * The maximum number of rows to return per page.
     * Compared to RowLimit, RowsPerPage refers to the maximum number of rows to return per page,
     * and is used primarily when you want to implement paging for search results.
     */
    RowsPerPage?: number;
    /**
     * The managed properties to return in the search results.
     */
    SelectProperties?: string[];
    /**
     * The locale ID (LCID) for the query.
     */
    Culture?: number;
    /**
     * The set of refinement filters used when issuing a refinement query (FQL)
     */
    RefinementFilters?: string[];
    /**
     * The set of refiners to return in a search result.
     */
    Refiners?: string;
    /**
     * The additional query terms to append to the query.
     */
    HiddenConstraints?: string;
    /**
     * The list of properties by which the search results are ordered.
     */
    SortList?: ISort[];
    /**
     * The amount of time in milliseconds before the query request times out.
     */
    Timeout?: number;
    /**
     * The properties to highlight in the search result summary when the property value matches the search terms entered by the user.
     */
    HitHighlightedProperties?: string[];
    /**
     * The type of the client that issued the query.
     */
    ClientType?: string;
    /**
     * The GUID for the user who submitted the search query.
     */
    PersonalizationData?: string;
    /**
     * The URL for the search results page.
     */
    ResultsUrl?: string;
    /**
     * Custom tags that identify the query. You can specify multiple query tags
     */
    QueryTag?: string;
    /**
     * Properties to be used to configure the search query
     */
    Properties?: ISearchProperty[];
    /**
     *  A Boolean value that specifies whether to return personal favorites with the search results.
     */
    ProcessPersonalFavorites?: boolean;
    /**
     * The location of the queryparametertemplate.xml file. This file is used to enable anonymous users to make Search REST queries.
     */
    QueryTemplatePropertiesUrl?: string;
    /**
     * Special rules for reordering search results.
     * These rules can specify that documents matching certain conditions are ranked higher or lower in the results.
     * This property applies only when search results are sorted based on rank.
     */
    ReorderingRules?: IReorderingRule[];
    /**
     * The number of properties to show hit highlighting for in the search results.
     */
    HitHighlightedMultivaluePropertyLimit?: number;
    /**
     * A Boolean value that specifies whether the hit highlighted properties can be ordered.
     */
    EnableOrderingHitHighlightedProperty?: boolean;
    /**
     * The managed properties that are used to determine how to collapse individual search results.
     * Results are collapsed into one or a specified number of results if they match any of the individual collapse specifications.
     * In a collapse specification, results are collapsed if their properties match all individual properties in the collapse specification.
     */
    CollapseSpecification?: string;
    /**
     * The locale identifier (LCID) of the user interface
     */
    UIlanguage?: number;
    /**
     * The preferred number of characters to display in the hit-highlighted summary generated for a search result.
     */
    DesiredSnippetLength?: number;
    /**
     * The maximum number of characters to display in the hit-highlighted summary generated for a search result.
     */
    MaxSnippetLength?: number;
    /**
     * The number of characters to display in the result summary for a search result.
     */
    SummaryLength?: number;
}

export interface ISort {
    /**
     * The name for a property by which the search results are ordered.
     */
    Property: string;
    /**
     * The direction in which search results are ordered.
     */
    Direction: SortDirection;
}

/**
 * Defines the SortDirection enum
 */
export enum SortDirection {
    Ascending = 0,
    Descending = 1,
    FQLFormula = 2
}

/**
 * Defines one search property
 */
export interface ISearchProperty {
    Name: string;
    Value: ISearchPropertyValue;
}

/**
 * Defines one search property value. Set only one of StrlVal/BoolVal/IntVal/StrArray.
 */
export interface ISearchPropertyValue {
    StrVal?: string;
    BoolVal?: boolean;
    IntVal?: number;
    StrArray?: string[];
    QueryPropertyValueTypeIndex: QueryPropertyValueType;
}

/**
 * Defines how ReorderingRule interface, used for reordering results
 */
export interface IReorderingRule {
    /**
     * The value to match on
     */
    MatchValue: string;
    /**
     * The rank boosting
     */
    Boost: number;
    /**
    * The rank boosting
    */
    MatchType: ReorderingRuleMatchType;
}

/**
 * defines the ReorderingRuleMatchType  enum
 */
export declare enum ReorderingRuleMatchType {
    ResultContainsKeyword = 0,
    TitleContainsKeyword = 1,
    TitleMatchesKeyword = 2,
    UrlStartsWith = 3,
    UrlExactlyMatches = 4,
    ContentTypeIs = 5,
    FileExtensionMatches = 6,
    ResultHasTag = 7,
    ManualCondition = 8
}

/**
 * Specifies the type value for the property
 */
export declare enum QueryPropertyValueType {
    None = 0,
    StringType = 1,
    Int32Type = 2,
    BooleanType = 3,
    StringArrayType = 4,
    UnSupportedType = 5
}