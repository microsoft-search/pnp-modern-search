import { IExtensionInstance } from "./IExtensionInstance";
import { IRefinementResult, IRefinementValue } from "../ISearchResult";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IUserService } from "../IUserService";
import { RefinementFilterOperationCallback } from "../RefinementFilterOperationCallback";

export interface IRefinerInstance extends IExtensionInstance {

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

  /**
   * Indicates if the value filter should be visible
   */
  showValueFilter: boolean;

}