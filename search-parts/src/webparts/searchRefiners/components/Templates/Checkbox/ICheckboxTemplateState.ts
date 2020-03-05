import IBaseRefinerTemplateState from "../IBaseRefinerTemplateState";
import { IRefinementValue } from "../../../../../models/ISearchResult";

interface ICheckboxTemplateState extends IBaseRefinerTemplateState {

    /**
     * The current selected values for the refiner
     */
    refinerSelectedFilterValues: IRefinementValue[];

    /**
     * The current filtered values for the refiner
     */
    refinerFilteredFilterValues: IRefinementValue[];
}

export default ICheckboxTemplateState;
