import { ITerm } from './ITaxonomyItems';

export interface ITaxonomyService {

    /**
     * Gets multiple terms by their ids using the current taxonomy context
     * @param siteUrl The site URL to use for the taxonomy session 
     * @param termIds An array of term ids to search for
     * @return {Promise<ITerm[]>} A promise containing the terms.
     */
    getTermsById(siteUrl: string, termIds: string[]): Promise<ITerm[]>;

    /**
     * Gets all terms from a term set using the current taxonomy context
     */
    getTermsByTermSetId(siteUrl: string, termSetId: string, termGroupId: string, cacheDurationDays?: number): Promise<ITerm[]>;

    /**
     * Gets all term sets from the default site collection term store
     */
    getTermSets(siteUrl: string): Promise<Array<{ id: string, name: string, groupId: string, groupName: string }>>;

    /**
     * Clears cached terms for a specific term set
     */
    clearTermsCache(termSetId: string): void;
}