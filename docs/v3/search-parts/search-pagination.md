# Search Pagination - v3
[Table of contents](../index.md)

> **This WebPart has been removed since the 3.11.0 version. If you had custom templates and need pagination, add the following code snippet in your template**:

```
{{#if @root.paging.showPaging}}
    <pnp-pagination 
        data-total-items="{{@root.paging.totalItemsCount}}" 
        data-hide-first-last-pages="{{@root.paging.hideFirstLastPages}}"
        data-hide-disabled="{{@root.paging.hideDisabled}}"
        data-hide-navigation="{{@root.paging.hideNavigation}}"
        data-range="{{@root.paging.pagingRange}}" 
        data-items-count-per-page="{{@root.paging.itemsCountPerPage}}" 
        data-current-page-number="{{@root.paging.currentPageNumber}}"
    >
    </pnp-pagination>
{{/if}}
```
