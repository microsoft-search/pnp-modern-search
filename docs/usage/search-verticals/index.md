# Search Verticals Web Part

The 'Verticals' Web Part allows to conditionally render a 'Search Results' Web Part according to the selected vertical. It is a simple way to build a complete search center including multiple sources.

!["PnP Search Verticals Web Part"](../../assets/webparts/search-verticals/search_verticals_wp_picker.png){: .center}

## Configuration

The configuration of the 'Verticals' Web Part is fairly simple.

!["Verticals configuration"](../../assets/webparts/search-verticals/configure_verticals.png){: .center} 

### Configure verticals

The options for a vertical are as follow:

| **Setting** | **Description** |
|------------|-----------------|
| **Tab name** | The vertical name (i.e. tab) 
| **Fluent UIFabric icon name** | The optional Fluent UI icon to display for the tab. Refer to [Office UI Fabric documentation](https://developer.microsoft.com/en-us/fluentui#/styles/web/icons) to see all available icons.
| **Is hyperlink** | If checked, the tab will behave as an hyperlink meaning it won't trigger any selected event.
| **Link URL** | If the tab is an hyperlink, the link URL to use. Tokens `{<TokenName>}` are supported here. See [tokens](../search-results/tokens.md) for more info.
| **Open behavior** | If the tab is an hyperlink, the opening behavior (new tab or current tab).