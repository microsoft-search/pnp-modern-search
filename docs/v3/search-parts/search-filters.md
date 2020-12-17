
# Search Filters - v3
[Table of contents](../index.md)
![Search Filters](../images/search-filters-property-pane.png)


#### Refiner Options

Setting | Description
-------|----
Refiners | The search managed properties to use as refiners. Make sure these are refinable. With SharePoint Online, you have to reuse the default ones to do so (RefinableStringXX etc.). The order is the same as they will appear in the refinement panel. You can also provide your own custom labels using the following format RefinableString01:"You custom filter label",RefinableString02:"You custom filter label",... This Web Part supports dynamic translation of taxonomy based refiners with few additional configurations in the connected search results Web Part (see above).
Connect to search results Web Part | The search results Web Part to use on the current page to get filters.

#### Styling Options

Setting | Description
-------|----
Web Part Title | Shows a title for this Web Part. Set blank if you don't want a title.
Show blank if no result | Shows nothing if there is no filter
Filters layout | Choose the template to use to display filters results.

#### Templates

##### Persona

The persona template work with technical account name (ex : i:0#.f|membership|pierre.dupond@tenantsharepoint.onmicrosoft.com).
By default, the _"Author"_ managed property returns only the display name (ex : "Pierre Dupont"). 
To get the 'Persona' template work with "Author", you need to map crawled properties `ows_q_USER_Author` to a managed properties `RefinableStringXX`.

All crawled properties `ows_q_USER_\<name>` and managed properties like `People:Manager`,`People:AccountName`,etc. return technical account name.

##### File Type

The _"File Type"_ template is intended to work with the `FileExtension` managed property.

##### Container Tree

The _"Container Tree" template is intended to work with the `ParentLink` managed property. Since this one is not refinable by default, you must map the `ows_ParentUrl` crawled property to a `RefinableStringXX` managed property.
The purpose of this template is to give the ability to navigate trough a folder hierarchy as metadata by parsing the parent link URL segments.

![Container Tree](../images/container_tree_template.png)
