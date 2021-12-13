The _'Microsoft Search'_ data source retrieve items from the Microsoft search engine.

> This data source uses the Microsoft Search beta API that is not suitable for a production use. An enhanced version of this data source will follow when the GA version will be released.

#### Source configuration

| Setting | Description | Default value 
| ------- |---------------- | ---------- |
| **Entity types to search** | The entity types to search. See the [Microsoft Search API documentation](https://docs.microsoft.com/en-us/graph/api/resources/search-api-overview?view=graph-rest-beta) to see valid combinations. | Drive items (SharePoint & OneDrive)
| **Query template** | A query template allowing to use tokens to set a base query the same way as SharePoint search.  | `{searchTerms}`
| **Use beta endpoint** | Flag to switch between `v1.0` and `beta` Microsoft Graph endpoint. |**false**
