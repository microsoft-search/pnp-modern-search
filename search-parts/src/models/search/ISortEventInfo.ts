import { ISortFieldConfiguration } from '@pnp/modern-search-extensibility/lib/models/ISortFieldConfiguration';

export interface ISortEventInfo {
    
    /**
     * The current sorting
     */
    sortList: ISortFieldConfiguration[];
}
