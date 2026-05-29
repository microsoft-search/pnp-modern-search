import * as React from 'react';
import { BaseWebComponent, IDataFilterInfo, IDataFilterValueInfo, ExtensibilityConstants } from '@pnp/modern-search-extensibility';
import * as ReactDOM from 'react-dom';
import { Checkbox, ChoiceGroup, IChoiceGroupOption, IStyleFunctionOrObject, ITextProps, ITextStyles, ITheme, Text } from '@fluentui/react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

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

    private _rootRef: React.RefObject<HTMLDivElement> = React.createRef();

    public componentDidMount(): void {
        this._applyRadioSetSizeAria();
    }

    public componentDidUpdate(): void {
        this._applyRadioSetSizeAria();
    }

    /**
     * For single-select filters each value renders its own single-option `ChoiceGroup`, which emits a
     * `radiogroup` containing a single radio. Screen readers therefore announce every value as
     * "1 of 1". Setting explicit `aria-setsize`/`aria-posinset` on the radio input overrides the
     * computed set size so the value is announced with its real position within the filter.
     */
    private _applyRadioSetSizeAria(): void {
        if (this.props.isMulti || !this._rootRef.current || !this.props.valueCount || this.props.valueIndex === undefined || this.props.valueIndex === null) {
            return;
        }
        const radioInput = this._rootRef.current.querySelector('input[type="radio"]');
        if (radioInput) {
            radioInput.setAttribute('aria-setsize', this.props.valueCount.toString());
            radioInput.setAttribute('aria-posinset', (this.props.valueIndex + 1).toString());
        }
    }

    public render() {

        let filterValue: IDataFilterValueInfo = {
            name: this.props.name,
            value: this.props.value,
            selected: this.props.selected
        };

        let renderInput: JSX.Element = null;
        let textColor: string = this.props.themeVariant && this.props.themeVariant.isInverted ? (this.props.themeVariant ? this.props.themeVariant.semanticColors.bodyText : '#323130') : this.props.themeVariant.semanticColors.inputText;
        const textComponentStyles: IStyleFunctionOrObject<ITextProps, ITextStyles> = {
            root: {
                color: textColor
            }
        };

        let labelValue = filterValue.name;
        if (filterValue.name.toString().indexOf("i:0#") > -1) {
            labelValue = filterValue.name.toString().split("|")[1] + "(" + filterValue.name.toString().split("|")[0] + ")";
        }


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
                        color: this.props.count && this.props.count === 0 ? this.props.themeVariant.semanticColors.disabledText : textColor
                    }
                }}
                theme={this.props.themeVariant as ITheme}
                defaultChecked={this.props.selected}
                disabled={this.props.disabled}
                title={filterValue.name}
                label={labelValue}


                onChange={(ev, checked: boolean) => {
                    filterValue.selected = checked;
                    this.props.onChecked(this.props.filterName, filterValue);
                }}
                onRenderLabel={(props, defaultRender) => {
                    return <Text block nowrap styles={textComponentStyles} title={props.label}>{props.label}</Text>;
                }}
            />;
        } else {
            renderInput = <ChoiceGroup
                defaultSelectedKey={this.props.selected ? filterValue.value : undefined}
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
                key={this.props.filterName}
                options={[
                    {
                        key: filterValue.value,
                        text: filterValue.name,
                        disabled: this.props.disabled,
                        styles: {
                            field: {
                                color: this.props.count && this.props.count === 0 ? this.props.themeVariant.semanticColors.disabledText : textColor
                            }
                        }
                    }
                ]}
                onChange={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => {
                    filterValue.selected = (ev.currentTarget as HTMLInputElement).checked;
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

    public async connectedCallback() {

        let props = this.resolveAttributes();
        const checkBox = <FilterCheckBoxComponent {...props} onChecked={((filterName: string, filterValue: IDataFilterValueInfo) => {
            // Bubble event through the DOM
            this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_UPDATED, {
                detail: {
                    filterName: filterName,
                    filterValues: [filterValue],
                    instanceId: props.instanceId
                } as IDataFilterInfo,
                bubbles: true,
                cancelable: true
            }));
        }).bind(this)}
        />;

        ReactDOM.render(checkBox, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}