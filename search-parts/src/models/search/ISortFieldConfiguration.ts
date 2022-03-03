import { SortFieldDirection } from "@pnp/modern-search-extensibility"; 

export interface ISortFieldConfiguration {
    sortField: string;
    sortDirection: SortFieldDirection;
    initialSort: boolean;
    userSort: boolean;
    sortFieldFriendlyName: string;
}