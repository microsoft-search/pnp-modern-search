import { ISynonymsListEntry } from '../../models/search/ISynonymsListEntry';
export interface ISynonymsService {
    enrichQueryWithSynonyms(queryText: string, synonymsList: ISynonymsListEntry[]): Promise<string>;
    getItemsFromSharePointSynonymsList(refresh: number, webUrl: string, listName: string, fieldNameKeyword: string, fieldNameSynonyms: string, fieldNameMutual: string): Promise<ISynonymsListEntry[]>;
}