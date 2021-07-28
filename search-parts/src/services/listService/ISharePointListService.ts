import { ISynonymsTableEntry } from "../../models/search/ISynonymsTableEntry";
import ISearchResultsWebPartProps from '../../webparts/searchResults/ISearchResultsWebPartProps';

export interface ISharePointListService {
    getAllItemsFromList(listName: string): Promise<ISynonymsTableEntry[]>;
}