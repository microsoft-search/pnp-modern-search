import { ISearchParams, ISearchResults, IManagedPropertyInfo } from "..";

export interface ISearchContext {

    /**
     * Perfoms a search query.
     * @returns ISearchResults object. Use the 'RelevantResults' property to acces results proeprties (returned as key/value pair object => item.[<Managed property name>])
     */
    search(query: string, params: ISearchParams): Promise<ISearchResults>;
    
    /**
     * Retrieves search query suggestions
     * @param query the term to suggest from
     */
    suggest(query: string): Promise<string[]>;

    /**
     * Gets available search managed properties in the search schema
     */
    getAvailableManagedProperties(): Promise<IManagedPropertyInfo[]>;

    /**
     * Checks if the provided manage property is sortable or not
     * @param property the managed property to verify
     */
    validateSortableProperty(property: string): Promise<boolean>;

}