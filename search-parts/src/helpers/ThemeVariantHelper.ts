import { IReadonlyTheme } from '@microsoft/sp-component-base';

const THEME_VARIANT_ATTRIBUTE = 'data-theme-variant';

export class ThemeVariantHelper {

    /**
     * Parsed themes, keyed by the element carrying the serialized theme. A serialized
     * `IReadonlyTheme` is ~8.5 KB, so parsing it once per ancestor instead of once per
     * web component keeps templates with many web components (ex: a refiner with a few
     * hundred values) cheap to render.
     */
    private static readonly _parsedThemes: WeakMap<Element, IReadonlyTheme> = new WeakMap<Element, IReadonlyTheme>();

    /**
     * Resolves the theme variant from the closest ancestor carrying a `data-theme-variant`
     * attribute. Use this as a `getThemeVariant()` fallback in web components that can be
     * repeated many times inside a template, so the theme only needs to be serialized once
     * on an enclosing element instead of on every single instance.
     * @param element the web component to resolve the theme for
     * @returns the theme variant, or `undefined` when no ancestor provides one
     */
    public static resolveFromAncestors(element: Element): IReadonlyTheme | undefined {
        // Start from the parent: the element itself is only asked for a fallback when it
        // has no usable `data-theme-variant` attribute of its own.
        const themeHost = element?.parentElement?.closest(`[${THEME_VARIANT_ATTRIBUTE}]`);

        if (!themeHost) {
            return undefined;
        }

        if (ThemeVariantHelper._parsedThemes.has(themeHost)) {
            return ThemeVariantHelper._parsedThemes.get(themeHost);
        }

        const serializedTheme = themeHost.getAttribute(THEME_VARIANT_ATTRIBUTE);
        let themeVariant: IReadonlyTheme | undefined = undefined;

        try {
            themeVariant = serializedTheme ? JSON.parse(serializedTheme) : undefined;
        } catch {
            // An unparsable theme is treated as "no theme" so components fall back to their defaults
            themeVariant = undefined;
        }

        ThemeVariantHelper._parsedThemes.set(themeHost, themeVariant);

        return themeVariant;
    }
}
