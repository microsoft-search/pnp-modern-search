import { IDataVerticalConfiguration } from "../../../models/common/IDataVerticalConfiguration";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { IWebPartTitleProps } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import { ITokenService } from "@pnp/modern-search-extensibility";

export interface ISearchVerticalsContainerProps {

  /**
   * The current search verticals information
   */
  verticals: IDataVerticalConfiguration[];

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

  /**
   * The default selected vertical
   */
  defaultSelectedKey: string;

  /**
   * Vertical tabs background color
   */
  verticalBackgroundColor?: string;

  /**
   * Vertical tabs border color
   */
  verticalBorderColor?: string;

  /**
   * Vertical tabs border thickness in pixels
   */
  verticalBorderThickness?: number;

  /**
   * Vertical tabs font size in pixels
   */
  verticalFontSize?: number;

  /**
   * Vertical tabs mouse over color
   */
  verticalMouseOverColor?: string;

  /**
   * Title font family
   */
  titleFont?: string;

  /**
   * Title font size in pixels
   */
  titleFontSize?: number;

  /**
   * Title font color
   */
  titleFontColor?: string;

  /**
   * Web part instance ID for unique styling
   */
  instanceId?: string;
}
