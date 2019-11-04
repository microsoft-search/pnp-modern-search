Version | Date | Comments
------- | ---- | --------
1.0 | Oct 17, 2017 | Initial release
1.1 | Jan 03, 2018 | Improvements and updating to SPFx drop 1.4
1.2 | Feb 12, 2018 | Added a search box Web Part + Added a "Result Source Id" and "Enable Query Rules" parameters.
1.3 | Apr1, 2018 | Added the result count + entered keywords option
1.4 | May 10, 2018 | <ul><li>Added the query suggestions feature to the search box Web Part</li><li>Added the automatic translation for taxonomy filter values according to the current site locale.</li> <li>Added the option in the search box Web Part to send the query to an other page</ul>
1.5 | Jul 2, 2018 | <ul><li>Added a templating feature for search results with Handlebars inspired by the [react-content-query-webpart](https://github.com/SharePoint/sp-dev-fx-webparts/tree/master/samples/react-content-query-webpart) sample.</li><li>Upgraded to 1.5.1-plusbeta to use the new SPFx dynamic data feature instead of event aggregator for Web Parts communication.</li> <li>Code refactoring and reorganization.</ul>
2.0.0.5 | Sept 18, 2018 | <ul><li>Upgraded to 1.6.0-plusbeta.</li><li>Added dynamic loading of parts needed in edit mode to reduce web part footprint.</li><li>Added configuration to sort.</li><li>Added option to set web part title.</li><li>Added result count tokens.</li><li>Added toggle to load/use handlebars helpers/moment.</li></ul>
2.1.0.0 | Oct 14, 2018 | <ul><li>Bug fixes ([#641](https://github.com/SharePoint/sp-dev-fx-webparts/issues/641),[#642](https://github.com/SharePoint/sp-dev-fx-webparts/issues/642))</li><li>Added document and Office 365 videos previews for the list template.</li><li>Added SharePoint best bets support.</li></ul>
2.1.1.0 | Oct 30, 2018 | <ul><li>Bug fix for editing custom template.</li><li>Bug fix for dynamic loading of video helper library.</li><li>Added support for Page context query variables.</li><li>Added `getUniqueCount` helper function.</li></ul>
2.1.2.0 | Nov 9, 2018 | <ul><li>Bug fix for IE11.</li><li>Added date query variables.</li><li>Added support for both result source id and query template.</li><li>Added `getUniqueCount` helper function.</li></ul>
2.2.0.0 | Nov 11, 2018 | <ul><li>Upgraded to SPFx 1.7.0</li><li>Added a TypeScript Azure Function to demonstrate NLP processing on search query</li><li>Removed extension data source. Now we use the default SPFx 'Page Environment' data source.</li></ul>
2.2.0.1 | Dec 3, 2018 | <ul><li>Remove switch for handlebar helpers, and instead load helpers if used in the template.</li></ul>
2.3.0.0 | Dec 13, 2018 | <ul><li>Upgraded to @pnp/controls 1.13.0</li><li>Added a result types features</li><li>Fix bug regarding dynamic data source connection</li></ul>
2.4.0.0 | Jan 03, 2019 | Added custom code renderer support.
2.4.0.1 | Jan 07, 2019 | Added backwards compatibility for older sort configurations, and old empty refiner configurations
2.5.0.1 | Feb 11, 2019 | Downgrade @microsoft/sp-office-ui-fabric-core to v1.6.0 to fix theming
2.5.1.0 | Mar 05, 2019 | Added Search Navigation webpart to the package.
3.0.0.0 | Mar 10, 2019 | Created a dedicated refiners Web Part to connect with a search results like to the classic SharePoint search experience.
3.0.1.0 | Mar 14, 2019 | Created a dedicated pagination Web Part to connect with a search results like to the classic SharePoint search experience. Improved Refiners WP CSS.
3.0.2.0 | Mar 14, 2019 | Fixed regressions with the paging experience
3.0.3.0 | Mar 16, 2019 | Fixed display of custom renderers, in edit mode
3.0.4.0 | Mar 21, 2019 | Fixed loading of Handlebars helpers when having multiple search parts on a page
3.0.5.0 | Mar 26, 2019 | Fixed recreating SearchService on each render
3.1.0.0 | Mar 30, 2019 | Added date range and multi value refiner templates
3.2.0.0 | Apr 08, 2019 | Added support for QueryString token
3.3.0.0 | Apr 20, 2019 | Added search verticals Web Part allowing to search within predefined scopes using query template and result source.
3.4.0.0 | May 23, 2019 | Added placeholders HTML markup by template instead of global.
3.5.0.0 | July 8th, 2019 | Fixes: Taxonomy tags, web part header, theme colors, search box clearing, loading of handlebars helpers. Added Spanish locale. Optimized CSS references (may break in custom templates if you used some of the OUIF styles). Optimized bundle size for run-time. Added more options for time zone handling with `getDate`.
3.6.2.0 | Aug 13th, 2019 | <ul><li>Does not work with IE11 (looking into it)</li><li>Removed the deprecated 'office-ui-fabric' module and updated layouts with the Office UI React components by wrapping them with web components.</li><li>Added a DetailsList and Debug layouts + template options for 'Tiles' (placeholders fileds, etc.) and 'Details List' (column builder, etc.).</li><li>Updated property pane fields (Search Results and Refiners WP) to use a dynamic search managed properties list instead of text values.</li><li>Added `regEx` and `getUnique` helpers.</li><li>Added Dutch translation.</li></ul>
3.6.3.0 | Aug 14th, 2019 | Now works in IE11, just ignore the errors :)
3.7.0.0 | Oct 30th, 2019 | <ul><li>Allow selecting between URL Fragment or QueryString parameter.</li><li>Refiner flashing fix.</li><li>Fixed Page token handling.</li><li>Added more handlebar helper methods.</li><li>Removed default path filter on the webpart.</li><li>Added sorting option for refiners.</li><li>Better default icon handling and support for using [OUIFR icons](https://developer.microsoft.com/en-us/fabric#/styles/web/icons) in your templates. See [TEMPLATING.md documentation](./TEMPLATING.md#Web-components) for more information.</li><li>Added support for rendering secondary result blocks in custom renderers.</li><li>Added toggle to include OneDrive results as a secondary result block (not currently visible without custom renderer).</li><li>Allow custom renderers to render even if there are zero search results to display.</li><li>Added fixed date refiner template.</li><li>Fix for using custom code renderer.</li><li>Upgraded to SPFx v1.9.1.</li><li>Added preview support for 'spellingSuggestion' token.</li></ul>
3.8.0.0 | Nov 4th, 2019 | Moved to a dedicated repository. Added an extensibility library to write custom web components.