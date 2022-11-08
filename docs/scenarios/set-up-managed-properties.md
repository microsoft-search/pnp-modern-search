# Scenario 2: Set up Managed Properties

!!! note
    The PnP Modern Search Web Parts must be deployed to your App Catalog and activated on your site. See the [installation documentation](../installation.md) for details.

If you've followed [Scenario 1: Create a simple search page](create-simple-search-page.md), you already have a functioning search experience.

One of the big benefits of the PnP Modern Search Web Parts is the ability to add filters, also known as refiners.

## Set up list/library columns and Managed Properties
When creating a list column named `Foo`, this will yield a crawled property of `ows_Foo` when an item is indexed. In turn the crawled property `ows_Foo` can be mapped to e.g. the managed property `RefinableString10`, and used in search results or as a filter property.

## Set up Site Columns and Managed Properties

!!! note
    Read the article [How Do Site Columns Become Managed Properties - Thus Available for Search](https://docs.microsoft.com/microsoft-365/community/how-do-site-columns-become-managed-properties-thus-available-for-search) to learn about how to set up your Managed Metadata Site Columns for use in search experiences.

At this point, you've set up Managed Properties you can use as you display results in the PnP Search Results Web Part as well as in your PnP Filters Web Part.
