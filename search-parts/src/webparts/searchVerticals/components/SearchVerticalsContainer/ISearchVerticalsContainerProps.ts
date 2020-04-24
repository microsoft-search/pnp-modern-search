import { ISearchVertical } from "../../../../models/ISearchVertical";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { ITokenService } from "../../../../services/TokenService";

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
  * Indicates which vertical needs to be selected by default
  */
  defaultVerticalKey: string;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;

  /**
   * An instance of the token service
   */
  tokenService: ITokenService;
}

export default ISearchVerticalsContainerProps;