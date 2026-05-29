# Copilot instructions

This repository (**PnP Modern Search v4**) is a **SharePoint Framework (SPFx)** solution
(TypeScript + React + webpack). The main package lives under `search-parts/`.

These notes are **additional, project-specific** guidance for PR reviews — they supplement, not
replace, the default review.

## SPFx-specific things the reviewer should know

- **Async-only code splitting**: each web part has a single injected entry script, so only
  webpack `chunks: 'async'` splitting works. Initial/sync split chunks would never load — be
  skeptical of changes that assume eager/sync vendor chunks.
- **Bundle size is a first-class concern**. Flag new top-level/eager imports of heavy libraries
  (Fluent UI, MGT, Adaptive Cards, Handlebars, Monaco/ACE, moment). Heavy or optional dependencies
  should load on demand via dynamic `import()` with a `webpackChunkName` comment prefixed
  `pnp-modern-search-*`. Webpack customization lives in
  `search-parts/config/spfx-customize-webpack.js`.
- **Microsoft Graph Toolkit (MGT)** must only load when the `useMicrosoftGraphToolkit` toggle is
  enabled — never eagerly on every render.
- **Property-pane controls**: shared controls should use the lazily-loaded references from
  `BaseWebPart.loadCommonPropertyPaneResources()` rather than eager
  `@pnp/spfx-property-controls` imports.
- **Localization & translation**: all user-facing strings must be localized — never hard-coded.
  Add the key to the per-web-part strings modules (e.g. `SearchResultsWebPartStrings`) or shared
  `CommonStrings`, with its English value in `src/loc/en-us.js`. Any new or changed string must
  also be added/updated in **every** language file under `search-parts/src/loc/` (e.g. `de-de.js`,
  `fr-fr.js`, `es-es.js`, `nl-nl.js`, `sv-SE.js`, `nb-no.js`, `da-dk.js`, `fi-fi.js`, `it-it.js`,
  `pl-pl.js`, `cs-cz.js`, `pt-br.js`) with a translation appropriate to that language — not left as
  the English fallback. Flag PRs that add/modify a string in `en-us.js` without updating the other
  locale files.
- **Templates/layouts**: watch for unsanitized HTML rendered via `dangerouslySetInnerHTML` or
  Handlebars (XSS risk from untrusted search data).

## Build

- Build with `npm run build` from `search-parts/`; output goes to `sharepoint/solution/`.
