import { IRefinementResult, IRefinementFilter, IRefinementValue } from "../../../../models/ISearchResult";
import RefinementFilterOperationCallback from "../../../../models/RefinementValueOperationCallback";
import IUserService from '../../../../services/UserService/IUserService';
import { IReadonlyTheme } from "@microsoft/sp-component-base";

interface IBaseRefinerTemplateProps {

  /**
   * The refiner values to render
   */
  refinementResult: IRefinementResult;

  /**
   * The current selected values for this refinement result
   * Used to build local state for sub components
   */
  selectedValues: IRefinementValue[];

  /**
   * Callback method to update selected filters
   */
  onFilterValuesUpdated: RefinementFilterOperationCallback;

  /**
   * Indicates if the template allows multi values selection
   */
  isMultiValue?: boolean;

  /**
   * Indicates if the current filters should be reset
   */
  shouldResetFilters: boolean;

  /**
   * A single filter value to reset
   */
  removeFilterValue?: IRefinementValue;

  /**
   * UserService
   */
  userService?: IUserService;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
}

export default IBaseRefinerTemplateProps;
