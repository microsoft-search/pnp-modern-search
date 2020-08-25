import { IRefinementResult, IRefinerConfiguration, IRefinementFilter } from "search-extensibility";
import { RefinementFilterOperationCallback, IUserService } from 'search-extensibility';
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import BaseTemplateService from "../../../../services/TemplateService/BaseTemplateService";

interface IFilterLayoutProps {

  /**
   * The refinement results
   */
  refinementResults: IRefinementResult[];

  /**
   * The Web Part refiners configuration
   */
  refinersConfiguration: IRefinerConfiguration[];

  /**
   * Indicates if at least a filter value has been selected
   */
  hasSelectedValues: boolean;

  /**
   * Handler method called from sub components when a refiner values have been updated (added or removed)
   */
  onFilterValuesUpdated: RefinementFilterOperationCallback;

  /**
   * Handler method called when all filters are removed
   */
  onRemoveAllFilters: () => void;

  /**
   * Indicates if we should reset filters for all refiners
   */
  shouldResetFilters: boolean;

  /**
   * The current selected filters (i.e global state for all refiners)
   */
  selectedFilters: IRefinementFilter[];

  /**
   * The current UI language
   */
  language: string;

  /**
   * UserService
   */
  userService: IUserService;

  /**
   * Template Service
   */
  templateService: BaseTemplateService;
  
  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;

  /**
   * Content class name
   */
  contentClassName: string;

  /**
   * Instance id
   */
  instanceId: string;

  /**
   * Web Url
   */
  webUrl: string;

  /**
   * Site Url
   */
  siteUrl:string;
  
}

export default IFilterLayoutProps;
