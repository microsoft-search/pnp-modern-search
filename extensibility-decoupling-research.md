# Extensibility Decoupling — Research & Implementation Plan

## Problem Statement

Today `search-parts` has a hard dependency on `@pnp/modern-search-extensibility` (npm). This creates three pain points:

1. **Lock-step versioning**: Every change to the extensibility package requires a corresponding update in search-parts.
2. **SPFx version coupling**: The npm package pins 6 `@microsoft/sp-*` dependencies (currently 1.22.2). Extension libraries built against one SPFx version break when consumed by search-parts running a different SPFx version.
3. **Extension author friction**: Extension authors must match the exact SPFx version of the extensibility package, limiting which SPFx versions they can target.

## Goal

- Remove `@pnp/modern-search-extensibility` as a dependency of `search-parts`
- Make the npm package SPFx-version-independent (zero `@microsoft/sp-*` deps)
- Ensure extensions built against any SPFx version work with search-parts on any (compatible) SPFx version
- Preserve extension author DX (`extends BaseDataSource<T>`, autocomplete, etc.)

---

## Research Findings

### Current Architecture

#### What the extensibility package exports

| Category | Count | Examples | SPFx Deps? |
|----------|-------|----------|------------|
| Pure interfaces | ~30 | `IDataSource`, `ILayout`, `ISuggestionProvider`, `IDataFilter` | Some yes |
| Enums | 12 | `FilterComparisonOperator`, `BuiltinTemplateSlots`, `LayoutType` | No |
| Abstract base classes | 5 | `BaseDataSource<T>`, `BaseLayout<T>`, `BaseWebComponent` | Yes |
| Constants class | 1 | `ExtensibilityConstants` (5 event name strings) | No |

#### SPFx types used in the extensibility package

| SPFx Type | Where Used | Purpose |
|-----------|-----------|---------|
| `ServiceScope` | All 5 base class constructors | DI container passed to extensions |
| `ServiceKey<T>` | All `*Definition` interfaces, `BaseWebComponent` | Service registration for SPFx DI |
| `WebPartContext` | All base classes + interfaces (`context` property) | SPFx web part context |
| `IPropertyPaneGroup` | `IDataSource`, `ISuggestionProvider`, `IQueryModifier` | Property pane config return type |
| `IPropertyPaneField<T>` | `ILayout` | Property pane field config return type |
| `ThemeProvider` | `BaseWebComponent.resolveAttributes()` | Auto-detect Fluent UI theme |
| `camelCase` | `BaseWebComponent.resolveAttributes()` | Attribute name conversion |

#### How extensions are loaded at runtime (ExtensibilityService)

```
User configures extension GUID in property pane
        ↓
SPComponentLoader.loadComponentById(guid)     ← SPFx API, loads library component
        ↓
Inspect loaded module's prototype for IExtensibilityLibrary methods
(duck-type check: getCustomLayouts, getCustomWebComponents, etc.)
        ↓
Two instantiation paths:
  A) If class has static .serviceKey → serviceScope.consume(serviceKey)  ← SPFx DI
  B) Else → new ExtensionClass()                                         ← plain constructor
        ↓
Cast to IExtensibilityLibrary, call methods to extract extensions
```

**Critical finding**: The `instantiateLibrary` method already does **duck-type detection** — it checks for method existence on the prototype, not `instanceof`. This validates the structural typing approach.

#### How search-parts uses extensibility types (59 files)

| Usage Pattern | File Count | Examples |
|--------------|-----------|---------|
| Extends `BaseWebComponent` | 17+ | All custom web components (Icon, Pagination, Panel, Image, etc.) |
| Extends `BaseLayout<T>` | 13 | All layout implementations (Cards, DetailList, Slider, etc.) |
| Extends `BaseDataSource<T>` | 2 | SharePointSearchDataSource, MicrosoftSearchDataSource |
| Extends `BaseSuggestionProvider<T>` | 1 | SharePointSuggestionProvider |
| Type-only (interfaces/enums) | ~26 | Various models, helpers, web parts |

**Key finding**: Zero `instanceof` checks against extensibility types anywhere in search-parts. All enum values are simple strings/numbers — safe for independent structural comparison.

### SPFx Cross-Version Compatibility — Root Cause Analysis (from SPFx source)

**Source files analyzed** (from `onedrive.visualstudio.com/ODSP-Web/_git/odsp-web`):
- `SPComponentLoader.ts` — facade delegating to `ISPComponentLoader`
- `RequireLoader.ts` — the `IModuleLoader` implementation (RequireJS-based)
- `dependencyLoading.ts` — `loadComponentDependencies()` and `loadComponentDependency()`

#### How component loading works

```
SPComponentLoader.loadComponentById(guid)
  → ManifestStore.tryGetManifest(id)        // Find manifest by GUID
  → SPComponentLoader.loadComponent(manifest)
    → RequireLoader._loadComponent(manifest)
      → depNames = Object.keys(manifest.loaderConfig.scriptResources)
      → RequireConfigurator.configLoadComponent(manifest)   // Configure RequireJS paths
      → loadComponentDependencies(loader, manifest, depNames)  // Load ALL deps
      → loader.loadEntryPoint(manifest)                     // Load the extension code
```

#### Where cross-version breaks (exact mechanism)

Each dependency in `scriptResources` with `type: 'component'` is loaded by `loadComponentDependency()`:

```typescript
function loadComponentDependency(loader, name, resource) {
    effectiveVersion = resource.version; // e.g., "1.18.0"
    
    // Exact version lookup in ManifestStore
    const depManifest = ManifestStore.instance.tryGetManifest(resource.id, effectiveVersion);
    
    if (depManifest) {
        // Found at exact version → load it
    } else {
        // NOT found → request from server (which also fails for old framework versions)
        dep = ManifestStore.instance.requestManifest(resource.id, effectiveVersion);
    }
}
```

An SPFx 1.18 extension's manifest declares `@microsoft/sp-core-library@1.18.0` in `scriptResources`. The page's ManifestStore has `1.22.0`. **Exact version lookup fails → loading fails.**

There IS a `_loadWithDifferentModuleId` fallback in RequireLoader that searches the RequireJS registry for another version of the same component GUID, but it's best-effort and doesn't cover all dependency chains.

#### Proof: manifest before and after slimming

**Before** (old extensibility package build):
```json
"scriptResources": {
    "pnp-search-extensibility-library": { "type": "path", "path": "..." },
    "react-dom":                         { "type": "component", "version": "17.0.1" },
    "@microsoft/sp-lodash-subset":       { "type": "component", "version": "1.22.2" },
    "@microsoft/sp-component-base":      { "type": "component", "version": "1.22.2" }
}
```

**After** (slim extensibility package build):
```json
"scriptResources": {
    "pnp-search-extensibility-library": { "type": "path", "path": "..." },
    "react-dom":                         { "type": "component", "version": "17.0.1" }
}
```

`@microsoft/sp-lodash-subset` and `@microsoft/sp-component-base` are **gone** — no version-pinned SPFx framework entries in the manifest.

#### Implications for extension authors

Extension authors who import `@microsoft/sp-core-library` (for `ServiceKey.create()`, `ServiceScope`) or `@microsoft/sp-http` (for `SPHttpClient`) will still have those entries in **their** extension's `scriptResources` with version pins. That's inherent to the SPFx build — any `import` from a framework package creates a `type: 'component'` entry.

The documented extension pattern uses `ServiceKey.create()`:
```typescript
import { ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
serviceKey: ServiceKey.create<ILayout>('CustomLayout', CustomLayout)
```

This means **extension authors must still match the web part's SPFx version** as documented. The slim npm package doesn't change this — it only ensures the npm package itself doesn't need version bumps when the web part project bumps SPFx.

#### Future opportunity: ServiceKey-free extensions

A future version could provide a `createServiceKey()` helper in the extensibility package that delegates to the host's `ServiceKey.create()` at runtime, avoiding the extension's need to import `@microsoft/sp-core-library` directly. This would allow true cross-version extensions but requires changes to both the npm package, the host's `ExtensibilityService`, and documentation.

---

## Revised Implementation Plan

### Decision: Keep npm dependency in search-parts

After analysis, **search-parts keeps its `@pnp/modern-search-extensibility` dependency** rather than internalizing. The slim package:
- Has zero SPFx deps (no version coupling)
- Provides single source of truth (no sync issues)
- Keeps same base class prototypes (runtime compat guaranteed by class identity)
- Version bumps only when the extensibility contract changes (correct behavior)

### Phase 1: Slim the npm package (DONE)

#### 1.1 Replace SPFx types with `any` in abstract base classes

All 5 base classes follow the same pattern — replace typed SPFx parameters with `any`:

```typescript
// Before
import { ServiceScope } from '@microsoft/sp-core-library';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IPropertyPaneGroup } from '@microsoft/sp-property-pane';

export abstract class BaseDataSource<T> {
    constructor(serviceScope: ServiceScope) { }
    get context(): WebPartContext { }
    getPropertyPaneGroupsConfiguration(): IPropertyPaneGroup[] { return []; }
}

// After (zero SPFx deps)
export abstract class BaseDataSource<T> {
    constructor(serviceScope: any) { }
    get context(): any { }
    getPropertyPaneGroupsConfiguration(): any[] { return []; }
}
```

Files to modify:
- `search-extensibility/src/models/dataSources/BaseDataSource.ts`
- `search-extensibility/src/models/layouts/BaseLayout.ts`
- `search-extensibility/src/models/layouts/BaseWebComponent.ts`
- `search-extensibility/src/models/suggestions/BaseSuggestionProvider.ts`
- `search-extensibility/src/models/queryModifier/BaseQueryModifier.ts`

#### 1.2 Replace SPFx types with `any` in interfaces

```typescript
// Before
import { ServiceKey } from '@microsoft/sp-core-library';
export interface IDataSourceDefinition {
    serviceKey: ServiceKey<IDataSource>;
}

// After
export interface IDataSourceDefinition {
    serviceKey: any;
}
```

Files to modify:
- `search-extensibility/src/models/dataSources/IDataSource.ts` — `context: any`, `serviceKeys: { TokenService: any }`, property pane returns `any[]`
- `search-extensibility/src/models/dataSources/IDataSourceDefinition.ts` — `serviceKey: any`
- `search-extensibility/src/models/layouts/ILayout.ts` — `context: any`, property pane returns `any[]`
- `search-extensibility/src/models/layouts/ILayoutDefinition.ts` — `serviceKey: any`
- `search-extensibility/src/models/suggestions/ISuggestionProvider.ts` — `context: any`, property pane returns `any[]`
- `search-extensibility/src/models/suggestions/ISuggestionProviderDefinition.ts` — `serviceKey: any`
- `search-extensibility/src/models/queryModifier/IQueryModifier.ts` — `context: any`, property pane returns `any[]`
- `search-extensibility/src/models/queryModifier/IQueryModifierDefinition.ts` — `serviceKey: any`

#### 1.3 Handle BaseWebComponent special dependencies

`BaseWebComponent` has three non-SPFx-type dependencies that need attention:

| Dependency | Current Source | Replacement |
|-----------|---------------|-------------|
| `camelCase()` | `@microsoft/sp-lodash-subset` | Inline 3-line implementation |
| `ThemeProvider.serviceKey` | `@microsoft/sp-component-base` | Remove (search-parts sets `themeVariant` explicitly via data attribute) |
| `ReactDOM.unmountComponentAtNode()` | `react-dom` | Keep as `peerDependency` |
| Custom elements polyfill | `@webcomponents/custom-elements` | Remove (modern browsers support natively) |

Inline `camelCase` replacement:
```typescript
function camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
```

#### 1.4 Update search-extensibility package.json

- Remove all `@microsoft/sp-*` packages from `dependencies`
- Remove `office-ui-fabric-react` from `dependencies`
- Remove `@webcomponents/custom-elements` and `@webcomponents/webcomponentsjs`
- Move `react` and `react-dom` to `peerDependencies`
- Keep `handlebars` (used in `IExtensibilityLibrary` interface)
- Keep `tslib` (TypeScript helper runtime)
- Bump major version (breaking type change)

#### 1.5 Extension author impact

Extension authors who need SPFx type safety cast from their own project deps:

```typescript
import { BaseDataSource, IDataSourceData } from '@pnp/modern-search-extensibility';
import { WebPartContext } from '@microsoft/sp-webpart-base'; // their own dep

export class MyDataSource extends BaseDataSource<IMyProps> {
    public async getData(): Promise<IDataSourceData> {
        const ctx = this.context as WebPartContext; // cast to get type safety
        // ...
    }
}
```

Most extension authors won't notice — they typically don't access `context` or `serviceScope` directly. The abstract methods they override (`getData()`, `connectedCallback()`, `modifyQuery()`, etc.) have no SPFx types in their signatures.

---

### Phase 2: search-parts keeps npm dependency (no changes needed)

search-parts continues to `import` from `@pnp/modern-search-extensibility`. The `any` types from the slim package are compatible — search-parts has its own SPFx deps for full type safety where needed.

### Phase 3: Verify

- [x] Build search-extensibility: `cd search-extensibility && pnpm run build` ✅
- [x] Verify manifest has zero `@microsoft/sp-*` entries in `scriptResources` ✅
- [ ] Build search-parts: `cd search-parts && pnpm run build`
- [ ] Run search-parts tests
- [ ] Publish new npm package version
- [ ] Verify an existing extension compiles against the new npm package

---

## Verification Checklist

- [x] search-extensibility `package.json` has zero `@microsoft/sp-*` runtime dependencies
- [x] Built manifest `scriptResources` has no version-pinned SPFx framework entries
- [ ] search-parts builds against the slim npm package
- [ ] Existing extension library compiles against the new npm package version
- [ ] Deploy and test an extension end-to-end

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Extension authors lose type safety on `context`, `serviceScope` | Certain | Low | Cast from their own SPFx deps; most don't use these directly |
| Enum value mismatch after independent evolution | Low | Medium | Single source of truth (npm package); no independent copies |
| `BaseWebComponent` theme detection changes | Certain | Low | search-parts sets `themeVariant` explicitly via data attribute in all templates |
| Existing extensions fail after npm package update | Low | High | Structural compat maintained; document migration path |
| Extension authors still need matching SPFx for `ServiceKey.create()` | Certain | Medium | Documented requirement; future ServiceKey-free pattern possible |

## Decisions Made

- **Slim npm package**: Replace SPFx types with `any`, remove all `@microsoft/sp-*` runtime deps
- **Keep npm dependency in search-parts**: Single source of truth, no sync issues
- **No internalization**: Simpler architecture, same base class prototypes for runtime compat
- npm package becomes SPFx-version-independent — no more lock-step version bumps
- `IExtensibilityLibrary` keeps `handlebars` type ref (both search-parts and extensions use handlebars)
- `BaseWebComponent` ThemeProvider auto-detection removed (theme passed via data attribute)
- `camelCase` inlined (replaced `@microsoft/sp-lodash-subset` dependency)
- Custom elements polyfill removed (modern browsers support natively)
- `BaseWebComponent` theme detection: remove auto-`ThemeProvider` consumption (search-parts sets `themeVariant` explicitly via attribute)
- Runtime compatibility guaranteed by structural typing + matching enum values + no `instanceof`
