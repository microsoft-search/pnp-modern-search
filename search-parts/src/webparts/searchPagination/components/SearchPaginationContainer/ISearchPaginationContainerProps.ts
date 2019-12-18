import { PageUpdateCallback } from "../Paging/IPagingProps";
import { DisplayMode } from "@microsoft/sp-core-library";
import { IPaginationInformation } from "../../../../models/ISearchResult";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

export interface ISearchPaginationContainerProps {
  /**
   * Callback function when the page changes
   */  
  onPageUpdate: PageUpdateCallback;
  /**
   * The current page display mode
   */
  displayMode: DisplayMode;
  /**
   * The pagination information
   */
  paginationInformation: IPaginationInformation;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
}
