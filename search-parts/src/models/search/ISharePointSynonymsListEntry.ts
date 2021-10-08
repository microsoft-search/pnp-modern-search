export interface ISharePointSynonymsListEntry {
    /**
     * Semicolon separated string with synonyms
     */
     title: string;

    /**
     * Semicolon separated string with synonyms
     */
    synonyms: string;

    /**
     * Flag indicating if the combinations are mutual
     */
    mutual: boolean;
}