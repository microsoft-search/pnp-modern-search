import { IRefinementFilter, IRefinementResult } from "search-extensibility";

export interface ISearchRefinersContainerState {
    selectedRefinementFilters: IRefinementFilter[];
    shouldResetFilters: boolean;
    availableRefiners: IRefinementResult[];
}