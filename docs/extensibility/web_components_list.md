# Builtin web components

Here are the list of all **reusable** web components you can use to customize your templates. 

- [&lt;pnp-iconfile&gt;](#ltpnp-iconfilegt)
- [&lt;pnp-documentcard&gt;](#ltpnp-documentcardgt)
- [&lt;pnp-filepreview&gt;](#ltpnp-filepreviewgt)
- [&lt;pnp-icon&gt;](#ltpnp-icongt)
- [&lt;pnp-panel&gt;](#ltpnp-panelgt)
- [&lt;pnp-collapsible&gt;](#ltpnp-collapsiblegt)
- [&lt;pnp-persona&gt;](#ltpnp-personagt)

> All other web components you will see in builtin layout templates are considered **internal** and are not supported for custom use.

> All components have an optional `data-theme-variant` attribute used to set the theme for your internal React components (for instance using Office UI Fabric). This value is typically retrieved from the root Handlebars context and reflect the current **section theme** where the Web Part belongs. **If not set, the theme of current site will be used as fallback and may not corespond to the current section theme**.

## `<pnp-iconfile>`

- **Description**: Render a file icon according to an extension. 

!["File icon component"](../assets/extensibility/web_components/fileicon_component.png){: .center}
- **Usage**
```html
<pnp-iconfile 
    data-extension="docx" 
    data-is-container="false" 
    data-size="32">
</pnp-iconfile>
```

| Parameter | Description |
| --------- | ----------- |
|**data-extension**|The file extension to render.
|**data-is-container**|If `true` or `1`, the icon will be a folder.
|**data-size**|The size of the icon to display.

## `<pnp-documentcard>`
- **Description**: Render a document card.

!["Document card component"](../assets/extensibility/web_components/document_card_component.png){: .center}

- **Usage**
```html
<pnp-documentcard 
    data-location="&lt;a href=\&quot;https://...\&quot;&gt;Title&lt;/a&gt;"
    data-title="Title"
    data-preview-image="https://..." 
    data-preview-url="https://..." 
    data-date="01/01/2020" 
    data-href="https://..." 
    data-author="David Lopez" 
    data-profile-image="/_layouts/15/userphoto.aspx?size=L&username=david.lopez@contoso.com" 
    data-file-extension="docx"
    data-enable-preview="true" 
    data-is-container="false"
    data-show-file-icon="true">`
</pnp-documentcard>
```

| Parameter | Description |
| --------- | ----------- |
|**data-location**|The document card location. HTML is allowed here. You must encode the string for this scenario.
|**data-title**|The document card title.
|**data-preview-image**|The preview image URL for the card.
|**data-preview-url**|The preview URL for the card.
|**data-href**|The URL for the card title.
|**data-author**|The author to display.
|**data-profile-image**|The profile image URL for the author if any.
|**data-file-extension**|The document card file extension if any.
|**data-enable-preview**|If the card supports preview. If `true`, a preview URL + preview image URL should be set.
|**data-is-container**|If `true` or `1`, the file icon will be a folder icon.
|**show-file-icon**|If `true` or `1`, the file icon will be hidden/displayed.

## `<pnp-filepreview>`

- **Description**: Render file preview in a callout when the wrapped element **is clicked**. The wrapped element can be anything (text, image, etc.)

!["File preview component"](../assets/extensibility/web_components/filepreview_component.png){: .center}

- **Usage**
```html
<pnp-filepreview 
    data-preview-url="https://..." 
    data-preview-image-url="https://...">
    <span>Wrapped element</span>
</pnp-filepreview>
```

| Parameter | Description |
| --------- | ----------- |
|**data-preview-image**|The preview image URL for the callout displayed while the preview is loading in a iframe (optional).
|**data-preview-url**|The preview URL for the element in the callout.
    
## `<pnp-icon>` 
- **Description**: Display an [Office UI Fabric icon](https://developer.microsoft.com/en-us/fluentui#/styles/web/icons).

!["Icon component"](../assets/extensibility/web_components/icon_component.png){: .center}

- **Usage**
```html
<pnp-icon data-name="Tag" aria-hidden="true"></pnp-icon>
```

| Parameter | Description |
| --------- | ----------- |
|**data-name**|The Office UI Fabric icon name to display (case sensitive).
    
## `<pnp-panel>`

- **Description**: display a panel with (`panel-content`) content when the associated outer `panel-open` element is clicked.

!["Panel component"](../assets/extensibility/web_components/panel_component.png){: .center}

- **Usage**
```html
<pnp-panel   
    data-is-open="false" 
    data-is-light-dismiss="true"
    data-is-blocking="true"
    data-size="2"
    data-panel-header-text="Panel header!">

    <template id="panel-open">
        <!-- All the content here will be wrapped with an onclick event opening/hiding the panel -->

        Click me!
    </template>

    <template id="panel-content">
        <!-- Panel content goes here -->
    
        Panel content!
    </template>
    
</pnp-panel>
```

## `<pnp-collapsible>`

- **Description**: expand/collapse the `collapsible-content` contetn when the text with `data-group-name` is clicked.

!["Collapsible component"](../assets/extensibility/web_components/collapsible_component.png){: .center}


- **Usage**
```html
<pnp-collapsible 
    data-group-name="Collapsible content" 
    data-is-default-collapsed="true">

    <template id="collapsible-content">
        <div>
            My Content!
        </div>
    </template>

    <template id="collapsible-footer">
        <div>
            My Footer!
        </div>
    </template>

</pnp-collapsible>
```

| Parameter | Description |
| --------- | ----------- |
|**data-is-default-collapsed**|If the content should be collapsed by default `true/false`.
|**data-group-name** |The header group name for expand/collapse.

## `<pnp-persona>`

- **Description**: display a persona item with relevant information.

!["Persona component"](../assets/extensibility/web_components/persona_component.png){: .center}

- **Usage**
```html
<pnp-persona
    data-image-url="/_layouts/15/userphoto.aspx?size=L&username=david.lopez@contoso.com"
    data-primary-text="David Lopez"
    data-secondary-text="Unknown"
    data-tertiary-text=""
    data-optional-text="514 928 0000"
    data-persona-size="" >
</pnp-persona>
```

| Parameter | Description |
| --------- | ----------- |
|**data-image-url**|The persona image URL.
|**data-primary-text**|The primary text (ex: person display name).
|**data-secondary-text**|The secondary text to display (ex: job title).
|**data-tertiary-text**|The tertiary text to display (ex: work phone).
|**data-optional-text**|The optional text to display.
|**data-persona-size**|The size of the persona **item** to display (no only the picture). Valid values are <ul><li>tiny = 0</li><li>extraExtraSmall = 1</li><li>extraSmall = 2</li><li>small = 3</li><li>regular = 4</li><li>large = 5</li><li>extraLarge = 6</li></ul>