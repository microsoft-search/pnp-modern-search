# Scenario 8 - Create a search page with verticals (within the same page)

!!! note
    The PnP Modern Search Web Parts must be deployed to your App Catalog and activated on your site. See the [installation documentation](../installation.md) for details.

This scenario describes how to configure multiple Search Verticals on the same page.

## Create a new sharepoint page

To add the Search Web Parts, you must first create a new modern SharePoint page. We will be configure this new page as a search page with the PnP Modern Search Web Parts.

![Create a page](https://user-images.githubusercontent.com/65955023/147087709-cb1fc905-3e21-46f0-8866-b68ed0e97fcb.png)

## Add PnP Search Web Parts

On the newly created page, add the PnP Modern Search Web Part Search Box, Search Verticals, and Search Results, twice.

![Add PnP Web Parts](https://user-images.githubusercontent.com/65955023/147087924-8671f0d6-bcb3-448e-829c-28513605b291.png)

The WebParts can be arranged and configured on the page as desired.

![Search Web Parts](https://user-images.githubusercontent.com/65955023/147088318-fe68658a-e2dd-4fb3-8fe3-260a5e56a6c1.png)

## Configure Search Box

You can leave the default configuration.

![Configure Search Box Web Part](https://user-images.githubusercontent.com/65955023/147088354-c14b0c1e-ec64-48a5-99cc-38490c7668ba.png)

## Configure Search Vertical

In the Search Verticals Web Part, the verticals (tabs) must be configured.

![Search Vertical](https://user-images.githubusercontent.com/65955023/147088917-d04194ea-d019-4e9f-af47-8de38703ebde.png)

Insert the tab name and a fluent icon for e better visualization. The results are on the same page, so a link URL are not necessary.

![Configure Search Vertical Web Part](https://user-images.githubusercontent.com/65955023/147088936-c89be36b-bc2c-4003-8012-b35e5af12fe6.png)

## Configure first Search Result Web Part

The first Results WebPart displays all results. Select the data source SharePoint and the result source &quot;LocalSharePointResults&quot;.

![First Result Web Part Vertical Everything](https://user-images.githubusercontent.com/65955023/147088983-4a15ac6f-97f1-403e-8c1a-f714237036da.png)

In the &quot;available connections&quot; section, the connection to the Search Box and the Search Vertical must be configured. The results web part should only be displayed if the vertical &quot;Everything&quot; is active.

![First Result  Web Part connection](https://user-images.githubusercontent.com/65955023/147088970-3f16a7df-1c1a-4d95-a2ad-d62fca16c581.png)

## Configure second Search Result Web Part

The second results web part displays results from the predefined result source knowledge, configures the result source in the SharePoint admin center, and the GUID must be added to the Web Part.

![Second Result Web Part Vertical Knowledge](https://user-images.githubusercontent.com/65955023/147089009-fde930ea-c138-4ad0-b6a1-e1fcd1c0ff3b.png)

In the &quot;available connections&quot; section, the connection to the Search Box and the Search Vertical must be configured again. The Results Web Part should only be displayed if the vertical &quot;Knowledge&quot; is selected.

![Second Result Web Part connection](https://user-images.githubusercontent.com/65955023/147089051-11f97261-ccca-41e3-84a5-2f099783f047.png)

After that, the minimum configuration is complete and the search page must be saved and published. The configuration can be customized, and a different layout can be used for the search results per Results WebPart.

## Testing your configuration

Now the query from the Search Box is sent to the verticals, depending on the choice of the verticals, the results are then displayed in the search result.

![Test Your Search page](https://user-images.githubusercontent.com/65955023/147089091-76df179d-c707-43d5-9fb0-d317d49cb2f3.png)
