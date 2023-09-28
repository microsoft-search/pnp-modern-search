import * as React from 'react';
import { ISearchResultsContainerProps } from './ISearchResultsContainerProps';
import { ISearchResultsContainerState } from './ISearchResultsContainerState';
import { TemplateRenderer } from "../../../controls/TemplateRenderer/TemplateRenderer";
import { Shimmer, ShimmerElementType as ElemType, ShimmerElementsGroup, SelectionZone, Selection, SelectionMode } from 'office-ui-fabric-react';
import { isEqual, cloneDeep, merge, isEmpty } from "@microsoft/sp-lodash-subset";
import { ITemplateService } from '../../../services/templateService/ITemplateService';
import { TemplateService } from '../../../services/templateService/TemplateService';
import { Log, DisplayMode } from "@microsoft/sp-core-library";
import { MessageBar, MessageBarType, Overlay, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { IDataSourceData, IDataFilterResult, BuiltinTemplateSlots } from '@pnp/modern-search-extensibility';
import { ISearchResultsTemplateContext } from '../../../models/common/ITemplateContext';
import styles from './SearchResultsContainer.module.scss';
import { Constants, AutoCalculatedDataSourceFields, TestConstants } from '../../../common/Constants';
import { ITemplateSlot } from '@pnp/modern-search-extensibility';
import { ObjectHelper } from '../../../helpers/ObjectHelper';
import { BuiltinLayoutsKeys } from '../../../layouts/AvailableLayouts';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import * as webPartStrings from 'SearchResultsWebPartStrings';

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

        renderTemplate = <SelectionZone
            selection={this._selection}
            selectionMode={selectionMode}>
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
            data = await this.getItemsPreview(data, this.convertTemplateSlotsToHashtable(this.props.properties.templateSlots));

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
     * Enhance items properties with preview information
     * @param data the data to enhance
     * @param slots the configured slots
     */
    private async getItemsPreview(data: IDataSourceData, slots: { [key: string]: string }): Promise<IDataSourceData> {

        const validPreviewExt = ["SVG", "MOVIE", "PAGES", "PICT", "SKETCH", "AI", "PDF", "PSB", "PSD", "3G2", "3GP", "ASF", "BMP", "HEVC", "M2TS", "M4V", "MOV", "MP3", "MP4", "MP4V", "MTS", "TS", "WMV", "DWG", "FBX", "ERF", "ZIP", "ZIP", "DCM", "DCM30", "DICM", "DICOM", "PLY", "HCP", "GIF", "HEIC", "HEIF", "JPEG", "JPG", "JPE", "MEF", "MRW", "NEF", "NRW", "ORF", "PANO", "PEF", "PNG", "SPM", "TIF", "TIFF", "XBM", "XCF", "KEY", "LOG", "CSV", "DIC", "DOC", "DOCM", "DOCX", "DOTM", "DOTX", "POT", "POTM", "POTX", "PPS", "PPSM", "PPSX", "PPT", "PPTM", "PPTX", "XD", "XLS", "XLSB", "XLSX", "SLTX", "EML", "MSG", "VSD", "VSDX", "CUR", "ICO", "ICON", "EPUB", "ODP", "ODS", "ODT", "ARW", "CR2", "CRW", "DNG", "RTF", "ABAP", "ADA", "ADP", "AHK", "AS", "AS3", "ASC", "ASCX", "ASM", "ASP", "ASPX", "AWK", "BAS", "BASH", "BASH_LOGIN", "BASH_LOGOUT", "BASH_PROFILE", "BASHRC", "BAT", "BIB", "BSH", "BUILD", "BUILDER", "C", "CAPFILE", "CBK", "CC", "CFC", "CFM", "CFML", "CL", "CLJ", "CMAKE", "CMD", "COFFEE", "CPP", "CPT", "CPY", "CS", "CSHTML", "CSON", "CSPROJ", "CSS", "CTP", "CXX", "D", "DDL", "DI.DIF", "DIFF", "DISCO", "DML", "DTD", "DTML", "EL", "EMAKE", "ERB", "ERL", "F90", "F95", "FS", "FSI", "FSSCRIPT", "FSX", "GEMFILE", "GEMSPEC", "GITCONFIG", "GO", "GROOVY", "GVY", "H", "HAML", "HANDLEBARS", "HBS", "HRL", "HS", "HTC", "HTML", "HXX", "IDL", "IIM", "INC", "INF", "INI", "INL", "IPP", "IRBRC", "JADE", "JAV", "JAVA", "JS", "JSON", "JSP", "JSX", "L", "LESS", "LHS", "LISP", "LOG", "LST", "LTX", "LUA", "M", "MAKE", "MARKDN", "MARKDOWN", "MD", "MDOWN", "MKDN", "ML", "MLI", "MLL", "MLY", "MM", "MUD", "NFO", "OPML", "OSASCRIPT", "OUT", "P", "PAS", "PATCH", "PHP", "PHP2", "PHP3", "PHP4", "PHP5", "PL", "PLIST", "PM", "POD", "PP", "PROFILE", "PROPERTIES", "PS", "PS1", "PT", "PY", "PYW", "R", "RAKE", "RB", "RBX", "RC", "RE", "README", "REG", "REST", "RESW", "RESX", "RHTML", "RJS", "RPROFILE", "RPY", "RSS", "RST", "RXML", "S", "SASS", "SCALA", "SCM", "SCONSCRIPT", "SCONSTRUCT", "SCRIPT", "SCSS", "SGML", "SH", "SHTML", "SML", "SQL", "STY", "TCL", "TEX", "TEXT", "TEXTILE", "TLD", "TLI", "TMPL", "TPL", "TXT", "VB", "VI", "VIM", "WSDL", "XAML", "XHTML", "XOML", "XML", "XSD", "XSL", "XSLT", "YAML", "YAWS", "YML", "ZSH", "HTM", "HTML", "Markdown", "MD", "URL"];

        // Auto determined preview URL 
        // We do not make these call if layouts does not allow preview ('enablePreview' property, specific to 'CardsLayout' and 'SimpleListLayout')
        if (slots[BuiltinTemplateSlots.PreviewUrl] === AutoCalculatedDataSourceFields.AutoPreviewUrl) {

            // TODO: I'd like to move this logic over to each provider
            data.items = data.items.map(item => {
                let contentClass = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.ContentClass]);
                const hasContentClass = !isEmpty(contentClass);
                const isLibItem = hasContentClass && contentClass.indexOf("Library") !== -1;

                let contentTypeId = this.props.dataSource.getTemplateSlots()[BuiltinTemplateSlots.IsFolder];
                const isContainer = contentTypeId ? contentTypeId.indexOf('0x0120') !== -1 : false;

                let pathProperty = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.Path]);
                if (!pathProperty || (hasContentClass && !isLibItem)) {
                    pathProperty = ObjectHelper.byPath(item, BuiltinTemplateSlots.Path); // Fallback to using Path for if DefaultEncodingURL is missing
                }

                let webUrl = ObjectHelper.byPath(item, "SPWebUrl");
                let uniqueId = ObjectHelper.byPath(item, "NormUniqueID");
                const itemFileType = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.FileType]);
                if (webUrl && uniqueId && itemFileType && itemFileType.toUpperCase() !== "ASPX") {
                    item.AutoPreviewUrl = `${webUrl}/_layouts/15/viewer.aspx?sourcedoc={${uniqueId}}`;
                } else if (pathProperty && pathProperty.indexOf("?") === -1 && !isContainer) {
                    item.AutoPreviewUrl = pathProperty + "?web=1";
                } else {
                    item.AutoPreviewUrl = pathProperty;
                }
                return item;
            });
        }

        // Auto determined preview image URL (thumbnail)
        if (slots[BuiltinTemplateSlots.PreviewImageUrl] === AutoCalculatedDataSourceFields.AutoPreviewImageUrl) {

            // TODO: I'd like to move this logic over to each provider
            data.items = data.items.map(item => {

                let contentClass = ObjectHelper.byPath(item, BuiltinTemplateSlots.ContentClass);

                if (!isEmpty(contentClass) && (contentClass.toLocaleLowerCase() == "sts_site" || contentClass.toLocaleLowerCase() == "sts_web")) {
                    item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = ObjectHelper.byPath(item, "SiteLogo");
                }
                else {
                    let siteId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.SiteId]);
                    let webId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.WebId]);
                    let listId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.ListId]);
                    let itemId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.ItemId]); // Could be UniqueId or item ID

                    let isFolder = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.IsFolder]);
                    const isContainerType = isFolder === "true" || isFolder === "1" || (isFolder && isFolder.indexOf('0x0120') !== -1);

                    let thumbNailUrl = ObjectHelper.byPath(item, "PictureThumbnailURL");
                    if (!isEmpty(thumbNailUrl)) {
                        if (thumbNailUrl.indexOf("/content?") !== -1 && thumbNailUrl.indexOf("closestavailablesize") === -1 && thumbNailUrl.indexOf("extendCacheMaxAge") === -1) {
                            thumbNailUrl = `${thumbNailUrl},closestavailablesize,extendCacheMaxAge`;
                        }
                        item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = thumbNailUrl;
                    }
                    else
                        if (siteId && listId && itemId && !isContainerType) {
                            // SP item logic
                            siteId = this.getGuidFromString(siteId);
                            listId = this.getGuidFromString(listId);
                            itemId = this.getGuidFromString(itemId);

                            if (webId) {
                                siteId = siteId + "," + this.getGuidFromString(webId); // add web id if present, needed for sub-sites
                            }

                            const itemFileType = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.FileType]);

                            if (itemFileType && validPreviewExt.indexOf(itemFileType.toUpperCase()) !== -1) {
                                // Can lead to 404 errors but it is a trade of for performances. We take a guess with this url instead of batching calls for all items and process only 200.
                                item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = `${this.props.pageContext.site.absoluteUrl}/_api/v2.1/sites/${siteId}/lists/${listId}/items/${itemId}/driveItem/thumbnails/0/c400x999/content?prefer=noredirect,closestavailablesize,extendCacheMaxAge`;
                            }
                        } else {
                            // Graph items logic
                            const driveId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.DriveId]);
                            //GET /drives/{drive-id}/items/{item-id}/thumbnails
                            if (driveId && siteId && itemId) {
                                item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = `${this.props.pageContext.site.absoluteUrl}/_api/v2.1/sites/${siteId}/drives/${driveId}/items/${itemId}/thumbnails/thumbnails/0/c400x999/content?prefer=noredirect,closestavailablesize,extendCacheMaxAge`;
                            }
                        }
                }

                if (!this.isOnlineDomain(item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl])) {
                    item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = null;
                }
                return item;
            });
        }

        return data;
    }

    /**
     * Check if we're on an online domain
     * @param domain
     */
    private isOnlineDomain(url: string) {
        return !isEmpty(url) && url.toLocaleLowerCase().indexOf(window.location.hostname.split('.').slice(-2).join('.').toLocaleLowerCase()) !== -1;
    }

    /**
     * Extracts the GUID value from a string
     * @param value the string value containing a GUID
     */
    private getGuidFromString(value: string): string {

        if (value) {
            const matches = value.match(/(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/);
            if (matches) {
                return matches[0];
            }
        }

        return value;
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
                    { type: ElemType.line, width: 40, height: 40 },
                    { type: ElemType.gap, width: 10, height: 40 }
                ]}
            />
            <ShimmerElementsGroup
                flexWrap={true}
                width="100%"
                shimmerElements={[
                    { type: ElemType.line, width: '100%', height: 10 },
                    { type: ElemType.line, width: '75%', height: 10 },
                    { type: ElemType.gap, width: '25%', height: 20 }
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