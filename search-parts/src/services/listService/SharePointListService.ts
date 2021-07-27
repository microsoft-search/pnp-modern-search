import { ISharePointListService } from './ISharePointListService';
import { ISynonymTableEntry } from '../../models/search/ISynonymeTableEntry';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export class SharePointListService implements ISharePointListService {

    public async getAllItemsFromList(listName: string): Promise<ISynonymTableEntry[]> {
        let result: ISynonymTableEntry[] = [];

        try {
            const web = Web("https://devseb365.sharepoint.com/sites/playground");
            const r = await web();

            const items: any[] = await web.lists.getByTitle("SynonymsRedNet").items.get();

            for (let index = 0; index < items.length; index++) {
                result.push(<ISynonymTableEntry>{ synonyms: items[index]["Title"] + ";" + items[index]["SYN_Synonyms"], mutual: items[index]["SYN_Mutual"] });
            }
        }
        catch (Error) {
            console.log(Error.message);
        }

        return result;
    }
}