import * as React from "react";
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import { IRefinementValue, RefinementOperator } from "../../../../../models/ISearchResult";
import ICheckboxTemplateState from "./ICheckboxTemplateState";
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Text } from '@microsoft/sp-core-library';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as strings from 'SearchRefinersWebPartStrings';
import * as update from 'immutability-helper';
import { ITheme } from "@uifabric/styling";
import { TextField } from "office-ui-fabric-react";
import { cloneDeep } from "@microsoft/sp-lodash-subset";
// import styles from "../../../../../services/TemplateService/BaseTemplateService.module.scss";
import styles from "./CheckboxTemplate.module.scss";


export default class CheckboxTemplate extends React.Component<IBaseRefinerTemplateProps, ICheckboxTemplateState> {

    private _operator: RefinementOperator;

    public constructor(props: IBaseRefinerTemplateProps) {
        super(props);

        this.state = {
            refinerSelectedFilterValues: [],
            refinerFilteredFilterValues: [],
        };

        this._onFilterAdded = this._onFilterAdded.bind(this);
        this._onFilterRemoved = this._onFilterRemoved.bind(this);
        this._applyFilters = this._applyFilters.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
    }

    public render() {

        let disableButtons = false;

        if ((this.props.selectedValues.length === 0 && this.state.refinerSelectedFilterValues.length === 0)) {
            disableButtons = true;
        }

        return <div>
            {this.props.refinementResult.Values.length > 10 && this.state.refinerSelectedFilterValues.length === 0 &&
                <TextField className={styles.filterBox} placeholder="Filter list of options by name" onChange={this._onChangeFilterText} />
            }
            {
                this.state.refinerFilteredFilterValues.map((refinementValue: IRefinementValue, j) => {

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

        // This scenario happens due to the behavior of the Office UI Fabric GroupedList component who recreates child components when a group is collapsed/expanded, causing a state reset for sub components
        // In this case we use the refiners global state to recreate the 'local' state for this component
        this.setState({
            refinerSelectedFilterValues: this.props.selectedValues,
            refinerFilteredFilterValues: this.props.selectedValues.length > 0 ? this.props.selectedValues : cloneDeep(this.props.refinementResult.Values),
        });
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IBaseRefinerTemplateProps) {

        if (nextProps.shouldResetFilters) {
            this.setState({
                refinerSelectedFilterValues: [],
                refinerFilteredFilterValues: nextProps.selectedValues.length > 0 ? nextProps.selectedValues : cloneDeep(nextProps.refinementResult.Values),
            });
        }

        // Remove an arbitrary value from the inner state
        // Useful when the remove filter action is also present in the parent layout component
        if (nextProps.removeFilterValue) {

            const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
                return elt.RefinementName !== nextProps.removeFilterValue.RefinementName;
            });

            this.setState({
                refinerSelectedFilterValues: newFilterValues,
                refinerFilteredFilterValues: newFilterValues,
            });

            this._applyFilters(newFilterValues);
        }
    }

    /**
   * Filter list of options based on user input
   * @param filterText - The text to use when filtering the collection
   */
    private _onChangeFilterText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, filterText: string): void => {
      this.setState({
        refinerFilteredFilterValues: filterText ? this.props.refinementResult.Values.filter(r => r.RefinementName.toString().toLowerCase().indexOf(filterText.toLowerCase()) > -1) : this.props.refinementResult.Values
      });
    }

    /**
     * Checks if the current filter value is present in the list of the selected values for the current refiner
     * @param valueToCheck The filter value to check
     */
    private _isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

        let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
            return filter.RefinementToken === valueToCheck.RefinementToken && filter.RefinementName === valueToCheck.RefinementName;
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
            refinerSelectedFilterValues: newFilterValues,
            refinerFilteredFilterValues: newFilterValues,
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
            return elt.RefinementName !== removedValue.RefinementName;
        });

        this.setState({
            refinerSelectedFilterValues: newFilterValues,
            refinerFilteredFilterValues: cloneDeep(this.props.refinementResult.Values),
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
            refinerSelectedFilterValues: [],
            refinerFilteredFilterValues: cloneDeep(this.props.refinementResult.Values),
        });

        this._applyFilters([]);
    }
}
