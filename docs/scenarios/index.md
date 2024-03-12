# Scenarios

This section of the documentation provides some scenario-based recipes for building solutions with the PnP Modern Search Web Parts. It can be confusing to look across the documentation for ways to solve specific needs, so these scenarios may help. Wherever possible, we link back to the core documentation rather than explaining actions in duplicate.

## [Create a simple search page](create-simple-search-page.md)

We can create a search-driven experience simply by adding the PnP Modern Search Web Parts to a page: PnP Search Box and PnP Search Results.

## [Set up Managed Properties](set-up-managed-properties.md)

In order to use your custom column values as filters in your PnP Modern Search search solutions, those columns must be mapped to refinable manage properties and they must be mapped to Managed Properties.

## [Build a page with filters](page-with-filters.md)

Most search solutions require some filters (aka refiners) to allow the user to filter the initial results.

## [Create a search page with verticals (on different pages)](Create-a-search-page-with-verticals-on-different-pages.md)

Search verticals can be used to selectively search specific content per vertical. Using the SharePoint provider you can use result sources to limit the content returned, or you can add the required KQL in the web part itself. This sample shows how to set up multiple search verticals on different pages.

## [Create a search page with verticals (within the same page)](Create-a-search-page-with-verticals-within-the-same-page.md)

Search verticals can be used to selectively search specific content per vertical. Using the SharePoint provider you can use result sources to limit the content returned,
or you can add the required KQL in the web part itself. This sample shows how to set up multiple search verticals on the same page.

## [Create a useful People Search](Create-a-useful-People-Search.md)
With the Modern Search Web Parts you can create a simple and useful People Search. You can search or filter people and you can show informations on the People Card when you hover.

## [Use PnP Results web part as a Department Web Part](use-search-as-a-department-webpart.md)
With the Modern Search Web Parts you can create a simple and useful Department Web part.

## [Use query rules for promoted links](Use-query-rules-for-promoted-links.md)
With the Modern Search Web Parts you can show promoted links for important results. They will be configured with query rules in the SharePoint Search Admin Center. Promoted results will show users more informations and direct links about specific, predefined, terms they searching for.

## [Use query string from url for dynamic results](use-query-string-in-url.md)
This scenario describes how to use query string as value in the URL from the current page. You can use URL query string parameters to build dynamic search pages.
Use a library with metadata that you can use the query string parameter in the URL.

## [Setup Results web part to show birthdays](Setup-Results-web-part-to-show-birthdays.md)
A common request in any intranet is to show birthdays of employees. This scenario describes how to use stock SharePoint search to show birthdays of employees in the search results. 

## [Setup Results web part to show work anniversaries](Setup-Results-web-part-to-show-work-anniversaries.md)
Showing the work anniversaries of employees is a common request in any intranet. This scenario describes one way to achive this using a sleight of hand trick/cheating as the search index does not contains the information we need. 

## [Connect one Search Results web part to another Search Results Web Part](Connect-to-a-search-results-webpart.md)
This scenario describes how to connect more then one results Web Part together. One results Web Part will view the sites, connected with the current HUB site, the other, connected results Web Part, will show the documents from the selected site.
