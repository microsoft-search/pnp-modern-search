import ISharePointManagedProperty from "../../models/search/ISharePointManagedProperty";
import { ISharePointSearchResults } from "../../models/search/ISharePointSearchResults";
import { ISharePointSearchQuery } from "../../models/search/ISharePointSearchQuery";

export interface IRefinerCheckResult {
     verified: string[];
     failed: string[];
}

export interface ISharePointSearchService {

     /**
     * Performs a search query against SharePoint
     * @param searchQuery The search query in KQL format
     * @return The search results
     */
     search(searchQuery: ISharePointSearchQuery): Promise<ISharePointSearchResults>;

	/**
     * Get available SharePoint search managed properties from the search schema
     */
	getAvailableManagedProperties(): Promise<ISharePointManagedProperty[]>;

     /**
     * Find requested refiners that returned values and those whose checks failed.
     */
     getRefinersWithValues(properties: string[]): Promise<IRefinerCheckResult>;
	
	/**
     * Get all available languages for the search query
     */
     getAvailableQueryLanguages(): Promise<any>;

     /**
     * Test a SharePoint sort request. Returns false when sorting is rejected but the query without sorting succeeds.
     * Rejects on other request failures or an invalid response.
     * @param property the SharePoint managed property
     */
     validateSortableProperty(property: string): Promise<boolean>;

     /**
     * Retrieves search query suggestions
     * @param query the term to suggest from
     */
     suggest(query: string): Promise<string[]>;
}