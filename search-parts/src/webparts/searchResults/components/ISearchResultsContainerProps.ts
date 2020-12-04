import { IDataSource, IDataFilterResult } from "@pnp/modern-search-extensibility";
import ISearchResultsWebPartProps from "../ISearchResultsWebPartProps";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IDataContext } from "@pnp/modern-search-extensibility";
import { PageContext } from "@microsoft/sp-page-context";
import { ServiceScope } from "@microsoft/sp-core-library";
import { IWebPartTitleProps } from "@pnp/spfx-controls-react/lib/WebPartTitle";

export interface ISearchResultsContainerProps {

  /**
   * The current Web Part data context
   */
  dataContext: IDataContext;

  /**
   * The current page context
   */
  pageContext: PageContext;

  /**
   * The selected data source instance
   */
  dataSource: IDataSource;

  /**
   * The selected data source key
   */
  dataSourceKey: string;

  /**
   * The template content before processing
   */
  templateContent: string;

  /**
   * The Web Part properties so they can be used in Handlebars template
   */
  properties: ISearchResultsWebPartProps;

  /**
   * The current theme information
   */
  themeVariant: IReadonlyTheme;

  /**
   * The Web Part instance ID
   */
  instanceId: string;

  /**
   * Handler when the data have been retrieved form the source. Useful to list all available fields from the source.
   */
  onDataRetrieved: (availableDataSourceFields: string[], filters?: IDataFilterResult[], pageNumber?: number, nextLinkUrl?: string, pageLinks?: string[]) => void;

  /**
   * The current service scope
   */
  serviceScope: ServiceScope;

  /**
   * The Web Part Title props
   */
  webPartTitleProps: IWebPartTitleProps;
}
