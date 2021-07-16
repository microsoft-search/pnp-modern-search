import { ISharePointListService } from './ISharePointListService';
import { ISynonymTableEntry } from '../../models/search/ISynonymeTableEntry';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export class SharePointListService implements ISharePointListService {

    public async getAllItemsFromList(listName: string): Promise<ISynonymTableEntry[]> {
        const items: any[] = await sp.web.lists.getByTitle(listName).items.get();

        let result: ISynonymTableEntry[] = [];

        for (let index = 0; index < items.length; index++) {
            result.push(<ISynonymTableEntry>{ synonyms: items[index]["Title"] + ";" + items[index]["Synonyms"], mutual: items[index]["Mutual"] });
        }

        return result;
    }
}