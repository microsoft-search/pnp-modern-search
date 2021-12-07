export interface ISearchVerticalsContainerState {
    
    /**
     * The current selected vertical key
     */
    selectedKey: string;

    /**
     * The connected Result Webparts for checking the count
     */
    connectedWebParts:  {
            id:string;
            verticalIds:string[];
            totalCount:number;
    }[];
}

