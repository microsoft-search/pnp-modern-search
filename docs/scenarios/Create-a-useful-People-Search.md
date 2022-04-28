# Create a useful People Search

!!! note
    The PnP Modern Search Web Parts must be deployed to your App Catalog and activated on your site. See the [installation documentation](../installation.md) for details.

This scenario describes how to configure a People Search with the PnP Modern Search Web Parts. You can search people in the Search Box or use filters with the Filters Web Part. With the defined layouts you can show your People Results with relevant information about the person. It's a basic configuration for a useful People Search, the PnP Web Parts have a lot more settings to configure.

## Create a new SharePoint page
To add the Search Web Parts, you must first create a new modern SharePoint page. We will be configure this new page as a search page with the PnP Modern Search Web Parts.

![Create a page](assets/create-a-useful-people-search/Create-a-page.png)

## Add PnP Search Web Parts
On the newly created page, add the PnP Modern Search Web Part Search Box, Search Filters and Search Results. 

![Add PnP Web Parts](assets/create-a-useful-people-search/Add-PnP-Web-Parts.png)

The WebParts can be arranged and configured on the page as desired.

![arrange your serach web parts](assets/create-a-useful-people-search/arrange-your-search-web-parts.png)

## Configure Search Box
You can change the placeholder text to display in the Search Box, you can leave the default configuration for the other settings.

![configure Search Box](assets/create-a-useful-people-search/configure-Search-Box.png)

## Configure Search Filters
Connect your Search Filters Web Part to the existing Results Web Part under "Use data from these Web Parts" and customize filters with your own properties.

![configure Search Filters](assets/create-a-useful-people-search/configure-search-filters.png)

### Customize filters
Add your own filter properties to the Search Filters. This are the properties from the UPS (= SharePoint User Profile Service), check the propertiy settings in your SharePoint Search Schema.

![configure customize filters](assets/create-a-useful-people-search/configure-customize-filters.png)

## Configure Search Results
Use the SharePoint Search as source and configure the Search Results Web Part to show only people. Choose the existing default result source LocalPeopleResults. With the query template you can exclude admin oder system accounts. In this example, only show user with an email addess this contains mehr365.

![configure search results](assets/create-a-useful-people-search/configure-search-results.png)

### Layout configuration
It is a predefined people layout available for the people search. Use People as Search Results layout.

![search results layouts](assets/create-a-useful-people-search/search-results-layouts.png)

## Layout options
In the section layout options you can manage the people fields, that will be showing in the results. When you like an people hover card, then activate this option, but you need to activate API access for Microsoft Graph in your SharePoint admin center. Use also an component size for your results.

![search results layout options](assets/create-a-useful-people-search/search-results-layout-options.png)

### Web Part Connections
As the last step, activate the connections. Use the query from your configured Search Box, you can also configure a default value. Conntect your Search Results also to the Filters Web Part.

![search results connections](assets/create-a-useful-people-search/search-results-connections.png)

## Solution
After the configuration i have a useful People Search incl. Hover card, with basic configuration. You have a lot more filter and layout options that you can configure.

![people search](assets/create-a-useful-people-search/people-search.png)
