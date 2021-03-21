
The 'debug' layout allows you to see all relevant data used by layout templates or data sources during render.

!["Debug layout"](../../../assets/webparts/search-results/layouts/debug_layout.png){: .center} 

The template context object exposes the following properties:

```json
"paging": {
    "currentPageNumber": "<The current selected page number>"
},
"filters": {
    "selectedFilters": "<List of currently selected filters>",
    "filterOperator": "<Operator to use between filters>",
    "instanceId": "<The connected Filters Web Part instance ID>",
    "filtersConfiguration": "<The filters configuration>"
},
"inputQueryText": "<The current input query text (Ex: search box text)>",
"slots": "<Hashtable of configured slots for the current data source. Usage: {{slot item @root.slots}} >",
"theme": "<Current theme variables>",
"properties": "<Web Part properties from property bag>",
"context": {
    "site": "<Contextual information for the SharePoint site collection that is hosting the page>",
    "web": "<Contextual information for the SharePoint web that is hosting the page>",
    "list" :"<Contextual information for the SharePoint list that is hosting the page>",
    "listItem":"<Contextual information for the SharePoint list item that is hosting the page>",
    "cultureInfo":"<It provides culture info for the current user of the application>",
    "user":"<It provides contextual information for the SharePoint user that is accessing the page>"
},
"data": "<The data source data>",
"instanceId": "<The Web Part instance ID>",
"utils": {
    "defaultImage": "<The default image content to display when no thummbnail is available (Base64)>"
}
```

