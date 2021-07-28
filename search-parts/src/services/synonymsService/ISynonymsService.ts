import { ISynonymsTableEntry } from '../../models/search/ISynonymsTableEntry';

export interface ISynonymsService {
    enrichQueryWithSynonyms(queryText: string, synonymsList: ISynonymsTableEntry[]): Promise<string>
}