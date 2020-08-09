import { IRefinementFilter, IRefinementValue, RefinementOperator } from 'search-extensibility';

type RefinementFilterOperationCallback = (filterName: string, filterValues: IRefinementValue[], Operatr: RefinementOperator) => void;

export default RefinementFilterOperationCallback;