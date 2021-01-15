import { IDataFilter, IDataFilterConfiguration, FilterType, IDataFilterResult } from "@pnp/modern-search-extensibility";
import { BuiltinTokenNames } from "../services/tokenService/TokenService";

export class DataFilterHelper {

  /**
   * Returns the configuration for a specific filter
   * @param filter the filter
   * @param filtersConfiguration the filtes configuraton 
   */
  public static getConfigurationForFilter(filter: IDataFilter | IDataFilterResult, filtersConfiguration: IDataFilterConfiguration[]): IDataFilterConfiguration {

    // Get the configuration for this filter
    let filterConfiguration: IDataFilterConfiguration = undefined;
    const filterConfigIdx = filtersConfiguration.map(configuration => { return configuration.filterName; }).indexOf(filter.filterName);
    
    if (filterConfigIdx !== -1) {
        filterConfiguration = filtersConfiguration[filterConfigIdx];
    }

    return filterConfiguration;
  }

  /**
   * Returns the selected filters by type
   * @param filters the list of selected filters
   * @param type the filter type to get
   * @param filtersConfiguration to filters configuration
   */
  public static getSelectedFilterValuesByType(filters: IDataFilter[], type: FilterType, filtersConfiguration: IDataFilterConfiguration[]): string[] {

    let selectedValues: string[] = [];

    filters.forEach(filter => {

      const configuration = this.getConfigurationForFilter(filter, filtersConfiguration);
      if (configuration && configuration.type === type) {
        selectedValues = selectedValues.concat(filter.values.map(value => value.value));
      }
    });

    return selectedValues.sort();
  }

  /**
   * Determines if filters have been applied via tokens in the string
   * @param selectedFilters the current selected filters
   * @param inputString the string with tokens 
   */
  public static getAppliedFiltersFromTokens(selectedFilters: IDataFilter[], inputString: string): IDataFilter[] {

    const tokens = inputString.match(/\{[^\{]*?\}/gi);
    let selectedFiltersInTokens: IDataFilter[] = [];

    if (tokens !== null && tokens.length > 0) {

      tokens.forEach(token => {

          // Take the expression inside curly brackets
          const tokenName = token.substr(1).slice(0, -1);
          const tokenParts = tokenName.split('.');

          // If contains 'filters.XXX'
          if (tokenName.indexOf(BuiltinTokenNames.filters) !== -1 && tokenParts.length > 1) {                    
            
            // See if the filter name is selected. 'tokenParts[1]' should be the filter name
            const selectedFiltersByName = selectedFilters.filter(selectedFilter => selectedFilter.filterName === tokenParts[1]);
            const alreadyAddedFitlers = selectedFiltersInTokens.filter(selectedFiltersInToken => selectedFiltersInToken.filterName === tokenParts[1]);

            if (selectedFiltersByName.length > 0 && alreadyAddedFitlers.length === 0) {
              selectedFiltersInTokens.push(selectedFilters[0]);
            }
          }
      });
    }

    return selectedFiltersInTokens;
  }
}