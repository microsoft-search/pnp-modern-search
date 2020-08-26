/*
import ISearchService from './ISearchService';
import { IGraphSearch } from './IGraphSearch';
import { ISearchServiceConfiguration } from '../../models/ISearchServiceConfiguration';
import { PageContext } from '@microsoft/sp-page-context';
import { TokenService } from '../TokenService';
import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SortDirection } from '@pnp/sp';

class GraphSearchService implements ISearchService {
    
    public resultsCount: number;
    public selectedProperties: string[];
    public queryTemplate?: string;
    public resultSourceId?: string;
    public sortList?: import("@pnp/sp").Sort[];
    public enableQueryRules?: boolean;
    public refiners?: any[];
    public refinementFilters?: string[];
    public synonymTable?: { [key: string]: string[]; };
    public queryCulture: number;
    public timeZoneId?: number;
    public includeOneDriveResults?: boolean;
    public queryModifier?: any;

    private _pageContext: PageContext = null;
    private _webPartContext: WebPartContext = null;
    private _tokenService: TokenService = null;

    public constructor(pageContext: PageContext, webPartContext: WebPartContext, spHttpClient: SPHttpClient) {
        this._pageContext = pageContext;
        this._tokenService = new TokenService(this._pageContext, spHttpClient);
        this._webPartContext = webPartContext;
        
    }

    public async search(kqlQuery: string, searchParams: IGraphSearch): Promise<any> {
        
        const page : number = typeof searchParams.pageNumber === "number" 
                                    ? searchParams.pageNumber
                                    : 1;
        const startRow : number = (page-1)* this.resultsCount;
        const endRow : number = startRow + this.resultsCount;

        const client = await this._webPartContext.msGraphClientFactory.getClient();
        const query = {
            EntityRequests: [ {
                EntityType: [ "File" ],
                ContentSources: [ "SharePoint", "OneDriveBusiness" ],
                Query: { 
                    "DisplayQueryString":kqlQuery,
                    "QueryString":kqlQuery,
                    "QueryTemplate": this.queryTemplate
                },
                Fields: this.selectedProperties,
                Filter: null,
                From: startRow,
                Size: endRow,
                Sort: this._getSort(),
                EnableQueryUnderstanding:false,
                EnableSpeller:false,
                ResultsMerge:{
                    Type:"Interleaved"
                }
              }
            ]
          };
          
        const response = await client.api("/search/query").version("2.0").post(query);

        return response;
    }

    private _getSort():any {
        return this.sortList.map((sl) => {
            return {
                Field: sl.Property,
                SortDirection: sl.Direction === SortDirection.Ascending
                    ? "Asc"
                    : "Desc"
            };
        });
    }
    
    public async suggest(query: string): Promise<string[]> {
        // call the search interface for 10 results & convert to string list?
        throw new Error("Method not implemented.");
    }
    
    public getConfiguration(): ISearchServiceConfiguration {
        throw new Error("Method not implemented.");
    }
    
    public async getAvailableManagedProperties(): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    
    public async validateSortableProperty(property: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    public async getSearchVerticalCounts(queryText: string, searchVerticals: import("../../models/ISearchVertical").ISearchVertical[], enableQueryRules: boolean): Promise<any[]> {
        throw new Error("Method not implemented.");
    }

    public async getAvailableQueryLanguages(): Promise<any[]> {
        throw new Error("Method not implemented.");
    }

}

export default GraphSearchService;
*/