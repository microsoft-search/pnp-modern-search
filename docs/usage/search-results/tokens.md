Tokens give you the ability to write dynamic queries for your data sources by using the special syntax `{<TokenName>}`.

#### Where can I use tokens?

You can use tokens in the following locations:

- **Search Results Web Part**
    - Builtin data sources
        - **SharePoint Search**
            - Query template field.
            - Refinement filters field.
    - Layouts
        - In the _'See all'_ link.

- **Search Verticals Web Part**
    - In the link URL when the vertical item is a link.
    - In the vertical tab value.

- **Search Box Web Part**
    - In the Query input transformation template when sending the query to a new page.

#### Supported tokens (all data sources)

> Tokens are case insensitive

##### Page tokens

|**Token**|**Definition**|
|:-----|:-----|
|**{Page.&lt;FieldName&gt;}**  <br/> | The value of a field on the page from where the query was issued. For example, if the page from where the query was issued contained a site column named "ContentOwner," specifying {Page.ContentOwner} would allow you to query for the value of "ContentOwner." FieldName is the internal name of the field. When used with taxonomy columns, use `{Page.<FieldName>.Label}` or `{Page.<FieldName>.TermID}` <br/> |

##### Connections tokens

Tokens related to connected Web Parts in the Search Results. 

> These tokens can be used in the 'Search Results' and 'Search Box' Web Parts.

> You can escape curly braces characters using `'\'` to avoid: ex: `DepartmentId:\{edbfd618-ef1d-4cc5-a214-95bf44ddf4ee\}`

|**Token**|**Definition**|
|:-----|:-----|
|**{inputQueryText}**<br/> | The query value entered into a search box on a page. The value depends on the configuration of input text connection of the Search Results Web Part. <br/> |
|**{verticals.&lt;value\|name&gt;}** | If connected, get the current selected vertical tab name or associated value.

##### Context tokens

|**Token**|**Definition**|
|:-----|:-----|
|**{PageContext.&lt;PropertyName&gt;}** | Resolves current SPFx page context related tokens. You can use deep paths here to access properties. Ex: `{PageContext.site.absoluteUrl}`. <br/>
| **{LegacyPageContext.&lt;PropertyName&gt;}** | Resolves current SPFx legacy page context related tokens. You can use deep paths here to access properties. Ex: `{LegacyPageContext.aadTenantId}`. <br/>
|**{QueryString.&lt;ParameterName&gt;}** <br/> | A value from a query string in the URL of the current page. For example, if the URL of the current page contains a query string such as ItemNumber=567, you could obtain the value 567 by specifying `{QueryString.ItemNumber}`. <br/> |
|**{CurrentDisplayLanguage}** <br/> |The current display language based on MUI in _ll-cc format_.  <br/> |
|**{CurrentDisplayLCID}**  <br/> |Numeric value of the current display language based on MUI in _ll-cc format_.  <br/> |
|**{TenantUrl}**  <br/> |URL of the tenant (root site)<br/> |

##### Site, web, hub, etc. tokens

Except for `{Hub}`, these a shortands to the `{PageContext}` tokens. They returns the same values. **&lt;PropertyName&gt;** is **case sensitive**.

|**Token**|**Definition**|
|:-----|:-----|
| **{Site.&lt;PropertyName&gt;}**| Resolves current site related tokens. You can use the 'Debug' layout and the `context` property to see all available values for a site. Ex `{Site.id._guid}` or `{Site.absoluteUrl}`.
| **{Hub.&lt;PropertyName&gt;}** | Resolves current hub site related tokens. Valid property names are `{Hub.HubSiteId}`, `{Hub.Id}` and `{Hub.IsHubSite}` You can target a hub with the template: `DepartmentId:\{{Hub.HubSiteId}\}`.
| **{Group.&lt;PropertyName&gt;}** | Resolves current Office 365 group related tokens. You can use the 'Debug' layout and the `context` property to see all available values for a site.
| **{List.&lt;PropertyName&gt;}** | Resolves current list related tokens. Ex `{List.id._guid}` or `{List.absoluteUrl}`.
| **{Web.&lt;PropertyName&gt;}** | Resolves current web related tokens  You can use the 'Debug' layout and the `context` property to see all available values for a site. Ex `{Web.id._guid}` or `{Web.absoluteUrl}`.

##### User tokens

|**Token**|**Definition**|
|-----|-----|
|**{User}** or **{User.Name}**  |Display name of the user who issued the query. For example, this value can be used to query content of the managed property Author.  <br/> |
|**{User.Email}**  |Email address of the user who issued the query. For example, this value can be used to query content of the managed property WorkEmail.  <br/> |
|**{User.PreferredContentLanguage}**  |Language as specified as Preferred Content Language in the profile of the user who issued the query.  <br/> |
|**{User.PreferredDisplayLanguage}**  |Language as specified as Preferred Display Language in the profile of the user who issued the query.  <br/> |
|**{User.\<property\>}** |Any property from the user profile of the user who issued the query — for example, `SPS-Interests`, `userprofile_guid`, `accountname`, etc. including custom properties.  <br/> |

##### Date tokens

|**Token**|**Definition**
|-----|-----|
| **{CurrentYear}** |Todays's date four digits, 2018 <br/> 
| **{CurrentMonth}** |Today's month, 1-12 <br/> 
| **{CurrentDate}** |Today's date, 1-31 <br/> 
| **{Today+/- \&lt;integer value for number of days&gt;}**  <br/> |A date calculated by adding/subtracting the specified number of days to/from the date when the query is issued. Date format is YYYY-MM-DD (Ex: `{Today+5}`) <br/> 

#### SharePoint search query variables

##### Supported variables

The SharePoint Search engine already supports tokens by default (i.e query variables, ex: `{Site.ID}`). You can use them in the **Query template** field only. To see the all the supported tokens natively, refer to the [Microsoft documentation](https://docs.microsoft.com/en-us/sharepoint/technical-reference/query-variables).

##### Use the 'OR' operator

To deal with mutli valued properties (like taxonomy multi or choices SharePoint fields), you can use the 'OR' operator syntax `{|<property><operator><multi_values_property>}`. The search query will be expanded to the following KQL query:

    ((<property><operator><value_1>) OR (<property><operator><value_2>) OR (<property><operator><value_3>) ...)

**Examples:**

- Using an user profile multi values taxonomy property: `{|owstaxidmetadataalltagsinfo:{User.SPS-Hashtags}}`
- Using a page multi values taxonomy property: `{|owstaxidmetadataalltagsinfo:{Page.myTaxonomyMultiColumn.TermID}}` or `{|owstaxidmetadataalltagsinfo:{Page.myTaxonomyMultiColumn.TermLabel}}`
- Using a page multi values choice property: `{|RefinableStringXX:{Page.myChoiceMultiColumn}}`

At any time, you can see the resolved query using the 'Debug' layout an inspecting the `data.queryModification` property.