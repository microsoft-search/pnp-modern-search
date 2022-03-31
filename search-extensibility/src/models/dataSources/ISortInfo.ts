import { SortFieldDirection } from './SortFieldDirection';

/**
 * Use this interface to send data when custonm sort event is raised
 */
export interface ISortInfo {
    /**
     * The sort field name
     */
    sortFieldName: string;

    /**
     * The sort field direction
     */
    sortFieldDirection: SortFieldDirection;
}