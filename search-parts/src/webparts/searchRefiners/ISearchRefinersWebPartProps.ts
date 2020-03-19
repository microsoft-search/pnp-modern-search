import IRefinerConfiguration from "../../models/IRefinerConfiguration";
import RefinersLayoutOption from "../../models/RefinersLayoutOptions";

export interface ISearchRefinersWebPartProps {
  webPartTitle: string;
  showBlank: boolean;
  refinersConfiguration: IRefinerConfiguration[];
  showFilterBoxForRefinerValues: boolean;
  searchResultsDataSourceReference: string;
  selectedLayout: RefinersLayoutOption;
}
