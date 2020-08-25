import { IRefinementResult, IRefinementFilter, IRefinerConfiguration, RefinersLayoutOption } from "search-extensibility";
import { DisplayMode } from "@microsoft/sp-core-library";
import { IUserService } from 'search-extensibility';
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import BaseTemplateService from "../../../../services/TemplateService/BaseTemplateService";

export interface ISearchRefinersContainerProps {
  /**
   * The Web Part title
   */
  webPartTitle: string;

  /**
   * Default selected refinement filters
   */
  defaultSelectedRefinementFilters: IRefinementFilter[];

  /**
   * List of available refiners from the connected search results Web Part
   */
  availableRefiners: IRefinementResult[];

  /**
   * The Web Part refiners configuration
   */
  refinersConfiguration: IRefinerConfiguration[];

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
   * Instance Id
   */
  instanceId: string;

  /**
   * Filter web part styles
   */
  styles: string;

  /**
   * DOM element
   */
  domElement:HTMLElement;

  /**
   * Web url
   */
  webUrl: string;

  /**
   * Site url
   */
  siteUrl:string;
  
}
