# Store custom templates in SharePoint

You can create your own custom templates. These can be used across PnP Search Result webparts across sites in your tenant, if you reference them by their URL.

Requirements for using a custom template, referenced by URL are:

* All users of the PnP Search Result webpart, must be able to read those templates. 
* Templates need to have their own URL.

A SharePoint site within your tenant is perfect for this scenario, because  you get some additional features:
* Version control
* Central repository
* Secure change access
* No public access
* Use OneDrive for sync
* Approval flows (if you want)
* plus more...

 ## How to do this checklist:
1. Create a SharePoint site
2. Give "Everyone except externals" read access to the site
3. Create a Library
4. Create a Templates Folder
5. Add your custom templates to this folder.

Now you can reference these templates using the URL to the file.

`https://<tenantname>.sharepoint.com/sites/<sitetitle>/<libraryname>/<foldername>/<templatename>.html`

## Example for the a tenant named Contoso.

| Site title | Library name | Folder name | Template names |
| :---------- | ------------ | ----------- | ------------- |
| contoso_Resources  | PnPSearch    | Templates   | mytemplate.html, mytemplate2.html|

Urls for the templates in this example:

mytemplate.html: `https://contoso.sharepoint.com/sites/contoso_resources/PnPSearch/Templates/mytemplate.html`

mytemplate2.html: `https://contoso.sharepoint.com/sites/contoso_resources/PnPSearch/Templates/mytemplate2.html`

