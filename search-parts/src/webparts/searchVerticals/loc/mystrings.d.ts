declare interface ISearchVerticalsWebPartStrings {
  General: {
    WebPartDefaultTitle: string;
    PlaceHolder: {
      EditLabel: string;
      IconText: string;
      Description: string;
      ConfigureBtnLabel: string;
    }
  },
  PropertyPane: {
    SearchVerticalsGroupName: string;
    Verticals: {
      PropertyLabel: string;
      PanelHeader: string;
      PanelDescription: string;
      ButtonLabel: string;
      DefaultVerticalQueryStringParamLabel: string;
      DefaultVerticalQueryStringParamDescription: string;
      Fields: {
        TabName: string;
        TabValue: string;
        IconName: string;
        IsLink: string;
        LinkUrl: string;
        ShowLinkIcon: string;
        OpenBehavior: string;
      }
    }
  }
}

declare module 'SearchVerticalsWebPartStrings' {
  const strings: ISearchVerticalsWebPartStrings;
  export = strings;
}
