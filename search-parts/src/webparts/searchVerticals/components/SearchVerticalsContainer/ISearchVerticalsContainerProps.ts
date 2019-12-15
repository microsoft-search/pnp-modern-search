import { ISearchVertical } from "../../../../models/ISearchVertical";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

interface ISearchVerticalsContainerProps {

  /**
   * The current search verticals information
   */
  verticals: ISearchVertical[];

  /**
   * Acllback handler when a vertical is selected
   */
  onVerticalSelected: (itemKey: string) => void;

  /**
   * Indicates if verticals should display the result count for each category
   */
  showCounts: boolean;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;
}

export default ISearchVerticalsContainerProps;