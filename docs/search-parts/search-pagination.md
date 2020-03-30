> **This WebPart has been removed since the 3.11.0 version. If you had custom templates and need pagination, add the following code snippet in your template**:

```
{{#if @root.paging.showPaging}}
    <pnp-pagination 
        total-items="{{@root.paging.totalItemsCount}}" 
        hide-first-last-pages="{{@root.paging.hideFirstLastPages}}"
        hide-disabled="{{@root.paging.hideDisabled}}"
        hide-navigation="{{@root.paging.hideNavigation}}"
        range="{{@root.paging.pagingRange}}" 
        items-count-per-page="{{@root.paging.itemsCountPerPage}}" 
        current-page-number="{{@root.paging.currentPageNumber}}"
    >
    </pnp-pagination>
{{/if}}
```
