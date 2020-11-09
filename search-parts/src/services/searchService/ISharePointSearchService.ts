import ISharePointManagedProperty from "../../models/search/ISharePointManagedProperty";
import { ISharePointSearchResults } from "../../models/search/ISearchResult";
import { ISearchQuery } from "../../models/search/ISearchQuery";

export interface ISharePointSearchService {

     /**
     * Performs a search query against SharePoint
     * @param searchQuery The search query in KQL format
     * @return The search results
     */
     search(searchQuery: ISearchQuery): Promise<ISharePointSearchResults>;

	/**
     * Get available SharePoint search managed properties from the search schema
     */
	getAvailableManagedProperties(): Promise<ISharePointManagedProperty[]>;
	
	/**
     * Get all available languages for the search query
     */
     getAvailableQueryLanguages(): Promise<any>;

     /**
     * Determine if a SharePoint managed property is sortable
     * @param property the SharePoint managed property
     */
     validateSortableProperty(property: string): Promise<boolean>;

     /**
     * Retrieves search query suggestions
     * @param query the term to suggest from
     */
     suggest(query: string): Promise<string[]>;
}