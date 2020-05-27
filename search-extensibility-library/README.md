# PnP Modern Search extensibility module

The Modern Search solution allows you to integrate you own granular components as web components inside the Handlebars templates using a dedicated extensibility module.

## Prerequisites

## Using Microsoft Graph Toolkit Web Components

This extensibility library contains a sample on how you can create custom components using the [Microsoft Graph Toolkit Web Components](https://docs.microsoft.com/en-us/graph/toolkit/overview).
The component in the sample uses the _mgt_ [Person card web component](https://docs.microsoft.com/en-us/graph/toolkit/components/person-card), so, if you are searching People, you can use this component in your custom Hnadlebars template. Here is the snippet:

```html
<div class="template_contentContainer">
  <graph-persona-custom-component 
      data-my-string-param="{{Title}}" 
      data-my-object-param="{{JSONstringify item}}">
  </graph-persona-custom-component>
</div>
```

__Note__: To make _mgt_ work in SPFx solutions, you need the _Rush Stack compiler_ 3.7 (this project is already configured to do so, adding the proper package and configuring the _tsconfig.json_)

