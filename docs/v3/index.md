# PnP Modern Search v3 #

## Solution overview

![Solution demo](./images/react-search-refiners.gif)

## Current version

![Current version](https://img.shields.io/badge/version-3.18.0-green.svg)

**Get the latest release at our [releases page](https://github.com/microsoft-search/pnp-modern-search/releases/latest).**

## Table of contents
- [Contributors](contributors.md)
- [Web Parts](search-parts/getting-started.md)
    - [Search Box](search-parts/search-box.md)
    - [Search Results](search-parts/search-results.md)
    - [Search Filters](search-parts/search-filters.md)
    - [Search Pagination](search-parts/search-pagination.md)
    - [Search Verticals](search-parts/search-verticals.md)
    - [Templating](search-parts/templating.md)
- [Extensibility Library](search-extensibility-library/getting-started.md)
- [Custom Renderer](search-custom-renderer/getting-started.md)
- [Search Query Enhancer](search-query-enhancer/getting-started.md)
    - [Debug locally](search-query-enhancer/debug-locally.md)

## Summary

This solution allows you to build user friendly SharePoint search experiences using SPFx in the modern interface. The main features include:

- Fully customizable SharePoint search query like the good old Content Search Web Part.
- Can either use a static query or be connected to a search box component using SPFx dynamic data.
- Live templating system with Handlebar to meet your requirements in terms of UI + built-in layouts. Can also use template from an external file.
- Search results including previews for Office documents and Office 365 videos.
- Customizable refiners supporting multilingual values for taxonomy based filters.
- Sortable results (unique field).
- Refiners Web Part.
- SharePoint best bets support.
- Search query enhancement with NLP tools (like Microsoft LUIS).
- Extensibility model allowing to write your own components.

A complete 1 hour tutorial video is available on the [official SharePoint Developer blog](https://developer.microsoft.com/en-us/sharepoint/blogs/pnp-webcast-sharepoint-framework-modern-search-web-part/):

<a href="https://www.youtube.com/watch?v=g41nvRVwtds" target="_blank"><img src="http://img.youtube.com/vi/g41nvRVwtds/maxresdefault.jpg"/></a>

## What's included?

### Search Web Parts

SPFx solution `search-parts` including a complete set of SharePoint search Web Parts like a search results, search box, etc.

See [documentation](./search-parts/getting-started.md).

### Search extensibility library

A SPFx library component project `search-extensibility-library` allowing to create custom React components wrapped as web components to be included in the search results Web Part Handlebars templates when you require complex dynamic behavior at a granular component level.

See [documentation](./search-extensibility-library/getting-started.md).

### Search custom renderer

A SPFx application customizer project `search-custom-renderer` allowing to completly override the results display using an unique React component.

See [documentation](./search-custom-renderer/getting-started.md).

### Search query enhancer

A sample Azure function project `search-query-enhancer`to demonstrate the use of Microsoft LUIS and other cognitive services to interpret user intents and enhance the search box query accordingly.

See [documentation](./search-query-enhancer/getting-started.md).

## Applies to

* [SharePoint Framework](https:/dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Important notice on upgrading the solution from pre v2.2.0.0
**Due to code restructuring we have hit an edge case which impacts upgrades from previous versions. To solve the issue go to `https://<tenant>.sharepoint.com/sites/<appcatalog>/Lists/ComponentManifests` and remove the entries for SearchBox and Search Results, and then upload the .sppkg for the new release.**

**Next you need to loop over all sites which have the web parts installed, and upgrade the App on those sites. Now the web parts should work on new and existing sites. You may use the PnP command `Update-PnPApp` to update the application.**

**If you have deployed the solution as a tenant wide extension, this should not impact you.**

## Important notice on upgrading the solution from pre v3.0.0.0

**Because this version introduces a new standalone search filters Web Part, you will have to reconfigure all previous refiners from the search results Web Part to this new Web Part. You can get the previous layout for filters by selecting the 'Panel' layout in the new Web Part property pane.**

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

<img src="https://telemetry.sharepointpnp.com/microsoft-search/pnp-modern-search" />
