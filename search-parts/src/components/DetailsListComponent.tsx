/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Fabric, ShimmeredDetailsList, IShimmeredDetailsListProps } from 'office-ui-fabric-react';
import { ITooltipHostProps, TooltipHost, ITooltipStyles, Shimmer, ShimmerElementsGroup, ShimmerElementType, IShimmerElement, mergeStyleSets, ITheme, Selection } from 'office-ui-fabric-react';
import * as Handlebars from 'handlebars';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { BaseWebComponent, BuiltinTemplateSlots, ExtensibilityConstants, ISortInfo, SortFieldDirection } from '@pnp/modern-search-extensibility';
import { groupBy, sortBy, findIndex, isEmpty } from "@microsoft/sp-lodash-subset";
import { FileIcon } from '../components/FileIconComponent';
import { DetailsListLayoutMode, SelectionMode, IColumn, IGroup, IDetailsRowProps, DetailsRow, IDetailsHeaderProps, DetailsHeader, CheckboxVisibility } from 'office-ui-fabric-react/lib/DetailsList';
import { DEFAULT_CELL_STYLE_PROPS, DEFAULT_ROW_HEIGHTS } from 'office-ui-fabric-react/lib/components/DetailsList/DetailsRow.styles';
import { ISearchResultsTemplateContext } from '../models/common/ITemplateContext';
import { ObjectHelper } from '../helpers/ObjectHelper';
import * as DOMPurify from 'dompurify';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';
import { ITemplateService } from '../services/templateService/ITemplateService';
import { TemplateService } from '../services/templateService/TemplateService';
import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";
import { ISortFieldConfiguration } from '../models/search/ISortFieldConfiguration';

const DEFAULT_SHIMMER_HEIGHT = 7;
const SHIMMER_LINE_VS_CELL_WIDTH_RATIO = 0.95;

const classNames = mergeStyleSets({
    fileIconHeaderIcon: {
        padding: 0,
        fontSize: '16px'
    },
    fileIconCell: {
        textAlign: 'center',
        selectors: {
            '&:before': {
                content: '.',
                display: 'inline-block',
                verticalAlign: 'middle',
                height: '100%',
                width: '0px',
                visibility: 'hidden'
            }
        }
    },
    fileIconImg: {
        verticalAlign: 'middle',
        maxHeight: '16px',
        maxWidth: '16px'
    },
    controlWrapper: {
        display: 'flex',
        flexWrap: 'wrap'
    }
});

export interface IDetailsListColumnConfiguration {

    /**
     * The name of the column
     */
    name: string;

    /**
     * The value of the column
     */
    value: string;

    /**
     * Alternate column for sorting
     */
    valueSorting: string;

    /**
     * Indicates if the value is an Handlebars expression
     */
    useHandlebarsExpr: boolean;

    /**
     * Column maximum width in px
     */
    maxWidth: string;

    /**
     * Column minimum width in px
     */
    minWidth: string;

    /**
     * Enable sorting on the column
     */
    enableSorting: boolean;

    /**
     * Enable column dynamic resize
     */
    isResizable: boolean;

    /**
     * Enable multiline column
     */
    isMultiline: boolean;

    /**
     * Callback handler when a sort field and direction are selected
     */
    onSort: (sortFieldName: string, sortFieldDirection: SortFieldDirection) => void;
}

export interface IDetailsListComponentProps {

    /**
     * Current items
     */
    items?: { [key: string]: any }[];

    /**
     * The columns configuration
     */
    columnsConfiguration?: IDetailsListColumnConfiguration[];

    /**
     * Show the file icon or not in the first column
     */
    showFileIcon?: boolean;

    /**
     * The field to use for the file extension ison display
     */
    fileExtensionField?: string;

    /**
     * The field to use to know if the item is a container
     */
    isContainerField?: string;

    /**
     * Enble the filtering on the columns
     */
    enableFiltering?: boolean;

    /**
     * If true, the details list shimers are displayed
     */
    showShimmers?: boolean;

    /**
     * If the details lsit should be compact
     */
    isCompact?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * The field to group by
     */
    groupBy?: string;

    /**
     * Show groups as collapsed by default if true. Expanded otherwise
     */
    groupsCollapsed?: boolean;

    /**
     * The Handlebars context to inject in columns content (ex: @root)
     */
    context?: ISearchResultsTemplateContext;

    /**
     * The isolated Handlebars namespace 
     */
    handlebars: typeof Handlebars;

    /**
    * The current selection keys. Needed to set the selected state of the component.
    */
    selectedKeys?: string[];

    /**
     * Flag indicating if items can be selected in the results
     */
    allowItemSelection?: boolean;

    /**
    * Allow multiple values to be select=ed
    */
    allowMulti?: boolean;

    /**
     * The sortable fields
     */
    fields?: ISortFieldConfiguration[];

    /**
    * The default selected field
    */
    defaultSelectedField?: string;

    /**
    * The default sort direction
    */
    defaultDirection?: SortFieldDirection;

    /**
     * Callback handler when a sort field and direction are selected
     */
    onSort: (sortFieldName: string, sortFieldDirection: SortFieldDirection) => void;
}

export interface IDetailsListComponentState {
    columns: IColumn[];
    items: any[];
    groups: IGroup[];
}

export class DetailsListComponent extends React.Component<IDetailsListComponentProps, IDetailsListComponentState> {

    private _allItems: any[];
    private _templateContext: ISearchResultsTemplateContext;
    private _domPurify: any;
    private _selection: Selection;
    private _selectionMode: SelectionMode = SelectionMode.none;

    constructor(props: IDetailsListComponentProps) {
        super(props);

        this._domPurify = DOMPurify.default;

        this._domPurify.setConfig({
            WHOLE_DOCUMENT: true
        });

        this._domPurify.addHook('uponSanitizeElement', DomPurifyHelper.allowCustomComponentsHook);
        this._domPurify.addHook('uponSanitizeAttribute', DomPurifyHelper.allowCustomAttributesHook);

        this._allItems = this.props.items ? this.props.items : [];

        if (!isEmpty(this.props.context)) {

            this._selection = new Selection(
                {
                    getKey: (item, index) => {
                        // Use of the same key format as the main selection mechanism
                        // The selection is not managed directly in the details list as it is rendered every time due to Handlebars
                        return item.key = `${this.props.context.paging.currentPageNumber}${index}`;
                    }
                }
            );

            if (this.props.allowItemSelection) {
                this._selectionMode = this.props.allowMulti ? SelectionMode.multiple : SelectionMode.single;
            }

            this._templateContext = this.props.context;
        }

        const columns: IColumn[] = [
        ];

        // Show file icon option
        if (this.props.showFileIcon) {
            columns.push(
                {
                    key: 'fileType',
                    name: 'File Type',
                    className: classNames.fileIconCell,
                    iconClassName: classNames.fileIconHeaderIcon,
                    iconName: 'Page',
                    isIconOnly: true,
                    minWidth: 16,
                    maxWidth: 16,
                    onRender: (item: any) => {

                        const contentclass = (ObjectHelper.byPath(item, BuiltinTemplateSlots.ContentClass) + "").toLowerCase();
                        const fallbackSiteLogo = !isEmpty(contentclass) && (contentclass == "sts_site" || contentclass == "sts_web") ? ObjectHelper.byPath(item, "SiteLogo") : "";

                        // A default icon will be displayed if the feld is not a valid extension (a full path with file name works as well)
                        return <FileIcon extension={ObjectHelper.byPath(item, this.props.fileExtensionField)} isContainer={ObjectHelper.byPath(item, this.props.isContainerField)} imageUrl={fallbackSiteLogo} />;
                    }
                }
            );
        }

        // Build columns dynamically
        if (this.props.columnsConfiguration) {

            this.props.columnsConfiguration.forEach((column: IDetailsListColumnConfiguration) => {
                const allowSorting = column.enableSorting && !!column.valueSorting;

                columns.push(
                    {
                        key: column.name,
                        name: column.name,
                        fieldName: column.name,
                        minWidth: parseInt(column.minWidth),
                        maxWidth: parseInt(column.maxWidth),
                        isRowHeader: false,
                        isResizable: column.isResizable === true,
                        isMultiline: column.isMultiline === true,
                        isSorted: allowSorting,
                        isSortedDescending: this.props.defaultDirection === SortFieldDirection.Descending,
                        sortAscendingAriaLabel: 'Sorted A to Z',
                        sortDescendingAriaLabel: 'Sorted Z to A',
                        onColumnClick: allowSorting ? this._onColumnClick : null,
                        data: {
                            // Set arbitrary data for the current column
                            useHandlebarsExpr: column.useHandlebarsExpr,

                            // Set the column value for sorting (i.e field to use)
                            value: column.valueSorting
                        },
                        isPadded: true,
                        onRender: (item: any) => {
                            let value: any;
                            let renderColumnValue: JSX.Element = null;
                            let hasError: boolean = false;
                            let toolTipText: string = column.useHandlebarsExpr ? value : '';

                            // Check if the value in an Handlebars expression
                            if (column.useHandlebarsExpr) {
                                try {
                                    value = this.props.handlebars ? this._processHandleBarsExprValue(column.value, item) : column.value;
                                } catch (error) {
                                    hasError = true;
                                    value = `<span style="color:red;font-style: italic" title="${error.message}">${`Error: ${error.message}`}</span>`;
                                }
                            } else {

                                // A field has been selected
                                value = ObjectHelper.byPath(item, column.value);
                            }

                            renderColumnValue = <span title={!hasError ? toolTipText : ''} dangerouslySetInnerHTML={{ __html: this._domPurify.sanitize(value) }}></span>;

                            return renderColumnValue;
                        },
                    },
                );
            });
        }

        this.state = {
            items: this._allItems,
            columns: columns,
            groups: []
        };

        this._onRenderCustomPlaceholder = this._onRenderCustomPlaceholder.bind(this);
        this._onRenderDetailsHeader = this._onRenderDetailsHeader.bind(this);
        this._onRenderRow = this._onRenderRow.bind(this);
    }

    public render() {

        const { columns, items } = this.state;

        let focusIndex = -1;
        if (this.props.selectedKeys && this.props.selectedKeys.length > 0) {
            const key = this.props.selectedKeys[0];
            focusIndex = items.findIndex(item => item.key == key);
        }


        let shimmeredDetailsListProps: IShimmeredDetailsListProps = {
            theme: this.props.themeVariant as ITheme,
            items: items,
            compact: this.props.isCompact,
            columns: columns,
            selectionMode: this._selectionMode,
            selection: this._selection,
            layoutMode: DetailsListLayoutMode.justified,
            isHeaderVisible: true,
            initialFocusedIndex: focusIndex,
            enableShimmer: this.props.showShimmers,
            selectionPreservedOnEmptyClick: true,
            enterModalSelectionOnTouch: true,
            onRenderCustomPlaceholder: this._onRenderCustomPlaceholder,
            onRenderRow: this._onRenderRow,
            onRenderDetailsHeader: this._onRenderDetailsHeader,
        };

        if (this.state.groups.length > 0) {
            shimmeredDetailsListProps.groups = this.state.groups;
            shimmeredDetailsListProps.groupProps = {
                showEmptyGroups: true
            };
        }

        return (
            <Fabric>
                <ShimmeredDetailsList {...shimmeredDetailsListProps} />
            </Fabric>
        );
    }

    public componentDidMount() {

        // Build the intitial groups
        if (this.props.groupBy) {

            // Because groups are determined by a start index and a count, we need to sort items to regroup them in the collection before processing. 
            const items = sortBy(this.state.items, this.props.groupBy);
            const groups = this._buildGroups(items, this.props.groupBy);

            this.setState({
                groups: groups,
                items: items
            });
        }

        // Manually select the items in the list
        if (this.props.selectedKeys) {

            this.props.selectedKeys.forEach(key => {
                this._selection.setKeySelected(key, true, false);
            });

            this.forceUpdate();
        }
    }

    private _onRenderCustomPlaceholder(rowProps: IDetailsRowProps): JSX.Element {

        // Logic updated from default logic https://github.com/OfficeDev/office-ui-fabric-react/blob/master/packages/office-ui-fabric-react/src/components/DetailsList/ShimmeredDetailsList.base.tsx
        // tslint:disable-next-line:no-shadowed-variable
        const { columns, compact, selectionMode, checkboxVisibility, cellStyleProps = DEFAULT_CELL_STYLE_PROPS } = rowProps;

        const { rowHeight, compactRowHeight } = DEFAULT_ROW_HEIGHTS;
        const gapHeight: number = compact ? compactRowHeight : rowHeight + 1; // 1px to take into account the border-bottom of DetailsRow.

        const shimmerElementsRow: JSX.Element[] = [];

        const showCheckbox = selectionMode !== SelectionMode.none && checkboxVisibility !== CheckboxVisibility.hidden;

        if (showCheckbox) {
            shimmerElementsRow.push(
                <ShimmerElementsGroup
                    theme={this.props.themeVariant as ITheme}
                    backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                    key={'checkboxGap'}
                    shimmerElements={[{ type: ShimmerElementType.gap, width: '40px', height: gapHeight }]} />
            );
        }

        columns.forEach((column, columnIdx) => {
            const shimmerElements: IShimmerElement[] = [];
            const groupWidth: number =
                cellStyleProps.cellLeftPadding +
                cellStyleProps.cellRightPadding +
                column.calculatedWidth! +
                (column.isPadded ? cellStyleProps.cellExtraRightPadding : 0);

            shimmerElements.push({
                type: ShimmerElementType.gap,
                width: cellStyleProps.cellLeftPadding,
                height: gapHeight
            });

            if (column.isIconOnly) {
                shimmerElements.push({
                    type: ShimmerElementType.line,
                    width: column.calculatedWidth!,
                    height: column.calculatedWidth!
                });
                shimmerElements.push({
                    type: ShimmerElementType.gap,
                    width: cellStyleProps.cellRightPadding,
                    height: gapHeight
                });
            } else {
                shimmerElements.push({
                    type: ShimmerElementType.line,
                    width: column.calculatedWidth! * SHIMMER_LINE_VS_CELL_WIDTH_RATIO,
                    height: DEFAULT_SHIMMER_HEIGHT
                });
                shimmerElements.push({
                    type: ShimmerElementType.gap,
                    width:
                        cellStyleProps.cellRightPadding +
                        (column.calculatedWidth! - column.calculatedWidth! * SHIMMER_LINE_VS_CELL_WIDTH_RATIO) +
                        (column.isPadded ? cellStyleProps.cellExtraRightPadding : 0),
                    height: gapHeight
                });
            }

            shimmerElementsRow.push(<ShimmerElementsGroup
                theme={this.props.themeVariant as ITheme}
                key={columnIdx} width={`${groupWidth}px`}
                backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                shimmerElements={shimmerElements} />);
        });
        // When resizing the window from narrow to wider, we need to cover the exposed Shimmer wave until the column resizing logic is done.
        shimmerElementsRow.push(
            <ShimmerElementsGroup
                key={'endGap'}
                width={'100%'}
                backgroundColor={this.props.themeVariant.semanticColors.bodyBackground}
                theme={this.props.themeVariant as ITheme}
                shimmerElements={[{ type: ShimmerElementType.gap, width: '100%', height: gapHeight }]}
            />
        );
        return <Shimmer
            theme={this.props.themeVariant as ITheme}
            customElementsGroup={<div style={{ display: 'flex' }}>{shimmerElementsRow}</div>} />;
    }

    private _onRenderRow(rowProps: IDetailsRowProps): JSX.Element {
        return <DetailsRow {...rowProps} theme={this.props.themeVariant as ITheme} />;
    }

    private _onRenderDetailsHeader(props: IDetailsHeaderProps): JSX.Element {

        props.onRenderColumnHeaderTooltip = (tooltipHostProps: ITooltipHostProps) => {

            const customStyles: Partial<ITooltipStyles> = {};
            customStyles.root = {
                backgroundColor: this.props.themeVariant.semanticColors.listBackground,
                color: this.props.themeVariant.semanticColors.listText,
                selectors: {
                    ':hover': {
                        backgroundColor: this.props.themeVariant.semanticColors.listHeaderBackgroundHovered
                    },
                    i: {
                        color: this.props.themeVariant.semanticColors.listText,
                    }
                }
            };

            //Add data-selection-all-toggle = true to "Select all" radio button div to have the results container Selection object update on clicking the radio button
            const child: any = React.Children.only(tooltipHostProps.children);
            if (child.props.id?.endsWith("-check")) {
                tooltipHostProps.children = React.cloneElement(child, { "data-selection-all-toggle": true });
            }

            return <TooltipHost {...tooltipHostProps} theme={this.props.themeVariant as ITheme} styles={customStyles} />;
        };

        return <DetailsHeader {...props} theme={this.props.themeVariant as ITheme} />;
    }

    private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {

        const { columns } = this.state;

        const newColumns: IColumn[] = columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });

        this.setState({
            columns: newColumns
        }, () => {
            const sortDirection = column.isSortedDescending ? SortFieldDirection.Ascending : SortFieldDirection.Descending;
            this.props.onSort(column.data.value, sortDirection);
        });

    }

    private _buildGroups(items: any[], groupByField: string): IGroup[] {

        const groupedItems = groupBy(items, (i) => {
            return ObjectHelper.byPath(i, groupByField);
        });

        let groups: IGroup[] = [];

        // eslint-disable-next-line guard-for-in
        for (const group in groupedItems) {

            const idx = findIndex(items, (i: any) => {

                // If items can't be grouped by the groupByField property, lodash groupBy will return 'undefined' as the group name
                if (group === 'undefined') {
                    return ObjectHelper.byPath(i, groupByField) === undefined;
                } else {
                    return ObjectHelper.byPath(i, groupByField) === group;
                }
            });

            let groupProps: IGroup = {
                name: group,
                key: group,
                startIndex: idx,
                count: groupedItems[group].length,
                isCollapsed: this.props.groupsCollapsed
            };

            groups.push(groupProps);
        }

        return groups;
    }

    private _processHandleBarsExprValue(columnValue: string, item: any): string {

        let exprValue: string = null;

        // Create a temp context with the current so we can use global registered helper on the current item
        const tempTemplateContent = `{{#with item as |item|}}${columnValue}{{/with}}`;
        let template = this.props.handlebars.compile(tempTemplateContent);

        // Pass the current item as context
        exprValue = template(
            {
                item: item
            },
            {
                data: {
                    root: {
                        slots: this._templateContext.slots,
                        theme: this._templateContext.theme,
                        context: this._templateContext.context,
                        instanceId: this._templateContext.instanceId,
                        properties: this._templateContext.properties,
                        utils: this._templateContext.utils
                    }
                }
            }
        );
        exprValue = exprValue ? exprValue.trim() : null;

        return exprValue;
    }
}

export class DetailsListWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        let serviceScope: ServiceScope = this._serviceScope; // Default is the root shared service scope regardless the current Web Part 
        let templateServiceKey: ServiceKey<any> = TemplateService.ServiceKey; // Defaut service key for TemplateService

        if (props.instanceId) {

            // Get the service scope and keys associated to the current Web Part displaying the component
            serviceScope = this._webPartServiceScopes.get(props.instanceId) ? this._webPartServiceScopes.get(props.instanceId) : serviceScope;
            templateServiceKey = this._webPartServiceKeys.get(props.instanceId) ? this._webPartServiceKeys.get(props.instanceId).TemplateService : templateServiceKey;
        }

        const templateService = serviceScope.consume<ITemplateService>(templateServiceKey);

        const fields: ISortFieldConfiguration[] = props.fields;

        const detailsListComponent = <DetailsListComponent {...props}
            handlebars={templateService.Handlebars}
            fields={fields}
            defaultSelectedField={props.defaultSelectedField}
            defaultDirection={props.defaultDirection}
            onSort={(sortFieldName, sortFieldDirection) => {

                // Send the event to the main Web Part
                this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_SORT_BY, {
                    detail: {
                        sortFieldName: sortFieldName,
                        sortFieldDirection: sortFieldDirection
                    } as ISortInfo,
                    bubbles: true,
                    cancelable: true
                }));
            }}
        />;
        ReactDOM.render(detailsListComponent, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}