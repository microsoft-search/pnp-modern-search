export interface ISynonymsProps {
    // Synonyms Functionality
    /**
     * Flag indicating if synonym expansion should be applied/enabled
     */
     synonymsEnabled : boolean;

    /**
     * Refesh interval in minutes (to read the synonyms from the defined synonyms list)
     */
     synonymsCacheRefreshInterval : number;

    /**
     * SharePoint site url to the site where the synonyms list is located
     */
     synonymsSiteUrl : string;

    /**
     * Name of the synonyms list
     */
     synonymsListName : string;
     
    /**
     * Name of the keyword column (normally the 'title' field)
     */
     synonymsListFieldNameKeyword : string;

    /**
     * Name of the synonyms column (text type field)
     */
     synonymsListFieldNameSynonyms : string;

    /**
     * Name of the mutual flag column (boolean type)
     */
     synonymsListFieldNameMutual : string;
}
