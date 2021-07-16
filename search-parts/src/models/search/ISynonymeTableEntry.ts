export interface ISynonymTableEntry {
    
    /**
     * Semicolon separated string with synonyms
     */
    synonyms: string;

    /**
     * Flag indicating if the combinations are mutual
     */
    mutual: boolean;
}