import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ChoiceGroup, ICheckboxProps, IChoiceGroupOption, ITheme, Spinner, SpinnerSize, Text, getTheme } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';

export interface IFilterPeopleTemplateProps {

    /**
     * If the People template should be selected
     */
    selected?: boolean;

    /**
     * If the People template should be disabled
     */
    disabled?: boolean;

    /**
     * The count for this filter value
     */
    count?: number;

    /**
     * The filter value to display
     */
    name?: string;

    /**
     * The value to use when selected
     */
    value?: string;

    /**
     * The filter name where belong the value
     */
    filterName?: string;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * Indicate if the filter is configured as multi values
     */
    isMulti?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo) => void;
}

export interface IFilterPeopleTemplateState {
    isSelectionInProgress: boolean;
}

export class FilterPeopleTemplateComponent extends React.Component<IFilterPeopleTemplateProps, IFilterPeopleTemplateState> {
    private static readonly SELECTION_FEEDBACK_DURATION_MS = 2500;
    private static readonly GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';
    private selectionFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

    private _setImmediateProgressCursor(): void {
        if (!globalThis.document) {
            return;
        }

        if (globalThis.document.documentElement) {
            globalThis.document.documentElement.style.setProperty('cursor', 'progress', 'important');
        }

        if (globalThis.document.body) {
            globalThis.document.body.style.setProperty('cursor', 'progress', 'important');
        }

        const styleId = FilterPeopleTemplateComponent.GLOBAL_BUSY_CURSOR_STYLE_ID;
        if (!globalThis.document.getElementById(styleId)) {
            const styleElement = globalThis.document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
        }
    }

    private readonly _renderCheckboxLabel = (props?: ICheckboxProps): JSX.Element => {
        const checkboxLabel = `${props?.label ?? ''}`;
        return <Text block nowrap styles={{ root: { color: this.props.themeVariant?.isInverted ? this.props.themeVariant?.semanticColors?.bodyText ?? '#323130' : this.props.themeVariant?.semanticColors?.inputText ?? '#323130' } }} title={checkboxLabel}>{checkboxLabel}</Text>;
    }

    public constructor(props: IFilterPeopleTemplateProps) {
        super(props);

        this.state = {
            isSelectionInProgress: false
        };
    }

    public componentDidMount(): void {
        this.restoreSelectionFeedback();
    }

    public componentWillUnmount(): void {
        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
            this.selectionFeedbackTimer = null;
        }
    }

    private readonly getSelectionFeedbackStorageKey = (): string => {
        const instanceId = `${this.props.instanceId ?? ''}`;
        const filterName = `${this.props.filterName ?? ''}`;
        const filterValue = `${this.props.value ?? ''}`;
        return `pnp-modern-search:people-filter-feedback:${instanceId}:${filterName}:${filterValue}`;
    }

    private readonly readSelectionFeedbackTimestamp = (): number => {
        try {
            const value = globalThis.sessionStorage.getItem(this.getSelectionFeedbackStorageKey());
            const timestamp = Number(value);
            return Number.isFinite(timestamp) ? timestamp : 0;
        } catch {
            return 0;
        }
    }

    private readonly writeSelectionFeedbackTimestamp = (timestamp: number): void => {
        try {
            globalThis.sessionStorage.setItem(this.getSelectionFeedbackStorageKey(), `${timestamp}`);
        } catch {
            // Ignore storage errors
        }
    }

    private readonly clearSelectionFeedbackTimestamp = (): void => {
        try {
            globalThis.sessionStorage.removeItem(this.getSelectionFeedbackStorageKey());
        } catch {
            // Ignore storage errors
        }
    }

    private readonly restoreSelectionFeedback = (): void => {
        const startedAt = this.readSelectionFeedbackTimestamp();
        if (!startedAt) {
            return;
        }

        const elapsed = Date.now() - startedAt;
        const remainingMs = FilterPeopleTemplateComponent.SELECTION_FEEDBACK_DURATION_MS - elapsed;

        if (remainingMs <= 0) {
            this.clearSelectionFeedbackTimestamp();
            return;
        }

        this.setState({ isSelectionInProgress: true });

        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
        }

        this.selectionFeedbackTimer = setTimeout(() => {
            this.selectionFeedbackTimer = null;
            this.clearSelectionFeedbackTimestamp();
            this.setState({ isSelectionInProgress: false });
        }, remainingMs);
    }

    private readonly beginSelectionFeedback = (): void => {
        if (this.selectionFeedbackTimer !== null) {
            clearTimeout(this.selectionFeedbackTimer);
        }

        this.writeSelectionFeedbackTimestamp(Date.now());
        this.setState({ isSelectionInProgress: true });

        this.selectionFeedbackTimer = setTimeout(() => {
            this.selectionFeedbackTimer = null;
            this.clearSelectionFeedbackTimestamp();
            this.setState({ isSelectionInProgress: false });
        }, FilterPeopleTemplateComponent.SELECTION_FEEDBACK_DURATION_MS);
    }

    private _extractReadableLabel(value: string): string {
        const cleanedValue = `${value || ''}`.trim().replace(/^"+|"+$/g, '');
        if (!cleanedValue) {
            return '';
        }

        const taxonomyLabelMatch = /(?:L0|GP0|GPP)\|#0?[0-9a-f-]{32,36}\|(.+)$/i.exec(cleanedValue);
        if (taxonomyLabelMatch?.[1]?.trim()) {
            return taxonomyLabelMatch[1].trim();
        }

        const genericGuidLabelMatch = /\|#0?[0-9a-f-]{32,36}\|([^|]+)$/i.exec(cleanedValue);
        if (genericGuidLabelMatch?.[1]?.trim()) {
            return genericGuidLabelMatch[1].trim();
        }

        const claimsLabelMatch = /^i:0#.*\|([^|]+)$/i.exec(cleanedValue);
        if (claimsLabelMatch?.[1]?.trim()) {
            return claimsLabelMatch[1].trim();
        }

        const personLikeLabelMatch = /([A-Za-z][A-Za-z'-]+(?:\s+[A-Za-z][A-Za-z'-]+)+)/.exec(cleanedValue);
        if (personLikeLabelMatch?.[1]?.trim()) {
            return personLikeLabelMatch[1].trim();
        }

        const segments = cleanedValue.split('|').map(segment => segment.trim()).filter(Boolean);
        if (segments.length > 0) {
            for (const segment of segments) {
                const isGuidLike = /^#?[-0-9a-fA-F]{32,36}$/.test(segment);
                const isLongHexLike = segment.length > 16 && /^[0-9a-fA-F]+$/.test(segment);
                if (!isGuidLike && !isLongHexLike) {
                    return segment;
                }
            }
        }

        return '';
    }

    private _resolveDisplayLabel(name?: string, value?: string): string {
        const rawLabel = `${name ?? value ?? ''}`.trim();
        const readableRawLabel = this._extractReadableLabel(rawLabel);
        if (readableRawLabel) {
            return readableRawLabel;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawLabel);
        if (decodedValue) {
            const readableDecodedLabel = this._extractReadableLabel(decodedValue);
            if (readableDecodedLabel) {
                return readableDecodedLabel;
            }

            return decodedValue;
        }

        return rawLabel;
    }

    public render() {

        let filterValue: IDataFilterValueInfo = {
            name: this.props.name,
            value: this.props.value,
            selected: this.props.selected
        };
        const safeFilterValue = `${filterValue.value ?? ''}`;
        const safeFilterName = `${this.props.filterName ?? ''}`;

        let renderInput: JSX.Element = null;
        let textColor: string = this.props.themeVariant?.isInverted ? this.props.themeVariant?.semanticColors?.bodyText ?? '#323130' : this.props.themeVariant?.semanticColors?.inputText ?? '#323130';
        const labelValue = this._resolveDisplayLabel(filterValue.name, filterValue.value);

        if (this.props.isMulti) {
            renderInput = <Checkbox
                styles={{
                    root: {
                        padding: 40,
                    },
                    label: {
                        width: '100%',
                    },
                    text: {
                        color: this.props.count && this.props.count === 0 ? this.props.themeVariant?.semanticColors?.disabledText ?? '#a19f9d' : textColor
                    }
                }}
                theme={(this.props.themeVariant as ITheme) || getTheme()}
                defaultChecked={this.props.selected}
                disabled={this.props.disabled}
                title={labelValue}
                label={labelValue}
                onChange={(ev, checked: boolean) => {
                    this._setImmediateProgressCursor();
                    this.beginSelectionFeedback();
                    filterValue.selected = checked;
                    filterValue.name = labelValue;
                    this.props.onChecked(this.props.filterName, filterValue);
                }}
                onRenderLabel={this._renderCheckboxLabel}
            />;
        } else {
            renderInput = <ChoiceGroup
                defaultSelectedKey={this.props.selected ? safeFilterValue : undefined}
                styles={{
                    root: {
                        position: 'relative',
                        display: 'flex',
                        paddingRight: 10,
                        paddingLeft: 10,
                        paddingBottom: 7,
                        paddingTop: 7,
                        selectors: {
                            '.ms-ChoiceField': {
                                marginTop: 0
                            }
                        }
                    }
                }}
                key={safeFilterName}
                options={[
                    {
                        key: safeFilterValue,
                        text: labelValue,
                        disabled: this.props.disabled,
                        styles: {
                            field: {
                                color: this.props.count && this.props.count === 0 ? this.props.themeVariant?.semanticColors?.disabledText ?? '#a19f9d' : textColor
                            }
                        }
                    }
                ]}
                onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
                    this._setImmediateProgressCursor();
                    this.beginSelectionFeedback();
                    filterValue.selected = (ev.currentTarget as HTMLInputElement).checked;
                    filterValue.value = safeFilterValue;
                    filterValue.name = labelValue;
                    this.props.onChecked(this.props.filterName, filterValue);
                }}
            />;
        }

        return <>
            {this.state.isSelectionInProgress && (
                <div style={{
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: '#605e5c'
                }}>
                    <Spinner size={SpinnerSize.xSmall} />
                    <span>Updating selection...</span>
                </div>
            )}
            {renderInput}
        </>;
    }
}

export class FilterPeopleCheckBoxWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        const checkBox = <FilterPeopleTemplateComponent {...props} onChecked={(filterName: string, filterValue: IDataFilterValueInfo) => {
            // Bubble event through the DOM
            const detail: IDataFilterInfo = {
                filterName: filterName,
                filterValues: [filterValue],
                instanceId: props.instanceId
            };
            this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                detail,
                bubbles: true,
                cancelable: true
            }));
        }}
        />;

        ReactDOM.render(checkBox, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}