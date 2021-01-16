import { IDataFilterResult } from "@pnp/modern-search-extensibility";

export interface ISharePointSearchResult {
    [key: string]: string;

    // Known SharePoint managed properties
    Title?: string;
    Path?: string;
    FileType?: string;
    HitHighlightedSummary?: string;
    AuthorOWSUSER?: string;
    owstaxidmetadataalltagsinfo?: string;
    Created?: string;
    UniqueID?: string;
    NormSiteID?: string;
    NormListID?: string;
    NormUniqueID?: string;
}

export interface ISharePointSearchResults {
    queryModification?: string;
    queryKeywords: string;
    relevantResults: ISharePointSearchResult[];
    secondaryResults: ISharePointSearchResultBlock[];
    refinementResults: IDataFilterResult[];
    promotedResults?: ISharePointSearchPromotedResult[];
    spellingSuggestion?: string;
    totalRows: number;
}

export interface ISharePointSearchPromotedResult {
    url: string;
    title: string;
    description: string;
}

export interface ISharePointSearchResultBlock {
    title: string;
    results: ISharePointSearchResult[];
}
  