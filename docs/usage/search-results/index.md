# Search Results Web Part

The _'Search Results' Web Part_ is the fundamental building block of whole global solution. Its purpose is basically to get data from a specifc source and render them in a specific native or custom layout based on Handlebars and web components.

This Web Part can be used **alone** or **connected to other Web Parts** to add dyanmic interactions (filters, search box or verticals). To use the Web Part on a SharePoint page:
1. Edit your SharePoint modern page.
2. Search for the _'PnP - Search Results'_ Web Part and add it to your page.<br><br>
    _You may use "PnP - Search Rollup" instead if you don't need to connect web parts. This version support being lazy loaded in the SharePoint framework to optimize page loading._

!["PnP Search Results"](../../assets/webparts/search-results/search_results_wp_picker.png){: .center}

!["PnP Search Results"](../../assets/webparts/search-results/search_results_wp_placeholder.png){: .center}

## Configuration

The search results Web Part configuration is divided into four parts each corresponding to a property pane page:

1. [**Data source**](./data-sources/index.md): From where to retrieve the data. Includes the [slots configuration](./slots.md) and [tokens usage](./tokens.md).
2. [**Layouts**](./layouts/index.md): How to render them.
3. [**Connections**](./connections/index.md): How the Web Part will be connected to others in the page.
4. [**Extensibility**](../../extensibility/index.md): How the Web Part will be connected to others in the page.

## Styling

### Results styling

The results styling section allows you to customize the visual appearance of the results container to match your branding and design requirements.

| **Setting** | **Description** | **Default value**
|------------|---------------- | ----------
| **Results background color** | The background color of the results container. | _Transparent_
| **Results border color** | The border color of the results container. | _Theme primary color_
| **Results border thickness** | The thickness of the results container borders (in pixels). | _1px_
| **Reset styling to default** | Reset all styling options to their default values. | N/A

### Web part title styling

The title styling section allows you to customize the visual appearance of the web part title.

| **Setting** | **Description** | **Default value**
|------------|---------------- | ----------
| **Title font** | The font family to use for the web part title. | _Segoe UI_
| **Title font size** | Controls the font size (in pixels) for the web part title. | _16px_
| **Title font color** | The color of the web part title text. | _Theme primary color_
| **Reset title styling to default** | Reset all title styling options to their default values. | N/A

## Common Settings

These settings are available across all PnP Modern Search web parts:

- [**Audience Targeting**](./common/audience-targeting.md): Control web part visibility based on user group membership.
- [**Paging**](./common/paging.md): Configure pagination for data display.
