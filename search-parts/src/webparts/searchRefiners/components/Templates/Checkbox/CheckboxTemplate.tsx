import * as React from "react";
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';
import { IRefinementValue, RefinementOperator } from "../../../../../models/ISearchResult";
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Text } from '@microsoft/sp-core-library';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as strings from 'SearchRefinersWebPartStrings';
import * as update from 'immutability-helper';
import { ITheme } from "@uifabric/styling";
import { TextField } from "office-ui-fabric-react";

//CSS
import styles from './CheckboxTemplate.module.scss';

export default class CheckboxTemplate extends React.Component<IBaseRefinerTemplateProps, IBaseRefinerTemplateState> {

    private _operator: RefinementOperator;

    public constructor(props: IBaseRefinerTemplateProps) {
        super(props);

        this.state = {
            refinerSelectedFilterValues: [],
        };

        this._onFilterAdded = this._onFilterAdded.bind(this);
        this._onFilterRemoved = this._onFilterRemoved.bind(this);
        this._applyFilters = this._applyFilters.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
        this._onValueFilterChanged = this._onValueFilterChanged.bind(this);
        this._isFilterMatch = this._isFilterMatch.bind(this);
        this._clearValueFilter = this._clearValueFilter.bind(this);
    }

    public render() {

        let disableButtons = false;

        if ((this.props.selectedValues.length === 0 && this.state.refinerSelectedFilterValues.length === 0)) {
            disableButtons = true;
        }

        return <div className={styles.pnpRefinersTemplateCheckbox}>
            {
                this.props.showValueFilter ?
                    <div className="pnp-value-filter-container">
                        <TextField className="pnp-value-filter" value={this.state.valueFilter} placeholder="Filter" onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,newValue?: string) => { this._onValueFilterChanged(newValue); }} onClick={this._onValueFilterClick} />
                        <Link onClick={this._clearValueFilter} disabled={!this.state.valueFilter || this.state.valueFilter === ""}>Clear</Link>
                    </div>
                    : null
            }
            {
                this.props.refinementResult.Values.filter(x => { return !this._isFilterMatch(x);}).map((refinementValue: IRefinementValue, j) => {

                    if (refinementValue.RefinementCount === 0) {
                        return null;
                    }

                    return (
                        <Checkbox
                            styles={{
                                root: {
                                    padding: 10
                                }
                            }}
                            theme={this.props.themeVariant as ITheme}
                            key={j}
                            checked={this._isValueInFilterSelection(refinementValue)}
                            disabled={this.state.refinerSelectedFilterValues.length > 0 && !this._isValueInFilterSelection(refinementValue) && !this.props.isMultiValue && refinementValue.RefinementName !== 'Size'}
                            label={Text.format(refinementValue.RefinementValue + ' ({0})', refinementValue.RefinementCount)}
                            onChange={(ev, checked: boolean) => {
                                checked ? this._onFilterAdded(refinementValue) : this._onFilterRemoved(refinementValue);
                            }} />
                    );
                })
            }
            {
                this.props.isMultiValue ?

                    <div>
                        <Link
                            theme={this.props.themeVariant as ITheme}
                            onClick={() => { this._applyFilters(this.state.refinerSelectedFilterValues); }}
                            disabled={disableButtons}>{strings.Refiners.ApplyFiltersLabel}
                        </Link>|<Link theme={this.props.themeVariant as ITheme}  onClick={this._clearFilters} disabled={this.state.refinerSelectedFilterValues.length === 0}>{strings.Refiners.ClearFiltersLabel}</Link>
                    </div>

                    : null
            }
        </div>;
    }

    public componentDidMount() {

        // Determine the operator according to multi value setting
        this._operator = this.props.isMultiValue ? RefinementOperator.OR : RefinementOperator.AND;

        // This scenario happens due to the behavior of the Office UI Fabric GroupedList component who recreates child components when a greoup is collapsed/expanded, causing a state reset for sub components
        // In this case we use the refiners global state to recreate the 'local' state for this component
        this.setState({
            refinerSelectedFilterValues: this.props.selectedValues
        });
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IBaseRefinerTemplateProps) {

        if (nextProps.shouldResetFilters) {
            this.setState({
                refinerSelectedFilterValues: [],
            });
        }

        // Remove an arbitrary value from the inner state
        // Useful when the remove filter action is also present in the parent layout component
        if (nextProps.removeFilterValue) {

            const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
                return elt.RefinementValue !== nextProps.removeFilterValue.RefinementValue;
            });

            this.setState({
                refinerSelectedFilterValues: newFilterValues
            });

            this._applyFilters(newFilterValues);
        }
    }

    /**
     * Checks if the current filter value is present in the list of the selected values for the current refiner
     * @param valueToCheck The filter value to check
     */
    private _isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

        let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
            return filter.RefinementToken === valueToCheck.RefinementToken && filter.RefinementValue === valueToCheck.RefinementValue;
        });

        return newFilters.length === 0 ? false : true;
    }

    /**
     * Handler when a new filter value is selected
     * @param addedValue the filter value added
     */
    private _onFilterAdded(addedValue: IRefinementValue) {

        let newFilterValues = update(this.state.refinerSelectedFilterValues, { $push: [addedValue] });

        this.setState({
            refinerSelectedFilterValues: newFilterValues
        });

        if (!this.props.isMultiValue) {
            this._applyFilters(newFilterValues);
        }
    }

    /**
     * Handler when a filter value is unselected
     * @param removedValue the filter value removed
     */
    private _onFilterRemoved(removedValue: IRefinementValue) {

        const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
            return elt.RefinementValue !== removedValue.RefinementValue;
        });

        this.setState({
            refinerSelectedFilterValues: newFilterValues
        });

        if (!this.props.isMultiValue) {
            this._applyFilters(newFilterValues);
        }
    }

    /**
     * Applies all selected filters for the current refiner
     */
    private _applyFilters(updatedValues: IRefinementValue[]) {
        this.props.onFilterValuesUpdated(this.props.refinementResult.FilterName, updatedValues, this._operator);
    }

    /**
     * Clears all selected filters for the current refiner
     */
    private _clearFilters() {

        this.setState({
            refinerSelectedFilterValues: []
        });

        this._applyFilters([]);
    }

    /**
     * Checks if an item-object matches the provided refinement value filter value
     * @param item The item-object to be checked
     */
    private _isFilterMatch(item: IRefinementValue): boolean {
        if(!this.state.valueFilter) { return false; }
        const isSelected = this.state.refinerSelectedFilterValues.some(selectedValue => selectedValue.RefinementValue === item.RefinementValue);
        if(isSelected) { return false; }
        return item.RefinementValue.toLowerCase().indexOf(this.state.valueFilter.toLowerCase()) === -1;
    }

    /**
     * Event triggered when a new value is provided in the refinement value filter textfield.
     * @param newvalue The new value provided through the textfield
     */
    private _onValueFilterChanged(newValue: string) {
        this.setState({
            valueFilter: newValue
        });
    }

    /**
     * Clears the filter applied to the refinement values
     */
    private _clearValueFilter() {
        this.setState({
            valueFilter: ""
        });
    }

    /**
     * Prevents the parent group to be colapsed
     * @param event The event that triggered the click
     */
    private _onValueFilterClick(event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>) {
        event.stopPropagation();
    }
}
