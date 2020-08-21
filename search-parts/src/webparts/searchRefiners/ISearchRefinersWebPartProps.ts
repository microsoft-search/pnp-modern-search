import { IRefinerConfiguration, RefinersLayoutOption } from "search-extensibility";

export interface ISearchRefinersWebPartProps {
  webPartTitle: string;
  showBlank: boolean;
  refinersConfiguration: IRefinerConfiguration[];
  searchResultsDataSourceReference: string;
  selectedLayout: RefinersLayoutOption;
  styles:string;
  extensibilityLibraries: string[];
}