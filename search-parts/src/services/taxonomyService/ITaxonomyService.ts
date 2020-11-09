import { ITerm } from './ITaxonomyItems';

export interface ITaxonomyService {

    /**
     * Gets multiple terms by their ids using the current taxonomy context
     * @param siteUrl The site URL to use for the taxonomy session 
     * @param termIds An array of term ids to search for
     * @return {Promise<ITerm[]>} A promise containing the terms.
     */
    getTermsById(siteUrl: string, termIds: string[]): Promise<ITerm[]>;
}