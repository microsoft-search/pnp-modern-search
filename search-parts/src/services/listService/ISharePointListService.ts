import { ISynonymsTableEntry } from "../../models/search/ISynonymsTableEntry";

export interface ISharePointListService {
    getAllItemsFromList(listName: string): Promise<ISynonymsTableEntry[]>;
}