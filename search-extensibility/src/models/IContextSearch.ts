import { ISearchParams } from "./ISearchParams";
import { ISearchResults } from "search-extensibility";

export interface IContextSearch {

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

}