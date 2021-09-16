export interface ISynonymsProps {
    // Synonyms Functionality
    /**
     * Flag indicating if synonym expansion should be applied/enabled
     */
     synonymsEnabled : boolean;

    /**
     * SharePoint web url to the site where the synonyms list is located
     */
     synonymsWebUrl : string;

    /**
     * Name of the synonyms list
     */
     synonymsListName : string;
     
    /**
     * Name of the keyword column (normally the 'title' field)
     */
     synonymsFieldNameKeyword : string;

    /**
     * Name of the synonyms column (text type field)
     */
     synonymsFieldNameSynonyms : string;

    /**
     * Name of the mutual flag column (boolean type)
     */
     synonymsFieldNameMutual : string;
}
