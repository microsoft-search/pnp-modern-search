import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ChoiceGroup, ICheckboxProps, IChoiceGroupOption, ITheme, Text, getTheme } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';

export interface IFilterCheckBoxProps {

    /**
     * If the checkbox should be selected
     */
    selected?: boolean;

    /**
     * If the checkbox should be disabled
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
     * The total number of values in the parent filter. Used for the `aria-setsize`
     * attribute so screen readers announce single-select radios as "x of y" instead
     * of "1 of 1" (each value is rendered as its own web component).
     */
    valueCount?: number;

    /**
     * The 0-based index of this value within the parent filter. Used to compute the
     * 1-based `aria-posinset` attribute (see `valueCount`).
     */
    valueIndex?: number;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo) => void;
}

export interface IFilterCheckBoxState {
}

export class FilterCheckBoxComponent extends React.Component<IFilterCheckBoxProps, IFilterCheckBoxState> {

    private readonly _rootRef: React.RefObject<HTMLDivElement> = React.createRef();
    private static readonly GLOBAL_BUSY_CURSOR_STYLE_ID = 'pnp-modern-search-busy-cursor-style';

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

        const styleId = FilterCheckBoxComponent.GLOBAL_BUSY_CURSOR_STYLE_ID;
        if (!globalThis.document.getElementById(styleId)) {
            const styleElement = globalThis.document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = '* { cursor: progress !important; }';
            globalThis.document.head.appendChild(styleElement);
        }
    }

    private _getTextColor(): string {
        if (this.props.themeVariant?.isInverted) {
            return this.props.themeVariant?.semanticColors?.bodyText ?? '#323130';
        }

        return this.props.themeVariant?.semanticColors?.inputText ?? '#323130';
    }

    private readonly _renderCheckboxLabel = (props?: ICheckboxProps): JSX.Element => {
        const checkboxLabel = `${props?.label ?? ''}`;
        return <Text block nowrap styles={{ root: { color: this._getTextColor() } }} title={checkboxLabel}>{checkboxLabel}</Text>;
    }

    public componentDidMount(): void {
        this._applyRadioSetSizeAria();
    }

    public componentDidUpdate(): void {
        this._applyRadioSetSizeAria();
    }

    /**
     * For single-select filters each value renders its own single-option `ChoiceGroup`, which emits a
     * `radiogroup` containing a single radio with a unique `name` attribute. Screen readers therefore
     * announce every value as "1 of 1" because native radios are positioned relative to other radios
     * sharing the same `name` (and `aria-setsize` is ignored for native radios in most SRs).
     *
     * To make the value announce its real position within the filter we (1) neutralize the inner
     * per-value `radiogroup` role, (2) give every value radio of the same filter a shared, stable
     * `name` so the browser/SR treats them as one radio set, and (3) set explicit
     * `aria-setsize`/`aria-posinset` as a fallback for SRs that honor them.
     */
    private _applyRadioSetSizeAria(): void {
        if (this.props.isMulti || !this._rootRef.current || !this.props.valueCount || this.props.valueIndex === undefined || this.props.valueIndex === null) {
            return;
        }
        const radioGroup = this._rootRef.current.querySelector('[role="radiogroup"]');
        if (radioGroup) {
            radioGroup.setAttribute('role', 'presentation');
        }
        const radioInput = this._rootRef.current.querySelector('input[type="radio"]');
        if (radioInput) {
            const sharedName = `pnp-filter-${this.props.instanceId || ''}-${this.props.filterName || ''}`;
            radioInput.setAttribute('name', sharedName);
            radioInput.setAttribute('aria-setsize', this.props.valueCount.toString());
            radioInput.setAttribute('aria-posinset', (this.props.valueIndex + 1).toString());
        }
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

    private _resolveDisplayLabel(rawValue: string): string {
        const readableRawLabel = this._extractReadableLabel(rawValue);
        if (readableRawLabel) {
            return readableRawLabel;
        }

        const decodedValue = TaxonomyHelper.decodeHexString(rawValue);
        if (decodedValue) {
            const readableDecodedLabel = this._extractReadableLabel(decodedValue);
            if (readableDecodedLabel) {
                return readableDecodedLabel;
            }

            return decodedValue;
        }

        return rawValue;
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
        const textColor = this._getTextColor();
        const rawLabelValue = `${filterValue.name ?? filterValue.value ?? ''}`;
        const labelValue = this._resolveDisplayLabel(rawLabelValue);


        if (this.props.isMulti) {
            renderInput = <Checkbox
                styles={{
                    root: {
                        padding: 10,
                    },
                    label: {
                        width: '100%'
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
                    filterValue.selected = (ev.currentTarget as HTMLInputElement).checked;
                    filterValue.value = safeFilterValue;
                    filterValue.name = labelValue;
                    this.props.onChecked(this.props.filterName, filterValue);
                }}
            />;

            // Wrap so we can reach the rendered radio input and set aria-setsize/aria-posinset on it.
            renderInput = <div ref={this._rootRef}>{renderInput}</div>;
        }

        return renderInput;
    }
}

export class FilterCheckBoxWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();
        const checkBox = <FilterCheckBoxComponent {...props} onChecked={(filterName: string, filterValue: IDataFilterValueInfo) => {
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