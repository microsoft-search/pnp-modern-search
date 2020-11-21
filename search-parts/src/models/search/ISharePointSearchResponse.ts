export interface ISharePointSearchResponse {
    ElapsedTime: number;
    Properties?: {
        Key: string;
        Value: any;
        ValueType: string;
    }[];
    PrimaryQueryResult?: IResultTableCollection;
    SecondaryQueryResults?: IResultTableCollection;
    SpellingSuggestion?: string;
    TriggeredRules?: any[];
}

export interface IResultTableCollection {
    QueryErrors?: Map<string, any>;
    QueryId?: string;
    QueryRuleId?: string;
    CustomResults?: IResultTable;
    RefinementResults?: IResultTable;
    RelevantResults?: IResultTable;
    SpecialTermResults?: IResultTable;
}
export interface IRefiner {
    Name: string;
    Entries: {
        RefinementCount: string;
        RefinementName: string;
        RefinementToken: string;
        RefinementValue: string;
    }[];
}
export interface IResultTable {
    GroupTemplateId?: string;
    ItemTemplateId?: string;
    Properties?: {
        Key: string;
        Value: any;
        ValueType: string;
    }[];
    Table?: {
        Rows: {
            Cells: {
                Key: string;
                Value: any;
                ValueType: string;
            }[];
        }[];
    };
    Refiners?: IRefiner[];
    ResultTitle?: string;
    ResultTitleUrl?: string;
    RowCount?: number;
    TableType?: string;
    TotalRows?: number;
    TotalRowsIncludingDuplicates?: number;
}