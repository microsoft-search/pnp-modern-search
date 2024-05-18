The 'simple list' layout display items as a simple list with larger rows, like a search engine results display.

!["Simple list layout"](../../../assets/webparts/search-results/layouts/simple_list_layout.png){: center} 

| Setting | Description | Default value 
| ------- |---------------- | ----------
| **Show file icon** | Hide or display the file icon for the result card. The file icon is determined using the `FileType` [slot](../slots.md). | True.
| **Show thumbnail** | If enabled, display a thumbnail for the itme + a callout with an interactive preview of the document on click based on the value specified value for the `PreviewUrl` current data source [slot](../slots.md).</br> <p align="center">[!["Card Preview"](../../../assets/webparts/search-results/layouts/simple_list_thumbnail.png)](../../../assets/webparts/search-results/layouts/simple_list_thumbnail.png)</p> | False.
| **Enable download** | Enable download of selected files. Requires _Allow items selection_ to be enabled and supports both single and multiple selection. If single selection is enabled the selected file will be downloaded as is. If multiple selection is enabled the selected files and folders will be downloaded in a single zip file like in SharePoint document libraries. Requires _SPWebUrl_, _ContentTypeId_, _NormListID_ and _NormUniqueID_ to be selected in _Selected properties_. | False.
