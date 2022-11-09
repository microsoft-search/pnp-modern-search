import * as React from "react";
import { BaseWebComponent, ExtensibilityConstants } from "@pnp/modern-search-extensibility";
import * as ReactDOM from "react-dom";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { ITheme } from "office-ui-fabric-react";
import styles from "./FilterMultiComponent.module.scss";
import * as strings from 'CommonStrings';


type FilterMultiEventCallback = () => void;

export interface IFilterMultiProps {

    /**
     * The filter name to use for applying selected values
     */
    filterName?: string;

    /**
     * The current theme settings
     */
    themeVariant?: IReadonlyTheme;

    /**
     * Callback handlers for filter multi events
     */
    onApply: FilterMultiEventCallback;
    onClear: FilterMultiEventCallback;

    /**
     * Enable or disable buttons
     */
    applyDisabled?: boolean;
    clearDisabled?: boolean;
}

export interface IFilterMultiState {
}

export class FilterMulti extends React.Component<IFilterMultiProps, IFilterMultiState> {

    public constructor(props: IFilterMultiProps) {
        super(props);
        this._applyFilters = this._applyFilters.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
    }

    public render() {
        return <div className={styles.filterMultiActions}>
            <PrimaryButton
                className={styles.applyBtn}
                disabled={this.props.applyDisabled}
                theme={this.props.themeVariant as ITheme}
                onClick={this._applyFilters}>
                {strings.Filters.ApplyAllFiltersButtonLabel}
            </PrimaryButton>
            <DefaultButton
                className={styles.clearBtn}
                theme={this.props.themeVariant as ITheme}
                disabled={this.props.clearDisabled}
                onClick={this._clearFilters}>
                {strings.Filters.ClearAllFiltersButtonLabel}
            </DefaultButton>
        </div>;
    }

    /**
     * Applies all selected filter values for the current filter
     */
    private _applyFilters() {
        this.props.onApply();
    }

    /**
     * Clears all selected filters for the current refiner
     */
    private _clearFilters() {
        this.props.onClear();
    }
}

export class FilterMultiWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public async connectedCallback() {

        let props = this.resolveAttributes();
        const filterMulti = <FilterMulti {...props}
            onApply={(() => {
                // Bubble event through the DOM
                this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, {
                    detail: {
                        filterName: props.filterName,
                        instanceId: props.instanceId
                    },
                    bubbles: true,
                    cancelable: true
                }));
            }).bind(this)}
            onClear={(() => {
                // Bubble event through the DOM
                this.dispatchEvent(new CustomEvent(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, {
                    detail: {
                        filterName: props.filterName,
                        instanceId: props.instanceId
                    },
                    bubbles: true,
                    cancelable: true
                }));
            }).bind(this)}
        />;
        ReactDOM.render(filterMulti, this);
    }

    protected onDispose(): void {
        ReactDOM.unmountComponentAtNode(this);
    }
}