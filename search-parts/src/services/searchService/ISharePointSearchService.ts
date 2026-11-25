import ISharePointManagedProperty from "../../models/search/ISharePointManagedProperty";
import { ISharePointSearchResults } from "../../models/search/ISharePointSearchResults";
import { ISharePointSearchQuery } from "../../models/search/ISharePointSearchQuery";

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
     * Get all available languages for the search query
     */
     getAvailableQueryLanguages(): Promise<any>;

     /**
     * Retrieves search query suggestions
     * @param query the term to suggest from
     */
     suggest(query: string): Promise<string[]>;
}