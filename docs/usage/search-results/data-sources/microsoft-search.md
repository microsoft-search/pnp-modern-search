The _'Microsoft Search'_ data source retrieve items from the Microsoft search engine.

> This data source can use the Microsoft Search beta API that is not suitable for a production use. Use the normal version for production use.

#### Source configuration

| Setting | Description | Default value 
| ------- |---------------- | ---------- |
| **Entity types to search** | The entity types to search. See the [Microsoft Search API documentation](https://docs.microsoft.com/en-us/graph/api/resources/search-api-overview?view=graph-rest-beta) to see valid combinations. | Drive items (SharePoint & OneDrive)
| **Query template** | A query template allowing to use tokens to set a base query the same way as SharePoint search.  | `{searchTerms}`
| **Use beta endpoint** | Flag to switch between `v1.0` and `beta` Microsoft Graph endpoint. |**false**
| **Enable spelling suggestions** | Flag to enable spelling suggestions. If enabled, the user will get the search results for the original search query and suggestions for spelling correction in the **queryAlterationResponse** property of the response for the typos in the query. |**false**
| **Enable spelling modifications** | Flag to enable spelling modifications. If enabled, the user will get the search results for the corrected query in case of no results for the original query with typos. The response will also include the spelling modification information in the **queryAlterationResponse** property. |**false**
