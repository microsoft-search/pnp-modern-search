import * as React from 'react';
import { ISearchFiltersContainerProps } from './ISearchFiltersContainerProps';
import { TemplateRenderer } from '../../../controls/TemplateRenderer/TemplateRenderer';
import { ISearchFiltersContainerState } from './ISearchFiltersContainerState';
import { isEqual, cloneDeep, sortBy } from '@microsoft/sp-lodash-subset';
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import * as webPartStrings from 'SearchFiltersWebPartStrings';
import * as commonStrings from 'CommonStrings';
import update from 'immutability-helper';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { 
  IDataFilterInternal, 
  IDataFilterValueInternal, 
  IDataFilterConfiguration, 
  IDataFilterResult, 
  IDataFilterResultValue, 
  IDataFilter, 
  FilterComparisonOperator, 
  IDataFilterInfo,
  ExtensibilityConstants
} from '@pnp/modern-search-extensibility';
import { ISearchFiltersTemplateContext } from '../../../models/common/ITemplateContext';
import { flatten } from '@microsoft/sp-lodash-subset';
import { DisplayMode } from '@microsoft/sp-core-library';
import { DataFilterHelper } from '../../../helpers/DataFilterHelper';

export default class SearchFiltersContainer extends React.Component<ISearchFiltersContainerProps, ISearchFiltersContainerState> {

  private componentRef: React.RefObject<any>;

  public constructor(props: ISearchFiltersContainerProps) {
    
    super(props);

    this.state = {
      currentUiFilters: [],
      submittedFilters: []
    };

    this.componentRef = React.createRef();

    this.onFilterValuesUpdated = this.onFilterValuesUpdated.bind(this);
  }

  public render(): React.ReactElement<ISearchFiltersContainerProps> {

    let renderWpContent: JSX.Element = null;
    let templateContent: string = null;
    let renderTitle: JSX.Element = null;

     // WP title
     renderTitle =  <WebPartTitle 
                      displayMode={this.props.webPartTitleProps.displayMode} 
                      title={this.props.webPartTitleProps.title} 
                      updateProperty={this.props.webPartTitleProps.updateProperty}
                      className={this.props.webPartTitleProps.className}
                    />;
    
    // If no filter 
    if (this.state.currentUiFilters.length === 0) {

      if (this.props.webPartTitleProps.displayMode === DisplayMode.Edit) {
        renderWpContent = <MessageBar messageBarType={MessageBarType.info}>{webPartStrings.General.NoAvailableFilterMessage}</MessageBar>;
      }
      
    } else {

      // Content loading
      templateContent = this.props.templateService.getTemplateMarkup(this.props.templateContent);
      const templateContext = this.getTemplateContext();
    
      renderWpContent =   <TemplateRenderer
                            key={JSON.stringify(templateContext)}
                            templateContent={templateContent} 
                            templateContext={templateContext}
                            templateService={this.props.templateService}
                            instanceId={this.props.instanceId}
                          />;
    }
    
    return  <div ref={this.componentRef} data-instance-id={this.props.instanceId}>
                {renderTitle}
                {renderWpContent}
            </div>;
  }

  public componentDidMount() {

    // Bind events when filter values are selected
    this.bindFilterEvents();

    // Bind events when mutli valued filter value are applied for a specific filter
    this.bindApplyFiltersEvents();

    // Bind events when mutli valued filter value are cleared for a specific filter
    this.bindClearFiltersEvents();

    // Initial state
    this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);
  }

  public componentDidUpdate(prevProps: ISearchFiltersContainerProps, prevState: ISearchFiltersContainerState) {
    
    // When filters configuration is updated or the layout is changed 
    if (!isEqual(prevProps.selectedLayoutKey, this.props.selectedLayoutKey) 
        || !isEqual(prevProps.properties, this.props.properties)) {

      const updatedfilters = this.state.currentUiFilters.map(selectedFilter => { 

        const updatedFilter = cloneDeep(selectedFilter);
        updatedFilter.values = [];
        return updatedFilter;
      });

      const submittedFilters = this.getSelectedFiltersFromUIFilters(updatedfilters);

      this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);

      this.props.onUpdateFilters(submittedFilters);
    }

    // When new filters are received from the data source
    if (!isEqual(prevProps.availableFilters, this.props.availableFilters)) {

        this.getFiltersToDisplay(this.props.availableFilters, this.state.currentUiFilters, this.props.filtersConfiguration);

        const submittedFilters = this.getSelectedFiltersFromUIFilters(this.state.currentUiFilters);
          
        this.setState({
          submittedFilters: submittedFilters
        });
    }
  }

  /**
   * Determines filters to be sent to the Handlebars templates as context with enhanced information from configuration
   * @param availableFilters the available filter results returned from the data source
   * @param currentUIFilters the current selected filters in the UI
   * @param filtersConfiguration the filter configuration from the property pane
   */
  private getFiltersToDisplay(availableFilters: IDataFilterResult[], currentUiFilters: IDataFilterInternal[], filtersConfiguration: IDataFilterConfiguration[]): void {

    const updatedFilters: IDataFilterInternal[] = availableFilters.map(availableFilter=> {

      let values: IDataFilterValueInternal[] = [];
  
      // Get the corresponding configuration for this filter
      const filterConfiguration = DataFilterHelper.getConfigurationForFilter(availableFilter, filtersConfiguration);

      if(filterConfiguration) {
        
        // Determine if the filter is already selected in the current UI filters 
        const selectedFilterIdx = currentUiFilters.map(selectedFilter => { return selectedFilter.filterName; }).indexOf(availableFilter.filterName);

        // When the selected filters combination have no results, we set the selected value counts for the current filter to 0 to be able to reset it in the UI.
        if (availableFilter.values.length === 0) {
          
          if (selectedFilterIdx !== -1) {

            // Set count to 0
            values = currentUiFilters[selectedFilterIdx].values.map(value => {

                // Reset the count for already selected refiners
                if (((value.selected || value.selectedOnce) && filterConfiguration.isMulti) || (value.selected && !filterConfiguration.isMulti)) {
                  value.count = 0;
                } else {
                  return null;
                }
                
                return value;
            }).filter(value => value);
          }
          
        } else {

          // Merge available filters with currently selected filters to ajust the count information
          values = availableFilter.values.map((availableValue: IDataFilterResultValue) => {

            const filterValueInternal: IDataFilterValueInternal = {          
              name: availableValue.name,
              selected: false,
              selectedOnce: false,
              disabled: false,
              value: availableValue.value,
              count: availableValue.count
            };
 
            if (selectedFilterIdx !== -1) {

              const valueIdx = currentUiFilters[selectedFilterIdx].values.map(value => { return value.value; }).indexOf(availableValue.value);

              // A new filter value is available
              if (valueIdx === -1) {
                return filterValueInternal;
              } else {

                // Update the count + name information
                const updatedValue = currentUiFilters[selectedFilterIdx].values[valueIdx];
                updatedValue.count = availableValue.count;
                updatedValue.name = availableValue.name;
                return updatedValue;
              }

            } else {
              // A new filter with new values is available
              return filterValueInternal;
            }
          });
        }

        // Add leftover values added outside of filter values range (ex: from a date range component or taxonomy picker)
        if (selectedFilterIdx !== -1) {
          const additionalValues = currentUiFilters[selectedFilterIdx].values.map(value => {

            const valueIdx = values.map(v => { return v.value; }).indexOf(value.value);
            if (valueIdx === -1 && value.selected) {
              return value;
            }
          });

          values = values.concat(additionalValues.filter(value => value));
        }

        const selectedOnce = selectedFilterIdx !== -1 && currentUiFilters[selectedFilterIdx].selectedOnce ? currentUiFilters[selectedFilterIdx].selectedOnce : values.filter(value => { return value.selectedOnce; }).length > 0;
        const hasSelectedValues = values.filter(value => { return value.selected; }).length > 0;

        // Determine if the user has updated the filter values (used for apply/clear buttons state)
        const currentSelectedValuesInUiForFilter = values.filter(value => { return value.selected; }).map(v => v.value).sort();
        const alreadySubmittedValuesForFilter = flatten(this.state.submittedFilters.filter(s => s.filterName === availableFilter.filterName).map(v => v.values)).map(t => t.value).sort();

        const canApply = !isEqual(currentSelectedValuesInUiForFilter, alreadySubmittedValuesForFilter);
        const canClear = alreadySubmittedValuesForFilter.length > 0;

        // Disabled all unselected values if the configuration is not multi to prevent multiple selection at once
        values = values.map(value => {
          if (!filterConfiguration.isMulti && hasSelectedValues && !value.selected) {
            value.disabled = true;
          } else {
            value.disabled = false;
          }

          return value;
        });

        // Merge information with filter configuration and other useful proeprties
        const filterResultInternal: IDataFilterInternal = {
          displayName: filterConfiguration.displayValue ? filterConfiguration.displayValue : availableFilter.filterName,
          filterName: availableFilter.filterName,
          isMulti: !filterConfiguration.isMulti ? false : filterConfiguration.isMulti,
          showCount: !filterConfiguration.showCount ? false: filterConfiguration.showCount,
          expandByDefault: !filterConfiguration.expandByDefault ? false : filterConfiguration.expandByDefault,
          selectedOnce: selectedOnce,
          selectedTemplate: filterConfiguration.selectedTemplate,
          hasSelectedValues: hasSelectedValues,
          values: values,
          operator: filterConfiguration.operator,
          taxonomyItemIds: filterConfiguration.taxonomyItemIds,
          sortIdx: filterConfiguration.sortIdx,
          canApply: canApply,
          canClear: canClear
        };
        
        return filterResultInternal;
      }
    });

    this.setState({
      currentUiFilters: update(this.state.currentUiFilters, { $set: sortBy(updatedFilters.filter(updatedFilter => updatedFilter), 'sortIdx')})      
    });
  }

  /**
   * Update the filter status in the state according to values
   * @param filterInfo the information about the updated filter
   */
  private onFilterValuesUpdated(filterInfo: IDataFilterInfo) {

      let currentUiFilters: IDataFilterInternal[] = [];

      // Get the configuration for this filter
      const filterConfigIdx = this.props.filtersConfiguration.map(filter => { return filter.filterName; }).indexOf(filterInfo.filterName);
      
      if (filterConfigIdx !== -1) {

        const filterConfiguration = this.props.filtersConfiguration[filterConfigIdx];
      
        // Get the index of the filter in the current selected filters collection
        const filterIdx = this.state.currentUiFilters.map(filter => { return filter.filterName; }).indexOf(filterInfo.filterName);

        if (filterIdx !== -1 ) {

          currentUiFilters = cloneDeep(this.state.currentUiFilters);

          // Addition or merge scenario
          filterInfo.filterValues.map(filterValue => {

            const filterValueInternal: IDataFilterValueInternal = {
              selected: filterValue.selected,
              name: filterValue.name,
              value: filterValue.value,
              operator: filterValue.operator,
              selectedOnce: true
            };

            const valueIdx = currentUiFilters[filterIdx].values.map(value => { return value.value; }).indexOf(filterValue.value);
        
            if (valueIdx === -1) {
              // If the value does not exist yet, we add it to the selected values
              currentUiFilters = update(currentUiFilters, { [filterIdx]: { values: { $push: [filterValueInternal] }}});
            } else {
              // Otherwise, we update the value in selected values
              currentUiFilters =  update(currentUiFilters, { [filterIdx]: { values: { [valueIdx]: { $set: filterValueInternal }}}});
            }
          });

        } else {

          const filterValuesInternal: IDataFilterValueInternal[] = filterInfo.filterValues.map(filterValue => {
            return {
              selected: filterValue.selected,
              name: filterValue.name,
              value: filterValue.value,
              selectedOnce: true
            };
          });

          const filterResultInternal: IDataFilterInternal = {
            displayName: filterConfiguration.displayValue ? filterConfiguration.displayValue : filterInfo.filterName,
            filterName: filterInfo.filterName,
            hasSelectedValues: filterInfo.filterValues.filter(value => value.selected).length > 0,
            selectedOnce: true,
            isMulti: !filterConfiguration.isMulti ? false : filterConfiguration.isMulti,
            showCount: !filterConfiguration.showCount ? false: filterConfiguration.showCount,
            expandByDefault: !filterConfiguration.expandByDefault ? false : filterConfiguration.expandByDefault,
            values: filterValuesInternal,
            operator: filterConfiguration.operator,
            selectedTemplate: filterConfiguration.selectedTemplate,
            sortIdx: filterConfiguration.sortIdx
          };

          // If does not exist, add to selected filters collection
          currentUiFilters = update(this.state.currentUiFilters, { $push: [filterResultInternal] });
        }
            
        if (!filterConfiguration.isMulti || filterInfo.forceUpdate) {

          const submittedFilters = this.getSelectedFiltersFromUIFilters(currentUiFilters);
          
          this.setState({
            submittedFilters: submittedFilters
          });

          // Send only selected filters to the data source
          this.props.onUpdateFilters(submittedFilters);
        }

        this.getFiltersToDisplay(this.props.availableFilters, currentUiFilters, this.props.filtersConfiguration);
      }
  }

  /**
   * Gets only the selected filters from the UI and convert them to format sent to the data source
   * @param currentUiFilters the current UI filters (selected or not)
   */
  private getSelectedFiltersFromUIFilters(currentUiFilters: IDataFilterInternal[]): IDataFilter[] {

    const selectedFilters: IDataFilter[] = currentUiFilters.map(selectedFilter => { 

      const newSelectedFilter = cloneDeep(selectedFilter);

      const values = newSelectedFilter.values.filter(selectedValue => {
        return selectedValue.selected;
      });

      if (values.length > 0) {
        
        newSelectedFilter.values = values.map(value => {

          let newValue = cloneDeep(value);
  
          // Remove useless properties since we don't want to expose them in the data source, especially for consumers
          delete newValue.selected;
          delete newValue.selectedOnce;
          delete newValue.count;

          // 'Equals' by default
          if (!newValue.operator) newValue.operator = FilterComparisonOperator.Eq;
  
          return newValue;
        });
        
        // Remove useless properties since we don't want to expose them in the data source, especially for consumers
        // We need to return only proeprties used for IDataFilter to avoid confusion
        delete newSelectedFilter.expandByDefault;
        delete newSelectedFilter.hasSelectedValues;
        delete newSelectedFilter.selectedOnce;
        delete newSelectedFilter.showCount;
        delete newSelectedFilter.isMulti;
        delete newSelectedFilter.displayName;
        delete newSelectedFilter.canApply;
        delete newSelectedFilter.canClear;
        delete newSelectedFilter.sortIdx;
        delete newSelectedFilter.taxonomyItemIds;
        delete newSelectedFilter.selectedTemplate;
  
        return newSelectedFilter;
      }
    });

    return selectedFilters.filter(filter => filter);
  }

  /**
   * Binds event fired from filter value web components ('When an single filter value is selected')
   */
  private bindFilterEvents() {

    this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_UPDATED, ((ev: CustomEvent) => {

      // We ensure the event if not propagated outside the component (i.e. other Web Part instances)
      ev.stopImmediatePropagation();

      const dataFilterInfo = ev.detail as IDataFilterInfo;

      // Need the 'selected' because web components are stateless so we need to know if the filter has been selected or removed
      this.onFilterValuesUpdated(dataFilterInfo);

    }).bind(this));
  }

  /**
   * Binds event fired from filter value web components ('When all filter values are applied (multi values filter)')
   */
  private bindApplyFiltersEvents() {

    this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, ((ev: CustomEvent) => {

      ev.stopImmediatePropagation();

      const submittedFilters = this.getSelectedFiltersFromUIFilters(this.state.currentUiFilters);

      // Refresh the UI
      this.getFiltersToDisplay(this.props.availableFilters, this.state.currentUiFilters, this.props.filtersConfiguration);

      this.setState({
        submittedFilters: submittedFilters
      });

      // Send selected filters to the data source
      this.props.onUpdateFilters(submittedFilters);

    }).bind(this));
  }

  /**
   * Binds event fired from filter value web components ('When all filter values are cleared (multi values filter)')
   */
  private bindClearFiltersEvents() {

    this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, ((ev: CustomEvent) => {

      ev.stopImmediatePropagation();

      const updatedfilters = this.state.currentUiFilters.map(selectedFilter => {

        const updatedFilter = cloneDeep(selectedFilter);

        if (updatedFilter.filterName === ev.detail.filterName) {
          updatedFilter.values = [];
          updatedFilter.selectedOnce = true;
          updatedFilter.hasSelectedValues = false;
        } else {
          updatedFilter.values = updatedFilter.values.filter(filter => filter.selected);
        }
        return updatedFilter;
      });

      const updateSubmittedFilters = this.state.submittedFilters.map(submittedFilter => {
        if (submittedFilter.filterName === ev.detail.filterName) {
          submittedFilter.values = [];
        }
        return submittedFilter;
      });

      this.setState({
        submittedFilters: updateSubmittedFilters
      });

      // Refresh the UI
      this.getFiltersToDisplay(this.props.availableFilters, updatedfilters, this.props.filtersConfiguration);

      // Send selected filters to the data source
      this.props.onUpdateFilters(updateSubmittedFilters);

    }).bind(this));
  }

  // Build the template context
  private getTemplateContext(): ISearchFiltersTemplateContext {

    return {
      filters: this.state.currentUiFilters,
      selectedFilters: this.state.submittedFilters,
      instanceId: this.props.instanceId,
      theme: this.props.themeVariant,
      strings: commonStrings.Filters,
      selectedOnce: this.state.currentUiFilters.filter(currentFilter => currentFilter.selectedOnce).length > 0,
      properties: {
        ...this.props.properties
      },
    };
  }
}
