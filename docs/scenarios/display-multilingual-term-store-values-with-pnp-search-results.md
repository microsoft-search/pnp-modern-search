# Display Multilingual term store values with PnP Search Results

!!! note
    The PnP Modern Search Web Parts must be deployed to your App Catalog and activated on your site. See the [installation documentation](../installation.md) for details.
    
This scenario describes how term store values can be displayed in multiple languages in the PnP Modern Search.

## Prepare the scenario
I use the colours as example in my case, it's simple to understand in different languages. You need also 2 different users with different language settings for a quicklier testing. 

Create a SharePoint Term store and translate the terms into another language, i use english as a default language and german as work language. Translate every term within the term set. 
![Create a SharePoint term set](assets/display-multilingual-term-store-values-with-pnp-search-results/create-a-sharepoint-term-set.png)

Create a SharePoint site column with type Managed Metadata and use the newly created term set.
![Site column Managed Metadata](assets/display-multilingual-term-store-values-with-pnp-search-results/site-column-managed-metadata.png)

Add the new site column to a SharePoint document library and tag your documents. 

When you check the library with your 2 different users, you can see SharePoint will be translate the multilingual term sets in the language from the user, where is logged in. SharePoint will be translate all default terms also in the other language, but not columns or views, but you can translate this terms manually.

Library in english:

![Document library in english](assets/display-multilingual-term-store-values-with-pnp-search-results/document-library-in-english.png)

Library in german:

![Document library in german](assets/display-multilingual-term-store-values-with-pnp-search-results/document-library-in-german.png)

As prepare for our search configuration, map the new crawled property to RefinableStringXX Managed Properties, please attention, map both Crawled properties, OWS_ and the OWS_TAXID_, to Managed Properties.
![Managed properties RefinableString](assets/display-multilingual-term-store-values-with-pnp-search-results/Managed-Properties-RefinableString.png)

Now, we are ready to jump into our search scenario, let's go 🚀

## Add PnP Search Results WebPart to a page
Add the PnP Search Results WebPart to a new or existing site page. See the scenario how you can [create a simple search page](create-simple-search-page.md)
![Add PnP Search Result WebPart](assets/display-multilingual-term-store-values-with-pnp-search-results/add-pnp-search-results-webpart.png)

## Configure Search Results WebPart
Configure the new PnP Results WebPart with a SharePoint Search source and as simply as possible, with a path-query and add the new Managed Properties as Selected properties in the WebPart configuration.
![Configure PnP Search Result WebPart](assets/display-multilingual-term-store-values-with-pnp-search-results/results-webpart-confguration.png)

Add the new Managed Property, with the OWS_, as Managed columns into the results WebPart and save the page.
![Configure PnP Search Result WebPart - Managed columns](assets/display-multilingual-term-store-values-with-pnp-search-results/webpart-configuration-manage-columns.png)

Check the page with both users and different language settings and you can see, the terms will NOT translate into the languages, we can see the default language as column values.

![Search Results without translation](assets/display-multilingual-term-store-values-with-pnp-search-results/search-results-without-translation.png)

## Configure multilingual columns
Edit the page and go back to Manage columns, activate the Use Handlebar expression and insert {{AutoRefinableString127}} , the second property mapped to the crawled property OWS_TAXID_, as expression.
![Add AutoRefinableString as Handlebar expression](assets/display-multilingual-term-store-values-with-pnp-search-results/webpart-configuration-manage-columns-ows_taxid_.png)

Enable localization on the first page from the PnP Search Results configuration.
![Enable localization](assets/display-multilingual-term-store-values-with-pnp-search-results/enable-localization.png)

## Testing Search configuration
After saving the configuration, now you can see the translated values in the PnP Search Results WebPart in the different languages.

### Results in english
![Multilingual Search Results in English](assets/display-multilingual-term-store-values-with-pnp-search-results/results-in-english.png)

### Results in german
![Multilingual Search Results in German](assets/display-multilingual-term-store-values-with-pnp-search-results/results-in-german.png)

*A little multilingual disclaimer: The search columns or SharePoint WebPart titles are not multilingual, but you can use SharePoint Multilingual Pages to configure more in a different language. See more in the Microsoft article: [Create multilingual SharePoint sites, pages, and news](https://support.microsoft.com/en-us/office/create-multilingual-sharepoint-sites-pages-and-news-2bb7d610-5453-41c6-a0e8-6f40b3ed750c?WT.mc_id=DX-MVP-5004845)
