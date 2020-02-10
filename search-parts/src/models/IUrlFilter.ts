import { RefinementOperator } from "./ISearchResult";

export interface IUrlFilter {
    filterName: string;
    filterOperator: RefinementOperator;
    filterValues: string | string[];
}
