import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import Pagination from        'react-js-pagination';
import { Icon, ITheme } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import styles from './PaginationComponent.module.scss';

export type PageUpdateCallback = (pageNumber: number, pageLink: string, pageLinks: string[]) => void;

export interface IPageEventInfo {
    
    /**
     * The page number currently selected
     */
    pageNumber: number;

    /**
     * If available, the page link associated with the page number 
     */
    pageLink?: string;

    /**
     * All the page links currently available in the pagination component
     */
    pageLinks?: string[];
}

export interface IPaginationComponentProps {

    /**
     * The total number of items retrieved from the data source if known.
     */
    totalItems: string;
    
    /**
     * The number of items per page
     */
    itemsCountPerPage: string;

    /**
     * The current page number
     */
    currentPageNumber: string;

    /**
     * The page range to display 
     */
    range?: string;

    /**
     * Handler method called when a page is updated
     */
    onPageUpdate: PageUpdateCallback;

    /**
     * Hide first/last navigation buttons for the paging control
     */
    hideFirstLastPages: boolean;

    /**
     * Hide navigation buttons (prev page, next page)
     */
    hideNavigation: boolean;

    /**
     * Hide navigation buttons (prev, next, first, last) if they are disabled.
     */
    hideDisabled: boolean;

    /**
     * The pre-calculated page links.
     */
    pageLinks: string[];

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;
}

export interface IPaginationComponentState {

    /**
     * The current page number
     */
    currentPageNumber: number;
}

export class PaginationComponent extends React.Component<IPaginationComponentProps, IPaginationComponentState> {

    private _pagelink: string;

    constructor(props: IPaginationComponentProps) {
        super(props);

        this.state = {
            currentPageNumber: parseInt(props.currentPageNumber)
        };
    }

    public render() {

        let pageLinks: string[] = [];
        let firstLink: string;
        let lastLink: string;
        let currentLink: string;
        let prevLink: string;
        let nextLink: string;

        if (this.props.pageLinks) {

            // Determine page links
            pageLinks = this.props.pageLinks as string[];

            firstLink = pageLinks[0];
            lastLink = pageLinks[pageLinks.length-1];
            currentLink = pageLinks[this.state.currentPageNumber-1];
            prevLink = pageLinks[this.state.currentPageNumber-2];
            nextLink = pageLinks[this.state.currentPageNumber];

            // By default the page link is the current link
            this._pagelink = currentLink;
        }

        // Calculate the total items count
        let totalCount: number = parseInt(this.props.totalItems); // Take the attribute value by default for count
        
        if (pageLinks.length > 0) {

            // pageLinks.length - 1 ==> Means at least X pages has been fully filled with items. We can't determine the last one so we exclude it (-1)
            // * this.props.itemsCountPerPage ==> How many items filled in these X pages
            // + 1 ==> if we have a last page, it means at least 1 item is present to generate a new page
            totalCount = ((pageLinks.length - 1) * parseInt(this.props.itemsCountPerPage)) + 1;
        }

        let isThemeInverted = false;
        if (this.props.themeVariant && this.props.themeVariant.isInverted) {
          isThemeInverted = true;
        }

        return(
            <div className={styles.paginationContainer}>
                <div className={styles.paginationContainer__paginationContainer}>
                    <div className={`${styles.paginationContainer__paginationContainer__pagination}`}>
                        <div className={`${isThemeInverted ? styles.inverted: styles.standard}`}>
                            <Pagination
                                activePage={this.state.currentPageNumber}
                                firstPageText={<Icon theme={this.props.themeVariant as ITheme} iconName='DoubleChevronLeft' onClick={() => { this._pagelink = firstLink;}}/>}
                                lastPageText={<Icon theme={this.props.themeVariant as ITheme} iconName='DoubleChevronRight' onClick={() => { this._pagelink = lastLink;}}/>}
                                prevPageText={<Icon theme={this.props.themeVariant as ITheme} iconName='ChevronLeft' onClick={() => { this._pagelink = prevLink;}} />}
                                nextPageText={<Icon theme={this.props.themeVariant as ITheme} iconName='ChevronRight' onClick={() => { this._pagelink = nextLink;}}/>}
                                activeLinkClass={ `${styles.active} ${isThemeInverted ? styles.active__inverted: ''}`}  
                                itemsCountPerPage={ this.props.itemsCountPerPage }
                                totalItemsCount={ totalCount }
                                hideDisabled={ this.props.hideDisabled ? this.props.hideDisabled : false  }
                                hideNavigation={ this.props.hideNavigation ? this.props.hideNavigation : false }
                                hideFirstLastPages={ this.props.hideFirstLastPages ? this.props.hideFirstLastPages : false }
                                pageRangeDisplayed={ this.props.range ? this.props.range : 5 }
                                onChange={((pageNumber: number) => {
                                   
                                    // Can't select the current page more than one
                                    if (pageNumber !== this.state.currentPageNumber) {
                                        
                                        let pageLink = this._pagelink;
                                        pageLink = pageLinks[pageNumber-1];
                                        
                                        this.setState({
                                            currentPageNumber: pageNumber
                                        });

                                        this.props.onPageUpdate(pageNumber, pageLink, pageLinks);
                                    }
                                    
                                }).bind(this)}
                            />    
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export class PaginationWebComponent extends BaseWebComponent {
   
    public constructor() {
        super(); 
    }
 
    public async connectedCallback() {
    
        // Handle events       
        let props: any = this.resolveAttributes();
        const pagination = <PaginationComponent {...props} onPageUpdate={(pageNumber: number, pageLink: string, pageLinks: string[]) => {

            // Bubble event through the DOM
            this.dispatchEvent(new CustomEvent('pageNumberUpdated', { 
                detail: {
                    pageNumber: pageNumber,
                    pageLink: pageLink,
                    pageLinks: pageLinks
                } as IPageEventInfo, 
                bubbles: true,
                cancelable: true
            }));
        }}/>;
        ReactDOM.render(pagination, this);
    }    
}