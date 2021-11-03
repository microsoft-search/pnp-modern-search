import { IAlteredQueryTokens } from "./IAlteredQueryTokens";

export interface ISearchAlteration {
    alteredQueryString:string;
    alteredHighlightedQueryString:string;
    alteredQueryTokens:IAlteredQueryTokens[];
}