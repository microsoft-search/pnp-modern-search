# Register Handlebars customizations

By default, builtin helpers and open-source [Handlebars helpers](https://github.com/helpers/handlebars-helpers) are available. If these don't fit your requirements, you can still create your own custom [helper](https://handlebarsjs.com/api-reference/helpers.html) or [partial](https://handlebarsjs.com/api-reference/runtime.html#handlebars-registerpartial-name-partial) that you can use in your HTML templates or layout fields (ex: 'Cards' or 'Details List' layouts).

> To avoid any conflict, each Web Part instance gets its own Handlebars isolated namespace (i.e. using `Handlebars.create()`) meaning registering customizations in the global Handlebars namespace **won't work** (ex: using `Handlebars.registerHelper()` directly).

To register a new Handlebars customization for the targeted Web Part (i.e. the Web Part instances where the extensibility library is registered and enabled):

1.  In the library main entry point (i.e. the class implementing the `IExtensibilityLibrary` in interface), register your customization using the `registerHandlebarsCustomizations()` method. The `namespace` parameter corresponds to the targeted Web Part Handlebars isolated namespace:

2. From here, use the Handlebars API to add your customizations to this specific namespace. They will be availabe in templates for registered Web Part instances:

```typescript
public registerHandlebarsCustomizations(namespace: typeof Handlebars) {

    // Register custom Handlebars helpers
    // Usage {{myHelper 'value'}}
    namespace.registerHelper('myHelper', (value: string) => {
        return new namespace.SafeString(value.toUpperCase());
    });
}
```

## Passing the current theme (and other context) to your helpers

Handlebars helpers run as string-template functions — unlike React web components, they don't automatically receive the current SPFx theme or page context. If your helper needs theme colors or other root data, **the template author passes them as hash arguments** when invoking the helper.

### Theme parameter pattern

The web part exposes the current theme on the Handlebars data context as `@root.theme`. Templates can pass it through:

```handlebars
{{myColoredBadge "Hello" theme=@root.theme}}
```

Inside the helper, the hash argument arrives on `options.hash`:

```typescript
namespace.registerHelper('myColoredBadge', function (text: string, options: any) {
    // Accept either a Fluent-style theme object or a plain palette object,
    // fall back to a hardcoded color if no theme was passed.
    const palette = (options?.hash?.theme?.palette) || options?.hash?.theme || {};
    const accent = palette.themePrimary || '#0078d4';
    const safeText = namespace.Utils.escapeExpression(text);
    return new namespace.SafeString(
        `<span style="background:${accent};color:#fff;padding:2px 8px;border-radius:4px;">${safeText}</span>`
    );
});
```

### Other useful root-context values

Anything the web part puts on the template context root is accessible via `@root.<name>` and can be forwarded to a helper the same way. Common examples templates can pass:

- `theme=@root.theme` — current Fluent theme (palette, semanticColors, fonts, etc.)
- `slots=@root.slots` — current slot configuration
- Custom values set on `additionalData` in the template render context

### Why no auto-injection?

Helpers receive only the arguments the template explicitly passes. This keeps helpers pure and predictable, avoids surprising globals, and lets the same helper work across web parts with different context shapes.

### HTML attributes vs. hash arguments

When you pass values to a **web component** (an HTML element in the template) you must stringify objects, because HTML attributes are strings:

```handlebars
<my-banner data-theme-variant='{{JSONstringify @root.theme}}'></my-banner>
```

When you pass values to a **Handlebars helper** (a `{{name ...}}` expression), pass the object directly — Handlebars passes it through as a JS object:

```handlebars
{{myBadge "Hello" theme=@root.theme}}
```

Don't `JSONstringify` for helper hash args — you'd just get the JSON string instead of the object.

## What's on `@root`

The full set of fields exposed at `@root` is the template context object built by each web part. The canonical source of truth is the [`ISearchResultsTemplateContext`](../../search-parts/src/models/common/ITemplateContext.ts) / [`ISearchFiltersTemplateContext`](../../search-parts/src/models/common/ITemplateContext.ts) interface definitions plus the `getTemplateContext()` method in each web part's container component.

Commonly-used fields:

- `@root.theme` — current Fluent theme (palette, semanticColors, fonts)
- `@root.properties` — the web part's property bag
- `@root.context.{site,web,user,list,listItem,cultureInfo}` — current SharePoint page context (Search Results only)
- `@root.data` — data returned by the connected data source (typically `@root.data.items`)
- `@root.slots` — configured slot name → managed property map
- `@root.inputQueryText` / `@root.originalInputQueryText` — current query

See the [extensibility index](./index.md#context-and-data-available-to-each-extension-type) for the full per-extension-type runtime context overview.

3. To reference the deployed manifest id of your extension in the search web part see the [Introduction](index.md#register-your-extensibility-library-with-a-web-part).