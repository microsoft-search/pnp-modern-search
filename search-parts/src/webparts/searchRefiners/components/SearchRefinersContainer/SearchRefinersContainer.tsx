import * as React from 'react';
import styles from '../SearchRefinersWebPart.module.scss';
import { ISearchRefinersContainerProps } from './ISearchRefinersContainerProps';
import { DisplayMode } from '@microsoft/sp-core-library';
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import Vertical from '../Layouts/Vertical/Vertical';
import LinkPanel from '../Layouts/LinkPanel/LinkPanel';
import RefinersLayoutOption from '../../../../models/RefinersLayoutOptions';
import { MessageBarType, MessageBar } from 'office-ui-fabric-react/lib/MessageBar';
import * as strings from 'SearchRefinersWebPartStrings';
import { ISearchRefinersContainerState } from './ISearchRefinersContainerState';
import { IRefinementFilter, IRefinementValue, RefinementOperator, IRefinementResult } from '../../../../models/ISearchResult';
import * as update from 'immutability-helper';
import RefinerTemplateOption from '../../../../models/RefinerTemplateOption';
import { find, isEqual } from '@microsoft/sp-lodash-subset';
import RefinersSortOption from '../../../../models/RefinersSortOptions';
import RefinerSortDirection from '../../../../models/RefinersSortDirection';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import IRefinerConfiguration from "../../../../models/IRefinerConfiguration";

export default class SearchRefinersContainer extends React.Component<ISearchRefinersContainerProps, ISearchRefinersContainerState> {

  private _defaultFiltersLoaded: boolean = false;

  public constructor(props: ISearchRefinersContainerProps) {
    super(props);

    this.state = {
      shouldResetFilters: false,
      selectedRefinementFilters: [],
      availableRefiners: []
    };

    this.onFilterValuesUpdated = this.onFilterValuesUpdated.bind(this);
    this.onRemoveAllFilters = this.onRemoveAllFilters.bind(this);
  }

  public render(): React.ReactElement<ISearchRefinersContainerProps> {
    let renderWpContent: JSX.Element = null;
    let renderWebPartTitle: JSX.Element = null;

    const { semanticColors }: IReadonlyTheme = this.props.themeVariant;

    if (this.props.webPartTitle && this.props.webPartTitle.length > 0) {
      renderWebPartTitle = <WebPartTitle title={this.props.webPartTitle} updateProperty={null} displayMode={DisplayMode.Read} themeVariant={this.props.themeVariant} />;
    }

    if (this.state.availableRefiners.length === 0) {

      if (this.props.displayMode === DisplayMode.Edit && this.props.showBlank) {
        renderWpContent = <MessageBar messageBarType={MessageBarType.info}>{strings.ShowBlankEditInfoMessage}</MessageBar>;
      } else if (!this.props.showBlank) {
        renderWpContent = <div className={styles.searchRefiners__noFilter}>
          {strings.NoFilterConfiguredLabel}
        </div>;
      }

    } else {

      // Choose the right layout according to the Web Part option
      switch (this.props.selectedLayout) {
        case RefinersLayoutOption.Vertical:
          renderWpContent = <Vertical
            onFilterValuesUpdated={this.onFilterValuesUpdated}
            refinementResults={this.state.availableRefiners}
            refinersConfiguration={this.props.refinersConfiguration}
            shouldResetFilters={this.state.shouldResetFilters}
            onRemoveAllFilters={this.onRemoveAllFilters}
            hasSelectedValues={this.state.selectedRefinementFilters.length > 0 ? true : false}
            language={this.props.language}
            themeVariant={this.props.themeVariant}
            selectedFilters={this.state.selectedRefinementFilters}
            userService={this.props.userService}
          />;
          break;

        case RefinersLayoutOption.LinkAndPanel:

          // Flatten all selected values
          let selectedValues = [];
          this.state.selectedRefinementFilters.map(refinement => {
            selectedValues = selectedValues.concat(refinement.Values);
          });

          renderWpContent = <LinkPanel
            onFilterValuesUpdated={this.onFilterValuesUpdated}
            refinementResults={this.state.availableRefiners}
            refinersConfiguration={this.props.refinersConfiguration}
            shouldResetFilters={this.state.shouldResetFilters}
            onRemoveAllFilters={this.onRemoveAllFilters}
            hasSelectedValues={this.state.selectedRefinementFilters.length > 0 ? true : false}
            selectedFilterValues={selectedValues}
            language={this.props.language}
            themeVariant={this.props.themeVariant}
            selectedFilters={this.state.selectedRefinementFilters}
            userService={this.props.userService}
          />;
          break;
      }
    }

    return (
      <div style={{ backgroundColor: semanticColors.bodyBackground }}>
        <div className={styles.searchRefiners}>
          {renderWebPartTitle}
          {renderWpContent}
        </div>
      </div>
    );
  }

  public UNSAFE_componentWillReceiveProps(nextProps: ISearchRefinersContainerProps) {

    if (nextProps.query !== this.props.query || !isEqual(this.props.themeVariant, nextProps.themeVariant)) {

      this.setState({
        shouldResetFilters: true,
        selectedRefinementFilters: []
      });

    } else {

      // Reset the flag every time we receive new refinement results
      this.setState({
        shouldResetFilters: false
      });
    }

    let availableFilters = nextProps.availableRefiners;

    nextProps.availableRefiners.forEach((refinementResult, index) => {

      // get the configuration for this refiner
      let refinerConfig = find(nextProps.refinersConfiguration, refiner => refiner.refinerName === refinementResult.FilterName);

      // if the Sort Option is Alphabetical, reorder the values
      if (refinerConfig && refinerConfig.refinerSortType === RefinersSortOption.Alphabetical) {
        let sortedValues = refinementResult.Values.sort((a, b) => {
          let textA = a.RefinementName.toLocaleUpperCase();
          let textB = b.RefinementName.toLocaleUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        availableFilters[index].Values = sortedValues;
      }
      else if (refinerConfig && refinerConfig.refinerSortType === RefinersSortOption.ByNumberOfResults) {
        let sortedValues = refinementResult.Values.sort((a, b) => {
          let textA = a.RefinementName.toLocaleUpperCase();
          let textB = b.RefinementName.toLocaleUpperCase();
          return (a.RefinementCount < b.RefinementCount) ? -1 : (a.RefinementCount > b.RefinementCount) ? 1 : (
            // on same number, alphabetically
            (textA < textB) ? -1 : (textA > textB) ? 1 : 0
          );
        });
        availableFilters[index].Values = sortedValues;
      }

      if (refinerConfig && refinerConfig.refinerSortType !== RefinersSortOption.Default && refinerConfig.refinerSortDirection == RefinerSortDirection.Descending) {
        refinementResult.Values = refinementResult.Values.reverse();
      }
    });

    // If a filter of type DateTime is currently selected but is not present in the new received refinement results, we add it as a result manually to be able to reset it
    const dateFilters = nextProps.refinersConfiguration.filter(refiner => {
      return refiner.template === RefinerTemplateOption.DateRange;
    });

    dateFilters.map(dateFilter => {

      // Is the filter currently selected?
      const isSelected = this.state.selectedRefinementFilters.map(filter => { return filter.FilterName === dateFilter.refinerName; }).length > 0 ? true : false;

      // If selected but there is no more result for this refiner, we manually add a dummy entry to available filters
      if (isSelected && nextProps.availableRefiners.filter(availableRefiner => { return availableRefiner.FilterName === dateFilter.refinerName; }).length === 0) {

        // Simply revert to previous filters to be able to reset filters combination
        availableFilters = update(nextProps.availableRefiners, { $set: this.props.availableRefiners.length > 0 ? this.props.availableRefiners : this.state.availableRefiners });

        // Reset all refinement counts
        availableFilters = availableFilters.map(filter => {

          const values = filter.Values.map(value => {
            value.RefinementCount = 0;
            return value;
          });

          filter.Values = values;
          return filter;
        });
      }
    });

    this._applyDefaultRefinementFilters(availableFilters);

    this.setState({
      availableRefiners: availableFilters
    });
  }

  public componentDidMount() {
    this.setState({
      availableRefiners: this.props.availableRefiners
    });
  }

  /**
   * Update the filter status in the state according to values
   * @param filterName the filter to update
   * @param filterValues the filter values
   * @param operator the operator (FQL) (i.e AND/OR)
   */
  private onFilterValuesUpdated(filterName: string, filterValues: IRefinementValue[], operator: RefinementOperator) {

    let newFilters = [];

    const refinementFilter: IRefinementFilter = {
      FilterName: filterName,
      Values: filterValues,
      Operator: operator
    };

    // Get the index of the filter in the current selected filters collection
    const filterIdx = this.state.selectedRefinementFilters.map(selected => { return selected.FilterName; }).indexOf(filterName);

    if (filterIdx !== -1) {

      if (filterValues.length > 0) {
        // Update value for the specific filters
        newFilters = update(this.state.selectedRefinementFilters, { [filterIdx]: { $set: refinementFilter } });
      } else {
        // If no values, we remove the filter
        newFilters = update(this.state.selectedRefinementFilters, { $splice: [[filterIdx, 1]] });
      }

    } else {

      if (filterValues.length > 0) {
        // If does not exist, add to selected filters collection
        newFilters = update(this.state.selectedRefinementFilters, { $push: [refinementFilter] });
      }
    }

    // Very important to reset the 'reset' flag after an udpdate
    this.setState({
      selectedRefinementFilters: newFilters,
      shouldResetFilters: false
    });

    this.props.onUpdateFilters(newFilters);
  }

  /**
   * Removes all selected filter values for all refiners
   */
  private onRemoveAllFilters() {

    this.setState({
      selectedRefinementFilters: [],
      shouldResetFilters: true
    });

    this.props.onUpdateFilters([]);
  }

  private _applyDefaultRefinementFilters(availableFilters: IRefinementResult[]): void {
    const defaultFilters: IRefinementFilter[] = [];

    if (this._defaultFiltersLoaded || !this.props || !this.props.refinersConfiguration || !this.props.refinersConfiguration.length || 
        !availableFilters || !availableFilters.length) {
      return;
    }

    // This ensures loading the values only once.
    this._defaultFiltersLoaded = true;

    // Check all Refiner Configuration and load the default filters
    this.props.refinersConfiguration.forEach((refinerConfiguration: IRefinerConfiguration) => {

      if (refinerConfiguration.refinerDefaultFilters) {

        const filterName = refinerConfiguration.refinerName;
        const defaultFiltersConfig = refinerConfiguration.refinerDefaultFilters;
        const refinementValues = this._getDefaultFilterValues(filterName, defaultFiltersConfig, availableFilters);

        if (refinementValues.length){
          const refinementFilter: IRefinementFilter = {
            FilterName: filterName,
            Values: refinementValues,
            Operator: this._getFilterOperatorFromConfig(refinerConfiguration)
          };

          defaultFilters.push(refinementFilter);
        }
      }

    });

    if (!defaultFilters.length) {
      return;
    }

    this.setState({
      selectedRefinementFilters: defaultFilters,
      shouldResetFilters: false
    });

    this.props.onUpdateFilters(defaultFilters);
  }

  private _getDefaultFilterValues(filterName: string, defaultFiltersConfig: string | string[], availableResults: IRefinementResult[]): IRefinementValue[] {
    const refinementValues: IRefinementValue[] = [];

    if (!defaultFiltersConfig || typeof defaultFiltersConfig !== "string") {
      return refinementValues;
    }

    if ( defaultFiltersConfig.indexOf(",") >= 0) {
      // Split multiples comma separated values
      defaultFiltersConfig.split(",").forEach((filter: string) => {
        this._addDefaultRefinementValue(filterName, filter, availableResults, refinementValues);
      });

    } else {
      this._addDefaultRefinementValue(filterName, defaultFiltersConfig, availableResults, refinementValues);
    }

    return refinementValues;
  }

  private _addDefaultRefinementValue(filterName: string, filterValue: string, availableResults: IRefinementResult[], refinementValues: IRefinementValue[]): IRefinementValue {
    if (!filterName || !filterValue || !availableResults.length || !refinementValues) return;

    const availableResult = availableResults.find(result => result.FilterName === filterName);
    if (availableResult && availableResult.Values.length > 0){
      const value = availableResult.Values.find(val => {
        return val.RefinementName === filterValue;
      });

      if (value) {
        refinementValues.push(value);
      }
    }
  }

  private _getFilterOperatorFromConfig(refinerConfiguration: IRefinerConfiguration): RefinementOperator {
    switch (refinerConfiguration.template) {
      case RefinerTemplateOption.CheckBox:
      case RefinerTemplateOption.FixedDateRange:
        return RefinementOperator.AND;

      case RefinerTemplateOption.CheckBoxMulti:
      case RefinerTemplateOption.DateRange:
        return RefinementOperator.OR;

      default:
        return RefinementOperator.AND;
    }
  }
}
