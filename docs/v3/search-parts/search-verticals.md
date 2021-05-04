# Search Verticals - v3
[Table of contents](../index.md)

![Search Verticals](../images/search_verticals.png)

The search verticals Web Part allow users to search through predefined scopes (i.e videos, people, etc.) or redirect to an arbitrary URL. We simply replace the query template and result source dynamically for a chosen vertical. To get it work, you simply need to connect the search verticals Web Part to a search results Web Part using the associated option. Also, if you want to display counts for each verticals **when a new query is performed** (for instance a search box query or an URL fragment update), connect the search results Web Part to the search verticals one (two ways connection in this case).

#### Verticals Options

| Page 1 | Page 2 | Page 3 |
| ------ | ------ | ------ |
| ![Page 1](../images/search_verticals_propertypane.png) | ![Page 2](../images/search_verticals_propertypane2.png) | ![Page 3](../images/search_verticals_propertypane3.png) 

Setting | Description
-------|----
Search verticals | Configure the search verticals to display. When you set a query template or a result source id for a vertical, these override the ones in the connected search results. You can also set an icon for a vertical using [Office UI Fabric icons names](https://developer.microsoft.com/en-us/fabric#/styles/icons). The query keywords are shared across all verticals. For instance, if you need default results for tabs, just specify a default query in the connected search results Web Part (like `*`) and the `{searchTerms}` expression in your vertical query template. Also, selected refinement filters are reset, if present, when a new vertical is selected. You can also specify an arbitrary link for a vertical. In this case, the selected vertical won't be sent to the connected search results WP. You can use tokens inside the **Link URL** field. The supported tokens are `{Page.xxx}`, `{CurrentDate}`, `{CurrentYear}`, `{CurrentMonth}`, `{URLToken.xxx}`, `{QueryString.xxx}`, `{PageContext.xxx}`, `{TenantUrl}`, `{searchTerms}` and `{SearchBoxQuery}`.
Show result counts | Indicates if the results count should be displayed for each vertical. In this case, you need to connect the Web Part to an existing search results Web Part on the page.
Default vertical querystring parameter | Parameter to pick up from the query string to default activate a vertical. Matches the name of the tab. Enter `v` if you for pass in `v=People` as part of your URL to match a vertical named  `People`.
Connect to a search results Web Part | The result web part the vertical web part is connected to.