![Search Box](../images/sb_property_pane.png)

#### Default Search Query Settings

Setting | Description
-------|----
Use a dynamic data source | You can set a default query text coming from am other data source. This case is particularly useful when you want to put a search box Web Part on the front page redirecting to an other page with the same query. Use the query string parameter 'q' from the built-in 'Page Environment' data source.

#### Search box options

Setting | Description
-------|----
Enable query suggestions | The search box supports query suggestions from SharePoint. Refer to the following [article](https://docs.microsoft.com/en-us/sharepoint/search/manage-query-suggestions) to know how to add query suggestions in your SharePoint tenant (caution: it can take up to 24h for changes to take effect).
Send the query to a new page | Sends the search query text to a new page. On that page, use an other search box Web Part configured with a dynamic data source as the default query. This Web Part uses the URL fragment '#' to pass the entered keywords. Make sure you use this data source property in your targeted components to retrieve the query.
Placeholder text | The placeholder text to display in the search box.

#### Search query enhancement

Setting | Description
-------|----
Use Natural Language Processing service | Turn this option '**on**' if you want to enhance the query text with NLP services like LUIS. In the _'Service Url'_ field, enter the URL of the Azure Function endpoint. Refer the instructions in the [search query enhancer getting started page](../search-query-enhancer/getting-started.md) file to set up the service. In this sample, only relevant detected keywords are returned as q new query using LUIS. Enabling debug mode will show you relevant information about the entered query.

---