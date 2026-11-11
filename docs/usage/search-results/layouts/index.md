## Builtin layouts

By default, the following layouts are provided:

!["Available layouts"](../../../assets/webparts/search-results/layouts/available_layouts.png){: .center}

> Be careful, when you switch the layout in the property pane, all the previous layout properties are lost. We do this to avoid polluting the Web Part property bag with multiple useless configurations.

### Cards

{!usage/search-results/layouts/cards.md!}

### Details List

{!usage/search-results/layouts/details-list.md!}

### Slider

{!usage/search-results/layouts/slider.md!}

### Simple list

{!usage/search-results/layouts/simple-list.md!}

### People

{!usage/search-results/layouts/people.md!}

### Debug

{!usage/search-results/layouts/debug.md!}

### Custom

{!usage/search-results/layouts/custom.md!}

## Common settings

### Export search results to CSV

The built-in Handlebars **Cards**, **Details List**, **Simple list**, and **Slider** layouts support the **Export Search result** action. Adaptive Cards layouts do not expose the export action or its settings. Export uses the current query, applied filters, selected vertical, and sorting from the Results web part's data source. It retrieves additional pages independently of the displayed page size, so it is not restricted to the visible page or selected items.

#### Configuration

1. Edit the Search Results web part and open its **Layouts** property-pane page.
2. Expand the **CSV export** section, which is collapsed by default, and enable **Enable download of current data as CSV**. This toggle is off by default. All export configuration controls are grouped in this section.
3. Select **Configure export columns** below the toggle to open the visual editor. Each row has an export checkbox, a managed property from the data source's **Selected properties**, and an editable CSV column display name. Existing JSON mappings are loaded with their selections, headers, and column order preserved. Select the properties to export, edit their headers, and select **Save** to update **Export columns (JSON)**. **Cancel**, the close button, and Escape discard changes. Alternatively, enter or edit the JSON directly in the textbox.
4. Ensure the mapped properties are returned by the data source. For SharePoint Search, include the managed properties in **Selected properties**; the export mapping does not add them to the search request automatically. Select **Validate JSON** below the textbox to check its current contents and confirm that every mapped property is selected, including edits that have not been accepted as a valid configuration. A dialog reports success or lists validation errors. This button is shown only when CSV export is enabled.
5. Save the configuration. Users can then select **Export Search result** in the Results toolbar without selecting individual items or enabling **Allow items selection**.

![CSV export configuration showing the enabled export toggle and JSON column mapping](../../../assets/webparts/search-results/layouts/export-search-results-configuration.png){: .center}

Example:

```json
{
  "Title": "Title",
  "AuthorOWSUSER": "Created by",
  "Created": "Created date",
  "Path": "URL"
}
```

Keys are the property names returned in the result data, not display names or Handlebars expressions. Values are the CSV headers. The mapping is independent of Details List's **Manage columns** configuration. Use one JSON object, not an array of objects. It must contain at least one entry, with non-empty property names and non-empty string headers. Validation runs when the textbox loses focus and checks that every key appears in the data source's selected properties, using exact field names. If any are missing, an error lists them; add those fields to the selected properties or remove them from the export mapping. The mapping does not add missing fields automatically.

The visual editor also displays previously mapped properties that are no longer selected, with a warning. Deselect them before saving, or cancel and add them back to **Selected properties**. Saving is disabled when no columns are checked, a checked column has a blank display name, or a checked property is unavailable. Invalid existing JSON is never silently replaced: cancel and correct it in the JSON textbox before reopening the editor.

The action is disabled when results are loading, when there are no loaded results, when no usable export mapping is configured, and while export is running.

Successful exports do not display a status message. If export fails, a localized, dismissible error is announced to assistive technologies. Changing the search inputs, filters, vertical, sorting, or paging during export cancels it and discards collected rows to avoid mixing results from different queries. Retry the export for the updated search.

Selecting or deselecting result items does not cancel a full-dataset export. The active export and its busy/error state are retained when selection updates replace the toolbar, preventing duplicate exports and allowing the original download to finish.

#### Exported file

- The file is named `SearchResults_<timestamp>.csv`.
- CSV fields are separated by semicolons. Headers and non-null values are quoted, with embedded double quotes escaped; commas, semicolons, and line breaks in values are preserved.
- String values and headers that could be interpreted as spreadsheet formulas are prefixed with an apostrophe, including formula markers following whitespace or control characters. Actual numeric values are preserved as numbers in the CSV text.
- The file uses UTF-8 with a byte order mark (BOM), helping Excel recognize accents and non-English characters.
- Export uses property values from the data source, including its preview enrichment. It does not evaluate layout column HTML or Handlebars expressions. Missing or null values produce empty cells; objects and arrays are serialized as JSON text.
- Valid UTC timestamp values with a zero-only fractional part are exported without that fraction and the `Z` suffix. For example, `2024-01-18T11:15:05.0000000Z` becomes `2024-01-18T11:15:05`. The time remains in UTC, but the timezone designator is omitted; no timezone conversion is performed. Because the exporter does not have field-type information, matching text values are formatted in the same way. Other date strings and column headers are unchanged.
- When a column contains a recognizable SharePoint `ows_q_USER_*` people identity, an adjacent column is added using the configured header plus `[Text Only]` (localized). If the additional header would collide with a configured or previously generated header after CSV formatting, including formula protection, a number is appended to distinguish it. Configured headers are not renamed. The original identity remains in the original column; the additional column contains the display names, separated by semicolons when there are multiple people. Empty or unrecognized values leave the additional cell empty, as do multi-value entries that cannot be completely recognized. Detection considers all exported rows, but no additional column is created when every value is empty or no identity is recognizable because the exporter does not receive field-type information.
- Similarly, when a column contains managed metadata values in the `taxid` crawled-property format (for example `GP0|#<guid>;L0|#0<guid>|Label;GTSet|#<guid>`), an adjacent `[Text Only]` column is added containing only the term labels. Duplicate labels are removed and multiple labels are separated by semicolons. Plain label text repeated after the taxid tokens (as produced when the managed property is also mapped to the field's plain crawled property) is ignored, including labels containing semicolons or beginning with `#`. Values with no term label, or that cannot be completely recognized, leave the additional cell empty. If a column contains both people and taxonomy values in different rows, each cell is interpreted independently.

Export fetches results using the data source's reported result count, in batches of up to 500. Microsoft Search message and event searches use batches of 25 to comply with Graph paging limits. Search API limits, throttling, count estimates, and changes to indexed content can affect the exported dataset. Large exports take longer and are assembled in browser memory; the reported result count is not a guarantee of an exact row count.

#### Compared with selected-item downloads

**Export Search result** exports the current matching dataset across pages using **Export columns (JSON)**. It does not require item selection.

The existing **Enable download** setting remains separate. With item selection enabled, **Download selected as CSV** exports only selected list items from the current page; documents and folders use the existing file/ZIP download behavior instead.

### Other common settings

For all layouts, some common settings are available:

!["Common options"](../../../assets/webparts/search-results/layouts/common_options.png){: .center}

| Setting | Description | Default value 
| ------- |---------------- | ---------- |
| **Allow items selection** | If enabled, allow items to be selected in default layouts. See [documentation](../connections/item-selection.md) for usage. | Disabled.
| **Allow multiple selection** | If the item selection is allowed, specify if users can select multiple items. When a layout also has **Enable details** turned on, the same **Details** action is reused for both modes: single selection opens the SharePoint details panel for that item, while multiple selection opens the shared selected items edit panel for the compatible selected items. | Disabled.
| **Preserve selection on empty click** | If the item selection is allowed, specify if a click outside of the selection zone should clear the selection | Disabled.
| **Hide this web part if there's nothing to show** | If there is no results, the Web Part will remain blank in display mode (title and 'See all' link included). In edit mode, you will see a message indicating there is no results. <p align="center">!["Common options"](../../../assets/webparts/search-results/layouts/hide_webpart.png)</p> | Disabled.
| **Show results count** | Hide or display the results count for the current query. | Enabled.
| **Use Microsoft Graph Toolkit** | Enable or disable the Microsoft Graph Toolkit to be used in Handlebars template. Refer to the [MGT documentation](https://docs.microsoft.com/en-us/graph/toolkit/overview) to see available components.

### Result types

The result types feature gives you the ability to apply a conditional rendering at item level according to data source field values.

![Result Types](../../../assets/webparts/search-results/layouts/result_types_btn.png){: .center}

> Not all layouts support the result types feature (ex: Details lsit and slider layouts).

**Example**

Given the following conditions, we apply a border with a specific color for each: 

![Result Types](../../../assets/webparts/search-results/layouts/result_types.png){: .center}

![Result Types template](../../../assets/webparts/search-results/layouts/result_types_template.png){: .center}

The result would be like this:

![Result Types template](../../../assets/webparts/search-results/layouts/result_types_result.png){: .center}

The following operators are supported:

- Equals
- Not equals
- Contains
- StartsWith
- Greater Or Equal
- Less Or Equal
- Less than
- Greater than
- Is not null

In case you use a custom template, you can still benefit from this feature following this markup:

```html
{{#> resultTypes}}
  {{!-- The block below will be used as default item template if no result types matched --}}
  <div class="template_result">
      <!-- Your default template markup -->
  </div>
{{/resultTypes}}
```

Handlebars [partials](https://handlebarsjs.com/guide/partials.html) are used behind the scenes and conditions are built dynamically using a recursive if/else structure.
