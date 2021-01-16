export interface ISortFieldConfiguration {
    sortField: string;
    sortDirection: SortFieldDirection;
}

export enum SortFieldDirection {
    Ascending = 1,
    Descending= 2    
}