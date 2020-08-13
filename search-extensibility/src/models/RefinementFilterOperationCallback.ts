import { IRefinementValue, RefinementOperator } from '..';

export type RefinementFilterOperationCallback = (filterName: string, filterValues: IRefinementValue[], Operatr: RefinementOperator) => void;