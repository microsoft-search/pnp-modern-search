// https://docs.microsoft.com/en-us/graph/api/resources/searchresponse?view=graph-rest-beta
import { EntityType } from "../../dataSources/MicrosoftSearchDataSource";

export interface IMicrosoftSearchResponse {
    hitsContainers: ISearchHitsContainer[];
    searchTerms: string[];
}

export interface ISearchHitsContainer {
    hits: ISearchHit[];
    moreResultsAvailable: boolean;
    total: number;
    aggregations: ISearchResponseAggregation[];
}

export interface ISearchHit {
    hitId: string;
    rank: number;
    summary: string;
    contentSource: string;
    resource: ISearchResponseResource;
}

export interface ISearchResponseAggregation {
    field: string;
    size?: number;
    buckets: IBucket[];
}

export interface IBucket {
    key: string;
    count: number;
    aggregationFilterToken: string;
}

export interface ISearchResponseResource {
    "@odata.type": string;
    fields?: {
        [fieldName: string]: string;
    };
}