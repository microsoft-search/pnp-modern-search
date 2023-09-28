import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Panel, PanelType, IPanelProps, Text, ITheme } from 'office-ui-fabric-react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { Log } from "@microsoft/sp-core-library";
import styles from "./PanelComponent.module.scss";
import * as DOMPurify from 'dompurify';
import { PnPClientStorage } from "@pnp/common/storage";

const PanelComponent_LogSource = "PnPModernSearch:PanelComponent";

export interface IPanelComponentProps {

    /**
     * If the panel is open by default
     */
    isOpen?: boolean;

    /**
     * The panel size
     */
    size?: string;

    /**
     * This panel is non-modal: even when it's open, it allows interacting with content outside the panel.
     */
    isBlocking?: boolean;

    /**
     * This panel uses "light dismiss" behavior: it can be closed by clicking or tapping the area outside the panel (or using the close button as usual).
     */
    isLightDismiss?: boolean;

    /**
     * The panel header text to display
     */
    panelHeaderText?: string;

    /**
     * The content to render in the panel
     */
    contentTemplate: string;

    /**
     * The content to render to open the panel
     */
    openTemplate: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * The panel component unique key for storage
     */
    stateKey?: string;

    /**
     * If specified, disabled the panel transition animation
     */
    disableAnimation?: boolean;
}

export interface IPanelState {

    /**
     * Flag indicating if we should show the panel
     */
    showPanel?: boolean;
}

export class PanelComponent extends React.Component<IPanelComponentProps, IPanelState> {

    /**
     * The client storage instance
     */
    private clientStorage: PnPClientStorage;
    private panelComponentUniqueKey: string = "PnPModernSearch:PanelComponent";

    constructor(props: IPanelComponentProps) {
        super(props);

        this.state = {
            showPanel: this.props.isOpen
        };

        this._onClosePanel = this._onClosePanel.bind(this);
        this._onTogglePanel = this._onTogglePanel.bind(this);
        this._updateFilter = this._updateFilter.bind(this);
        this._applyAllFilters = this._applyAllFilters.bind(this);
        this._clearAllFilters = this._clearAllFilters.bind(this);
        this._updateFilterOperator = this._updateFilterOperator.bind(this);

        this.clientStorage = new PnPClientStorage();

        if (props.stateKey) {
            this.panelComponentUniqueKey = `${this.panelComponentUniqueKey}:${props.stateKey}`;
        }
    }

    public render() {

        let panelProps: IPanelProps = {
            theme: this.props.themeVariant as ITheme,
            isOpen: this.state.showPanel,
            type: this.props.size ? Number(this.props.size) : PanelType.medium,
            isHiddenOnDismiss: false,
            isBlocking: this.props.isBlocking,
            isLightDismiss: this.props.isLightDismiss,
            onDismiss: this._onClosePanel,
            headerText: this.props.panelHeaderText,
            allowTouchBodyScroll: true,
            onRenderBody: () => {

                return <div style={{
                    overflow: 'auto',
                    marginLeft: 15
                }} dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(this.props.contentTemplate) }}>
                </div>;
            }
        };

        // Avoid panel animation flickering when the control is re-rerendered after a filter is selected
        if (this.props.disableAnimation) {
            panelProps.styles = {
                main: {
                    transition: 'none',
                    animation: 'none'
                }
            };
        }

        return <div>
            <Text theme={this.props.themeVariant as ITheme}>
                <div
                    role={"menubar"}
                    tabIndex={0}
                    className={styles.panel__open}
                    onClick={this._onTogglePanel}
                    onKeyPress={(e) => {
                        if (e.charCode === 13) {
                            this._onTogglePanel();
                        }
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.default.sanitize(this.props.openTemplate) }}>
                </div>
            </Text>
            <Panel {...panelProps} />
        </div>;
    }

    public componentDidMount() {

        if (this.props.isOpen !== undefined) {
            this.setState({ showPanel: this.props.isOpen });
        } else {

            // Get expand state if any
            const isOpen = this.clientStorage.session.get(this.panelComponentUniqueKey);

            if (isOpen !== null) {
                this.setState({ showPanel: isOpen });
            }
        }

        // Reset the state when the page is refreshed or the window location is updated
        window.onbeforeunload = () => {
            this.clientStorage.session.delete(this.panelComponentUniqueKey);
        };

        this._bindEvents();
    }

    public componentDidUpdate() {
        this._bindEvents();
    }

    private _bindEvents() {
        this.bindFilterEvents();
        this.bindApplyFiltersEvents();
        this.bindClearFiltersEvents();
        this.bindOperatorSelectionEvents();
    }

    private _onClosePanel() {
        this.setState({ showPanel: false });

        // Save the panel open state
        this.clientStorage.session.put(this.panelComponentUniqueKey, false);
    }

    private _onTogglePanel() {
        this.setState({ showPanel: !this.state.showPanel });

        // Save the panel open state
        this.clientStorage.session.put(this.panelComponentUniqueKey, !this.state.showPanel);
    }

    /**
     * Binds event fired from pagination web components
     */
    private bindFilterEvents() {

        if (this.state.showPanel) {
            // Catch panel event
            // Because the panel is outside the component DOM elemnt itself, we need to catch the event at document level
            document.addEventListener(ExtensibilityConstants.EVENT_FILTER_UPDATED, this._updateFilter);
        } else {
            document.removeEventListener(ExtensibilityConstants.EVENT_FILTER_UPDATED, this._updateFilter);
        }
    }

    /**
     * Binds event fired from filter value web components ('When all filter values are applied (multi values filter)')
     */
    private bindApplyFiltersEvents() {

        if (this.state.showPanel) {
            document.addEventListener(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, this._applyAllFilters);
        } else {
            document.removeEventListener(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, this._applyAllFilters);
        }
    }

    /**
     * Binds event fired from filter value web components ('When all filter values are cleared (multi values filter)')
     */
    private bindClearFiltersEvents() {

        if (this.state.showPanel) {
            document.addEventListener(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, this._clearAllFilters);
        } else {
            document.removeEventListener(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, this._clearAllFilters);
        }
    }

    /**
     * Binds event fired from filter value web components ('When the operator between filter values changes')
     */
    private bindOperatorSelectionEvents() {
        if (this.state.showPanel) {
            document.addEventListener(ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED, this._updateFilterOperator);
        } else {
            document.removeEventListener(ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED, this._updateFilterOperator);
        }
    }

    private _applyAllFilters(ev: CustomEvent) {

        ev.stopImmediatePropagation();

        // Get the Web Part instance ID from where the event was fired so we can fire again this event but scoped to the Web Part
        const webPartInstanceId = ev.detail.instanceId;
        const webPartDomElement = window.document.querySelector(`div[data-instance-id="${webPartInstanceId}"]`);

        if (webPartDomElement) {
            webPartDomElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, {
                detail: {
                    filterName: ev.detail.filterName,
                },
                bubbles: true,
                cancelable: true
            }));
        } else {
            Log.info(PanelComponent_LogSource, `Unable to find the data filter WP. Did you forget to add the 'instance-id' attribute to the 'pnp-filter-multi' component?`);
        }

    }

    private _clearAllFilters(ev: CustomEvent) {

        ev.stopImmediatePropagation();

        // Get the Web Part instance ID from where the event was fired so we can fire again this event but scoped to the Web Part
        const webPartInstanceId = ev.detail.instanceId;
        const webPartDomElement = window.document.querySelector(`div[data-instance-id="${webPartInstanceId}"]`);

        if (webPartDomElement) {

            webPartDomElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, {
                detail: {
                    filterName: ev.detail.filterName,
                },
                bubbles: true,
                cancelable: true
            }));
        } else {
            Log.info(PanelComponent_LogSource, `Unable to find the data filter WP. Did you forget to add the 'instance-id' attribute to the 'pnp-filter-multi' component?`);
        }
    }

    private _updateFilter(ev: CustomEvent) {

        ev.stopImmediatePropagation();

        // Get the Web Part instance ID from where the event was fired so we can fire again this event but scoped to the Web Part
        // 'data-instance-id' is a custom managed attribute to uniquely identify the filter Web Part when the panel belongs to
        const webPartInstanceId = ev.detail.instanceId;
        const webPartDomElement = window.document.querySelector(`div[data-instance-id="${webPartInstanceId}"]`);

        const eventDetails = ev.detail as IDataFilterInfo;

        if (webPartDomElement) {

            webPartDomElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                detail: {
                    filterName: eventDetails.filterName,
                    filterValues: eventDetails.filterValues,
                    instanceId: eventDetails.instanceId,
                    forceUpdate: eventDetails.forceUpdate,
                    operator: eventDetails.operator
                } as IDataFilterInfo,
                bubbles: true,
                cancelable: true
            }));

        } else {
            Log.info(PanelComponent_LogSource, `Unable to find the data filter WP. Did you forget to add the 'instance-id' attribute to the 'pnp-filter-multi' component?`);
        }
    }

    private _updateFilterOperator(ev: CustomEvent) {

        ev.stopImmediatePropagation();

        // Get the Web Part instance ID from where the event was fired so we can fire again this event but scoped to the Web Part
        const webPartInstanceId = ev.detail.instanceId;
        const webPartDomElement = window.document.querySelector(`div[data-instance-id="${webPartInstanceId}"]`);

        if (webPartDomElement) {
            webPartDomElement.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED, {
                detail: {
                    filterName: ev.detail.filterName,
                    operator: ev.detail.operator
                },
                bubbles: true,
                cancelable: true
            }));
        } else {
            Log.info(PanelComponent_LogSource, `Unable to find the data filter WP. Did you forget to add the 'instance-id' attribute to the 'pnp-filter-multi' component?`);
        }
    }
}

export class PanelWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        const domParser = new DOMParser();
        const htmlContent: Document = domParser.parseFromString(this.innerHTML, 'text/html');

        // Get the templates
        const openTemplate = htmlContent.getElementById('panel-open');
        const contentTemplate = htmlContent.getElementById('panel-content');

        let contentTemplateContent = null;
        let openTemplateContent = null;

        if (contentTemplate) {
            contentTemplateContent = contentTemplate.innerHTML;
        }

        if (openTemplate) {
            openTemplateContent = openTemplate.innerHTML;
        }

        let props = this.resolveAttributes();
        const fileIcon = <PanelComponent {...props} contentTemplate={contentTemplateContent} openTemplate={openTemplateContent} />;
        ReactDOM.render(fileIcon, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}