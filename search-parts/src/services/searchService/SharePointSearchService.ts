import { Text } from '@microsoft/sp-core-library';
import { ServiceKey, ServiceScope, Log } from "@microsoft/sp-core-library";
import { SPHttpClient } from "@microsoft/sp-http";
import { ISharePointSearchService } from './ISharePointSearchService';
import { PnPClientStorage } from "@pnp/common/storage";
import { dateAdd } from "@pnp/common/util";
import { PageContext } from '@microsoft/sp-page-context';
import { ISharePointSearchResult, ISharePointSearchResults, ISharePointSearchResultBlock, ISharePointSearchPromotedResult } from '../../models/search/ISharePointSearchResults';
import ISharePointManagedProperty from '../../models/search/ISharePointManagedProperty';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { IDataFilterResultValue, IDataFilterResult, FilterComparisonOperator } from '@pnp/modern-search-extensibility';
import LocalizationHelper from '../../helpers/LocalizationHelper';
import { ISharePointSearchResponse } from '../../models/search/ISharePointSearchResponse';
import { ISuggestResult, ISuggestQuery } from '../../models/search/ISuggestQuery';
import { ISharePointSearchQuery, SortDirection } from '../../models/search/ISharePointSearchQuery';
import { cloneDeep } from "@microsoft/sp-lodash-subset";
import { Constants } from '../../common/Constants';

const SearchService_ServiceKey = 'pnpSearchResults:SharePointSearchService';
const AvailableQueryLanguages_StorageKey = 'pnpSearchResults_AvailableQueryLanguages';

export class SharePointSearchService implements ISharePointSearchService {

    public static ServiceKey: ServiceKey<ISharePointSearchService> = ServiceKey.create(SearchService_ServiceKey, SharePointSearchService);

    /**
     * The current page context instance
     */
    private pageContext: PageContext;

    /**
     * The SharePoint search service endpoint REST URL
     */
    private searchEndpointUrl: string;

    /**
     * The current service scope
     */
    private serviceScope: ServiceScope;

    /**
     * The SPHttpClient instance
     */
    private spHttpClient: SPHttpClient;

    /**
     * The client storage instance
     */
    private clientStorage: PnPClientStorage;

    constructor(serviceScope: ServiceScope) {

        this.serviceScope = serviceScope;

        this.clientStorage = new PnPClientStorage();

        serviceScope.whenFinished(async () => {

            this.pageContext = serviceScope.consume<PageContext>(PageContext.serviceKey);
            this.spHttpClient = serviceScope.consume<SPHttpClient>(SPHttpClient.serviceKey);

            this.searchEndpointUrl = `${this.pageContext.web.absoluteUrl}/_api/search/postquery`;
        });
    }

    /**
     * Performs a search query against SharePoint
     * @param searchQuery The search query in KQL format
     * @return The search results
     */
    public async search(searchQuery: ISharePointSearchQuery): Promise<ISharePointSearchResults> {

        let results: ISharePointSearchResults = {
            queryKeywords: searchQuery.Querytext,
            refinementResults: [],
            relevantResults: [],
            secondaryResults: [],
            totalRows: 0
        };

        try {

            const response = await this.spHttpClient.post(this.searchEndpointUrl, SPHttpClient.configurations.v1, {
                body: this.getRequestPayload(searchQuery),
                headers: {
                    'odata-version': '3.0',
                    'accept': 'application/json;odata=nometadata',
                    'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                    'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
                }
            });

            if (response.ok) {
                const searchResponse: ISharePointSearchResponse = await response.json();

                if (searchResponse.PrimaryQueryResult) {

                    let refinementResults: IDataFilterResult[] = [];

                    // Get the transformed query submitted to SharePoint
                    const properties = searchResponse.PrimaryQueryResult.RelevantResults.Properties.filter((property) => {
                        return property.Key === 'QueryModification';
                    });

                    if (properties.length === 1) {
                        results.queryModification = properties[0].Value;
                    }

                    const resultRows = searchResponse.PrimaryQueryResult.RelevantResults.Table.Rows;
                    let refinementResultsRows = searchResponse.PrimaryQueryResult.RefinementResults;

                    const refinementRows: any = refinementResultsRows ? refinementResultsRows.Refiners : [];

                    // Map search results
                    let searchResults: ISharePointSearchResult[] = this.getSearchResults(resultRows);

                    // Map refinement results
                    refinementRows.forEach((refiner) => {

                        let values: IDataFilterResultValue[] = [];
                        refiner.Entries.forEach((item) => {
                            values.push({
                                count: parseInt(item.RefinementCount, 10),
                                name: item.RefinementValue.replace("string;#", ""), // Replace string;# for calculated columns https://github.com/SharePoint/sp-dev-solutions/issues/304
                                value: item.RefinementToken,
                                operator: FilterComparisonOperator.Contains
                            } as IDataFilterResultValue);
                        });

                        refinementResults.push({
                            filterName: refiner.Name,
                            values: values
                        });
                    });

                    results.relevantResults = searchResults;
                    results.refinementResults = refinementResults;
                    results.totalRows = searchResponse.PrimaryQueryResult.RelevantResults.TotalRows;

                    if (!isEmpty(searchResponse.SpellingSuggestion)) {
                        results.spellingSuggestion = searchResponse.SpellingSuggestion;
                    }
                }

                // Query rules handling
                if (searchResponse.SecondaryQueryResults) {

                    const secondaryQueryResults = searchResponse.SecondaryQueryResults;

                    if (Array.isArray(secondaryQueryResults) && secondaryQueryResults.length > 0) {

                        let promotedResults: ISharePointSearchPromotedResult[] = [];
                        let secondaryResults: ISharePointSearchResultBlock[] = [];

                        secondaryQueryResults.forEach((e) => {

                            // Best bets are mapped through the "SpecialTermResults" https://msdn.microsoft.com/en-us/library/dd907265(v=office.12).aspx
                            if (e.SpecialTermResults) {
                                // Casting as pnpjs has an incorrect mapping of SpecialTermResults
                                (e.SpecialTermResults).Results.forEach((result) => {
                                    promotedResults.push({
                                        title: result.Title,
                                        url: result.Url,
                                        description: result.Description
                                    } as ISharePointSearchPromotedResult);
                                });
                            }

                            // Secondary/Query Rule results are mapped through SecondaryQueryResults.RelevantResults
                            if (e.RelevantResults) {
                                const secondaryResultItems = this.getSearchResults(e.RelevantResults.Table.Rows);

                                const secondaryResultBlock: ISharePointSearchResultBlock = {
                                    title: e.RelevantResults.ResultTitle,
                                    results: secondaryResultItems
                                };

                                // Only keep secondary result blocks which have items
                                if (secondaryResultBlock.results.length > 0) {
                                    secondaryResults.push(secondaryResultBlock);
                                }
                            }
                        });

                        results.promotedResults = promotedResults;
                        results.secondaryResults = secondaryResults;
                    }
                }
                return results;
            } else {
                throw new Error(`${response['statusMessage']}`);
            }

        } catch (error) {
            Log.error("[SharePointSearchService.search()]", error, this.serviceScope);
            throw error;
        }
    }

    /**
     * Get available SharePoint search managed properties from the search schema
     */
    public async getAvailableManagedProperties(): Promise<ISharePointManagedProperty[]> {

        let managedProperties: ISharePointManagedProperty[] = [];
        let searchQuery: ISharePointSearchQuery = {};

        searchQuery.Querytext = '*';
        searchQuery.Refiners = 'ManagedProperties(filter=50000/0/*,sort=name/ascending)';
        searchQuery.RowLimit = 1;

        try {

            const response = await this.spHttpClient.post(this.searchEndpointUrl, SPHttpClient.configurations.v1, {
                body: this.getRequestPayload(searchQuery),
                headers: {
                    'odata-version': '3.0',
                    'accept': 'application/json;odata=nometadata'
                }
            });

            if (response.ok) {

                const searchResponse: ISharePointSearchResponse = await response.json();
                const refinementResultsRows = searchResponse.PrimaryQueryResult.RefinementResults;
                const refinementRows: any = refinementResultsRows ? refinementResultsRows.Refiners : [];

                // Map refinement results
                refinementRows.forEach((refiner) => {
                    refiner.Entries.forEach((item) => {
                        managedProperties.push({
                            name: item.RefinementName
                        });
                    });
                });

            } else {
                throw new Error(`${response['statusMessage']}`);
            }

        } catch (error) {
            Log.error("[SharePointSearchService.getAvailableManagedProperties()]", error, this.serviceScope);
            throw error;
        }

        return managedProperties;
    }

    /**
     * Get all available languages for the search query
     */
    public async getAvailableQueryLanguages(): Promise<any> {

        try {
            this.clientStorage.local.deleteExpired();
            let availableLanguages = this.clientStorage.local.get(AvailableQueryLanguages_StorageKey);

            if (availableLanguages) {
                return Promise.resolve(availableLanguages);
            } else {
                const response = await this.spHttpClient.get(`${this.pageContext.web.absoluteUrl}/_api/web/RegionalSettings/InstalledLanguages`, SPHttpClient.configurations.v1, {
                    headers: {
                        'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                        'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
                    }
                });
                if (response.ok) {
                    availableLanguages = await response.json();
                    this.clientStorage.local.put(AvailableQueryLanguages_StorageKey, availableLanguages.Items, dateAdd(new Date(), 'week', 1));
                    return availableLanguages.Items;
                } else {
                    throw new Error(`${response['statusMessage']}`);
                }
            }
        } catch (error) {
            Log.error("[SharePointSearchService._getQueryLanguages()]", error, this.serviceScope);
            throw new Error(error);
        }
    }

    /**
     * Determine if a SharePoint managed property is sortable
     * @param property the SharePoint managed property
     */
    public async validateSortableProperty(property: string): Promise<boolean> {

        let isSortable: boolean = false;

        let searchQuery: ISharePointSearchQuery = {};
        searchQuery.Querytext = "*";
        searchQuery.SortList = [
            {
                Property: property,
                Direction: SortDirection.Ascending
            }
        ];
        searchQuery.RowLimit = 1;
        searchQuery.SelectProperties = ['Path'];

        try {
            const response = await this.spHttpClient.post(this.searchEndpointUrl, SPHttpClient.configurations.v1, {
                body: this.getRequestPayload(searchQuery),
                headers: {
                    'odata-version': '3.0',
                    'accept': 'application/json;odata=nometadata',
                    'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                    'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
                }
            });

            if (response.ok) {
                isSortable = true;

            } else {
                isSortable = false;
            }
        } catch {
            isSortable = false;
        }

        return isSortable;
    }

    /**
     * Retrieves search query suggestions
     * @param query the term to suggest from
     */
    public async suggest(query: string): Promise<string[]> {

        let suggestions: string[] = [];

        const searchSuggestQuery: ISuggestQuery = {
            preQuery: true,
            queryText: encodeURIComponent(query.replace(/'/g, '\'\'')),
            count: 10,
            hitHighlighting: true,
            prefixMatch: true,
            culture: LocalizationHelper.getLocaleId(this.pageContext.cultureInfo.currentUICultureName).toString(),
            numberOfQuerySuggestions: 10,
            capitalize: false
        };

        try {

            const endpointUrl = Text.format(
                `${this.pageContext.web.absoluteUrl}/_api/search/suggest?querytext='{0}'&inumberofquerysuggestions={1}&fHitHighlighting={2}&fCapitalizeFirstLetters={3}&Culture={4}&fPrefixMatchAllTerms={5}`,
                searchSuggestQuery.queryText,
                searchSuggestQuery.numberOfQuerySuggestions,
                searchSuggestQuery.hitHighlighting,
                searchSuggestQuery.capitalize,
                searchSuggestQuery.culture,
                searchSuggestQuery.prefixMatch
            );

            const response = await this.spHttpClient.get(endpointUrl, SPHttpClient.configurations.v1, {
                headers: {
                    'X-ClientService-ClientTag': Constants.X_CLIENTSERVICE_CLIENTTAG,
                    'UserAgent': Constants.X_CLIENTSERVICE_CLIENTTAG
                }
            });
            if (response.ok) {
                const suggestionResponse: ISuggestResult = await response.json();

                if (suggestionResponse.Queries.length > 0) {

                    // Get only the suggesiton string value
                    suggestions = suggestionResponse.Queries.map(elt => {
                        return elt.Query;
                    });
                }

                return suggestions;
            } else {
                throw new Error(`${response['statusMessage']}`);
            }
        } catch (error) {
            Log.error("[SharePointSearchService.suggest()]", error, this.serviceScope);
            throw error;
        }
    }

    /**
     * Extracts search results from search response rows
     * @param resultRows the search result rows
     */
    private getSearchResults(resultRows: any): ISharePointSearchResult[] {

        // Map search results
        let searchResults: ISharePointSearchResult[] = resultRows.map((elt) => {

            // Build item result dynamically
            // We can't type the response here because search results are by definition too heterogeneous so we treat them as key-value object
            let result: ISharePointSearchResult = {};

            elt.Cells.map((item) => {
                result[item.Key] = item.Value;
            });

            return result;
        });

        return searchResults;
    }

    private getRequestPayload(searchQuery: ISharePointSearchQuery): string {

        let queryPayload: any = cloneDeep(searchQuery);

        queryPayload.HitHighlightedProperties = this.fixArrProp(queryPayload.HitHighlightedProperties);
        queryPayload.Properties = this.fixArrProp(queryPayload.Properties);
        queryPayload.RefinementFilters = this.fixArrProp(queryPayload.RefinementFilters);
        queryPayload.ReorderingRules = this.fixArrProp(queryPayload.ReorderingRules);
        queryPayload.SelectProperties = this.fixArrProp(queryPayload.SelectProperties);
        queryPayload.SortList = this.fixArrProp(queryPayload.SortList);

        const postBody = {
            request: {
                '__metadata': {
                    'type': 'Microsoft.Office.Server.Search.REST.SearchRequest'
                },
                ...queryPayload
            }
        };

        return JSON.stringify(postBody);
    }

    /**
     * Fix array property
     *
     * @param prop property to fix for container struct
     */
    private fixArrProp(prop: any): { results: any[] } {
        if (typeof prop === "undefined") {
            return ({ results: [] });
        }
        return { results: Array.isArray(prop) ? prop : [prop] };
    }
}