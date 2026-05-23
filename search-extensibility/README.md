## PnP Search Extensibility library

PnP Modern Search uses the concept of 'extensibility libraries'. These are SharePoint Framework library components you put in the global or site collection app catalog that will be loaded automatically by Web Parts to enhance the experience and options (ex: new data source with new options, custom layout, etc.). Simple as that!

## Get started

More information to get started can be found in the documentation for PnP Moderns Search at https://microsoft-search.github.io/pnp-modern-search/extensibility/.

## v2.0.0 — Slim package (decoupled from SPFx)

Starting with v2.0.0, this package has **zero `@microsoft/sp-*` runtime dependencies**. SPFx types used in base classes (`ServiceScope`, `WebPartContext`, etc.) are typed as `any`, and any SPFx-specific behavior the base classes used to auto-perform is now opt-in.

### Why

You can now consume this package from a library built against **any SPFx version** (1.18.2, 1.21.1, 1.22.x, ...) without npm peer-dep conflicts. Combined with the runtime cross-version manifest patcher in `search-parts`, extensions built against an older SPFx now load on pages running a newer SPFx version.

### Migration from v1.x

In most cases **no code changes are required** — existing extensions compile and run as-is because they already import SPFx types directly from `@microsoft/sp-*` packages. Specific changes to be aware of:

| Area | v1.x | v2.0.0 | Action |
|---|---|---|---|
| Base class context types | `BaseDataSource<T>` with `context: any` | `BaseDataSource<T, TContext = any>` | None required. Optionally pass `WebPartContext` as the second generic for full intellisense. |
| Constructor signature | `(serviceScope: ServiceScope)` | `(serviceScope: any)` | None — `any` is assignable from anything. |
| `BaseWebComponent._serviceScope` | typed as `ServiceScope` | typed as `any` | None. Continue calling `_serviceScope.consume(MyServiceKey)` — works identically at runtime. Cast if you want types: `(this._serviceScope as ServiceScope).consume(...)`. |
| `BaseWebComponent` theme | Auto-consumed `ThemeProvider` from `_serviceScope` and set `props.themeVariant` | **Removed.** Theme is opt-in. | If you relied on auto-theme, either (a) pass `data-theme-variant='{{JSONstringify @root.theme}}'` from the Handlebars template, or (b) override `getThemeVariant()` in your web component and consume `ThemeProvider.serviceKey` from `_serviceScope` yourself. |
| `BaseWebComponent._moment` | held a `moment` library instance (internal use) | **Renamed to `_dayjs`** (now a dayjs instance). Both were marked "INTERNAL USE ONLY". | If you accessed `_moment` directly (against advice), use `this._serviceScope.consume(DateHelper.ServiceKey)` instead. |
| Web component polyfill | Pulled in transitively via SPFx deps | Direct dep on `@webcomponents/custom-elements ^1.6.0` | None — auto-included. |
| Public exports (`index.ts`) | n/a | **Identical to v1.18.2** | None. |

### Optional generic typing (recommended for new code)

```typescript
import { BaseDataSource } from '@pnp/modern-search-extensibility';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export class MyDataSource extends BaseDataSource<IMyProps, WebPartContext> {
    public async getData() {
        // `this.context` is now typed as WebPartContext — full intellisense
        const url = this.context.pageContext.web.absoluteUrl;
        // ...
    }
}
```

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## "Sharing is Caring"

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**