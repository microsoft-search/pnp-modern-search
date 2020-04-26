import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsListLayoutMode, SelectionMode, IColumn, IDetailsRowProps, IDetailsRowStyles, DetailsRow, IDetailsHeaderBaseProps, IDetailsHeaderProps, DetailsHeader, IDetailsHeaderStyles, CheckboxVisibility } from 'office-ui-fabric-react/lib/DetailsList';
import { mergeStyleSets, createTheme, ITheme } from 'office-ui-fabric-react/lib/Styling';
import { ISearchResult } from '../models/ISearchResult';
import * as Handlebars from 'handlebars';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IconComponent } from './IconComponent';
import { BaseWebComponent } from './BaseWebComponent';
import * as ReactDOM from 'react-dom';
import { ITooltipHostProps, TooltipHost, ITooltipStyles, Shimmer, ShimmerElementsGroup, ShimmerElementType, IShimmerElement } from 'office-ui-fabric-react';
import { DEFAULT_CELL_STYLE_PROPS, DEFAULT_ROW_HEIGHTS } from 'office-ui-fabric-react/lib/components/DetailsList/DetailsRow.styles';
import * as DOMPurify from 'dompurify';
import { TemplateService } from '../services/TemplateService/TemplateService';

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
const controlStyles = {
    root: {
        margin: '0 30px 20px 0',
        maxWidth: '300px'
    }
};

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
     * If true, the column value will be wrapped by the item link
     */
    isResultItemLink: boolean;
}

export interface DetailsListComponentProps {

    /**
     * Current items
     */
    items?: string;

    /**
     * The columns configuration
     */
    columnsConfiguration?: string;

    /**
     * Show the file icon or not in the first column
     */
    showFileIcon?: boolean;

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
}

export interface IDetailsListComponentState {
    columns: IColumn[];
    items: ISearchResult[];
}

export class DetailsListComponent extends React.Component<DetailsListComponentProps, IDetailsListComponentState> {

    private _allItems: ISearchResult[];

    constructor(props: DetailsListComponentProps) {
        super(props);

        this._allItems = this.props.items ? JSON.parse(this.props.items) : [];

        const columns: IColumn[] = [
        ];

        // Show file icon pption
        if (this.props.showFileIcon) {
            columns.push(
                {
                    key: 'column1',
                    name: 'File Type',
                    className: classNames.fileIconCell,
                    iconClassName: classNames.fileIconHeaderIcon,
                    ariaLabel: 'Column operations for File type, Press to sort on File type',
                    iconName: 'Page',
                    isIconOnly: true,
                    fieldName: 'IconExt',
                    minWidth: 16,
                    maxWidth: 16,
                    onColumnClick: this._onColumnClick,
                    onRender: (item: ISearchResult) => {
                        return (<IconComponent fileExtension={item.IconExt} imageUrl={item.SiteLogo} size={16} ></IconComponent>);
                    }
                }
            );
        }

        // Build columns dynamically
        if (this.props.columnsConfiguration) {
            JSON.parse(this.props.columnsConfiguration).map((column: IDetailsListColumnConfiguration) => {
                columns.push(
                    {
                        key: column.name,
                        name: column.name,
                        fieldName: column.value,
                        minWidth: parseInt(column.minWidth),
                        maxWidth: parseInt(column.maxWidth),
                        isRowHeader: true,
                        isResizable: column.isResizable === true,
                        isMultiline: column.isMultiline === true,
                        isSorted: column.enableSorting === true,
                        isSortedDescending: false,
                        sortAscendingAriaLabel: 'Sorted A to Z',
                        sortDescendingAriaLabel: 'Sorted Z to A',
                        onColumnClick: column.enableSorting ? this._onColumnClick : null,
                        data: 'string',
                        isPadded: true,
                        onRender: (item: ISearchResult) => {

                            let value: any = item[column.value];
                            let renderColumnValue: JSX.Element = null;
                            let hasError: boolean = false;

                            // Check if the value in an Handlebars expression
                            if (column.useHandlebarsExpr) {

                                try {

                                    // Create a temp context with the current so we can use global registered helper on the current item
                                    const tempTemplateContent = `{{#with item as |item|}}${column.value}{{/with}}`;

                                    let template = Handlebars.compile(tempTemplateContent);

                                    // Pass the current item as context
                                    value = template({ item: item }, { data: { themeVariant: this.props.themeVariant } });

                                    value = value ? value.trim() : null;

                                    TemplateService.initPreviewElements();

                                } catch (error) {
                                    hasError = true;
                                    value = `<span style="color:red;font-style: italic" title="${error.message}">${`Error: ${error.message}`}</span>`;
                                }
                            }

                            renderColumnValue = <span title={!hasError ? value : ''} dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(value) }}></span>;

                            // Make the value clickable to the corresponding result item 
                            if (column.isResultItemLink) {
                                let url = item.Path;
                                if (item.ServerRedirectedURL) url = item.ServerRedirectedURL;
                                else if (item.DefaultEncodingURL) url = item.DefaultEncodingURL;

                                renderColumnValue = <a style={{ color: this.props.themeVariant.semanticColors.link }} href={url} target='_blank'>{renderColumnValue}</a>;
                            }

                            return renderColumnValue;
                        },
                    },
                );
            });
        }

        this.state = {
            items: this._allItems,
            columns: columns
        };
    }

    public render() {
        const { columns, items } = this.state;

        let renderFilter: JSX.Element = null;

        if (this.props.enableFiltering) {
            renderFilter = <div className={classNames.controlWrapper}>
                <TextField label="Filter by name:" onChange={this._onChangeText.bind(this)} styles={controlStyles} />;
                            </div>;
        }

        return (
            <Fabric>
                {renderFilter}
                <ShimmeredDetailsList
                    theme={this.props.themeVariant as ITheme}
                    items={items}
                    compact={this.props.isCompact}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    setKey="set"
                    onRenderCustomPlaceholder={(rowProps: IDetailsRowProps): JSX.Element => {

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

                        columns.map((column, columnIdx) => {
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
                    }}
                    onRenderRow={(rowProps: IDetailsRowProps): JSX.Element => {
                        return <DetailsRow {...rowProps} theme={this.props.themeVariant as ITheme} />;
                    }}
                    onRenderDetailsHeader={(props: IDetailsHeaderProps): JSX.Element => {

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

                            return <TooltipHost {...tooltipHostProps} theme={this.props.themeVariant as ITheme} styles={customStyles} />;
                        };

                        return <DetailsHeader {...props} theme={this.props.themeVariant as ITheme} />;
                    }}
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    enableShimmer={this.props.showShimmers}
                    selectionPreservedOnEmptyClick={true}
                    enterModalSelectionOnTouch={true}
                />
            </Fabric>
        );
    }

    private _onChangeText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
        this.setState({
            items: text ? this._allItems.filter(i => i.Title.toLowerCase().indexOf(text) > -1) : this._allItems
        });
    }

    private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, items } = this.state;
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
        const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
        this.setState({
            columns: newColumns,
            items: newItems
        });
    }
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}

export class DetailsListWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        const detailsListComponent = <DetailsListComponent {...props} />;
        ReactDOM.render(detailsListComponent, this);
    }
}