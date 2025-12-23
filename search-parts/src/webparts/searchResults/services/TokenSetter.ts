import { ITokenService, IDataFilterToken, IDataFilterTokenValue, IDataVertical, FilterComparisonOperator } from '@pnp/modern-search-extensibility';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';
import { DynamicPropertyHelper } from '../../../helpers/DynamicPropertyHelper';
import { IDataFilterSourceData } from '../../../models/dynamicData/IDataFilterSourceData';
import { IDataVerticalSourceData } from '../../../models/dynamicData/IDataVerticalSourceData';
import { DataFilterHelper } from '../../../helpers/DataFilterHelper';
import { BuiltinFilterTemplates } from '../../../layouts/AvailableTemplates';
import { flatten, isEmpty } from '@microsoft/sp-lodash-subset';
import { DynamicProperty } from '@microsoft/sp-component-base';

export class TokenSetter {

    constructor(
        private tokenService: ITokenService,
        private filtersConnectionSourceData: DynamicProperty<IDataFilterSourceData>,
        private verticalsConnectionSourceData: DynamicProperty<IDataVerticalSourceData>,
        private selectedItemFieldValue: DynamicProperty<any>,
        private destinationFieldName: string,
        private getInputQueryTextValue: () => Promise<string>
    ) {}

    public async setAllTokens(): Promise<void> {
        if (!this.tokenService) {
            return;
        }

        await this.setInputQueryTextTokens();
        this.setFilterTokens();
        this.setItemSelectionTokens();
        await this.setVerticalTokens();
    }

    private async setInputQueryTextTokens(): Promise<void> {
        const inputQueryText = await this.getInputQueryTextValue();
        this.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, inputQueryText);
        this.tokenService.setTokenValue(BuiltinTokenNames.originalInputQueryText, inputQueryText);
    }

    private setFilterTokens(): void {
        if (!this.filtersConnectionSourceData) {
            return;
        }

        const filtersSourceData: IDataFilterSourceData = DynamicPropertyHelper.tryGetValueSafe(this.filtersConnectionSourceData);

        if (!filtersSourceData) {
            return;
        }

        // Set the token as 'null' if no filter is selected meaning the token is available but with no data (different from 'undefined')
        // It is the caller responsibility to check if the value is empty before using it in an expression (ex: `if(empty('{filters}'),'doA','doB)`)
        let filterTokens: IDataFilterToken = null;

        const allValues = flatten(filtersSourceData.selectedFilters.map(f => f.values));

        // Make sure we have values in selected filters
        if (filtersSourceData.selectedFilters.length > 0 && !isEmpty(allValues)) {

            filterTokens = {};

            // Build the initial structure for the configured filter names
            filtersSourceData.filterConfiguration.forEach(filterConfiguration => {
                // Initialize to an empty object so the token service can resolve it to an empty string instead leaving the token '{filters}' as is
                filterTokens[filterConfiguration.filterName] = null;
            });

            filtersSourceData.selectedFilters.forEach(filter => {

                const configuration = DataFilterHelper.getConfigurationForFilter(filter, filtersSourceData.filterConfiguration);

                if (configuration) {

                    let filterTokenValue: IDataFilterTokenValue = null;

                    const filterValues = filter.values.map(value => value.value).join(',');

                    // Don't tokenize the filter if there is no value.
                    if (filterValues.length > 0) {
                        filterTokenValue = {
                            valueAsText: filterValues
                        };
                    }

                    if (configuration.selectedTemplate === BuiltinFilterTemplates.DateRange) {

                        let fromDate = undefined;
                        let toDate = undefined;

                        // Determine start and end dates by operator
                        filter.values.forEach(filterValue => {
                            if (filterValue.operator === FilterComparisonOperator.Geq && !fromDate) {
                                fromDate = filterValue.value;
                            }

                            if (filterValue.operator === FilterComparisonOperator.Lt && !toDate) {
                                toDate = fromDate = filterValue.value;
                            }
                        });

                        filterTokenValue.fromDate = fromDate;
                        filterTokenValue.toDate = toDate;
                    }

                    filterTokens[filter.filterName] = filterTokenValue;
                }
            });
        }

        this.tokenService.setTokenValue(BuiltinTokenNames.filters, filterTokens);
    }

    private setItemSelectionTokens(): void {
        if (!this.destinationFieldName) {
            return;
        }

        const itemFieldValues: string[] = DynamicPropertyHelper.tryGetValuesSafe(this.selectedItemFieldValue);

        let filterTokens = {
            [this.destinationFieldName]: {
                valueAsText: null,
            } as IDataFilterTokenValue
        };

        filterTokens[this.destinationFieldName].valueAsText = itemFieldValues.length > 0 ? itemFieldValues.join(',') : undefined;  // This allow the `{? <KQL expression>}` to work
        this.tokenService.setTokenValue(BuiltinTokenNames.filters, filterTokens);
    }

    private async setVerticalTokens(): Promise<void> {
        if (!this.verticalsConnectionSourceData) {
            return;
        }

        const verticalSourceData = DynamicPropertyHelper.tryGetValueSafe(this.verticalsConnectionSourceData);

        // Tokens for verticals are resolved first locally in the Search Verticals WP itself. If some tokens are not recognized in the string (ex: undefined in their TokenService instance), they will be left untounched. 
        // In this case, we need to resolve them in the current Search Results WP context as they only exist here (ex: itemsCountPerPage)
        if (verticalSourceData && verticalSourceData.selectedVertical) {
            const resolvedSelectedVertical: IDataVertical = {
                key: verticalSourceData.selectedVertical.key,
                name: verticalSourceData.selectedVertical.name,
                value: await this.tokenService.resolveTokens(verticalSourceData.selectedVertical.value)
            };

            this.tokenService.setTokenValue(BuiltinTokenNames.verticals, resolvedSelectedVertical);
        }
    }
}
