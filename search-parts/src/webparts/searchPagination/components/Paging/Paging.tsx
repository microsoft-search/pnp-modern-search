import * as React from        'react';
import IPagingProps from      './IPagingProps';
import Pagination from        'react-js-pagination';
import styles from '../SearchPaginationWebPart.module.scss';
import IPagingState from './IPagingState';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

export default class Paging extends React.Component<IPagingProps, IPagingState> {

    constructor(props: IPagingProps) {
        super(props);

        this.state = {
            currentPage: props.currentPage
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IPagingProps) {
        if (this.state.currentPage !== nextProps.currentPage)
        {
            this.setState({
                currentPage: nextProps.currentPage
            });
        }
    }

    public render(): React.ReactElement<IPagingProps> {

        let isThemeInverted = false;
        if (this.props.themeVariant && this.props.themeVariant.isInverted) {
          isThemeInverted = true;
        }

        const { palette }: IReadonlyTheme = this.props.themeVariant;
        
        return(
            <div className={styles.searchPagination__paginationContainer}>
                <div className={`${styles.searchPagination__paginationContainer__pagination} ${isThemeInverted ? 'inverted': ''}`}>
                <Pagination
                    activePage={this.state.currentPage}
                    firstPageText={<i style={{backgroundColor: palette.themeLight}} className='ms-Icon ms-Icon--DoubleChevronLeft' aria-hidden='true'></i>}
                    lastPageText={<i style={{backgroundColor: palette.themeLight}} className='ms-Icon ms-Icon--DoubleChevronRight' aria-hidden='true'></i>}
                    prevPageText={<i style={{backgroundColor: palette.themeLight}} className='ms-Icon ms-Icon--ChevronLeft' aria-hidden='true'></i>}
                    nextPageText={<i style={{backgroundColor: palette.themeLight}} className='ms-Icon ms-Icon--ChevronRight' aria-hidden='true'></i>}
                    activeLinkClass={ `${styles.active} ${isThemeInverted ? styles.active__inverted: ''}`}
                    itemsCountPerPage={ this.props.itemsCountPerPage }
                    totalItemsCount={ this.props.totalItems }
                    pageRangeDisplayed={5}
                    onChange={(pageNumber: number) => {
                        this.setState({
                            currentPage: pageNumber
                        });
                        this.props.onPageUpdate(pageNumber);
                    }}
                />                      
                </div>
            </div>
        );
    }
}
    