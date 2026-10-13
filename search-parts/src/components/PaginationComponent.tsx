import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import Pagination from 'react-js-pagination';
import { Icon, ITheme, getTheme } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import styles from './PaginationComponent.module.scss';
import * as strings from 'CommonStrings';

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
     * The number of items returned on the current page, independent of the estimated total.
     */
    currentItemsCount?: string;

    /**
     * Use previous/next navigation by default.
     */
    hidePageNumbers?: boolean;

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
            currentPageNumber: Number.parseInt(props.currentPageNumber)
        };
    }

    public componentDidUpdate(prevProps: IPaginationComponentProps): void {
        if (prevProps.currentPageNumber !== this.props.currentPageNumber) {
            this.setState({ currentPageNumber: Number.parseInt(this.props.currentPageNumber) });
        }
    }

    public render() {
        const pageLinks: string[] = this.props.pageLinks ? this.props.pageLinks as string[] : [];
        const isThemeInverted = !!this.props.themeVariant?.isInverted;

        return (
            <div className={styles.paginationContainer}>
                <div className={styles.paginationContainer__paginationContainer}>
                    <div className={`${styles.paginationContainer__paginationContainer__pagination}`}>
                        <div
                            className={`${isThemeInverted ? styles.inverted : styles.standard}`}
                            style={{
                                '--link': this.props.themeVariant?.semanticColors?.link,
                                '--listItemBackgroundHovered': this.props.themeVariant?.semanticColors?.listItemBackgroundHovered
                            } as React.CSSProperties}>
                            {this.props.hidePageNumbers === true
                                ? this.renderSimplePagination(pageLinks, isThemeInverted)
                                : this.renderNumberedPagination(pageLinks, isThemeInverted)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private renderNumberedPagination(pageLinks: string[], isThemeInverted: boolean): JSX.Element {
        const currentPage = this.state.currentPageNumber;
        const theme = (this.props.themeVariant as ITheme) || getTheme();
        const itemsCountPerPage = Number.parseInt(this.props.itemsCountPerPage);

        const firstLink = pageLinks[0];
        const lastLink = pageLinks[pageLinks.length - 1];
        const prevLink = pageLinks[currentPage - 2];
        const nextLink = pageLinks[currentPage];

        // By default the page link is the current link
        this._pagelink = pageLinks[currentPage - 1];

        // pageLinks.length - 1 ==> at least X pages are fully filled; the last one can't be determined so it is excluded
        // + 1 ==> if we have a last page, at least 1 item is present to generate a new page
        const totalCount = pageLinks.length > 0
            ? ((pageLinks.length - 1) * itemsCountPerPage) + 1
            : Number.parseInt(this.props.totalItems);

        const icon = (iconName: string, link: string): JSX.Element =>
            <Icon className={styles.pagerIcon} theme={theme} iconName={iconName} onClick={() => { this._pagelink = link; }} />;

        return <Pagination
            activePage={currentPage}
            firstPageText={icon('DoubleChevronLeft', firstLink)}
            lastPageText={icon('DoubleChevronRight', lastLink)}
            prevPageText={icon('ChevronLeft', prevLink)}
            nextPageText={icon('ChevronRight', nextLink)}
            activeLinkClass={`${styles.active} ${isThemeInverted ? styles.active__inverted : ''}`}
            itemsCountPerPage={itemsCountPerPage}
            totalItemsCount={totalCount}
            hideDisabled={this.props.hideDisabled ?? false}
            hideNavigation={this.props.hideNavigation ?? false}
            hideFirstLastPages={this.props.hideFirstLastPages ?? false}
            pageRangeDisplayed={this.props.range !== undefined ? Number.parseInt(this.props.range) : 5}
            onChange={(pageNumber: number) => {
                // Can't select the current page more than once
                if (pageNumber !== currentPage) {
                    this.setState({ currentPageNumber: pageNumber });
                    this.props.onPageUpdate(pageNumber, pageLinks[pageNumber - 1], pageLinks);
                }
            }}
        />;
    }

    private renderSimplePagination(pageLinks: string[], isInverted: boolean): JSX.Element {
        const currentPage = this.state.currentPageNumber;
        const theme = (this.props.themeVariant as ITheme) || getTheme();
        const hasNextPage = this.props.pageLinks
            ? !!pageLinks[currentPage]
            : this.props.currentItemsCount === undefined || Number.parseInt(this.props.currentItemsCount) >= Number.parseInt(this.props.itemsCountPerPage);
        const updatePage = (pageNumber: number): void => {
            this.setState({ currentPageNumber: pageNumber });
            this.props.onPageUpdate(pageNumber, pageLinks[pageNumber - 1], pageLinks);
        };

        const hasPreviousPage = currentPage > 1;
        if (!hasPreviousPage && !hasNextPage) {
            return null;
        }

        const renderButton = (targetPage: number, content: JSX.Element, label?: string): JSX.Element =>
            <li>
                <button type="button" aria-label={label} onClick={() => updatePage(targetPage)}>
                    {content}
                </button>
            </li>;
        const chevron = (iconName: string, className: string = styles.pagerIcon): JSX.Element => <Icon className={className} theme={theme} iconName={iconName} />;

        return <ul>
            {hasPreviousPage && renderButton(currentPage - 1, chevron('ChevronLeft'), strings.Layouts.Slider.PreviousPageLabel)}
            {hasPreviousPage && <li><span className={isInverted ? styles.active__inverted : styles.active} aria-current="page">{currentPage}</span></li>}
            {hasNextPage && (hasPreviousPage
                ? renderButton(currentPage + 1, chevron('ChevronRight'), strings.Layouts.Slider.NextPageLabel)
                : renderButton(currentPage + 1, <>{strings.Layouts.Slider.NextLabel}{chevron('ChevronRight', `${styles.pagerIcon} ${styles.pagerIconAfterText}`)}</>))}
        </ul>;
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
        }} />;
        ReactDOM.render(pagination, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}