import { IRefinementValue } from "..";

export interface IRefinerState {

    /**
     * The current selected values for the refiner 
     */
    refinerSelectedFilterValues: IRefinementValue[];

    /**
     * Value on which refinement values will be filtered
     */
    valueFilter?: string;
} 