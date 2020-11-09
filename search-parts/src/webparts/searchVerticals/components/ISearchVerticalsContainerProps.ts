import { IDataVertical } from "../../../models/common/IDataVertical";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { IWebPartTitleProps } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import { ITokenService } from "@pnp/modern-search-extensibility";

export interface ISearchVerticalsContainerProps {

  /**
   * The current search verticals information
   */
  verticals: IDataVertical[];

  /**
   * Acllback handler when a vertical is selected
   */
  onVerticalSelected: (itemKey: string) => void;

  /**
   * The current theme variant
   */
  themeVariant: IReadonlyTheme | undefined;

  /**
   * The Web Part Title props
   */
  webPartTitleProps: IWebPartTitleProps;

  /**
   * An instance of the token service
   */
  tokenService: ITokenService;
}
