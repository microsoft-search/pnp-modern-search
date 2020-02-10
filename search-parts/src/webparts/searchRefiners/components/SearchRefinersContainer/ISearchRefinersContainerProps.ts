import { IRefinementResult, IRefinementFilter } from "../../../../models/ISearchResult";
import IRefinerConfiguration from "../../../../models/IRefinerConfiguration";
import { DisplayMode } from "@microsoft/sp-core-library";
import RefinersLayoutOption from "../../../../models/RefinersLayoutOptions";
import IUserService from '../../../../services/UserService/IUserService';
import { IReadonlyTheme } from "@microsoft/sp-component-base";

export interface ISearchRefinersContainerProps {
  /**
   * The Web Part title
   */
  webPartTitle: string;

  /**
   * List of available refiners from the connected search results Web Part
   */
  availableRefiners: IRefinementResult[];

  /**
   * The Web Part refiners configuration
   */
  refinersConfiguration: IRefinerConfiguration[];

  /**
   * List of the deafault selected filters (based on the url config parameters)
   */
  defaultSelectedRefinementFilters: IRefinementFilter[];

  /**
   * The selected layout
   */
  selectedLayout: RefinersLayoutOption;

  /**
   * Handler method when a filter value is updated in children components
   */
  onUpdateFilters: (filters: IRefinementFilter[]) => void;

  /**
   * Indicates if we should show blank if no refinement result
   */
  showBlank: boolean;

  /**
   * The current page display mode
   */
  displayMode: DisplayMode;

  /**
   * The current UI language
   */
  language: string;

  /**
   * The current search query
   */
  query: string;

  /**
   * UserService
   */
  userService: IUserService;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
}
