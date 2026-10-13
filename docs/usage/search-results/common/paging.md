The paging options are available for all data sources.

| Setting | Description | Default value |
| --------| ----------- |---------------|
| **Show paging** | Hide or display the paging control. | `true` |
| **Number of items per page** | Specify the number of items to show per page. | `10` |
| **Hide page numbers** | Use previous/next navigation only. On the first page, show **Next page >**; on subsequent pages, show **< current page >**. Turn off to show a range of page numbers. | `true` |
| **Number of pages to display in range** | Determines the number of pages to display in range when page numbers are enabled. | `5` |
| **Hide navigation buttons (prev page, next page)** | Applies when page numbers are enabled. | `false` |
| **Hide first/last navigation buttons** | Applies when page numbers are enabled. | `false` |
| **Hide navigation buttons (prev, next, first, last) if they are disabled.** | Applies when page numbers are enabled. | `true` |
| **Enable page number in query string** | When enabled, the current page number is written to the URL as a `?page=N` query string parameter so pages can be deep-linked and the browser back/forward buttons navigate between result pages instead of leaving the page. | `false` |

Search services may return an estimated result count that changes with the page size or current page. Previous/next navigation does not use this count: **Next** is available while the current page is full (or a next-page link is supplied). A full final page can therefore lead to an empty page, where **Previous** remains available. Short or empty pages do not show **Next**.

For custom templates, pass `data-hide-page-numbers="{{@root.properties.paging.hidePageNumbers}}"` and `data-current-items-count="{{@root.data.items.length}}"` to `<pnp-pagination>`, and do not hide the control based on `totalItemsCount` in previous/next mode. Without the current item count or page links, **Next** remains available because the component cannot determine whether the last page has been reached.