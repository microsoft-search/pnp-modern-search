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