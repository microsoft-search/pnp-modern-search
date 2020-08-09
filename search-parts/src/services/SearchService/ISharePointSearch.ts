import {ISearchParams} from 'search-extensibility';

export interface ISharePointSearch extends ISearchParams {
    pageNumber?:number;
    useOldSPIcons?:boolean;
}