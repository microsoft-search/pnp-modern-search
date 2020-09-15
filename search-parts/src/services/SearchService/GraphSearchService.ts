import ISearchService from './ISearchService';
import { IGraphSearchParams } from './IGraphSearchParams';
import { ISearchServiceConfiguration } from '../../models/ISearchServiceConfiguration';
import { PageContext } from '@microsoft/sp-page-context';
import { TokenService } from '../TokenService';
import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SortDirection } from '@pnp/sp';
import { IManagedPropertyInfo, ISearchResults, ISearchVerticalInformation } from 'search-extensibility';

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
    private sortableProperties : string[] = [
        "PersonalScore"
    ];
    private refineableProperties: IManagedPropertyInfo[] = [
        {
            name: "LastModifiedTime",
            sortable: false
        }
    ];

    public constructor(pageContext: PageContext, webPartContext: WebPartContext, spHttpClient: SPHttpClient) {
        this._pageContext = pageContext;
        this._tokenService = new TokenService(this._pageContext, spHttpClient);
        this._webPartContext = webPartContext;
    }

    public async search(kqlQuery: string, searchParams: IGraphSearchParams): Promise<ISearchResults> {

        const page : number = typeof searchParams.pageNumber === "number" 
                                    ? searchParams.pageNumber
                                    : 1;
        const startRow : number = (page-1)* this.resultsCount;
        const client = await this._webPartContext.msGraphClientFactory.getClient();

        const request = {
            requests: [
                {
                    contentSources: this._getResultSources(),
                    entityTypes: [],
                    query: {
                        query_string: kqlQuery + " " + this.queryTemplate
                    },
                    from: startRow,
                    size: this.resultsCount,
                    stored_fields: this._getStoredFields()
                }
            ]
        };

        const response = await client.api("/search/query").version("beta").post(request);

        return this._parseResponse(kqlQuery, page, response);
    }

    private _parseResponse(query: string, pageNumber: number, response:any) : ISearchResults {
 
        let results: ISearchResults = {
            QueryKeywords: query,
            RelevantResults: [],
            SecondaryResults: [],
            RefinementResults: [],
            PaginationInformation: {
                CurrentPage: pageNumber,
                MaxResultsPerPage: this.resultsCount,
                TotalRows: 0
            }
        };

        if(response  && response.value  && response.value.length > 0
            && response.value[0].hitsContainers  && response.value[0].hitsContainers.length > 0
            && response.value[0].hitsContainers[0].hits && response.value[0].hitsContainers[0].hits.length > 0) {
       
            // Map the JSON response to the output array
            response.value[0].hitsContainers[0].hits.map((item: any) => {
                let res : any = {};

                item.map((props:string, key:string)=>{
                    const newKey = key.startsWith("_") ? key.substr(1): key;
                    res[newKey] = props;
                });

                if(item._source) {
                    if (item._source.webLink) {
                        item.link = item._source.webLink;
                    }
                    if (item._source.webUrl) {
                        item.link = item._source.webUrl;
                    }
                    /*
                    if (this.state.resultType == 'event') {
                        item.link = "https://outlook.office365.com/calendar/view/month";
                    }
                    */
                }

                item.type = item._source["@odata.type"];

            });

        }

        return results;

    }

    private _getStoredFields():string[] {
        if(this.resultSourceId.indexOf("externalItem") >= -1) return this.selectedProperties;
        return [];
    }
    private _getResultSources(): string[] {
        if(this.resultSourceId) {
            return this.resultSourceId.split(","); // split the result source IDs by commans
        } else if(!this.includeOneDriveResults) {
            return ["SharePoint","Exchange","PowerBI"];
        } else {
            return ["SharePoint","Exchange","OneDriveBusiness","PowerBI"];
        }
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
        return {
            enableQueryRules: this.enableQueryRules,
            queryTemplate: this.queryTemplate,
            refinementFilters: this.refinementFilters,
            refiners: this.refiners,
            resultSourceId: this.resultSourceId,
            resultsCount: this.resultsCount,
            selectedProperties: this.selectedProperties,
            sortList: this.sortList,
            synonymTable: this.synonymTable,
            queryCulture: this.queryCulture
        } as ISearchServiceConfiguration; 
    }
    
    public async getAvailableManagedProperties(): Promise<IManagedPropertyInfo[]> {
        return this.refineableProperties;
    }
    
    public async validateSortableProperty(property: string): Promise<boolean> {
        return this.sortableProperties.filter((prop)=>prop === property).length>0;
    }
    
    public async getSearchVerticalCounts(queryText: string, searchVerticals: import("../../models/ISearchVertical").ISearchVertical[], enableQueryRules: boolean): Promise<ISearchVerticalInformation[]> {
        throw new Error("Method not implemented.");
    }

    public async getAvailableQueryLanguages(): Promise<any[]> {
        throw new Error("Method not implemented.");
    }

}

export default GraphSearchService;