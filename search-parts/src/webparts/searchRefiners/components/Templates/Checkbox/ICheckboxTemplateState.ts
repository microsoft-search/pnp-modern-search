import IBaseRefinerTemplateState from "../IBaseRefinerTemplateState";
import { IRefinementValue } from "../../../../../models/ISearchResult";

interface ICheckboxTemplateState extends IBaseRefinerTemplateState {

    /**
     * The current filtered values for the refiner
     */
    refinerFilteredFilterValues: IRefinementValue[];
}

export default ICheckboxTemplateState;
