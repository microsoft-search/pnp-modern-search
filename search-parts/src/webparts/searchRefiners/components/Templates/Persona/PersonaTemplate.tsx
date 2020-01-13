// React
import * as React from "react";

// Loacalization
import * as strings from 'SearchRefinersWebPartStrings';

// CSS
import styles from './PersonaTemplate.module.scss';

// UI Fabric
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ITheme } from '@uifabric/styling';

// Thirs party Lib
import * as update from 'immutability-helper';

// Custom component
import { PersonaCustom } from './PersonaCustom';

// Interface
import { IRefinementValue, RefinementOperator } from "../../../../../models/ISearchResult";
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';

export interface IPersonaTemplateProps extends IBaseRefinerTemplateProps {
}

export interface IPersonaTemplateState extends IBaseRefinerTemplateState {
}
// Class
export default class PersonaTemplate extends React.Component<IPersonaTemplateProps, IPersonaTemplateState> {

  private _operator: RefinementOperator;

  public constructor(props: IPersonaTemplateProps) {
    super(props);

    this.state = {
      refinerSelectedFilterValues: []
    };
  }

  public render() {
    return (
      <div className={styles.pnpRefinersTemplatePersona}>
        {
          this.props.refinementResult.Values.map((refinementValue: IRefinementValue, j) => {

            let accountName: string = refinementValue.RefinementValue ? refinementValue.RefinementValue.split('i:0#.f|').pop() : null;
            let displayName: string = refinementValue.RefinementValue.split('|').length > 1 ? refinementValue.RefinementValue.split('|')[1].trim() : null;

            if (refinementValue.RefinementCount === 0) {
              return null;
            }
            return (
              <PersonaCustom
                key={j}
                userService={this.props.userService}
                selected={this._isValueInFilterSelection(refinementValue)}
                accountName={`i:0#.f|${accountName}`}
                resultCount={refinementValue.RefinementCount}
                theme={this.props.themeVariant as ITheme}
                onClick={(ev) => {

                  if (!this._isValueInFilterSelection(refinementValue)) { 
                    refinementValue.RefinementName = displayName ? displayName : refinementValue.RefinementName;
                    this._onFilterAdded(refinementValue);
                  } else {
                    this._onFilterRemoved(refinementValue);
                  }
                }}
              />
            );
          })
        }

      </div>
    );
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

  public UNSAFE_componentWillReceiveProps(nextProps: IPersonaTemplateProps) {

    if (nextProps.shouldResetFilters) {
      this.setState({
        refinerSelectedFilterValues: []
      });
    }

    // Remove an arbitrary value from the inner state
    // Useful when the remove filter action is also present in the parent layout component
    if (nextProps.removeFilterValue) {

      const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
        return elt.RefinementName !== nextProps.removeFilterValue.RefinementName;
      });

      this.setState({
        refinerSelectedFilterValues: newFilterValues
      });

      this._applyFilters(newFilterValues);
    }
  }

  /**
   * Handler when a new filter value is selected
   * @param addedValue the filter value added
   */
  private _onFilterAdded = (addedValue: IRefinementValue) => {

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
  private _applyFilters = (updatedValues: IRefinementValue[]) => {
    this.props.onFilterValuesUpdated(this.props.refinementResult.FilterName, updatedValues, this._operator);
  }

  /**
   * Checks if the current filter value is present in the list of the selected values for the current refiner
   * @param valueToCheck The filter value to check
   */
  private _isValueInFilterSelection(valueToCheck: IRefinementValue): boolean {

      let displayName: string = valueToCheck.RefinementValue.split('|').length > 1 ? valueToCheck.RefinementValue.split('|')[1].trim() : null;

      let newFilters = this.state.refinerSelectedFilterValues.filter((filter) => {
          return filter.RefinementToken === valueToCheck.RefinementToken && (filter.RefinementValue === valueToCheck.RefinementValue || filter.RefinementName === displayName);
      });

      return newFilters.length === 0 ? false : true;
  }
}
