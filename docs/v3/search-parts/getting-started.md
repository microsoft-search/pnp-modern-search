# Web parts - v3
[Table of contents](../index.md)
## Summary

This solution contains all search Web Parts you can use on your SharePoint modern pages.

## Used SharePoint Framework Version ##

![SPFx](https://img.shields.io/badge/drop-1.10.0-green.svg)

This solution includes the following Web Parts:

## Search Web Part(s) ##

Component | Description |
----- | ----- |
Search Box Web Part | Allows users to enter free text/KQL search queries connected to a search results Web Part.
Search Results Web Part | Performs static or dynamic search query with customizable parameters sorting and templating.
Search Refiners | Allows users to configure refiners for a search results Web Part.
Search Verticals | Allows users to search in predefined scopes.

## Minimal Path to Awesome ##

- Clone this repository
- In the `search-parts` project, run the following commands:
  - `npm install`
  - `gulp serve`

The `search-parts` project also supports faster development via [spfx-fast-serve](https://github.com/s-KaiNet/spfx-fast-serve) tool. To use "fast serve" run `npm run serve` instead of `gulp serve`.

We recommend using `--nobrowser` when serving and use one of two approaches for debugging instead of the local workbench:
* Hosted workbench on any site via: https://&lt;tenant&gt;.sharepoint.com/sites/yoursite/_layouts/15/workbench.aspx
* Debug on a modern page by appending the below parameters to the URL. This allows page composition and debug as you were in production.
  ```
  ?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js
  ```
