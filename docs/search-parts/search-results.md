| Page 1 | Page 2 | Page 3 |
| ------ | ------ | ------ |
| ![Page 1](../images/property_pane.png) | ![Page 2](../images/property_pane2.png) | ![Page 3](../images/property_pane3.png) 

#### Search Query Configuration

Setting | Description
-------|----
Search query keywords | Here you choose to use a static search query or a query coming from a data source. It is recommended to use the associated Web Part coming with this sample. The search query is in KQL format so you can use search query variables (See this [post](http://www.techmikael.com/2015/07/sharepoint-rest-do-support-query.html) to know which ones are allowed). You can only plug one source to this Web Part.

![Web Part connection](../images/wp_connection.png)

#### Search Settings

Setting | Description
-------|----
Query template | The search query template in KQL format. You can use search variables here (like Path:{Site}).
Result Source Identifier | The GUID of a SharePoint result source.
Sort order | The initial search results sort order, where you can use one or multiple properties to sort by. **By default, results are sorted by created date (ascending) and size (descending). Remove these values to reset default sorting**
Sortable fields | The search managed properties to use for sorting. With SharePoint Online, you have to reuse the default ones to do so (RefinableStringXX etc.). The order is the same as they will appear in the sort panel. You can also provide your own custom labels using the following format RefinableString01:"You custom filter label",RefinableString02:"You custom filter label",... If no sortable fields are provided, the 'Sort' button will not be visible.
Connect to a search refiners Web Part | If enable, select the search refiners Web Part to use on the current page to get selected filters. It is a 2 ways connection so don't forget to connect the targeted search refiners to the search results Web Part as well.
Connect to a search verticals Web Part | If enable, select the search verticals Web Part to connect to.
Enable Query Rules | Enable the query rules if applies. Turn this options  'on' to display your SharePoint Promoted results (links only) and make result blocks available to custom renderers.
Include OneDrive results | Include OneDrive results if applicable. Turn this option 'on' to make users' personal OneDrive results available to custom renderers. Read more [here](https://docs.microsoft.com/en-us/sharepoint/support/search/private-onedrive-results-not-included).
Selected properties | The search managed properties to retrieve. You can select them from a predefined list or add them as free text if not listed. Then, these properties are available in your Handlebars template with the syntax (`item.property_name` or `property_name` inside the `{{#each}}` loop).
Number of items to retrieve per page | Quite explicit. The paging behavior is done directly by the search API (See the *SearchDataProvider.ts* file), not by the code on post-render.

#### Styling Options

Setting | Description
-------|----
Web Part Title | Shows a title for this Web Part. Set blank if you don't want a title.
Show blank if no result | Shows nothing if there is no result
Show result count | Shows the result count and entered keywords
Connect to a search pagination Web Part	 | If enable, select the search pagination Web Part to use on the current page to get selected page. It is a 2 ways connection so don't forget to connect the targeted search pagination to the search results Web Part as well.
Result Layouts options | Choose the template to use to display search results. Some layouts are defined by default but you can create your own either by clicking on the **"Custom"** tile, or **"Edit template"** from an existing chosen template. In custom mode, you can set an external template. It has to be in the same SharePoint tenant. Behind the scenes, the Office UI React controls are used. Custom code templates will also automatically be displayed here upon registration. See the [templating documentation](./templating.md) for more information about templating.
Result types | Allows you to set a custom template at item level according to a specific condition (ex: FileType equals 'pdf').

##### Miscellaneous: Taxonomy values dynamic translation

The search results Web Part supports automatic translation for taxonomy based filters and result metadata according to current site language. To get it work, you must map a new refinable managed property associated with *ows_taxId_<your_column_name>* crawled property and turn on the *'Localization Enabled'* toggle in the search results property pane:

![Managed Property](../images/managed-property.png)

![Enable Localization](../images/enable_localization.png)

---

#### Out of the box query variables

The following out of the box [query variables](https://docs.microsoft.com/en-us/sharepoint/technical-reference/query-variables) are supported/tested:

##### Site and site collection properties
|**Query variable**|**Definition**|
|:-----|:-----|
|{Site} or {Site.URL}  <br/> |URL of the site from where the query was issued. For example, this value can be used to query content of the managed property Path.  <br/> |
|{Site.ID}  <br/> |GUID of site from where the query was issued. This value corresponds to the value of the managed property SiteID.  <br/> |
|{Site.LCID}  <br/> |Numeric value of the locale as specified by the Regional Settings in the Site Settings on the Site from where the query was issued.  <br/> |
|{Site.Locale}  <br/> |Language of the Site from where the query was issued in ll-cc format — for example, en-us.  <br/> |
|{Site.\<property\>}  <br/> |Any property from the property bag of the site (SPWeb) from where the query was issued, including custom properties.  <br/> |
|{SiteCollection} or {SiteCollection.URL}  <br/> |URL of site collection from where the query was issued. For example, this value can be used to query content of the managed property Path.  <br/> |
|{SiteCollection.ID}  <br/> |GUID of site collection from where the query was issued.  <br/> |
|{SiteCollection.LCID}  <br/> |Numeric value of the locale as specified by the Regional Settings in the Site Settings on the Site Collection from where the query was issued.  <br/> |
|{SiteCollection.Locale}  <br/> |Language of the Site Collection from where the query was issued in ll-cc format — for example, en-us.  <br/> |
|{SiteCollection.\<property\>}  <br/> |Any property from the property bag of the root site (SPWeb) in the site collection (SPSite) from where the query was issued, including custom properties.  <br/> |

##### URL token and request properties
|**Query variable**|**Definition**|
|:-----|:-----|
|{URLToken.\<integer\>}  <br/> |A value from the URL of a page. The integer represents the position of the value in the URL as counted from right to left. For example, for the page http://www.contoso/audio/mp3/1010101, the query variable {URLToken.1} will query for the last value in the URL, 1010101. The query variable {URLToken.3} will query for the third last property in the URL, audio. You can query for values up to the ninth last position in a URL.  <br/> |
|{Request.\<PropertyName\>}  <br/> |A value from the current http request - for example, {Request.Url}.  <br/> |

##### User properties
|**Query variable**|**Definition**|
|:-----|:-----|
|{User} or {User.Name}  <br/> |Display name of the user who issued the query. For example, this value can be used to query content of the managed property Author.  <br/> |
|{User.Email}  <br/> |Email address of the user who issued the query. For example, this value can be used to query content of the managed property WorkEmail.  <br/> |
|{User.PreferredContentLanguage}  <br/> |Language as specified as Preferred Content Language in the profile of the user who issued the query.  <br/> |
|{User.PreferredDisplayLanguage}  <br/> |Language as specified as Preferred Display Language in the profile of the user who issued the query.  <br/> |
|{User.\<property\>}  <br/> |Any property from the user profile of the user who issued the query — for example, SPS-Interests, including custom properties.  <br/> |

##### Other properties
|**Query variable**|**Definition**|
|:-----|:-----|
|{Today+/- \<integer value for number of days\>}  <br/> |A date calculated by adding/subtracting the specified number of days to/from the date when the query is issued. Date format is YYYY-MM-DD. For example, this value can be used to query content of the managed property LastModifiedTime.  <br/> |
|{SearchBoxQuery} or {searchTerms} <br/> |The query value entered into a search box on a page.  <br/> |
|{CurrentDisplayLanguage}  <br/> |The current display language based on MUI in ll-cc format.  <br/> |
|{CurrentDisplayLCID}  <br/> |Numeric value of the current display language based on MUI in ll-cc format.  <br/> |

#### Custom query variables

The following custom query variables are supported:

|**Query variable**|**Definition**|
|:-----|:-----|
|{Page.&lt;FieldName&gt;}  <br/> | The value of a field on the page from where the query was issued. For example, if the page from where the query was issued contained a site column named "ContentOwner," specifying {Page.ContentOwner} would allow you to query for the value of "ContentOwner." FieldName is the internal name of the field. When used with taxonomy columns, use `{Page.<FieldName>.Label}` or `{Page.<FieldName>.TermID}` <br/> |
|{CurrentYear}  <br/> | Todays's date four digits, 2018 <br/> |
|{CurrentMonth}  <br/> | Today's month, 1-12 <br/> |
|{CurrentDate}  <br/> | Today's date, 1-31 <br/> |
|{QueryString.&lt;ParameterName&gt;} <br/> | A value from a query string in the URL of the current page. For example, if the URL of the current page contains a query string such as ItemNumber=567, you could obtain the value 567 by specifying {QueryString.ItemNumber}. <br/> |
|{PageContext.&lt;ParameterName&gt;} <br/> | A value from the legacyPageContext object on the page. For example, if the legacyPageContext object of the current page contains a property "hubSiteId": "166aa115-7ae7-4c21-9e02-9e0c8872be28", you could obtain the value 166aa115-7ae7-4c21-9e02-9e0c8872be28 by specifying {PageContext.hubSiteId}. The property name is case sensitive!<br/> |
|{TenantUrl}  <br/> |URL of the tenant (root site)<br/> |

#### Best bets

This WP supports SharePoint best bets via SharePoint query rules:

![Query Rules](../images/query_rules.png)

![Best Bets](../images/best_bets.png)