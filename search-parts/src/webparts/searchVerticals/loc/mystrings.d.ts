declare interface ISearchVerticalsWebPartStrings {
  SearchVerticalsGroupName: string;
  PlaceHolderEditLabel: string;
  PlaceHolderConfigureBtnLabel: string;
  PlaceHolderIconText: string;
  PlaceHolderDescription: string;
  SameTabOpenBehavior: string;
  NewTabOpenBehavior: string;
  PageOpenBehaviorLabel: string;
  PropertyPane: {
    Verticals: {
      PropertyLabel: string;
      PanelHeader: string;
      PanelDescription: string;
      ButtonLabel: string;
      Fields: {
        TabName: string;
        QueryTemplate: string;
        ResultSource: string;
        IconName: string;
        IsLink: string;
        LinkUrl: string;
        OpenBehavior: string;
      }
    },
    ShowCounts: {
      PropertyLabel: string;
    },
    DefaultVerticalQuerystringParam: {
      PropertyLabel: string;
    },
    SearchResultsDataSource:{
      PropertyLabel: string;
    } 
  }
}

declare module 'SearchVerticalsWebPartStrings' {
  const strings: ISearchVerticalsWebPartStrings;
  export = strings;
}
