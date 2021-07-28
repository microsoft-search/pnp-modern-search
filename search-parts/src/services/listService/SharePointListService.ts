import { Version, Text, DisplayMode, ServiceScope, Log } from '@microsoft/sp-core-library';
import { ISharePointListService } from './ISharePointListService';
import { ISynonymsTableEntry } from '../../models/search/ISynonymsTableEntry';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import ISearchResultsWebPartProps from '../../webparts/searchResults/ISearchResultsWebPartProps';

export class SharePointListService implements ISharePointListService {

    //public async getAllItemsFromList(properties: ISearchResultsWebPartProps): Promise<ISynonymsTableEntry[]> {
    public async getAllItemsFromList(listName: string): Promise<ISynonymsTableEntry[]> {

        let result: ISynonymsTableEntry[] = [];

        try {


            const web = Web("https://devmarc365.sharepoint.com/sites/playground");

            const r = await web();

            const items: any[] = await web.lists.getByTitle("SynonymsRedNet").items.get();

            for (let index = 0; index < items.length; index++) {
                result.push(<ISynonymsTableEntry>{ synonyms: items[index]["Title"] + ";" + items[index]["SYN_Synonyms"], mutual: items[index]["SYN_Mutual"] });
            }
        }
        catch (Error) {
            console.log(Error.message);
        }

        return result;
    }
}