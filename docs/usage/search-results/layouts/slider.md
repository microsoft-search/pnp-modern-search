The 'slider' layout allows you to display data as as dynamic slider (i.e caroussel).

!["Slider layout"](../../../assets/webparts/search-results/layouts/slider_layout.png){: .center} 

| Setting | Description | Default value 
| ------- |---------------- | ---------- 
| **Auto play** | If enabled, slides move automatically every X seconds. | True.
| **Auto play duration** | Move elements every X seconds. | 3 seconds.
| **Pause on hover** | If enabled, pause the slider on mouse hover. | True.
| **Number of elements to group together in slides** | Groups cells together in slides. | 3.
| **Show page dots** | Enable or disable slider navigation. You can adjust the dots position by updating the `.flickity-page-dots` CSS class. | True.
| **Infinite scrolling** | Enable or disable infinite scrolling on the carousel. | False.
| **Slide height (in px)** | Dynamically set the slides height to adjust your results. | 360px.
| **Slide width (in px)** | Dynamically set the slides width to adjust your results. | 318px.
| **Enable download** | Enable download of selected files. Requires _Allow items selection_ to be enabled and supports both single and multiple selection. If single selection is enabled the selected file will be downloaded as is. If multiple selection is enabled the selected files and folders will be downloaded in a single zip file like in SharePoint document libraries. Requires _SPWebUrl_, _ContentTypeId_, _NormListID_ and _NormUniqueID_ to be selected in _Selected properties_. | False.