import * as React from 'react';
import { ISearchPaginationContainerProps } from './ISearchPaginationContainerProps';
import Paging from '../Paging/Paging';
import styles from '../SearchPaginationWebPart.module.scss';
import { MessageBarType, MessageBar } from 'office-ui-fabric-react/lib/MessageBar';
import { DisplayMode } from "@microsoft/sp-core-library";
import * as strings from 'SearchPaginationWebPartStrings';

export default class SearchPaginationContainer extends React.Component<ISearchPaginationContainerProps, {}> {
  public render(): React.ReactElement<ISearchPaginationContainerProps> {
    let renderWpContent: JSX.Element = null;

    let shouldDisplay = false;
    if (this.props.paginationInformation && this.props.paginationInformation.TotalRows > 0) {
      shouldDisplay = Math.ceil(this.props.paginationInformation.TotalRows / this.props.paginationInformation.MaxResultsPerPage) > 1;
    }
    
    if (shouldDisplay) {
      renderWpContent = <div className={styles.searchPagination}>
      <Paging
        themeVariant={this.props.themeVariant}
        totalItems={this.props.paginationInformation.TotalRows}
        itemsCountPerPage={this.props.paginationInformation.MaxResultsPerPage}
        onPageUpdate={this.props.onPageUpdate}
        currentPage={this.props.paginationInformation.CurrentPage} />
      </div>;
    }
    else if (this.props.displayMode === DisplayMode.Edit) {
      renderWpContent = <MessageBar messageBarType={MessageBarType.info}>{strings.ShowBlankEditInfoMessage}</MessageBar>;
    }

    return renderWpContent;
  }
}
