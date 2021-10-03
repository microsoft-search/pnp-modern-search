import { Text, ServiceScope } from '@microsoft/sp-core-library';
import { BaseDataSource, FilterComparisonOperator, FilterType, IDataSource, ITokenService } from "@pnp/modern-search-extensibility";
import { ServiceKey } from "@microsoft/sp-core-library";
import { TaxonomyService } from "../services/taxonomyService/TaxonomyService";
import { SharePointSearchService } from "../services/searchService/SharePointSearchService";
import { ServiceScopeHelper } from "./ServiceScopeHelper";
import { TokenService, BuiltinTokenNames } from '../services/tokenService/TokenService';
import * as commonStrings from 'CommonStrings';
import { DataFilterHelper } from './DataFilterHelper';
import { BuiltinFilterTemplates } from '../layouts/AvailableTemplates';
import { IDataFilterSourceData } from '../models/dynamicData/IDataFilterSourceData';
export enum BuiltinDataSourceProviderKeys {
    SharePointSearch = 'SharePointSearch',
    MicrosoftSearch = 'MicrosoftSearch'
}

export class DataSourceHelper {

    /**
     * Gets the data source instance according to the current selected one
     * @param dataSourceKey the selected data source provider key
     * @param webPartInstanceServiceScope the available source definitions
     * @param dataSourceProperties the data source properties
     * @returns the data source provider instance and tokenservice
     */
    public static async getDataSourceInstance(dataSourceKey: string, webPartInstanceServiceScope: ServiceScope, dataSourceProperties: { [key: string]: any }): Promise<{ dataSource: IDataSource, tokenService: ITokenService }> {

        let dataSource: IDataSource = undefined;
        let serviceKey: ServiceKey<IDataSource> = undefined;

        if (dataSourceKey) {

            // If it is a builtin data source, we load the corresponding known class file asynchronously for performance purpose
            // We also create the service key at the same time to be able to get an instance
            switch (dataSourceKey) {

                // SharePoint Search API
                case BuiltinDataSourceProviderKeys.SharePointSearch:

                    const { SharePointSearchDataSource } = await import(
                        /* webpackChunkName: 'pnp-modern-search-sharepoint-search-datasource' */
                        '../dataSources/SharePointSearchDataSource'
                    );

                    serviceKey = ServiceKey.create<IDataSource>('ModernSearch:SharePointSearchDataSource', SharePointSearchDataSource);
                    break;

                // Microsoft Search API
                case BuiltinDataSourceProviderKeys.MicrosoftSearch:

                    const { MicrosoftSearchDataSource } = await import(
                        /* webpackChunkName: 'pnp-modern-search-microsoft-search-datasource' */
                        '../dataSources/MicrosoftSearchDataSource'
                    );

                    serviceKey = ServiceKey.create<IDataSource>('ModernSearch:SharePointSearchDataSource', MicrosoftSearchDataSource);
                    break;

                default:
                    break;
            }

            return new Promise<{ dataSource: IDataSource, tokenService: ITokenService }>((resolve, reject) => {

                // Register here services we want to expose to custom data sources (ex: TokenService)
                // The instances are shared across all data sources. It means when properties will be set once for all consumers. Be careful manipulating these instance properties. 
                const childServiceScope = ServiceScopeHelper.registerChildServices(webPartInstanceServiceScope, [
                    serviceKey,
                    TaxonomyService.ServiceKey,
                    SharePointSearchService.ServiceKey,
                    TokenService.ServiceKey
                ]);

                childServiceScope.whenFinished(async () => {

                    const tokenService = childServiceScope.consume<ITokenService>(TokenService.ServiceKey);

                    // Register the data source service in the Web Part scope only (child scope of the current scope)
                    dataSource = childServiceScope.consume<IDataSource>(serviceKey);

                    // Verifiy if the data source implements correctly the IDataSource interface and BaseDataSource methods
                    const isValidDataSource = (dataSourceInstance: IDataSource): dataSourceInstance is BaseDataSource<any> => {
                        return (
                            (dataSourceInstance as BaseDataSource<any>).getAppliedFilters !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).getData !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).getFilterBehavior !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).getItemCount !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).getPagingBehavior !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).getPropertyPaneGroupsConfiguration !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).getTemplateSlots !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).onInit !== undefined &&
                            (dataSourceInstance as BaseDataSource<any>).onPropertyUpdate !== undefined
                        );
                    };

                    if (!isValidDataSource(dataSource)) {
                        reject(new Error(Text.format(commonStrings.General.Extensibility.InvalidDataSourceInstance, dataSourceKey)));
                    }

                    // Initialize the data source with current Web Part properties
                    if (dataSource) {
                        // Initializes Web part lifecycle methods and properties
                        dataSource.properties = dataSourceProperties;

                        // Initializes available services
                        dataSource.serviceKeys = {
                            TokenService: TokenService.ServiceKey
                        };

                        resolve({ dataSource, tokenService });
                    }
                });
            });
        }
    }

    /**
     * Set token values from Web Part property bag
     */
    public static setTokens(tokenService: ITokenService, inputQueryText: string, filtersSourceData?: IDataFilterSourceData) {

        if (tokenService) {
            tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, inputQueryText);

            // Selected filters
            if (filtersSourceData && filtersSourceData.selectedFilters) {
                /* Example structure
                    {
                    filterName: value(GUID), // Taxonomy
                    filterName:{ // Date range
                        startDate: <ISO_Date>,
                        endDate: <ISO_Date>
                    }
                }*/
                let filterTokens: { [key: string]: string | { [key: string]: string } } = {};

                filtersSourceData.selectedFilters.forEach(filter => {

                    const configuration = DataFilterHelper.getConfigurationForFilter(filter, filtersSourceData.filterConfiguration);

                    if (configuration && configuration.type === FilterType.StaticFilter) {

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

                            filterTokens[filter.filterName] = {
                                startDate: fromDate,
                                endDate: toDate
                            };
                        }
                    }
                });

                tokenService.setTokenValue(BuiltinTokenNames.filters, filterTokens);
            }
        }
    }
}
