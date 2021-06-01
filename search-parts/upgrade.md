# Upgrade project search-parts to v1.12.1

Date: 5/31/2021

## Findings

Following is the list of steps required to upgrade your project to SharePoint Framework version 1.12.1. [Summary](#Summary) of the modifications is included at the end of the report.

### FN001001 @microsoft/sp-core-library | Required

Install SharePoint Framework dependency package @microsoft/sp-core-library

Execute the following command:

```sh
npm i -SE @microsoft/sp-core-library@1.12.1
```

File: [./package.json:15:5](./package.json)

### FN001002 @microsoft/sp-lodash-subset | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-lodash-subset

Execute the following command:

```sh
npm i -SE @microsoft/sp-lodash-subset@1.12.1
```

File: [./package.json:20:9](./package.json)

### FN001003 @microsoft/sp-office-ui-fabric-core | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-office-ui-fabric-core

Execute the following command:

```sh
npm i -SE @microsoft/sp-office-ui-fabric-core@1.12.1
```

File: [./package.json:21:9](./package.json)

### FN001004 @microsoft/sp-webpart-base | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-webpart-base

Execute the following command:

```sh
npm i -SE @microsoft/sp-webpart-base@1.12.1
```

File: [./package.json:23:9](./package.json)

### FN001011 @microsoft/sp-dialog | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-dialog

Execute the following command:

```sh
npm i -SE @microsoft/sp-dialog@1.12.1
```

File: [./package.json:18:9](./package.json)

### FN001012 @microsoft/sp-application-base | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-application-base

Execute the following command:

```sh
npm i -SE @microsoft/sp-application-base@1.12.1
```

File: [./package.json:17:9](./package.json)

### FN001013 @microsoft/decorators | Required

Upgrade SharePoint Framework dependency package @microsoft/decorators

Execute the following command:

```sh
npm i -SE @microsoft/decorators@1.12.1
```

File: [./package.json:16:9](./package.json)

### FN001021 @microsoft/sp-property-pane | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-property-pane

Execute the following command:

```sh
npm i -SE @microsoft/sp-property-pane@1.12.1
```

File: [./package.json:22:9](./package.json)

### FN001029 @microsoft/sp-loader | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-loader

Execute the following command:

```sh
npm i -SE @microsoft/sp-loader@1.12.1
```

File: [./package.json:19:9](./package.json)

### FN002001 @microsoft/sp-build-web | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-build-web

Execute the following command:

```sh
npm i -DE @microsoft/sp-build-web@1.12.1
```

File: [./package.json:60:9](./package.json)

### FN002002 @microsoft/sp-module-interfaces | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-module-interfaces

Execute the following command:

```sh
npm i -DE @microsoft/sp-module-interfaces@1.12.1
```

File: [./package.json:61:9](./package.json)

### FN002003 @microsoft/sp-webpart-workbench | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-webpart-workbench

Execute the following command:

```sh
npm i -DE @microsoft/sp-webpart-workbench@1.12.1
```

File: [./package.json:63:9](./package.json)

### FN002009 @microsoft/sp-tslint-rules | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-tslint-rules

Execute the following command:

```sh
npm i -DE @microsoft/sp-tslint-rules@1.12.1
```

File: [./package.json:62:9](./package.json)

### FN004002 copy-assets.json deployCdnPath | Required

Update copy-assets.json deployCdnPath

```json
{
  "deployCdnPath": "./release/assets/"
}
```

File: [./config/copy-assets.json:3:3](./config/copy-assets.json)

### FN005002 deploy-azure-storage.json workingDir | Required

Update deploy-azure-storage.json workingDir

```json
{
  "workingDir": "./release/assets/"
}
```

File: [./config/deploy-azure-storage.json:3:3](./config/deploy-azure-storage.json)

### FN010001 .yo-rc.json version | Recommended

Update version in .yo-rc.json

```json
{
  "@microsoft/generator-sharepoint": {
    "version": "1.12.1"
  }
}
```

File: [./.yo-rc.json:5:9](./.yo-rc.json)

### FN023001 .gitignore 'release' folder | Required

To .gitignore add the 'release' folder


File: [./.gitignore](./.gitignore)

### FN001008 react | Required

Upgrade SharePoint Framework dependency package react

Execute the following command:

```sh
npm i -SE react@16.9.0
```

File: [./package.json:51:9](./package.json)

### FN001009 react-dom | Required

Upgrade SharePoint Framework dependency package react-dom

Execute the following command:

```sh
npm i -SE react-dom@16.9.0
```

File: [./package.json:54:9](./package.json)

### FN001022 office-ui-fabric-react | Required

Upgrade SharePoint Framework dependency package office-ui-fabric-react

Execute the following command:

```sh
npm i -SE office-ui-fabric-react@7.156.0
```

File: [./package.json:50:9](./package.json)

### FN002004 gulp | Required

Upgrade SharePoint Framework dev dependency package gulp

Execute the following command:

```sh
npm i -DE gulp@4.0.2
```

File: [./package.json:80:9](./package.json)

### FN002005 @types/chai | Required

Remove SharePoint Framework dev dependency package @types/chai

Execute the following command:

```sh
npm un -D @types/chai
```

File: [./package.json:64:9](./package.json)

### FN002006 @types/mocha | Required

Remove SharePoint Framework dev dependency package @types/mocha

Execute the following command:

```sh
npm un -D @types/mocha
```

File: [./package.json:67:9](./package.json)

### FN002017 @microsoft/rush-stack-compiler-3.7 | Required

Install SharePoint Framework dev dependency package @microsoft/rush-stack-compiler-3.7

Execute the following command:

```sh
npm i -DE @microsoft/rush-stack-compiler-3.7@0.2.3
```

File: [./package.json:58:5](./package.json)

### FN002014 @types/es6-promise | Required

Remove SharePoint Framework dev dependency package @types/es6-promise

Execute the following command:

```sh
npm un -D @types/es6-promise
```

File: [./package.json:65:9](./package.json)

### FN002015 @types/react | Required

Upgrade SharePoint Framework dev dependency package @types/react

Execute the following command:

```sh
npm i -DE @types/react@16.9.36
```

File: [./package.json:69:9](./package.json)

### FN002016 @types/react-dom | Required

Upgrade SharePoint Framework dev dependency package @types/react-dom

Execute the following command:

```sh
npm i -DE @types/react-dom@16.9.8
```

File: [./package.json:70:9](./package.json)

### FN013002 gulpfile.js serve task | Required

Before 'build.initialize(require('gulp'));' add the serve task

```js
var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

```

File: [./gulpfile.js](./gulpfile.js)

### FN015006 .editorconfig | Required

Remove file .editorconfig

Execute the following command:

```sh
rm ".editorconfig"
```

File: [.editorconfig](.editorconfig)

### FN019002 tslint.json extends | Required

Update tslint.json extends property

```json
{
  "extends": "./node_modules/@microsoft/sp-tslint-rules/base-tslint.json"
}
```

File: [./tslint.json:2:3](./tslint.json)

### FN021002 engines | Required

Remove package.json property

```json
{
  "engines": "undefined"
}
```

File: [./package.json:5:5](./package.json)

### FN001005 @types/react | Required

Remove SharePoint Framework dependency package @types/react

Execute the following command:

```sh
npm un -S @types/react
```

File: [./package.json:35:9](./package.json)

### FN001006 @types/react-dom | Required

Remove SharePoint Framework dependency package @types/react-dom

Execute the following command:

```sh
npm un -S @types/react-dom
```

File: [./package.json:36:9](./package.json)

### FN001007 @types/webpack-env | Required

Remove SharePoint Framework dependency package @types/webpack-env

Execute the following command:

```sh
npm un -S @types/webpack-env
```

File: [./package.json:37:9](./package.json)

### FN001010 @types/es6-promise | Required

Remove SharePoint Framework dependency package @types/es6-promise

Execute the following command:

```sh
npm un -S @types/es6-promise
```

File: [./package.json:34:9](./package.json)

### FN006004 package-solution.json developer | Optional

In package-solution.json add developer section

```json
{
  "solution": {
    "developer": {
      "name": "Contoso",
      "privacyUrl": "https://contoso.com/privacy",
      "termsOfUseUrl": "https://contoso.com/terms-of-use",
      "websiteUrl": "https://contoso.com/my-app",
      "mpnId": "000000"
    }
  }
}
```

File: [./config/package-solution.json:3:5](./config/package-solution.json)

### FN017001 Run npm dedupe | Optional

If, after upgrading npm packages, when building the project you have errors similar to: "error TS2345: Argument of type 'SPHttpClientConfiguration' is not assignable to parameter of type 'SPHttpClientConfiguration'", try running 'npm dedupe' to cleanup npm packages.

Execute the following command:

```sh
npm dedupe
```

File: [./package.json](./package.json)

## Summary

### Execute script

```sh
npm un -S @types/react @types/react-dom @types/webpack-env @types/es6-promise
npm un -D @types/chai @types/mocha @types/es6-promise
npm i -SE @microsoft/sp-core-library@1.12.1 @microsoft/sp-lodash-subset@1.12.1 @microsoft/sp-office-ui-fabric-core@1.12.1 @microsoft/sp-webpart-base@1.12.1 @microsoft/sp-dialog@1.12.1 @microsoft/sp-application-base@1.12.1 @microsoft/decorators@1.12.1 @microsoft/sp-property-pane@1.12.1 @microsoft/sp-loader@1.12.1 react@16.9.0 react-dom@16.9.0
npm i -DE @microsoft/sp-build-web@1.12.1 @microsoft/sp-module-interfaces@1.12.1 @microsoft/sp-webpart-workbench@1.12.1 @microsoft/sp-tslint-rules@1.12.1 gulp@4.0.2 @microsoft/rush-stack-compiler-3.7@0.2.3 @types/react@16.9.36 @types/react-dom@16.9.8
npm dedupe
rm ".editorconfig"
```

### Modify files

#### [./config/copy-assets.json](./config/copy-assets.json)

Update copy-assets.json deployCdnPath:

```json
{
  "deployCdnPath": "./release/assets/"
}
```

#### [./config/deploy-azure-storage.json](./config/deploy-azure-storage.json)

Update deploy-azure-storage.json workingDir:

```json
{
  "workingDir": "./release/assets/"
}
```

#### [./.yo-rc.json](./.yo-rc.json)

Update version in .yo-rc.json:

```json
{
  "@microsoft/generator-sharepoint": {
    "version": "1.12.1"
  }
}
```

#### [./.gitignore](./.gitignore)

To .gitignore add the 'release' folder:

```text
release
```

#### [./gulpfile.js](./gulpfile.js)

Before 'build.initialize(require('gulp'));' add the serve task:

```js
var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

```

#### [./tslint.json](./tslint.json)

Update tslint.json extends property:

```json
{
  "extends": "./node_modules/@microsoft/sp-tslint-rules/base-tslint.json"
}
```

#### [./package.json](./package.json)

Remove package.json property:

```json
{
  "engines": "undefined"
}
```

#### [./config/package-solution.json](./config/package-solution.json)

In package-solution.json add developer section:

```json
{
  "solution": {
    "developer": {
      "name": "Contoso",
      "privacyUrl": "https://contoso.com/privacy",
      "termsOfUseUrl": "https://contoso.com/terms-of-use",
      "websiteUrl": "https://contoso.com/my-app",
      "mpnId": "000000"
    }
  }
}
```
