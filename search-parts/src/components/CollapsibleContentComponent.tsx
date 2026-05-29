"use client";
import * as React from 'react';
import { BaseWebComponent } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { IGroup, IGroupDividerProps, Icon, Text, GroupedList, ITextProps, IStyleFunctionOrObject, ITextStyles, TooltipHost, DirectionalHint } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import styles from './CollapsibleContentComponent.module.scss';
import { DomPurifyHelper } from '../helpers/DomPurifyHelper';

export interface ICollapsibleContentComponentProps {

    /**
     * The collapsible groupe name
     */
    groupName?: string;

    /**
     * If the group should be collapsed by default
     */
    defaultCollapsed?: boolean;

    /**
     * Content of the header template
     */
    headerTemplate?: string;

    /**
     * Content of the items template
     */
    contentTemplate: string;

    /**
     * Content of the footer template
     */
    footerTemplate?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
        * Indicates whether a warning should be shown in the header.
     */
    showWarningMarker?: boolean;

    /**
        * Warning text displayed in the header.
     */
    warningMarkerTooltip?: string;
}

export interface ICollapsibleContentComponentState {

    /**
     * Current collapse/expand state for the group
     */
    isCollapsed: boolean;
}

export class CollapsibleContentComponent extends React.Component<ICollapsibleContentComponentProps, ICollapsibleContentComponentState> {

    private componentRef = React.createRef<HTMLDivElement>();
    private readonly headerRef = React.createRef<HTMLDivElement>();
    private headerDividerProps: IGroupDividerProps;
    private storageKey: string;

    public constructor(props) {
        super(props);

        // Create a unique storage key for this collapsible group
        this.storageKey = `pnp-collapsible-${props.groupName}`;
        
        // Check if there's a stored state for this group
        const storedState = sessionStorage.getItem(this.storageKey);
        const defaultCollapsed = this.getNormalizedDefaultCollapsed(props.defaultCollapsed);
        
        // A forced-open state from the parent (selected filters or expandByDefault)
        // must override any previously stored collapsed preference.
        const initialCollapsedState = defaultCollapsed === false
            ? false
            : storedState
                ? JSON.parse(storedState)
            : !!defaultCollapsed;
        
        this.state = {
            isCollapsed: initialCollapsedState,
        };

        this._onRenderCell = this._onRenderCell.bind(this);
        this._onRenderHeader = this._onRenderHeader.bind(this);
        this._onTogglePanel = this._onTogglePanel.bind(this);
        this._collapsePanel = this._collapsePanel.bind(this);
    }

    public componentDidUpdate(prevProps: ICollapsibleContentComponentProps) {
        const defaultCollapsed = this.getNormalizedDefaultCollapsed(this.props.defaultCollapsed);
        const prevDefaultCollapsed = this.getNormalizedDefaultCollapsed(prevProps.defaultCollapsed);

        // Only react when the parent default changes to open.
        // This keeps expandByDefault as an initial/open-on-state-change behavior,
        // but still lets users collapse the panel afterwards.
        if (defaultCollapsed === false && prevDefaultCollapsed !== defaultCollapsed && this.state.isCollapsed) {
            if (this.state.isCollapsed) {
                sessionStorage.setItem(this.storageKey, JSON.stringify(false));
                this.setState({
                    isCollapsed: false
                });
            }
        }
    }

    private getNormalizedDefaultCollapsed(defaultCollapsed: boolean | string | undefined): boolean | undefined {
        if (defaultCollapsed === 'false') {
            return false;
        }

        if (defaultCollapsed === 'true') {
            return true;
        }

        if (typeof defaultCollapsed === 'boolean') {
            return defaultCollapsed;
        }

        return undefined;
    }


    public render() {

        const groups: IGroup[] = [
            {
                key: this.props.groupName,
                name: this.props.groupName,
                count: 1, // The count should be at least 1 to show the header
                startIndex: 0,
                isShowingAll: true,
                hasMoreData: false,
                isCollapsed: this.state.isCollapsed,
            }
        ];

        const groupedList = <GroupedList
            items={[
                <div key={'template'} dangerouslySetInnerHTML={{ __html: DomPurifyHelper.instance.sanitize(this.props.contentTemplate) }}></div>
            ]}
            styles={{
                root: {
                    selectors: {
                        '.ms-List-cell': {
                            minHeight: 0
                        }
                    }
                }
            }}
            onRenderCell={this._onRenderCell}
            className={styles.collapsible__filterPanel__body__group}
            onShouldVirtualize={() => false}
            listProps={{ onShouldVirtualize: () => false }}
            groupProps={
                {
                    onRenderHeader: this._onRenderHeader,
                    onRenderFooter: ((props) => {

                        if (!props.group.isCollapsed) {
                            return <div dangerouslySetInnerHTML={{ __html: DomPurifyHelper.instance.sanitize(this.props.footerTemplate) }}></div>;
                        } else {
                            return null;
                        }
                    }).bind(this),
                }
            }
            groups={groups}
        />;

        return <div ref={this.componentRef} data-name={this.props.groupName} data-is-scrollable={true} onKeyDown={(e) => {
            // Allow keyboard users to close an opened widget and return to its header (#3900).
            // Escape from anywhere inside the expanded widget collapses it and moves focus back
            // to the header so it can be re-opened or navigated away from.
            if (e.key === 'Escape' && !this.state.isCollapsed) {
                this._collapsePanel();
            }
        }}>{groupedList}</div>;
    }

    /**
     * Collapses the panel (if expanded) and returns focus to the header so keyboard users are not
     * trapped inside the filter options (#3900).
     */
    private _collapsePanel() {
        if (this.state.isCollapsed) {
            return;
        }

        sessionStorage.setItem(this.storageKey, JSON.stringify(true));
        this.setState({ isCollapsed: true });

        if (this.headerDividerProps?.onToggleCollapse) {
            this.headerDividerProps.onToggleCollapse(this.headerDividerProps.group);
        }

        // Restore focus to the header once the collapse has been applied.
        globalThis.requestAnimationFrame(() => {
            if (this.headerRef.current) {
                this.headerRef.current.focus();
            }
        });
    }

    private _onTogglePanel(props: IGroupDividerProps) {
        const newCollapsedState = !props.group.isCollapsed;
        
        // Store the user's preference in session storage
        sessionStorage.setItem(this.storageKey, JSON.stringify(newCollapsedState));
        
        this.setState({
            isCollapsed: newCollapsedState
        });
        props.onToggleCollapse(props.group);
    }

    private _onRenderHeader(props: IGroupDividerProps): JSX.Element {
        // Keep a reference to the divider props so the panel can be collapsed programmatically
        // (e.g. on Escape) and stay in sync with the GroupedList internal collapse state (#3900).
        this.headerDividerProps = props;
        let textColor: string = this.props.themeVariant && this.props.themeVariant.isInverted ? (this.props.themeVariant ? this.props.themeVariant.semanticColors.bodyText : '#323130') : this.props.themeVariant.semanticColors.inputText;
        const warningDescriptionId = `pnp-warning-${(this.props.groupName || 'group').toString().replace(/[^a-zA-Z0-9_-]/g, '-')}`;
        const textComponentStyles: IStyleFunctionOrObject<ITextProps, ITextStyles> = {
            root: {
                color: textColor
            }
        };
        return (
            <div style={{ position: 'relative' }}>
                <div
                    ref={this.headerRef}
                    className={styles.collapsible__filterPanel__body__group__header}
                    role={"menubar"}
                    tabIndex={0}
                    onClick={() => {
                        this._onTogglePanel(props);
                    }}
                    onKeyDown={(e) => {
                        // Enter or Space toggles the widget open/closed from the header.
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                            e.preventDefault();
                            this._onTogglePanel(props);
                        }
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text variant={'large'} styles={textComponentStyles}>{props.group.name}</Text>
                        {this.props.showWarningMarker ?
                            <>
                                <TooltipHost content={this.props.warningMarkerTooltip} directionalHint={DirectionalHint.bottomCenter}>
                                    <button
                                        type='button'
                                        title={this.props.warningMarkerTooltip}
                                        aria-label={this.props.warningMarkerTooltip}
                                        aria-describedby={warningDescriptionId}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 18,
                                            height: 18,
                                            border: '1px solid #d83b01',
                                            borderRadius: '50%',
                                            color: '#d83b01',
                                            background: 'transparent',
                                            cursor: 'help'
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onKeyDown={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <Icon iconName='Info' styles={{ root: { color: '#d83b01', fontSize: 12 } }} />
                                    </button>
                                </TooltipHost>
                                <span
                                    id={warningDescriptionId}
                                    style={{
                                        border: 0,
                                        clip: 'rect(0 0 0 0)',
                                        height: 1,
                                        margin: -1,
                                        overflow: 'hidden',
                                        padding: 0,
                                        position: 'absolute',
                                        width: 1,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {this.props.warningMarkerTooltip}
                                </span>
                            </>
                            : null}
                    </div>
                    <div className={styles.collapsible__filterPanel__body__headerIcon}>
                        {props.group.isCollapsed ?
                            <Icon iconName='ChevronDown' />
                            :
                            <Icon iconName='ChevronUp' />
                        }
                    </div>
                </div>
                {!props.group.isCollapsed ?
                    <div dangerouslySetInnerHTML={{ __html: DomPurifyHelper.instance.sanitize(this.props.headerTemplate) }}></div>
                    :
                    null
                }
            </div>
        );
    }

    private _onRenderCell(nestingDepth: number, item: any, itemIndex: number) {
        return (
            <div data-selection-index={itemIndex}>
                {item}
            </div>
        );
    }
}

export class CollapsibleContentWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(this.innerHTML, 'text/html');

        // Get the templates
        const headerTemplateContent = htmlContent.getElementById('collapsible-header');
        const contentTemplateContent = htmlContent.getElementById('collapsible-content');
        const footerTemplateContent = htmlContent.getElementById('collapsible-footer');

        let contentTemplate = null;
        let footerTemplate = null;
        let headerTemplate = null;

        if (contentTemplateContent) {
            contentTemplate = contentTemplateContent.innerHTML;
        }

        if (footerTemplateContent) {
            footerTemplate = footerTemplateContent.innerHTML;
        }

        if (headerTemplateContent) {
            headerTemplate = headerTemplateContent.innerHTML;
        }

        let props = this.resolveAttributes();
        const collapsibleContent = <CollapsibleContentComponent
            {...props}
            headerTemplate={headerTemplate}
            contentTemplate={contentTemplate}
            footerTemplate={footerTemplate}
        />;

        ReactDOM.render(collapsibleContent, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}