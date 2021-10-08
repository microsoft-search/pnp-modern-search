import { ISynonymsListEntry } from "./ISynonymsListEntry";

export interface ISharePointSynonymsListCache {
    /**
     * Timestamp of last updated time
     */
    updated: Date;

    /**
     * List of synonyms
     */
    synonyms: ISynonymsListEntry[];
}