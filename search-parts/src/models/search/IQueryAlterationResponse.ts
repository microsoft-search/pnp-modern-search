import { ISearchAlteration } from "./ISearchAlteration";

export interface IQueryAlterationResponse {
    
    originalQueryString:string;
    queryAlteration:ISearchAlteration;
    queryAlterationType: "suggestion"|"modification";
}