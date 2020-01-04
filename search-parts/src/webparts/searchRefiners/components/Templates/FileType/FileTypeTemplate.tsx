// React
import * as React from 'react';

// Localization
import * as strings from 'SearchRefinersWebPartStrings';

// CSS
import styles from './FileTypeTemplate.module.scss';

// UI Fabric
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Text } from '@microsoft/sp-core-library';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Text as TextUI } from 'office-ui-fabric-react/lib/Text';
import { getFileTypeIconProps } from '@uifabric/file-type-icons';
import { ITheme } from '@uifabric/styling';

// Third party lib
import * as update from 'immutability-helper';

// Helper
import { FileHelper } from './../../../../../helpers/FileHelper';

// Interface
import { IRefinementValue, RefinementOperator } from '../../../../../models/ISearchResult';
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';

// Class
export default class FileTypeTemplate extends React.Component<IBaseRefinerTemplateProps, IBaseRefinerTemplateState> {

  private _operator: RefinementOperator;

  public constructor(props: IBaseRefinerTemplateProps) {
    super(props);

    this.state = {
      refinerSelectedFilterValues: []
    };
  }

  public render() {
    return (
      <div className={styles.pnpRefinersTemplateFileType}>
        {
          this.props.refinementResult.Values.map((refinementValue: IRefinementValue, j) => {

            if (refinementValue.RefinementCount === 0) {
              return null;
            }

            let extension: string = refinementValue.RefinementValue.toLowerCase();

            return (
              <Checkbox
                styles={{
                  root: {
                    padding: 10
                  }
                }}
                key={j}
                checked={this._isValueInFilterSelection(refinementValue)}
                onChange={(ev, checked: boolean) => {
                  checked ? this._onFilterAdded(refinementValue) : this._onFilterRemoved(refinementValue);
                }}
                theme={this.props.themeVariant as ITheme}
                onRenderLabel={() => {
                  return (
                    <>
                      <Icon {...getFileTypeIconProps({ extension: extension, size: 20, imageFileType: 'svg' })} />
                      <TextUI className='pnp-lbl' block={true} nowrap={true}>{Text.format(`${FileHelper.extensionToLabel(extension)} ({0})`, refinementValue.RefinementCount)}</TextUI>
                    </>
                  );
                }}
              >
              </Checkbox>
            );
          })
        }
        {
          this.props.isMultiValue ?

            <div>
              <Link onClick={() => { this._applyFilters(this.state.refinerSelectedFilterValues); }} disabled={this.state.refinerSelectedFilterValues.length === 0}>{strings.Refiners.ApplyFiltersLabel}</Link>|<Link onClick={this._clearFilters} disabled={this.state.refinerSelectedFilterValues.length === 0}>{strings.Refiners.ClearFiltersLabel}</Link>
            </div>

            : null
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

  public UNSAFE_componentWillReceiveProps(nextProps: IBaseRefinerTemplateProps) {

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
  private _onFilterRemoved = (removedValue: IRefinementValue) => {

    const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
      return elt.RefinementName !== removedValue.RefinementName;
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
   * Clears all selected filters for the current refiner
   */
  private _clearFilters = () => {

    this.setState({
      refinerSelectedFilterValues: []
    });

    this._applyFilters([]);
  }
}
