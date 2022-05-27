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
| **Sort settings** | Configure the sort settings of the data source. Properties listed in the dropdown are all static properties marked as _'Sortable'_ in the [SharePoint search schema](https://docs.microsoft.com/sharepoint/technical-reference/). However, it does not list all possible _RefinableXXX_ or aliases fields. To use them, you must enter the value manually and press 'Enter' to validate. For a particular field, you can define if it should be used for initial sort (i.e. when the results are loaded for the first time) or be only available for users in the sort control (i.e. after the results are loaded). **The sort control does not consider default sort fields (i.e. select them by default) and you can only sort on a single field at a time according the fields you defined**. If no user sort fields are defined in the configuration, the sort control won't be displayed.  | None.
| **Enable result Types** | Display results according to the result types defined in the Microsoft Search admin center. **This option can only be used if `External Items` entity type is selected and the layout type is "Adaptive Cards**   | None.
