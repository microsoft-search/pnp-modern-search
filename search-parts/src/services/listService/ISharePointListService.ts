import { ISynonymTableEntry } from "../../models/search/ISynonymeTableEntry";

export interface ISharePointListService {
    getAllItemsFromList(listName: string): Promise<ISynonymTableEntry[]>;
}