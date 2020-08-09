import { IRefinementValue, RefinementOperator } from './ISearchResult';

export type RefinementFilterOperationCallback = (filterName: string, filterValues: IRefinementValue[], Operatr: RefinementOperator) => void;