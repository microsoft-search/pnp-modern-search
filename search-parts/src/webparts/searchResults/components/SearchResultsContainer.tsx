import * as React from 'react';
import { ISearchResultsContainerProps } from './ISearchResultsContainerProps';
import { ISearchResultsContainerState } from './ISearchResultsContainerState';
import { TemplateRenderer } from "../../../controls/TemplateRenderer/TemplateRenderer";
import { isEqual, cloneDeep, merge } from "@microsoft/sp-lodash-subset";
import { ITemplateService } from '../../../services/templateService/ITemplateService';
import { TemplateService } from '../../../services/templateService/TemplateService';
import { Log, DisplayMode } from "@microsoft/sp-core-library";
import { IDataSourceData, IDataFilterResult } from '@pnp/modern-search-extensibility';
import { isEqual, cloneDeep, merge, isEmpty } from "@microsoft/sp-lodash-subset";
import { ITemplateService } from '../../../services/templateService/ITemplateService';
import { TemplateService } from '../../../services/templateService/TemplateService';
import { Log, DisplayMode } from "@microsoft/sp-core-library";
import { IDataSourceData, IDataFilterResult, BuiltinTemplateSlots } from '@pnp/modern-search-extensibility';
import { ISearchResultsTemplateContext } from '../../../models/common/ITemplateContext';
import styles from './SearchResultsContainer.module.scss';
import { Constants, TestConstants } from '../../../common/Constants';
import { ITemplateSlot } from '@pnp/modern-search-extensibility';
import { ObjectHelper } from '../../../helpers/ObjectHelper';
import { BuiltinLayoutsKeys } from '../../../layouts/AvailableLayouts';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import * as webPartStrings from 'SearchResultsWebPartStrings';
import { Selection, SelectionMode, SelectionZone } from "@fluentui/react/lib/Selection";
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Overlay } from '@fluentui/react/lib/Overlay';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Shimmer, ShimmerElementsGroup, ShimmerElementType } from '@fluentui/react/lib/Shimmer';

const LogSource = "SearchResultsContainer";

/**
 * Cached data structure for a data source
 */
export interface IDataSourceCacheData {
    data: IDataSourceData;
    itemsCount: number;
}

export default class SearchResultsContainer extends React.Component<ISearchResultsContainerProps, ISearchResultsContainerState> {

    /**
     * A template service instance
     */
    private templateService: ITemplateService = undefined;

    /**
     * Store the last available filters
     */
    private _lastAvailableSearchFilters: IDataFilterResult[] = [];

    /**
     * The current total items count
     */
    private _totalItemsCount: number = 0;

    /**
     * The current selection information in the template
     */
    private _selection: Selection;

    private _lastPageNumber: number;
    private _lastPageSelectedKeys: string[] = [];

    private _searchWebPartRef: HTMLElement;

    public constructor(props: ISearchResultsContainerProps) {

        super(props);

        this.state = {
            data: null,
            isLoading: true,
            errorMessage: '',
            renderedOnce: false,
            selectedItemKeys: []
        };

        this.templateService = this.props.serviceScope.consume<ITemplateService>(TemplateService.ServiceKey);

        this._onSelectionChanged = this._onSelectionChanged.bind(this);

        this._selection = new Selection({
            onSelectionChanged: this._onSelectionChanged,
            getKey: (item, index) => {
                // Not suitable as keys
                // - Stringified object as we can't rely on field values. Ex they can diverge from calls with SharePoint (ex: piSearchResultId with SharePoint)
                return item.key = `${this.props.dataContext.pageNumber}${index}`;
            },
        });
    }

    public render(): React.ReactElement<ISearchResultsContainerProps> {

        let renderTemplate: JSX.Element = null;
        let renderOverlay: JSX.Element = null;
        let templateContent: string = null;
        let renderTitle: JSX.Element = null;
        let renderInfoMessage: JSX.Element = null;

        // Web Part title
        renderTitle = <div data-ui-test-id={TestConstants.SearchResultsWebPartTitle}>
            <WebPartTitle
                displayMode={this.props.webPartTitleProps.displayMode}
                title={this.props.webPartTitleProps.title}
                updateProperty={this.props.webPartTitleProps.updateProperty}
                moreLink={this.props.webPartTitleProps.moreLink}
                themeVariant={this.props.webPartTitleProps.themeVariant}
                className={this.props.webPartTitleProps.className}
            />
        </div>;

        // Content loading
        templateContent = this.templateService.getTemplateMarkup(this.props.templateContent);
        const templateContext = this.getTemplateContext();
        let renderType = this.props.renderType;

        let selectionMode = SelectionMode.none;
        if (this.props.properties.itemSelectionProps && this.props.properties.itemSelectionProps.allowItemSelection) {
            selectionMode = this.props.properties.itemSelectionProps.allowMulti ? SelectionMode.multiple : SelectionMode.single;
        }

        const selectionPreservedOnEmptyClick = this.props.properties.itemSelectionProps?.selectionPreservedOnEmptyClick ?? false;

        renderTemplate = <SelectionZone
            selection={this._selection}
            selectionMode={selectionMode}
            isSelectedOnFocus={false}
            selectionPreservedOnEmptyClick={selectionPreservedOnEmptyClick}>
            <TemplateRenderer
                templateContent={templateContent}
                templateContext={templateContext}
                templateService={this.templateService}
                instanceId={this.props.instanceId}
                renderType={renderType}
            />
        </SelectionZone>;

        // Determine if the component should show content according to Web Part parameters  
        if (this.state.data && this.state.data.items.length === 0) {

            if (this.props.properties.showBlankIfNoResult) {

                // Edit mode
                if (this.props.webPartTitleProps.displayMode === DisplayMode.Edit) {

                    // We keep the debug view if display mode to help user debug...
                    if (this.props.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsDebug) {
                        renderTemplate = <MessageBar messageBarType={MessageBarType.info}>{webPartStrings.General.ShowBlankEditInfoMessage}</MessageBar>;
                    }

                } else {

                    // Display Mode
                    renderTitle = null;
                    renderTemplate = null;
                }
            }

            // call handler if no results found
            this.props.onNoResultsFound();
        }

        if (this.state.isLoading) {

            // Overlay
            if (this.state.renderedOnce) {

                renderOverlay = <div data-ui-test-id={TestConstants.SearchResultsLoadingOverlay}>
                    <Overlay isDarkThemed={false} className={styles.overlay}>
                        <Spinner size={SpinnerSize.medium} />
                    </Overlay>
                </div>;

            } else {

                // Placeholder loading (first load scenario)
                let renderShimmerElements: JSX.Element = null;
                templateContent = this.templateService.getPlaceholderMarkup(this.props.templateContent);

                if (templateContent) {
                    renderShimmerElements = <TemplateRenderer
                        templateContent={templateContent}
                        templateContext={this.getTemplateContext()}
                        templateService={this.templateService}
                        instanceId={this.props.instanceId}
                        renderType={this.props.renderType}
                    />;
                } else {
                    renderShimmerElements = this.getDefaultShimmerElements();
                }

                renderTemplate = renderShimmerElements;
            }
        }

        let errorTemplate = null;
        // Error handling
        if (this.state.errorMessage) {
            errorTemplate = <div className={TestConstants.SearchResultsErrorMessage} data-ui-test-id={TestConstants.SearchResultsErrorMessage}><MessageBar messageBarType={MessageBarType.error}>{this.state.errorMessage}</MessageBar></div>;
        }

        return <main><div data-instance-id={this.props.instanceId}
            data-ui-test-id={TestConstants.SearchResultsWebPart}>
            <div tabIndex={-1} ref={(ref) => { this._searchWebPartRef = ref; }}></div>
            {renderOverlay}
            {renderInfoMessage}
            {renderTitle}
            {errorTemplate}
            {renderTemplate}
        </div></main>;
    }

    public async componentDidMount() {
        await this.getDataFromDataSource(this.props.dataContext.pageNumber);
    }

    public async componentDidUpdate(prevProps: ISearchResultsContainerProps, prevState: ISearchResultsContainerState) {

        if (!isEqual(prevProps.dataSourceKey, this.props.dataSourceKey)
            || !isEqual(prevProps.dataContext, this.props.dataContext)
            || !isEqual(prevProps.properties.dataSourceProperties, this.props.properties.dataSourceProperties)
            || !isEqual(prevProps.properties.templateSlots, this.props.properties.templateSlots)) {

            if (!isEqual(prevProps.dataContext.pageNumber, this.props.dataContext.pageNumber)) {
                // Save the last selected keys for the current selection to be able to track items across pages
                this._lastPageSelectedKeys = this._selection.getSelection().map(item => item.key as string);

                // This is WebKit only, so defensively code and fallback to "scrollIntoView"
                if ((this._searchWebPartRef as any).scrollIntoViewIfNeeded) {
                    (this._searchWebPartRef as any).scrollIntoViewIfNeeded(false);
                } else {
                    // Scroll to the top of the component
                    this._searchWebPartRef.scrollIntoView(true);
                }
            }

            await this.getDataFromDataSource(this.props.dataContext.pageNumber);
        }

        if (!this.props.properties.itemSelectionProps.allowItemSelection && this.state.data) {
            // Reset already selected items
            this._selection.setItems(this.state.data.items, true);
        }

    }

    /**
     * Retrieves the data from the selected data source
     * @param pageNumber the current page number
     */
    private async getDataFromDataSource(pageNumber: number): Promise<void> {

        this.setState({
            isLoading: true,
            errorMessage: ''
        });

        this.forceUpdate();

        try {

            let data: IDataSourceData = {
                items: []
            };

            let availableFilters: IDataFilterResult[] = [];
            let totalItemsCount = 0;

            const localDataContext = cloneDeep(this.props.dataContext);

            // Fetch live data
            data = await this.props.dataSource.getData(localDataContext);

            // Compute preview information for items ('AutoXX' properties)
            
            data = await this.props.dataSource.getItemsPreview(data, this.convertTemplateSlotsToHashtable(this.props.properties.templateSlots));

            // Determine total items count and page number
            totalItemsCount = this.props.dataSource.getItemCount();

            if (data.filters) {
                if (data.filters.length === 0) {

                    // Send back the previous filters with reset values to the Data Filter WP to keep selected values in the UI and be able to reset them if necessary
                    // (Ex: Multi values filters, date range)
                    availableFilters = this._lastAvailableSearchFilters.map(lastAvailableFilter => {
                        lastAvailableFilter.values = [];
                        return lastAvailableFilter;
                    });

                } else {
                    availableFilters = data.filters;
                    this._lastAvailableSearchFilters = availableFilters;
                }
            }

            this.props.onDataRetrieved(this.getAvailableFieldsFromResults(data), availableFilters, pageNumber);

            // Persist the total items count
            this._totalItemsCount = totalItemsCount;

            this.setState({
                isLoading: false,
                data: data,
                renderedOnce: !this.state.renderedOnce ? true : this.state.renderedOnce,
            });

            // Create a cloned copy of items to avoid mutation by the selection class
            this._selection.setItems(cloneDeep(data.items));
            this._lastPageNumber = pageNumber;

        } catch (error) {

            this.setState({
                isLoading: false,
                errorMessage: error.message
            });

            Log.error(LogSource, error, this.props.serviceScope);

            // To be able to retrace the stack trace.
            throw error;
        }
    }

    /**
     * Returns default shimmers if the template does not provide any
     */
    private getDefaultShimmerElements(): JSX.Element {

        let i = 0;
        let renderShimmerElements: JSX.Element[] = [];
        const shimmerContent: JSX.Element = <div style={{ display: 'flex' }}>
            <ShimmerElementsGroup
                shimmerElements={[
                    { type: ShimmerElementType.line, width: 40, height: 40 },
                    { type: ShimmerElementType.gap, width: 10, height: 40 }
                ]}
            />
            <ShimmerElementsGroup
                flexWrap={true}
                width="100%"
                shimmerElements={[
                    { type: ShimmerElementType.line, width: '100%', height: 10 },
                    { type: ShimmerElementType.line, width: '75%', height: 10 },
                    { type: ShimmerElementType.gap, width: '25%', height: 20 }
                ]}
            />
        </div>;

        while (i < 4) {
            renderShimmerElements.push(
                <Shimmer
                    key={i}
                    customElementsGroup={shimmerContent}
                    width="100%"
                    style={{ marginBottom: "20px" }}
                />);
            i++;
        }

        return <div>{renderShimmerElements}</div>;
    }

    // Build the template context
    private getTemplateContext(): ISearchResultsTemplateContext {

        let adaptiveCardsHostConfig = null;

        // Gets information about current page context
        const { site, web, list, listItem, user, cultureInfo } = this.props.pageContext;

        // Expose only relevant properties
        const trimmedProperties = cloneDeep(this.props.properties);

        delete trimmedProperties.filtersDataSourceReference;
        delete trimmedProperties.inlineTemplateContent;
        delete trimmedProperties.documentationLink;
        delete trimmedProperties.externalTemplateUrl;

        try {
            adaptiveCardsHostConfig = JSON.parse(this.props.properties.adaptiveCardsHostConfig);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            Log.warn(LogSource, `Invalid host config provided. Refer to https://docs.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config for more details`, this.props.serviceScope);
        }


        return {
            // The data source data
            data: {
                totalItemsCount: this._totalItemsCount,
                ...this.state.data
            },
            paging: {
                currentPageNumber: this.props.dataContext.pageNumber
            },
            // Current theme infos
            theme: this.props.themeVariant,
            // The Web Part properties;
            properties: {
                ...trimmedProperties
            },
            // The connected filters information
            filters: {
                selectedFilters: this.props.dataContext.filters.selectedFilters,
                filterOperator: this.props.dataContext.filters.filterOperator,
                instanceId: this.props.dataContext.filters.instanceId,
                filtersConfiguration: this.props.dataContext.filters.filtersConfiguration
            },
            // Sorting information
            sort: {
                selectedSortFieldName: this.props.dataContext.sorting.selectedSortFieldName,
                selectedSortDirection: this.props.dataContext.sorting.selectedSortDirection
            },
            // The connected verticals information
            verticals: {
                selectedVertical: this.props.dataContext.verticals.selectedVertical
            },
            inputQueryText: this.props.dataContext.inputQueryText,
            originalInputQueryText: this.props.dataContext.originalInputQueryText,
            // The available template slots 
            slots: this.convertTemplateSlotsToHashtable(this.props.properties.templateSlots),
            // The current page context
            context: {
                site: site,
                web: web,
                list: list,
                user: user,
                cultureInfo: cultureInfo,
                listItem: listItem
            },
            teamsContext: this.props.teamsContext,
            // The Web Part instance ID for scoped CSS styles
            instanceId: this.props.instanceId,
            // Any other useful informations
            utils: {
                defaultImage: Constants.DEFAULT_IMAGE_CONTENT,
                adaptiveCardsHostConfig: adaptiveCardsHostConfig
            },
            selectedKeys: this.state.selectedItemKeys
        };
    }

    /**
     * Converts the configured template slots to an hashtable to be used in the Handlebars templates
     * @param templateSlots the configured template slots
     */
    private convertTemplateSlotsToHashtable(templateSlots: ITemplateSlot[]): { [key: string]: string } {

        // Transform the slots as an hashtable for the HB templates (easier to manipulate rather than a full object)
        let slots: { [key: string]: string } = {};

        if (templateSlots) {
            templateSlots.forEach(templateSlot => {
                slots[templateSlot.slotName] = templateSlot.slotField;
            });
        }

        return slots;
    }

    /**
     * Retrieves the available fields from results
     * @param data the current data
     */
    private getAvailableFieldsFromResults(data: IDataSourceData): string[] {

        if (data.items.length > 0) {

            let mergedItem: any = {};

            // Consolidate all available properties from all items 
            data.items.forEach(item => {
                mergedItem = merge(mergedItem, item);
            });

            // Flatten properties (ex: a.b.c)
            mergedItem = ObjectHelper.flatten(mergedItem);

            return Object.keys(mergedItem).map(key => {
                return key;
            });

        } else {
            return [];
        }
    }

    private _onSelectionChanged() {

        // When page is updated, the selection changed is fired clearing all previous selection
        // We need to ensure the state is not updated during this phase 
        if (this.props.dataContext.pageNumber === this._lastPageNumber) {

            const currentSelectedItems = this._selection.getSelection();

            const currentPageSelectionKeys = currentSelectedItems.map(item => item.key as string);

            this.props.onItemSelected(currentSelectedItems);

            // Update curent selected keys and values
            this.setState({
                selectedItemKeys: [...this._lastPageSelectedKeys, ...currentPageSelectionKeys]
            }, () => {
                this.forceUpdate();
            });
        }

    }
}