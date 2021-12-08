export interface ISearchVerticalsContainerState {
    
    /**
     * The current selected vertical key
     */
    selectedKey: string;

    /**
     * The connected Result Webparts for checking the count
     */
    connectedWebParts: IConnectedResultWebpart[];
}

export interface IConnectedResultWebpart{
    id:string;
    verticalIds:string[];
    totalCount:number;
}