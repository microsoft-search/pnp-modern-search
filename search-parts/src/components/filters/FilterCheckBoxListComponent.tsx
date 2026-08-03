import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ChoiceGroup, ICheckboxProps, IChoiceGroupOption, IChoiceGroupOptionProps, ITheme, List, Text, getTheme } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { TaxonomyHelper } from '../../helpers/TaxonomyHelper';
import { ThemeVariantHelper } from '../../helpers/ThemeVariantHelper';
import { BusyCursorHelper } from '../../helpers/BusyCursorHelper';
import styles from './FilterCheckBoxListComponent.module.scss';

/**
 * A single refiner value to render in the list
 */
export interface IFilterCheckBoxListValue {

    /**
     * The raw filter value name to display
     */
    name: string;

    /**
     * An optional display label already normalized by the template.
     */
    displayLabel?: string;

    /**
     * The value to use when selected
     */
    value: string;

    /**
     * If the value is currently selected
     */
    selected: boolean;

    /**
     * If the value can't be selected
     */
    disabled: boolean;

    /**
     * The number of results behind this value, `undefined` when the data source doesn't provide one
     */
    count?: number;
}

export interface IFilterCheckBoxListProps {

    /**
     * The filter name the values belong to
     */
    filterName?: string;

    /**
     * The filter display name, used to label the value group
     */
    displayName?: string;

    /**
     * The Web Part instance ID from where the filter component belongs
     */
    instanceId?: string;

    /**
     * Indicate if the filter is configured as multi values
     */
    isMulti?: boolean;

    /**
     * If the values should show the associated count
     */
    showCount?: boolean;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * All values of the filter
     */
    values: IFilterCheckBoxListValue[];

    /**
     * Handler when a filter value is selected
     */
    onChecked: (filterName: string, filterValue: IDataFilterValueInfo) => void;
}

export interface IFilterCheckBoxListState {

    /**
     * The values currently selected in this list. Kept locally so pending (not yet applied)
     * selections survive rerenders and, for large filters, cells being recycled by the
     * virtualized list.
     */
    selectedValues: string[];
}

/**
 * Renders all values of a single filter in one React root.
 *
 * Rendering one web component (and therefore one React root) per refiner value does not
 * scale: a refiner returning a few hundred values froze the page for seconds on every
 * render. This component takes the values as lightweight `<option>` children instead, and
 * virtualizes them once the list gets large.
 */
export class FilterCheckBoxList extends React.Component<IFilterCheckBoxListProps, IFilterCheckBoxListState> {

    /**
     * Number of values from which the list starts to virtualize. Below this, everything is
     * rendered so the DOM stays fully searchable (browser find, screen reader traversal).
     */
    private static readonly VIRTUALIZATION_THRESHOLD = 100;

    /**
     * Estimated height of a single value row, used to size the virtualized pages before
     * they are measured.
     */
    private static readonly ESTIMATED_ROW_HEIGHT = 40;

    private static readonly ROWS_PER_PAGE = 20;

    /**
     * Readable labels, keyed by the raw refiner value they were resolved from. Resolving a
     * label runs a handful of regular expressions, which shouldn't be repeated for every
     * value on every rerender of the list.
     */
    private readonly _displayLabels: Map<string, string> = new Map<string, string>();

    public constructor(props: IFilterCheckBoxListProps) {
        super(props);

        this.state = {
            selectedValues: FilterCheckBoxList._getSelectedValues(props.values)
        };

        this._onRenderCheckBoxCell = this._onRenderCheckBoxCell.bind(this);
        this._onRenderCheckboxLabel = this._onRenderCheckboxLabel.bind(this);
        this._onShouldVirtualize = this._onShouldVirtualize.bind(this);
    }

    /**
     * Takes over the selection whenever the host pushes a different one (ex: a filter reset, a
     * deep link or a new set of results). Comparing the incoming selection instead of the props
     * identity keeps selections the user made but hasn't applied yet on multi value filters.
     */
    public componentDidUpdate(previousProps: IFilterCheckBoxListProps): void {

        const previousSelection = FilterCheckBoxList._getSelectedValues(previousProps.values);
        const currentSelection = FilterCheckBoxList._getSelectedValues(this.props.values);

        if (FilterCheckBoxList._getSignature(previousSelection) !== FilterCheckBoxList._getSignature(currentSelection)) {
            this.setState({ selectedValues: currentSelection });
        }
    }

    private static _getSelectedValues(values: IFilterCheckBoxListValue[]): string[] {
        return (values || []).filter(value => value.selected).map(value => value.value);
    }

    private static _getSignature(selectedValues: string[]): string {
        return [...selectedValues].sort((left, right) => left.localeCompare(right)).join('|');
    }

    public render(): JSX.Element {
        return this.props.isMulti ? this._renderCheckBoxes() : this._renderChoiceGroup();
    }

    /**
     * Multi value filters: one checkbox per value, virtualized when there are many of them.
     */
    private _renderCheckBoxes(): JSX.Element {
        return (
            <div role='group' aria-label={this.props.displayName}>
                <List
                    items={this.props.values}
                    onRenderCell={this._onRenderCheckBoxCell}
                    onShouldVirtualize={this._onShouldVirtualize}
                    getKey={(item: IFilterCheckBoxListValue, index: number) => `${item.value}-${index}`}
                    getItemCountForPage={() => FilterCheckBoxList.ROWS_PER_PAGE}
                    getPageHeight={() => FilterCheckBoxList.ROWS_PER_PAGE * FilterCheckBoxList.ESTIMATED_ROW_HEIGHT}
                />
            </div>
        );
    }

    /**
     * Single value filters: a single `ChoiceGroup` holding all values. Rendering one
     * `ChoiceGroup` per value used to produce as many single-radio radio groups, which
     * screen readers announced as "1 of 1" for every value.
     */
    private _renderChoiceGroup(): JSX.Element {
        const labelId = this._getGroupLabelId();
        const options: IChoiceGroupOption[] = (this.props.values || []).map(value => {

            const label = this._getDisplayLabel(value);

            return {
                key: `${value.value ?? ''}`,
                text: label,
                disabled: value.disabled,
                styles: {
                    field: {
                        color: this._getValueColor(value)
                    }
                },
                onRenderField: (fieldProps?: IChoiceGroupOption & IChoiceGroupOptionProps, defaultRender?: (props?: IChoiceGroupOption & IChoiceGroupOptionProps) => JSX.Element | null) => {
                    return (
                        <div className='filter--value' title={this._getValueTitle(value, label)}>
                            <span className={styles.choiceField}>{defaultRender(fieldProps)}</span>
                            {this._renderCount(value)}
                        </div>
                    );
                }
            };
        });

        return (
            <>
                <span id={labelId} className={styles.srOnly}>{this.props.displayName}</span>
                <ChoiceGroup
                    ariaLabelledBy={labelId}
                    selectedKey={this.state.selectedValues[0] ?? null}
                    options={options}
                    styles={{
                        root: {
                            selectors: {
                                // The right padding lives on the value itself (see 'choiceField'),
                                // so it separates the value from its count instead of trailing
                                // after the count.
                                '.ms-ChoiceField': {
                                    marginTop: 0,
                                    padding: '7px 0 7px 10px'
                                }
                            }
                        }
                    }}
                    onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
                        this._onValueChanged(`${option?.key ?? ''}`, `${option?.text ?? ''}`, true);
                    }}
                />
            </>
        );
    }

    private _onRenderCheckBoxCell(value: IFilterCheckBoxListValue): JSX.Element {

        const label = this._getDisplayLabel(value);

        return (
            <div className='filter--value' title={this._getValueTitle(value, label)}>
                <Checkbox
                    styles={{
                        root: {
                            padding: 10
                        },
                        label: {
                            width: '100%'
                        },
                        text: {
                            color: this._getValueColor(value)
                        }
                    }}
                    theme={(this.props.themeVariant as ITheme) || getTheme()}
                    checked={this.state.selectedValues.indexOf(value.value) !== -1}
                    disabled={value.disabled}
                    title={label}
                    label={label}
                    onChange={(ev, checked: boolean) => {
                        this._onValueChanged(value.value, label, checked);
                    }}
                    onRenderLabel={this._onRenderCheckboxLabel}
                />
                {this._renderCount(value)}
            </div>
        );
    }

    private _onValueChanged(value: string, label: string, selected: boolean): void {

        BusyCursorHelper.setImmediateProgressCursor();

        this.setState(previousState => {

            if (!this.props.isMulti) {
                return { selectedValues: selected ? [value] : [] };
            }

            const remainingValues = previousState.selectedValues.filter(selectedValue => selectedValue !== value);

            return { selectedValues: selected ? [...remainingValues, value] : remainingValues };
        });

        this.props.onChecked(this.props.filterName, {
            name: label,
            value: value,
            selected: selected
        });
    }

    private _onRenderCheckboxLabel(props?: ICheckboxProps): JSX.Element {
        const checkboxLabel = `${props?.label ?? ''}`;
        return <Text block nowrap styles={{ root: { color: this._getTextColor() } }} title={checkboxLabel}>{checkboxLabel}</Text>;
    }

    private _onShouldVirtualize(): boolean {
        return (this.props.values || []).length > FilterCheckBoxList.VIRTUALIZATION_THRESHOLD;
    }

    private _renderCount(value: IFilterCheckBoxListValue): JSX.Element {
        if (!this.props.showCount) {
            return null;
        }

        return <span className={styles.count} data-ui-test-id='filterCount'>({this._getCountText(value)})</span>;
    }

    private _getCountText(value: IFilterCheckBoxListValue): string {
        return value.count === undefined ? '' : `${value.count}`;
    }

    private _resolveDisplayLabel(label: string): string {
        if (!label) {
            return '';
        }

        if (!this._displayLabels.has(label)) {
            this._displayLabels.set(label, TaxonomyHelper.resolveDisplayLabel(label));
        }

        return this._displayLabels.get(label) ?? label;
    }

    private _getDisplayLabel(value: IFilterCheckBoxListValue): string {
        const preferredDisplayLabel = value.displayLabel?.trim();
        if (preferredDisplayLabel) {
            return this._resolveDisplayLabel(preferredDisplayLabel);
        }

        const rawName = `${value.name ?? ''}`;
        const rawValue = `${value.value ?? ''}`;
        const nameLooksLikeEmail = !!TaxonomyHelper.extractEmailLikeLabel(rawName);
        if (nameLooksLikeEmail && rawValue) {
            const resolvedValueLabel = this._resolveDisplayLabel(rawValue);
            if (resolvedValueLabel && resolvedValueLabel !== rawValue) {
                const resolvedNameLabel = rawName ? this._resolveDisplayLabel(rawName) : '';
                if (!resolvedNameLabel || resolvedNameLabel === rawName) {
                    return resolvedValueLabel;
                }
            }
        }

        return this._resolveDisplayLabel(rawName || rawValue);
    }

    private _getValueTitle(value: IFilterCheckBoxListValue, label: string): string {
        return this.props.showCount ? `${label} (${this._getCountText(value)})` : label;
    }

    private _getValueColor(value: IFilterCheckBoxListValue): string {
        return value.count === 0
            ? this.props.themeVariant?.semanticColors?.disabledText ?? '#a19f9d'
            : this._getTextColor();
    }

    private _getTextColor(): string {
        if (this.props.themeVariant?.isInverted) {
            return this.props.themeVariant?.semanticColors?.bodyText ?? '#323130';
        }

        return this.props.themeVariant?.semanticColors?.inputText ?? '#323130';
    }

    private _getGroupLabelId(): string {
        const safeId = `${this.props.instanceId ?? ''}-${this.props.filterName ?? ''}`.replace(/[^a-zA-Z0-9_-]/g, '-');
        return `pnp-filter-values-${safeId}`;
    }
}

export class FilterCheckBoxListWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback(): void {

        const props = this.resolveAttributes();
        const values: IFilterCheckBoxListValue[] = [];

        // Resolve all <option> nodes in the web component inner HTML. Passing the values as
        // children keeps the rendered template small: the theme and the filter settings are
        // only serialized once per filter instead of once per value.
        this.querySelectorAll('option').forEach((htmlOption: HTMLOptionElement) => {
            values.push({
                name: htmlOption.text,
                displayLabel: htmlOption.dataset.displayLabel,
                value: htmlOption.value,
                selected: this.toBoolean(htmlOption.getAttribute('data-selected')),
                disabled: this.toBoolean(htmlOption.getAttribute('data-disabled')),
                count: this.toCount(htmlOption.getAttribute('data-count'))
            });
        });

        const filterCheckBoxList = <FilterCheckBoxList
            {...props}
            values={values}
            onChecked={(filterName: string, filterValue: IDataFilterValueInfo) => {
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

        ReactDOM.render(filterCheckBoxList, this);
    }

    /**
     * The theme is set once on an enclosing element (ex: `pnp-collapsible`) instead of on
     * every filter component, so look it up from the ancestors.
     */
    protected getThemeVariant(): IReadonlyTheme {
        return ThemeVariantHelper.resolveFromAncestors(this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }

    private toBoolean(value: string): boolean {
        return value === 'true';
    }

    private toCount(value: string): number {
        // Data sources don't always return a count, in which case the attribute is empty
        return value ? Number(value) : undefined;
    }
}
